'use client'

import { CModal, CModalBody, CModalFooter, CButton } from '@coreui/react-pro'

interface ConfirmModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  onConfirm: () => void
  message: string
}

const ConfirmModal = ({ visible, setVisible, onConfirm, message }: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm()
    setVisible(false)
  }

  return (
    <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
      <CModalBody>{message}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" onClick={handleConfirm}>
          Excluir
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmModal
