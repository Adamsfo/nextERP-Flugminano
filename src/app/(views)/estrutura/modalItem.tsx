import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import FormItem from './formItem'
import { EstruturaTorneioItem } from '@/types/geral'

type EstruturaItemModalProps = {
  modal: boolean
  setModal: (value: boolean) => void
  item: EstruturaTorneioItem
  estruturaId: number
  index: number
  handleItemChange: <K extends keyof EstruturaTorneioItem>(
    index: number,
    field: K,
    value: EstruturaTorneioItem[K]
  ) => void
  handleAdicionarItem: (item: EstruturaTorneioItem) => void
}

const ModalEstruturaItem: React.FC<EstruturaItemModalProps> = ({
  modal,
  setModal,
  item,
  index,
  estruturaId,
  handleItemChange,
  handleAdicionarItem,
}) => {
  const handleClose = () => {
    setModal(false)
  }

  return (
    <CModal visible={modal} alignment="center" size="xl" onClose={handleClose}>
      <FormItem
        params={{ item, onClose: handleClose, estruturaId: estruturaId, index }}
        handleItemChange={handleItemChange}
        handleAdicionarItem={handleAdicionarItem}
      />
    </CModal>
  )
}

export default ModalEstruturaItem
