'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { PropostaAprovacaoLink } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import { formatCurrency } from '@/components/tz/formatters'
import { getStatusAprovacaoLinkStyle } from '@/components/tz/StatusAprovacaoLinkStyle'
import { formatarCpfExibicao, formatarWhatsApp } from '@/components/tz/formatters'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilReload, cilSend, cilXCircle } from '@coreui/icons'

const formatarDataHora = (valor?: string) => {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('pt-BR')
}

const Campo = ({ label, value }: { label: string; value?: string | number | null }) => (
  <CCol md={4} className="mb-3">
    <div className="text-body-secondary small">{label}</div>
    <div className="fw-semibold">{value ?? '-'}</div>
  </CCol>
)

export default function AprovacaoDetalhePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = parseInt(params.id, 10)
  const [registro, setRegistro] = useState<PropostaAprovacaoLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const ret = await apiGeral.getPropostaAprovacaoLinkById<PropostaAprovacaoLink>(id)
      if (!ret.success || !ret.data) {
        setMsg(ret.message || 'Registro não encontrado.')
        setModalMsg(true)
        return
      }
      setRegistro(ret.data as PropostaAprovacaoLink)
    } catch (e: unknown) {
      setMsg(String(e))
      setModalMsg(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) carregar()
  }, [id, carregar])

  const executarAcao = async (fn: () => Promise<{ success?: boolean; message?: string }>) => {
    const ret = await fn()
    setMsg(ret.message || (ret.success ? 'Operação realizada.' : 'Erro na operação.'))
    setModalMsg(true)
    if (ret.success) await carregar()
  }

  if (loading) {
    return (
      <PermissionGate permission={1}>
        <CAlert color="info">Carregando...</CAlert>
      </PermissionGate>
    )
  }

  if (!registro) {
    return (
      <PermissionGate permission={1}>
        <CAlert color="danger">Registro não encontrado.</CAlert>
        <CButtonBack onClick={() => router.push('/propostaComercial/aprovacoes')} />
      </PermissionGate>
    )
  }

  const statusStyle = getStatusAprovacaoLinkStyle(registro.status)
  const proposta = registro.proposta

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Aprovação #{registro.id}</strong>
              <span
                style={{
                  color: statusStyle.color,
                  backgroundColor: statusStyle.background,
                  fontWeight: 'bold',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                {statusStyle.label}
              </span>
            </CCardHeader>
            <CCardBody>
              <h6 className="mb-3">Dados da proposta</h6>
              <CRow>
                <Campo label="Número" value={proposta?.numero || registro.proposta_numero} />
                <Campo label="Cliente" value={proposta?.clienteNome || registro.proposta_clienteNome} />
                <Campo label="Documento" value={proposta?.clienteDocumento} />
                <Campo label="Status proposta" value={proposta?.status || registro.proposta_status} />
                <Campo
                  label="Valor total"
                  value={
                    proposta?.valorTotal != null
                      ? formatCurrency(Number(proposta.valorTotal))
                      : registro.proposta_valorTotal != null
                        ? formatCurrency(Number(registro.proposta_valorTotal))
                        : '-'
                  }
                />
                <Campo label="Data proposta" value={proposta?.data ? formatarDataHora(String(proposta.data)) : '-'} />
                <Campo
                  label="Validade"
                  value={proposta?.validade ? formatarDataHora(String(proposta.validade)) : '-'}
                />
              </CRow>

              <hr className="my-4" />

              <h6 className="mb-3">Dados do envio</h6>
              <CRow>
                <Campo label="Destinatário" value={registro.nomeDestinatario} />
                <Campo label="E-mail" value={registro.email} />
                <Campo label="WhatsApp" value={formatarWhatsApp(registro.whatsapp)} />
                <Campo label="Enviado em" value={formatarDataHora(registro.createdAt)} />
                <Campo label="Expira em" value={formatarDataHora(registro.expiraEm)} />
                <Campo label="Link público" value={registro.publicUrl} />
              </CRow>
              {registro.publicUrl ? (
                <CButton
                  color="link"
                  className="px-0"
                  onClick={() => navigator.clipboard.writeText(registro.publicUrl || '')}
                >
                  <CIcon icon={cilCopy} className="me-1" />
                  Copiar link
                </CButton>
              ) : null}

              <hr className="my-4" />

              <h6 className="mb-3">Dados da resposta</h6>
              <CRow>
                <Campo label="Respondido em" value={formatarDataHora(registro.aprovadoEm)} />
                <Campo label="Nome aprovador" value={registro.nomeAprovador} />
                <Campo label="CPF aprovador" value={formatarCpfExibicao(registro.cpfAprovador)} />
                <Campo label="IP" value={registro.ipAprovacao} />
                <CCol md={12} className="mb-3">
                  <div className="text-body-secondary small">Motivo reprovação</div>
                  <div>{registro.observacaoReprovacao || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
            <CCardFooter className="d-flex flex-wrap gap-2">
              <CButtonBack onClick={() => router.push('/propostaComercial/aprovacoes')} />
              {registro.email ? (
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={() => executarAcao(() => apiGeral.reenviarEmailPropostaAprovacaoLink(id))}
                >
                  <CIcon icon={cilSend} className="me-1" />
                  Reenviar e-mail
                </CButton>
              ) : null}
              <CButton
                color="info"
                variant="outline"
                onClick={() => {
                  if (window.confirm('Gerar novo link e invalidar o atual se pendente?')) {
                    executarAcao(() => apiGeral.gerarNovoLinkPropostaAprovacao(id))
                  }
                }}
              >
                <CIcon icon={cilReload} className="me-1" />
                Gerar novo link
              </CButton>
              {registro.status === 'PENDENTE' ? (
                <CButton
                  color="danger"
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Invalidar este link?')) {
                      executarAcao(() => apiGeral.invalidarPropostaAprovacaoLink(id))
                    }
                  }}
                >
                  <CIcon icon={cilXCircle} className="me-1" />
                  Invalidar link
                </CButton>
              ) : null}
              {registro.publicUrl ? (
                <CButton
                  color="secondary"
                  variant="outline"
                  href={registro.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir página pública
                </CButton>
              ) : null}
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
      <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg} />
    </PermissionGate>
  )
}
