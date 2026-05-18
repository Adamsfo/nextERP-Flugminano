'use client'

import { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import { PropostaComercial } from '@/types/geral'
import { apiGeral } from '@/lib/geral'
import TextInputField from '@/components/tz/TextInputField'

type LinkCriado = {
  token: string
  publicUrl: string
}

interface Props {
  visible: boolean
  setVisible: (v: boolean) => void
  proposta: PropostaComercial | null
}

const ModalEnviarAprovacaoProposta: React.FC<Props> = ({ visible, setVisible, proposta }) => {
  const [nomeDestinatario, setNomeDestinatario] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [linkCriado, setLinkCriado] = useState<LinkCriado | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    if (!visible || !proposta) return
    setNomeDestinatario(proposta.clienteNome || '')
    setEmail(proposta.clienteEmail || '')
    setWhatsapp(proposta.clienteTelefone || '')
    setMensagem('')
    setLinkCriado(null)
    setErro('')
    setSucesso('')
  }, [visible, proposta])

  const handleClose = () => {
    setVisible(false)
    setErro('')
    setSucesso('')
  }

  const validarFormulario = () => {
    if (!nomeDestinatario.trim()) {
      setErro('Informe o nome do destinatário.')
      return false
    }
    return true
  }

  const garantirLink = async (): Promise<LinkCriado | null> => {
    if (linkCriado) return linkCriado
    if (!proposta) return null
    if (!validarFormulario()) return null

    setLoading(true)
    setErro('')
    try {
      const ret = await apiGeral.criarLinkAprovacaoProposta({
        propostaComercialId: proposta.id,
        nomeDestinatario: nomeDestinatario.trim(),
        email: email.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
      })
      if (!ret.success || !ret.data) {
        setErro(ret.message || 'Não foi possível gerar o link.')
        return null
      }
      const payload = ret.data as { data?: LinkCriado } | LinkCriado
      const data =
        payload && typeof payload === 'object' && 'data' in payload && payload.data
          ? payload.data
          : (payload as LinkCriado)
      if (!data?.publicUrl || !data?.token) {
        setErro('Resposta inválida ao gerar o link.')
        return null
      }
      setLinkCriado(data)
      return data
    } catch (e: unknown) {
      setErro(String(e))
      return null
    } finally {
      setLoading(false)
    }
  }

  const montarMensagemWhatsApp = (url: string) => {
    const saudacao = nomeDestinatario.trim() ? `Olá ${nomeDestinatario.trim()}` : 'Olá'
    const extra = mensagem.trim() ? `\n\n${mensagem.trim()}` : ''
    return `${saudacao},\nsegue proposta comercial para aprovação:\n\n${url}${extra}`
  }

  const handleCopiarLink = async () => {
    const link = await garantirLink()
    if (!link?.publicUrl) return
    try {
      await navigator.clipboard.writeText(link.publicUrl)
      setSucesso('Link copiado para a área de transferência.')
    } catch {
      setErro('Não foi possível copiar o link.')
    }
  }

  const handleEnviarEmail = async () => {
    if (!email.trim()) {
      setErro('Informe o e-mail do destinatário.')
      return
    }
    const link = await garantirLink()
    if (!link?.token) return

    setLoading(true)
    setErro('')
    setSucesso('')
    try {
      const ret = await apiGeral.enviarEmailAprovacaoProposta({
        token: link.token,
        mensagem: mensagem.trim() || undefined,
      })
      if (!ret.success) {
        setErro(ret.message || 'Não foi possível enviar o e-mail.')
        return
      }
      setSucesso('E-mail enviado com sucesso.')
    } finally {
      setLoading(false)
    }
  }

  const handleAbrirWhatsApp = async () => {
    const link = await garantirLink()
    if (!link?.publicUrl) return

    const texto = encodeURIComponent(montarMensagemWhatsApp(link.publicUrl))
    const digits = whatsapp.replace(/\D/g, '')
    const url = digits
      ? `https://wa.me/55${digits}?text=${texto}`
      : `https://wa.me/?text=${texto}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose} size="lg">
      <CModalHeader>
        <CModalTitle>Enviar proposta para aprovação</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="g-3">
          <CCol md={12}>
            <TextInputField
              name="nomeDestinatario"
              placeholder="Nome do destinatário"
              value={nomeDestinatario}
              onChange={(e) => setNomeDestinatario(e.target.value)}
            />
          </CCol>
          <CCol md={6}>
            <TextInputField
              name="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </CCol>
          <CCol md={6}>
            <TextInputField
              name="whatsapp"
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </CCol>
          <CCol md={12}>
            <CFormTextarea
              label="Mensagem opcional"
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </CCol>
          {linkCriado?.publicUrl ? (
            <CCol md={12}>
              <small className="text-body-secondary d-block">Link gerado:</small>
              <code className="d-block text-break">{linkCriado.publicUrl}</code>
            </CCol>
          ) : null}
          {erro ? (
            <CCol md={12}>
              <div className="text-danger">{erro}</div>
            </CCol>
          ) : null}
          {sucesso ? (
            <CCol md={12}>
              <div className="text-success">{sucesso}</div>
            </CCol>
          ) : null}
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={handleClose} disabled={loading}>
          Cancelar
        </CButton>
        <CButton color="info" variant="outline" onClick={handleCopiarLink} disabled={loading}>
          Copiar Link
        </CButton>
        <CButton color="primary" variant="outline" onClick={handleEnviarEmail} disabled={loading}>
          Enviar Email
        </CButton>
        <CButton color="success" onClick={handleAbrirWhatsApp} disabled={loading}>
          Abrir WhatsApp
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalEnviarAprovacaoProposta
