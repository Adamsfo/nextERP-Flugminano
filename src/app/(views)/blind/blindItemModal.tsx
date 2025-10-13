import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import BlindItemForm from './formItem'

type BlindItemModalProps = {
  modal: boolean
  setModal: (value: boolean) => void
  id: string
  blindId: number
}

const BlindItemModal: React.FC<BlindItemModalProps> = ({ modal, setModal, id, blindId }) => {
  const handleClose = () => {
    setModal(false)
  }

  return (
    <CModal visible={modal} alignment="center" size="xl" onClose={handleClose}>
      <BlindItemForm params={{ id, onClose: handleClose, blindId: blindId }} />
    </CModal>
  )
}

export default BlindItemModal
