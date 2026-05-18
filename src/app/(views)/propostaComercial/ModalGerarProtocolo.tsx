'use client'

import { useEffect, useState } from 'react'
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

const MSG_QTD_MAIOR_PROPOSTA =
  'A quantidade de amostras do protocolo não pode ser maior que a quantidade cadastrada na proposta comercial.'

interface ModalGerarProtocoloProps {
  visible: boolean
  setVisible: (v: boolean) => void
  propostaComercialId: number
  propostaQuantidadeAmostras?: number
}

const ModalGerarProtocolo: React.FC<ModalGerarProtocoloProps> = ({
  visible,
  setVisible,
  propostaComercialId,
  propostaQuantidadeAmostras,
}) => {
  const router = useRouter()
  const [qtd, setQtd] = useState<string>('1')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const maxAmostras =
    propostaQuantidadeAmostras !== undefined &&
    propostaQuantidadeAmostras !== null &&
    Number(propostaQuantidadeAmostras) >= 1
      ? Number(propostaQuantidadeAmostras)
      : undefined

  useEffect(() => {
    if (!visible) return
    setQtd('1')
    setErro('')
  }, [visible, maxAmostras, propostaComercialId])

  const validarQuantidade = (n: number, valorVazio = false): string => {
    if (valorVazio) return ''
    if (!Number.isFinite(n) || n < 1) {
      return 'Informe um número inteiro maior ou igual a 1.'
    }
    if (maxAmostras !== undefined && n > maxAmostras) {
      return MSG_QTD_MAIOR_PROPOSTA
    }
    return ''
  }

  const handleClose = () => {
    setVisible(false)
    setErro('')
    setQtd('1')
  }

  const handleChangeQtd = (value: string) => {
    setQtd(value)
    if (value.trim() === '') {
      setErro('')
      return
    }
    const n = parseInt(value, 10)
    setErro(validarQuantidade(n))
  }

  const handleConfirm = async () => {
    setErro('')
    const n = parseInt(qtd, 10)
    const erroValidacao = validarQuantidade(n, qtd.trim() === '')
    if (erroValidacao) {
      setErro(erroValidacao)
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
          max={maxAmostras}
          step={1}
          value={qtd}
          onChange={(e) => handleChangeQtd(e.target.value)}
        />
        {maxAmostras !== undefined ? (
          <div className="text-body-secondary small mt-1">
            Máximo permitido pela proposta comercial: <strong>{maxAmostras}</strong>
          </div>
        ) : null}
        {erro && <div className="text-danger mt-2">{erro}</div>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={handleConfirm} disabled={loading || !!erro}>
          {loading ? 'Gerando…' : 'Confirmar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalGerarProtocolo
