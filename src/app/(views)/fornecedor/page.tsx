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
  CFormInput,
  CFormLabel,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilX } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import CButtonAdd from '@/components/tz/CButtonAdd'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'

const Page = () => {
  const endpoint = '/fornecedor'
  const endpointApi = '/clienteFornecedor'
  const [search, setSearch] = useState('')
  // const [empresaId, setempresaId] = useState<number[]>([])
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
    // { key: 'tipo', _style: { minWidth: '200px' }, label: 'Tipo' },
    { key: 'nomeFantasia', _style: { minWidth: '100px' }, label: 'Nome' },
    { key: 'razaoSocialNome', _style: { minWidth: '100px' }, label: 'Razão Social' },
    { key: 'cnpjCpf', _style: { minWidth: '100px' }, label: 'CNPJ / CPF' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const show_details = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => handleEditClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilX} size="xl" style={{ marginRight: '6px' }} />
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
    <PermissionGate permission={3}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Fornecedor</strong>
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
                // empresaId={empresaId}
                filtroFixo={{ tipo: 'Fornecedor' }}
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
