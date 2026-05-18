'use client'

import { useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { useRouter } from 'next/navigation'

interface ModalGerarLaboratoriosProps {
  visible: boolean
  setVisible: (v: boolean) => void
  protocoloId: number
  quantidadeAmostras: number
  protocoloNumero?: string
}

const ModalGerarLaboratorios: React.FC<ModalGerarLaboratoriosProps> = ({
  visible,
  setVisible,
  protocoloId,
  quantidadeAmostras,
  protocoloNumero,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleClose = () => {
    setVisible(false)
    setErro('')
  }

  const handleConfirm = async () => {
    setErro('')
    setLoading(true)
    try {
      const ret = await apiGeral.gerarLaboratoriosDeProtocolo({ protocoloId })
      if (!ret.success) {
        setErro(ret.message || 'Não foi possível gerar os laboratórios.')
        return
      }
      if (!protocoloNumero?.trim()) {
        setErro('Número do protocolo não disponível para filtrar a listagem.')
        return
      }
      handleClose()
      const numero = encodeURIComponent(protocoloNumero.trim())
      router.push(`/laboratorios?search=${numero}&filterField=protocolo_numero`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>Gerar laboratórios</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>
          Serão gerados <strong>{quantidadeAmostras}</strong> registro(s) de laboratório
          {protocoloNumero ? (
            <>
              {' '}
              para o protocolo <strong>{protocoloNumero}</strong>.
            </>
          ) : (
            '.'
          )}
        </p>
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

export default ModalGerarLaboratorios
