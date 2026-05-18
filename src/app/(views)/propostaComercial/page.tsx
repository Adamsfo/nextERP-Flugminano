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
import { cilAlignCenter, cilDelete, cilPlus, cilPrint, cilSend } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropostaComercial, QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import { formatCurrency } from '@/components/tz/formatters'
import { getStatusPropostaStyle } from '@/components/tz/StatusPropostaStyle'
import { API_BASE_URL } from '@/lib/api'
import ModalStatusPropComercial from './ModalStatusPropComercial'
import ModalGerarProtocolo from './ModalGerarProtocolo'
import ModalEnviarAprovacaoProposta from './ModalEnviarAprovacaoProposta'

const Page = () => {
  const endpoint = '/propostaComercial'
  const endpointApi = '/proposta'
  const [search, setSearch] = useState('')
  const [atualizar, setAtualizar] = useState(false)
  // const [empresaId, setempresaId] = useState<number[]>([])
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [registro, setRegistro] = useState<PropostaComercial | null>(null)
  const [modalStatus, setModalStatus] = useState(false)
  const [modalGerarProtocolo, setModalGerarProtocolo] = useState(false)
  const [modalEnviarAprovacao, setModalEnviarAprovacao] = useState(false)
  const [propostaGerarProtocolo, setPropostaGerarProtocolo] = useState<{
    id: number
    quantidadeAmostras?: number
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
    { key: 'laboratorio_nome', label: 'Laboratório' },
    { key: 'numero', label: 'Número' },
    { key: 'createdAt', label: 'Data' },
    { key: 'clienteNome', _style: { minWidth: '100px' }, label: 'Nome' },
    { key: 'clienteDocumento', _style: { minWidth: '100px' }, label: 'Documento' },
    { key: 'clienteEmail', _style: { minWidth: '100px' }, label: 'Email' },
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

  const handleStatusClick = (registro: PropostaComercial) => {
    setRegistro(registro)
    setModalStatus(true)
  }

  const badgeAprovacaoExterna = (item: PropostaComercial) => {
    if (item.aprovacaoLinkStatus === 'PENDENTE' && item.status !== 'Aprovada') {
      return (
        <span
          className="d-block mt-1"
          style={{
            color: '#0d6efd',
            backgroundColor: '#e7f1ff',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        >
          Aguardando Aprovação
        </span>
      )
    }
    if (item.aprovacaoLinkStatus === 'APROVADA' && item.aprovacaoNomeAprovador) {
      return (
        <small className="d-block mt-1 text-body-secondary">
          Aprovado por {item.aprovacaoNomeAprovador}
        </small>
      )
    }
    if (item.aprovacaoLinkStatus === 'REPROVADA' && item.aprovacaoNomeAprovador) {
      return (
        <small className="d-block mt-1 text-body-secondary">
          Reprovado por {item.aprovacaoNomeAprovador}
        </small>
      )
    }
    return null
  }

  const status = (item: PropostaComercial) => {
    const statusStyle = getStatusPropostaStyle(item.status)

    return (
      <td style={{ textAlign: 'center', cursor: 'pointer' }}>
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
          onClick={() => handleStatusClick(item)}
        >
          {item.status}
        </span>
        {badgeAprovacaoExterna(item)}
      </td>
    )
  }

  const handleEnviarAprovacaoClick = (item: PropostaComercial) => {
    setRegistro(item)
    setModalEnviarAprovacao(true)
  }

  const handleGerarProtocoloClick = (item: PropostaComercial) => {
    setPropostaGerarProtocolo({
      id: item.id,
      quantidadeAmostras: item.quantidadeAmostras,
    })
    setModalGerarProtocolo(true)
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
            <CDropdownItem onClick={() => handleImprimirClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon
                  icon={cilPrint}
                  size="xl"
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
              </CTooltip>
              Imprimir
            </CDropdownItem>
            {item.status !== 'Aprovada' && item.status !== 'Cancelada' ? (
              <CDropdownItem onClick={() => handleEnviarAprovacaoClick(item)}>
                <CTooltip content="Enviar link de aprovação ao cliente" placement="top">
                  <CIcon icon={cilSend} size="xl" style={{ marginRight: '6px' }} />
                </CTooltip>
                Enviar para Aprovação
              </CDropdownItem>
            ) : null}
            {item.status === 'Aprovada' ? (
              <CDropdownItem onClick={() => handleGerarProtocoloClick(item)}>
                <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                  <CIcon icon={cilPlus} size="xl" style={{ marginRight: '6px', cursor: 'pointer' }} />
                </CTooltip>
                Gerar Protocolo
              </CDropdownItem>
            ) : null}
            <CDropdownItem onClick={() => handleEditClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon
                  icon={cilAlignCenter}
                  size="xl"
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon
                  icon={cilDelete}
                  size="xl"
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
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

  const handleImprimirClick = async (id: number) => {
    window.open(
      `${API_BASE_URL}/proposta/${id}/imprimir?token=${localStorage.getItem('token')}`,
      '_blank'
    )
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
              <strong>Proposta Comercial</strong>
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
                scopedColumns={{ status, createdAt, valorTotal, show_details }}
                search={search}
                // empresaId={empresaId}
                // filtroFixo={{ tipo: 'Cliente' }}
                atualizar={atualizar}
              />
            </CCardBody>
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
            {registro && (
              <ModalStatusPropComercial
                visible={modalStatus}
                setVisible={setModalStatus}
                registro={registro as PropostaComercial}
                setAtualizar={setAtualizar}
              />
            )}
            {propostaGerarProtocolo ? (
              <ModalGerarProtocolo
                visible={modalGerarProtocolo}
                setVisible={setModalGerarProtocolo}
                propostaComercialId={propostaGerarProtocolo.id}
                propostaQuantidadeAmostras={propostaGerarProtocolo.quantidadeAmostras}
              />
            ) : null}
            {registro ? (
              <ModalEnviarAprovacaoProposta
                visible={modalEnviarAprovacao}
                setVisible={setModalEnviarAprovacao}
                proposta={registro}
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
