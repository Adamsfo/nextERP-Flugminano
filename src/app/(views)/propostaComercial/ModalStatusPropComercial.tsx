'use client'

import { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { PropostaComercial } from '@/types/geral'
import { apiGeral } from '@/lib/geral'

const statusOptions = ['Rascunho', 'Enviada', 'Aprovada', 'Reprovada', 'Cancelada', 'Expirada']

interface ModalStatusProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  registro: PropostaComercial
  setAtualizar?: (atualizar: boolean) => void
}

const ModalStatusPropComercial: React.FC<ModalStatusProps> = ({
  visible,
  setVisible,
  registro,
  setAtualizar,
}) => {
  const handleClose = () => {
    setVisible(false) // Fecha o modal definindo visible como false
  }

  const [status, setStatus] = useState<(typeof statusOptions)[number]>(registro.status)

  const handleSave = async () => {
    const updatedRegistro = { ...registro, status }
    await apiGeral.updateResorce<PropostaComercial>('/proposta', updatedRegistro)
    setVisible(false)
    if (setAtualizar) {
      setAtualizar(true)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>Alterar Status da Proposta Comercial {registro.numero}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormSelect
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statusOptions)[number])}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </CFormSelect>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>
          Fechar
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          Salvar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalStatusPropComercial
