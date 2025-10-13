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
  CFormLabel,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAirplay, cilAlignCenter, cilDelete, cilMediaPause, cilMediaPlay } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'

const Page = () => {
  const endpoint = '/torneio'
  const endpointApi = '/torneio'
  const [search, setSearch] = useState('')
  const [atualizar, setAtualizar] = useState(false)
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const searchParams = useSearchParams()

  useEffect(() => {
    const filtro = searchParams.get('filter')
    if (filtro) {
      try {
        setSearch(filtro)
      } catch (error) {
        console.error('Erro ao parsear o parâmetro:', error)
      }
    }
  }, [searchParams])

  const columns = [
    { key: 'id', _style: { width: '15%' }, label: 'Código' },
    { key: 'descricao', _style: { minWidth: '100px' }, label: 'Nome' },
    { key: 'dataInicio', _style: { minWidth: '100px' }, label: 'Data Inicio' },
    { key: 'status', _style: { minWidth: '100px' }, label: 'Status' },
    {
      key: 'blindItem_nivel',
      _style: { minWidth: '100px' },
      label: 'Nivel Atual',
      filter: false,
      sorter: false,
    },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const blindItem_nivel = (item: any, index: any) => {
    return (
      <td>
        <CFormLabel>{item.blindItem_nivel === 0 ? 'Intervalo' : item.blindItem_nivel}</CFormLabel>
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
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem style={{ cursor: 'pointer' }} onClick={() => handleEditClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Detalhes do Torneio
            </CDropdownItem>
            <CDropdownItem
              style={{ cursor: 'pointer' }}
              onClick={() => handleIniciarTorneioClick()}
            >
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilMediaPlay} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Iniciar Torneio
            </CDropdownItem>
            <CDropdownItem style={{ cursor: 'pointer' }} onClick={() => handlePararTorneioClick()}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilMediaPause} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Parar Torneio
            </CDropdownItem>
            <CDropdownItem style={{ cursor: 'pointer' }} onClick={() => handlePainelBlindClick()}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilAirplay} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Painel de Blind
            </CDropdownItem>
            {/* <CDropdownItem
              style={{ cursor: 'pointer' }}
              onClick={() => handleExcluirClick(item.id)}
            >
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem> */}
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

  const handlePainelBlindClick = () => {
    router.push('/painelBlind')
  }

  const handleIniciarTorneioClick = async () => {
    await apiGeral.iniciarTorneio('')
    setAtualizar(!atualizar)
  }

  const handlePararTorneioClick = async () => {
    await apiGeral.pararTorneio('')
    setAtualizar(!atualizar)
  }

  const { handleExcluirClick, ConfirmModalComponent } = useDeleteWithConfirm(async (id: string) => {
    try {
      const ret = await apiGeral.deleteResorce(endpointApi, id)
      console.log('ret', ret)
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
              <strong>Torneio</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>{/* <SelectEmpresa id={empresaId} setId={setempresaId} /> */}</CCol>
                <CCol md={6} className="d-flex align-items-center justify-content-end">
                  <FilterTableWrapper
                    search={search}
                    setSearch={setSearch}
                    handleNewClick={handleNewClick}
                    atualizar={atualizar}
                    setAtualizar={setAtualizar}
                  />
                </CCol>
              </CRow>
              <SmartTableWrapper
                fetchFunction={getRegistros}
                columns={columns}
                scopedColumns={{ blindItem_nivel, show_details }}
                search={search}
                atualizar={atualizar}
                // empresaId={empresaId}
                // filtroFixo={{ tipo: 'Cliente' }}
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
