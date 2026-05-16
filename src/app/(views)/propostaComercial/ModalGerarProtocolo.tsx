'use client'

import { useState } from 'react'
import {
  CButton,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { useRouter } from 'next/navigation'

interface ModalGerarProtocoloProps {
  visible: boolean
  setVisible: (v: boolean) => void
  propostaComercialId: number
}

const ModalGerarProtocolo: React.FC<ModalGerarProtocoloProps> = ({
  visible,
  setVisible,
  propostaComercialId,
}) => {
  const router = useRouter()
  const [qtd, setQtd] = useState<string>('1')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleClose = () => {
    setVisible(false)
    setErro('')
    setQtd('1')
  }

  const handleConfirm = async () => {
    setErro('')
    const n = parseInt(qtd, 10)
    if (!Number.isFinite(n) || n < 1) {
      setErro('Informe um número inteiro maior ou igual a 1.')
      return
    }
    setLoading(true)
    try {
      const ret = await apiGeral.gerarProtocoloDeProposta({
        propostaComercialId,
        quantidadeAmostras: n,
      })
      if (!ret.success) {
        setErro(ret.message || 'Não foi possível gerar o protocolo.')
        return
      }
      const criado = ret.data as { id?: number }
      handleClose()
      if (criado?.id) {
        router.push(`/protocolo/${criado.id}`)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>Gerar protocolo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel htmlFor="quantidadeAmostras">Quantidade de amostras</CFormLabel>
        <CFormInput
          id="quantidadeAmostras"
          type="number"
          min={1}
          step={1}
          value={qtd}
          onChange={(e) => setQtd(e.target.value)}
        />
        {erro && <div className="text-danger mt-2">{erro}</div>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Gerando…' : 'Confirmar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalGerarProtocolo
