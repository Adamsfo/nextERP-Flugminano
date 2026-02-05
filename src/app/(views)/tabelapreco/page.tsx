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

const Page = () => {
  const endpoint = '/tabelapreco'
  const endpointApi = '/tabelapreco'

  const [search, setSearch] = useState('')
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const searchParams = useSearchParams()

  useEffect(() => {
    const filtro = searchParams.get('filter')
    if (filtro) setSearch(filtro)
  }, [searchParams])

  const columns = [
    { key: 'id', _style: { width: '10%' }, label: 'Código' },
    { key: 'laboratorio_nome', label: 'Laboratório', _style: { minWidth: '200px' } },
    { key: 'nome', _style: { minWidth: '200px' }, label: 'Nome' },
    { key: 'valor', _style: { width: '15%' }, label: 'Valor' },
    { key: 'ativa', _style: { width: '10%' }, label: 'Ativa' },
    { key: 'show_details', label: 'Ação', _style: { width: '1%' }, filter: false, sorter: false },
  ]

  const show_details = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" />
          </CDropdownToggle>

          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>

            <CDropdownItem onClick={() => handleEditClick(item.id)}>
              <CTooltip content="Editar tabela de preço">
                <CIcon icon={cilAlignCenter} size="xl" className="me-2" />
              </CTooltip>
              Alterar
            </CDropdownItem>

            <CDropdownItem onClick={() => handleExcluirClick(item.id)}>
              <CTooltip content="Excluir tabela de preço">
                <CIcon icon={cilDelete} size="xl" className="me-2" />
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

  const handleNewClick = () => {
    router.push(`${endpoint}/new`)
  }

  const handleEditClick = (id: string) => {
    router.push(`${endpoint}/${id}`)
  }

  const { handleExcluirClick, ConfirmModalComponent } = useDeleteWithConfirm(async (id: string) => {
    try {
      const ret = await apiGeral.deleteResorce(endpointApi, id)

      if (!ret.success) {
        setMsg('Erro ao excluir: ' + ret.message)
        setModalMsg(true)
        return
      }

      setMsg('Registro excluído com sucesso.')
      setModalMsg(true)
      router.refresh()
    } catch (error) {
      setMsg('Erro ao excluir: ' + error)
      setModalMsg(true)
    }
  })

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Tabela de Preço</strong>
            </CCardHeader>

            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}></CCol>

                <CCol md={6} className="d-flex align-items-center justify-content-end">
                  <FilterTableWrapper
                    search={search}
                    setSearch={setSearch}
                    handleNewClick={handleNewClick}
                  />
                </CCol>
              </CRow>

              <SmartTableWrapper
                fetchFunction={getRegistros}
                columns={columns}
                scopedColumns={{ show_details }}
                search={search}
                filtroPorEmpresa={false}
              />
            </CCardBody>

            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg} />
            {ConfirmModalComponent}
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
