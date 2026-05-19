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
import { cilAlignCenter, cilDelete, cilPlus } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import { formatCurrency, formatDateBr } from '@/components/tz/formatters'
import { getStatusProtocoloStyle } from '@/components/tz/StatusProtocoloStyle'
import { laboratoriosListUrl } from '@/lib/laboratoriosNav'
import ModalGerarLaboratorios from './ModalGerarLaboratorios'

const Page = () => {
  const endpoint = '/protocolo'
  const endpointApi = '/protocolo'
  const [search, setSearch] = useState('')
  const [atualizar, setAtualizar] = useState(false)
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [modalGerarLaboratorios, setModalGerarLaboratorios] = useState(false)
  const [protocoloGerarLab, setProtocoloGerarLab] = useState<{
    id: number
    quantidadeAmostras: number
    numero: string
  } | null>(null)

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
    { key: 'id', _style: { width: '6%' }, label: 'Código' },
    { key: 'numero', label: 'Número' },
    { key: 'proposta_numero', label: 'Proposta' },
    { key: 'createdAt', label: 'Data' },
    { key: 'dataEntregaCliente', label: 'Entrega Cliente' },
    { key: 'clienteNome', _style: { minWidth: '100px' }, label: 'Cliente (snapshot)' },
    { key: 'laboratorio_nome', label: 'Laboratório' },
    { key: 'quantidadeAmostras', label: 'Amostras' },
    { key: 'valorTotal', label: 'Valor Total' },
    { key: 'status', label: 'Status' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const valorTotal = (item: any) => {
    return <td style={{ textAlign: 'right' }}>{formatCurrency(item.valorTotal)}</td>
  }

  const createdAt = (item: any) => {
    const date = new Date(item.createdAt)
    return <td>{date.toLocaleDateString()}</td>
  }

  const dataEntregaCliente = (item: { dataEntregaCliente?: string | null }) => (
    <td>{formatDateBr(item.dataEntregaCliente)}</td>
  )

  const handleLabGeradosClick = (item: { numero?: string }) => {
    const numero = item.numero?.trim()
    if (!numero) return
    router.push(
      laboratoriosListUrl({
        search: numero,
        filterField: 'protocolo_numero',
      })
    )
  }

  const status = (item: any) => {
    const statusStyle = getStatusProtocoloStyle(item.status)
    const labGerados = item.status === 'Lab. Gerado(s)'
    const badgeStyle = {
      color: statusStyle.color,
      backgroundColor: statusStyle.background,
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '6px',
      display: 'inline-block',
      fontSize: '12px',
    }

    return (
      <td style={{ textAlign: 'center' }}>
        {labGerados ? (
          <CTooltip content="Ver laboratórios deste protocolo" placement="top">
            <span
              role="button"
              tabIndex={0}
              onClick={() => handleLabGeradosClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLabGeradosClick(item)
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.92)'
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = ''
                e.currentTarget.style.boxShadow = ''
              }}
              style={{
                ...badgeStyle,
                cursor: 'pointer',
                transition: 'filter 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {item.status}
            </span>
          </CTooltip>
        ) : (
          <span style={badgeStyle}>{item.status}</span>
        )}
      </td>
    )
  }

  const handleGerarLaboratoriosClick = (item: any) => {
    setProtocoloGerarLab({
      id: item.id,
      quantidadeAmostras: item.quantidadeAmostras,
      numero: item.numero,
    })
    setModalGerarLaboratorios(true)
  }

  const show_details = (item: any) => {
    const podeExcluir = item.status === 'Protocolado' || item.status === 'Cancelado'
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" style={{ cursor: 'pointer' }}>
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => router.push(`${endpoint}/${item.id}`)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon
                  icon={cilAlignCenter}
                  size="xl"
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleGerarLaboratoriosClick(item)}>
              <CTooltip content="Gerar registros de laboratório por amostra" placement="top">
                <CIcon icon={cilPlus} size="xl" style={{ marginRight: '6px', cursor: 'pointer' }} />
              </CTooltip>
              Gerar Laboratórios
            </CDropdownItem>
            {podeExcluir ? (
              <CDropdownItem onClick={() => handleExcluirClick(String(item.id))}>
                <CTooltip content="Excluir protocolo" placement="top">
                  <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
                </CTooltip>
                Excluir
              </CDropdownItem>
            ) : null}
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
              <strong>Protocolos</strong>
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
                scopedColumns={{
                  status,
                  createdAt,
                  dataEntregaCliente,
                  valorTotal,
                  show_details,
                }}
                search={search}
                atualizar={atualizar}
              />
            </CCardBody>
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
            {protocoloGerarLab ? (
              <ModalGerarLaboratorios
                visible={modalGerarLaboratorios}
                setVisible={setModalGerarLaboratorios}
                protocoloId={protocoloGerarLab.id}
                quantidadeAmostras={protocoloGerarLab.quantidadeAmostras}
                protocoloNumero={protocoloGerarLab.numero}
              />
            ) : null}
            {ConfirmModalComponent}
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
