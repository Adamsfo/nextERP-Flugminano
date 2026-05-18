'use client'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilDelete } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import { getStatusLaboratoriosStyle } from '@/components/tz/StatusLaboratoriosStyle'
import {
  laboratoriosEditUrl,
  laboratoriosListQueryFromState,
  laboratoriosListStateFromSearchParams,
} from '@/lib/laboratoriosNav'

const Page = () => {
  const endpoint = '/laboratorios'
  const endpointApi = '/laboratorios'
  const searchParams = useSearchParams()
  const filtroInicial = laboratoriosListStateFromSearchParams(searchParams)

  const [search, setSearch] = useState(filtroInicial.search)
  const [filtroFixo, setFiltroFixo] = useState<Record<string, string | number> | undefined>(
    filtroInicial.filtroFixo
  )
  const [atualizar, setAtualizar] = useState(false)
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const next = laboratoriosListStateFromSearchParams(searchParams)
    setSearch(next.search)
    setFiltroFixo(next.filtroFixo)
    setAtualizar((v) => !v)
  }, [searchParams])

  const columns = [
    { key: 'id', _style: { width: '6%' }, label: 'Código' },
    { key: 'numero', label: 'Número' },
    { key: 'protocolo_numero', label: 'Protocolo' },
    { key: 'sequenciaAmostra', label: 'Seq. Amostra' },
    { key: 'dataGeracao', label: 'Data geração' },
    { key: 'cliente_nomeFantasia', _style: { minWidth: '100px' }, label: 'Cliente' },
    { key: 'laboratorio_nome', label: 'Laboratório' },
    { key: 'status', label: 'Status' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const dataGeracao = (item: any) => {
    const date = new Date(item.dataGeracao)
    return <td>{date.toLocaleDateString()}</td>
  }

  const status = (item: any) => {
    const statusStyle = getStatusLaboratoriosStyle(item.status)
    return (
      <td style={{ textAlign: 'center' }}>
        <span
          style={{
            color: statusStyle.color,
            backgroundColor: statusStyle.background,
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '6px',
            display: 'inline-block',
            fontSize: '12px',
          }}
        >
          {item.status}
        </span>
      </td>
    )
  }

  const show_details = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" style={{ cursor: 'pointer' }}>
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem
              onClick={() =>
                router.push(
                  laboratoriosEditUrl(item.id, laboratoriosListQueryFromState(search, filtroFixo))
                )
              }
            >
              <CTooltip content="Alterar laboratório" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(String(item.id))}>
              <CTooltip content="Excluir laboratório" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const getRegistros = async (params: QueryParams) => {
    return await apiGeral.getResource(endpointApi, params)
  }

  const { handleExcluirClick, ConfirmModalComponent } = useDeleteWithConfirm(async (id: string) => {
    try {
      const ret = await apiGeral.deleteResorce(endpointApi, id)
      if (!ret.success) {
        setMsg('Erro ao excluir registro:' + ret.message)
        return
      }
      setMsg('Registro excluído com sucesso.')
      setModalMsg(true)
      router.refresh()
    } catch (error) {
      setMsg('Erro ao excluir registro:' + error)
    }
  })

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Laboratórios</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={12} className="d-flex align-items-center justify-content-end">
                  <FilterTableWrapper
                    search={search}
                    setSearch={setSearch}
                    atualizar={atualizar}
                    setAtualizar={setAtualizar}
                  />
                </CCol>
              </CRow>
              <SmartTableWrapper
                fetchFunction={getRegistros}
                columns={columns}
                scopedColumns={{ status, dataGeracao, show_details }}
                search={search}
                filtroFixo={filtroFixo}
                atualizar={atualizar}
              />
            </CCardBody>
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
            {ConfirmModalComponent}
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
