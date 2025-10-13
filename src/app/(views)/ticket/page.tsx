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
import { cilAlignCenter, cilDelete } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'

const Page = () => {
  const endpoint = '/ticket'
  const endpointApi = '/ticket'
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
    { key: 'ClienteFornecedor_razaoSocialNome', _style: { minWidth: '100px' }, label: 'Jogador' },
    {
      key: 'torneio_descricao',
      _style: { minWidth: '100px' },
      label: 'Torneio',
      filter: false,
      sorter: false,
    },
    // { key: 'dataInicio', _style: { minWidth: '100px' }, label: 'Data Inicio' },
    { key: 'status', _style: { minWidth: '100px' }, label: 'Status', filter: false, sorter: false },
    { key: 'uid', _style: { width: '20%' }, label: 'QR Code', filter: false, sorter: false },
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
              Detalhes do Ticket
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

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Ticket</strong>
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
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
