'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import { formatCurrency } from '@/components/tz/formatters'
import TextInputField from '@/components/tz/TextInputField'
import { cpfValido, formatarCpfInput } from '@/lib/cpf'
import {
  aprovarPropostaPublica,
  fetchPropostaPublica,
  getPropostaPublicaPdfUrl,
  PropostaPublicaData,
  reprovarPropostaPublica,
} from '@/lib/propostaPublicaApi'

export default function PropostaPublicaPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [dados, setDados] = useState<PropostaPublicaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [nomeAprovador, setNomeAprovador] = useState('')
  const [cpfAprovador, setCpfAprovador] = useState('')
  const [motivoReprovacao, setMotivoReprovacao] = useState('')
  const [mostrarReprovar, setMostrarReprovar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensagemFinal, setMensagemFinal] = useState('')
  const [mostrarPdf, setMostrarPdf] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const data = await fetchPropostaPublica(token)
      setDados(data)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Link inválido ou indisponível.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  const validarCampos = () => {
    if (!nomeAprovador.trim()) {
      setErro('Informe seu nome completo.')
      return false
    }
    if (!cpfValido(cpfAprovador)) {
      setErro('Informe um CPF válido.')
      return false
    }
    setErro('')
    return true
  }

  const handleAprovar = async () => {
    if (!validarCampos()) return
    setEnviando(true)
    try {
      await aprovarPropostaPublica(token, {
        nomeAprovador: nomeAprovador.trim(),
        cpfAprovador,
      })
      setMensagemFinal('Proposta aprovada com sucesso. Obrigado!')
      await carregar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível aprovar.')
    } finally {
      setEnviando(false)
    }
  }

  const handleReprovar = async () => {
    if (!validarCampos()) return
    if (!motivoReprovacao.trim()) {
      setErro('Informe o motivo da reprovação.')
      return
    }
    setEnviando(true)
    try {
      await reprovarPropostaPublica(token, {
        nomeAprovador: nomeAprovador.trim(),
        cpfAprovador,
        observacaoReprovacao: motivoReprovacao.trim(),
      })
      setMensagemFinal('Proposta reprovada. Obrigado pelo retorno.')
      await carregar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível reprovar.')
    } finally {
      setEnviando(false)
    }
  }

  const pdfUrl = getPropostaPublicaPdfUrl(token)

  if (loading) {
    return (
      <CContainer className="py-5 text-center">
        <CSpinner color="primary" />
      </CContainer>
    )
  }

  if (!dados && erro) {
    return (
      <CContainer className="py-5" style={{ maxWidth: 720 }}>
        <CAlert color="danger">{erro}</CAlert>
      </CContainer>
    )
  }

  if (!dados) return null

  const empresaNome = dados.empresa.nomeFantasia || dados.empresa.razaoSocial || 'Empresa'
  const podeResponder = dados.podeResponder && !mensagemFinal

  return (
    <div className="bg-body-tertiary min-vh-100 py-4">
      <CContainer style={{ maxWidth: 900 }}>
        <CCard className="shadow-sm border-0 mb-4">
          <CCardHeader className="bg-white border-bottom py-4">
            <CRow className="align-items-center">
              <CCol>
                <h4 className="mb-1">{empresaNome}</h4>
                <p className="text-body-secondary mb-0">Aprovação de Proposta Comercial</p>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-3 mb-4">
              <CCol md={6}>
                <strong>Cliente:</strong> {dados.proposta.clienteNome}
              </CCol>
              <CCol md={6}>
                <strong>Documento:</strong> {dados.proposta.clienteDocumento}
              </CCol>
              <CCol md={4}>
                <strong>Proposta nº:</strong> {dados.proposta.numero}
              </CCol>
              <CCol md={4}>
                <strong>Data:</strong>{' '}
                {dados.proposta.data
                  ? new Date(dados.proposta.data).toLocaleDateString('pt-BR')
                  : '-'}
              </CCol>
              <CCol md={4}>
                <strong>Validade:</strong>{' '}
                {dados.proposta.validade
                  ? new Date(dados.proposta.validade).toLocaleDateString('pt-BR')
                  : '-'}
              </CCol>
              <CCol md={4}>
                <strong>Valor total:</strong>{' '}
                {formatCurrency(Number(dados.proposta.valorTotal || 0))}
              </CCol>
              <CCol md={4}>
                <strong>Status:</strong> {dados.proposta.status}
              </CCol>
              <CCol md={4}>
                <strong>Link válido até:</strong>{' '}
                {new Date(dados.link.expiraEm).toLocaleString('pt-BR')}
              </CCol>
            </CRow>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <CButton color="primary" onClick={() => setMostrarPdf((v) => !v)}>
                {mostrarPdf ? 'Ocultar PDF' : 'Visualizar PDF'}
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Baixar PDF
              </CButton>
            </div>

            {mostrarPdf ? (
              <div className="mb-4 border rounded overflow-hidden" style={{ height: 520 }}>
                <iframe
                  src={pdfUrl}
                  title="Proposta Comercial"
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </div>
            ) : null}

            {mensagemFinal ? (
              <CAlert color="success">{mensagemFinal}</CAlert>
            ) : dados.mensagemBloqueio ? (
              <CAlert color="warning">{dados.mensagemBloqueio}</CAlert>
            ) : null}

            {dados.link.nomeAprovador && !mensagemFinal ? (
              <CAlert color="info">
                Respondido por <strong>{dados.link.nomeAprovador}</strong>
                {dados.link.aprovadoEm
                  ? ` em ${new Date(dados.link.aprovadoEm).toLocaleString('pt-BR')}`
                  : ''}
                {dados.link.observacaoReprovacao ? (
                  <>
                    <br />
                    Motivo: {dados.link.observacaoReprovacao}
                  </>
                ) : null}
              </CAlert>
            ) : null}

            {podeResponder ? (
              <>
                <hr />
                <h5 className="mb-3">Sua resposta</h5>
                <CRow className="g-3">
                  <CCol md={8}>
                    <TextInputField
                      name="nomeAprovador"
                      placeholder="Nome completo"
                      value={nomeAprovador}
                      onChange={(e) => setNomeAprovador(e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    <TextInputField
                      name="cpfAprovador"
                      placeholder="CPF"
                      value={cpfAprovador}
                      onChange={(e) => setCpfAprovador(formatarCpfInput(e.target.value))}
                    />
                  </CCol>
                  {mostrarReprovar ? (
                    <CCol md={12}>
                      <CFormTextarea
                        label="Motivo da reprovação"
                        rows={4}
                        value={motivoReprovacao}
                        onChange={(e) => setMotivoReprovacao(e.target.value)}
                      />
                    </CCol>
                  ) : null}
                  {erro ? (
                    <CCol md={12}>
                      <div className="text-danger">{erro}</div>
                    </CCol>
                  ) : null}
                  <CCol md={12} className="d-flex flex-wrap gap-2">
                    <CButton color="success" disabled={enviando} onClick={handleAprovar}>
                      Aprovar
                    </CButton>
                    {!mostrarReprovar ? (
                      <CButton
                        color="danger"
                        variant="outline"
                        disabled={enviando}
                        onClick={() => setMostrarReprovar(true)}
                      >
                        Reprovar
                      </CButton>
                    ) : (
                      <CButton color="danger" disabled={enviando} onClick={handleReprovar}>
                        Confirmar reprovação
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </>
            ) : null}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
