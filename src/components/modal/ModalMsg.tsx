'use client'

import { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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

interface ModalMsgProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  msg?: string
}

const ModalMsg: React.FC<ModalMsgProps> = ({ visible, setVisible, msg }) => {
  const handleClose = () => {
    setVisible(false) // Fecha o modal definindo visible como false
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>Informação</CModalTitle>
      </CModalHeader>
      <CModalBody>{msg}</CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleClose}>
          Fechar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalMsg
