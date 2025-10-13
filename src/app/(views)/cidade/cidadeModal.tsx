import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import CidadeForm from './cidadeForm'

type CidadeModalProps = {
  modal: boolean
  setModal: (value: boolean) => void
  id: string
}

const CidadeModal: React.FC<CidadeModalProps> = ({ modal, setModal, id }) => {
  const handleClose = () => {
    setModal(false)
  }

  return (
    <CModal visible={modal} alignment="center" size="lg" onClose={handleClose}>
      <CidadeForm params={{ id, onClose: handleClose }} />
    </CModal>
  )
}

export default CidadeModal
