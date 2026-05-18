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
import { cilAlignCenter, cilCopy, cilReload, cilSend, cilXCircle } from '@coreui/icons'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropostaAprovacaoLink, QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { getStatusAprovacaoLinkStyle } from '@/components/tz/StatusAprovacaoLinkStyle'
import { formatarCpfExibicao, formatarWhatsApp } from '@/components/tz/formatters'

const formatarDataHora = (valor?: string) => {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('pt-BR')
}

const Page = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [atualizar, setAtualizar] = useState(false)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const columns = [
    { key: 'id', _style: { width: '72px' }, label: 'Código' },
    { key: 'proposta_numero', _style: { width: '96px', minWidth: '90px' }, label: 'Proposta' },
    { key: 'proposta_clienteNome', _style: { minWidth: '140px' }, label: 'Cliente' },
    { key: 'nomeDestinatario', _style: { minWidth: '130px' }, label: 'Destinatário' },
    { key: 'email', _style: { minWidth: '160px' }, label: 'Email' },
    { key: 'whatsapp', _style: { width: '140px' }, label: 'WhatsApp' },
    { key: 'status', _style: { width: '110px' }, label: 'Status' },
    { key: 'createdAt', _style: { width: '150px' }, label: 'Enviado em' },
    { key: 'expiraEm', _style: { width: '150px' }, label: 'Expira em' },
    { key: 'aprovadoEm', _style: { width: '150px' }, label: 'Respondido em' },
    { key: 'nomeAprovador', _style: { minWidth: '130px' }, label: 'Nome aprovador' },
    { key: 'cpfAprovador', _style: { width: '130px' }, label: 'CPF aprovador' },
    { key: 'ipAprovacao', _style: { width: '120px' }, label: 'IP' },
    { key: 'observacaoReprovacao', _style: { minWidth: '160px' }, label: 'Motivo reprovação' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const statusCell = (item: PropostaAprovacaoLink) => {
    const statusStyle = getStatusAprovacaoLinkStyle(item.status)
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
          {statusStyle.label}
        </span>
      </td>
    )
  }

  const celulaData = (valor?: string) => (
    <td style={{ whiteSpace: 'nowrap' }}>{formatarDataHora(valor)}</td>
  )
  const createdAt = (item: PropostaAprovacaoLink) => celulaData(item.createdAt)
  const expiraEm = (item: PropostaAprovacaoLink) => celulaData(item.expiraEm)
  const aprovadoEm = (item: PropostaAprovacaoLink) => celulaData(item.aprovadoEm)

  const whatsapp = (item: PropostaAprovacaoLink) => (
    <td style={{ whiteSpace: 'nowrap' }}>{formatarWhatsApp(item.whatsapp)}</td>
  )

  const cpfAprovador = (item: PropostaAprovacaoLink) => (
    <td style={{ whiteSpace: 'nowrap' }}>{formatarCpfExibicao(item.cpfAprovador)}</td>
  )

  const ipAprovacao = (item: PropostaAprovacaoLink) => (
    <td style={{ whiteSpace: 'nowrap' }}>{item.ipAprovacao || '-'}</td>
  )

  const motivo = (item: PropostaAprovacaoLink) => (
    <td className="text-truncate" style={{ maxWidth: 200 }} title={item.observacaoReprovacao || ''}>
      {item.observacaoReprovacao || '-'}
    </td>
  )

  const executarAcao = async (fn: () => Promise<{ success?: boolean; message?: string }>) => {
    const ret = await fn()
    if (!ret.success) {
      setMsg(ret.message || 'Não foi possível concluir a ação.')
      setModalMsg(true)
      return false
    }
    setMsg(ret.message || 'Operação realizada com sucesso.')
    setModalMsg(true)
    setAtualizar((v) => !v)
    return true
  }

  const handleCopiarLink = async (item: PropostaAprovacaoLink) => {
    if (!item.publicUrl) return
    try {
      await navigator.clipboard.writeText(item.publicUrl)
      setMsg('Link copiado.')
      setModalMsg(true)
    } catch {
      setMsg('Não foi possível copiar o link.')
      setModalMsg(true)
    }
  }

  const show_details = (item: PropostaAprovacaoLink) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" style={{ cursor: 'pointer' }}>
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            {/* <CDropdownItem onClick={() => router.push(`/propostaComercial/aprovacoes/${item.id}`)}>
              <CTooltip content="Ver detalhe" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Ver detalhe
            </CDropdownItem> */}
            <CDropdownItem onClick={() => handleCopiarLink(item)}>
              <CTooltip content="Copiar link público" placement="top">
                <CIcon icon={cilCopy} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Copiar link
            </CDropdownItem>
            {item.email ? (
              <CDropdownItem
                onClick={() =>
                  executarAcao(() => apiGeral.reenviarEmailPropostaAprovacaoLink(item.id))
                }
              >
                <CTooltip content="Reenviar e-mail" placement="top">
                  <CIcon icon={cilSend} size="xl" style={{ marginRight: '6px' }} />
                </CTooltip>
                Reenviar e-mail
              </CDropdownItem>
            ) : null}
            <CDropdownItem
              onClick={() => {
                if (
                  window.confirm(
                    'Gerar novo link? O link atual será invalidado se ainda estiver pendente.'
                  )
                ) {
                  executarAcao(() => apiGeral.gerarNovoLinkPropostaAprovacao(item.id))
                }
              }}
            >
              <CTooltip content="Gerar novo link" placement="top">
                <CIcon icon={cilReload} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Gerar novo link
            </CDropdownItem>
            {item.status === 'PENDENTE' ? (
              <CDropdownItem
                onClick={() => {
                  if (window.confirm('Invalidar este link de aprovação?')) {
                    executarAcao(() => apiGeral.invalidarPropostaAprovacaoLink(item.id))
                  }
                }}
              >
                <CTooltip content="Invalidar link" placement="top">
                  <CIcon icon={cilXCircle} size="xl" style={{ marginRight: '6px' }} />
                </CTooltip>
                Invalidar link
              </CDropdownItem>
            ) : null}
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const getRegistros = async (params: QueryParams) => {
    return await apiGeral.getPropostaAprovacaoLinks(params)
  }

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Aprovações</strong>
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
                  status: statusCell,
                  createdAt,
                  expiraEm,
                  aprovadoEm,
                  whatsapp,
                  cpfAprovador,
                  ipAprovacao,
                  observacaoReprovacao: motivo,
                  show_details,
                }}
                search={search}
                atualizar={atualizar}
              />
            </CCardBody>
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg} />
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
