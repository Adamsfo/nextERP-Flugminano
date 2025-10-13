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
import CidadeModal from './cidadeModal'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import CButtonAdd from '@/components/tz/CButtonAdd'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'

const Page = () => {
  const endpoint = '/cidade'
  const [search, setSearch] = useState('')
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [idEdit, setIdEdit] = useState('')
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const searchParams = useSearchParams()

  useEffect(() => {
    const filtro = searchParams.get('filter') // Supondo que o parâmetro é chamado 'param'
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
    { key: 'descricao', _style: { minWidth: '200px' }, label: 'Descrição' },
    { key: 'uf', _style: { minWidth: '100px' }, label: 'UF' },
    { key: 'show_details', label: 'Ação', _style: { width: '1%' }, filter: false, sorter: false },
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
            <CDropdownItem onClick={() => handleEditModal(item.id)}>
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
    return await apiGeral.getResource(endpoint, params)
  }

  const handleEditModal = (id: string) => {
    setIdEdit(id)
    setModal(true)
  }

  const handleNewModal = () => {
    setIdEdit('')
    setModal(true)
  }

  const handleNewClick = () => {
    router.push(`${endpoint}/new`)
  }

  const handleEditClick = (id: string) => {
    router.push(`${endpoint}/${id}`)
  }

  const { handleExcluirClick, ConfirmModalComponent } = useDeleteWithConfirm(async (id: string) => {
    try {
      const ret = await apiGeral.deleteResorce(endpoint, id)
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
    <PermissionGate permission={5}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Cidades</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>{/* <SelectEmpresa id={empresaId} setId={setempresaId} /> */}</CCol>
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
              <CidadeModal modal={modal} setModal={setModal} id={idEdit}></CidadeModal>
            </CCardBody>
          </CCard>
          <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
          {ConfirmModalComponent}
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
