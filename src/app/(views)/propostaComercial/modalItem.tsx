import { CModal } from '@coreui/react-pro'
import FormItem from './formItem'
import { PropostaComercialItem } from '@/types/geral'

type PropostaComercialItemModalProps = {
  modal: boolean
  setModal: (value: boolean) => void
  item: PropostaComercialItem
  propostaComercialId: number
  laboratorioId: number
  index: number
  handleItemChange: <K extends keyof PropostaComercialItem>(
    index: number,
    field: K,
    value: PropostaComercialItem[K]
  ) => void
  handleAdicionarItem: (item: PropostaComercialItem) => void
}

const ModalPropostaComercialItem: React.FC<PropostaComercialItemModalProps> = ({
  modal,
  setModal,
  item,
  index,
  propostaComercialId,
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
          propostaComercialId: propostaComercialId,
          laboratorioId: laboratorioId,
          index,
        }}
        handleItemChange={handleItemChange}
        handleAdicionarItem={handleAdicionarItem}
      />
    </CModal>
  )
}

export default ModalPropostaComercialItem
