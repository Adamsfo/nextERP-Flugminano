import { CModal } from '@coreui/react-pro'
import FormItem from './formItem'
import { ProtocoloItem } from '@/types/geral'

type ModalProtocoloItemProps = {
  modal: boolean
  setModal: (value: boolean) => void
  item: ProtocoloItem
  protocoloId: number
  laboratorioId: number
  index: number
  handleItemChange: <K extends keyof ProtocoloItem>(
    index: number,
    field: K,
    value: ProtocoloItem[K]
  ) => void
  handleAdicionarItem: (item: ProtocoloItem) => void
}

const ModalProtocoloItem: React.FC<ModalProtocoloItemProps> = ({
  modal,
  setModal,
  item,
  index,
  protocoloId,
  laboratorioId,
  handleItemChange,
  handleAdicionarItem,
}) => {
  const handleClose = () => {
    setModal(false)
  }

  return (
    <CModal visible={modal} alignment="center" size="xl" onClose={handleClose}>
      <FormItem
        params={{
          item,
          onClose: handleClose,
          protocoloId: protocoloId,
          laboratorioId: laboratorioId,
          index,
        }}
        handleItemChange={handleItemChange}
        handleAdicionarItem={handleAdicionarItem}
      />
    </CModal>
  )
}

export default ModalProtocoloItem
