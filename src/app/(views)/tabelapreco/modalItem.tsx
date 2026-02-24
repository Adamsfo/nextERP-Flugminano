import { CModal } from '@coreui/react-pro'
import FormItem from './formItem'
import { TabelaPrecoItem } from '@/types/geral'

type TabelaPrecoItemModalProps = {
  modal: boolean
  setModal: (value: boolean) => void
  item: TabelaPrecoItem
  tabelaPrecoId: number
  laboratorioId: number
  index: number
  handleItemChange: <K extends keyof TabelaPrecoItem>(
    index: number,
    field: K,
    value: TabelaPrecoItem[K]
  ) => void
  handleAdicionarItem: (item: TabelaPrecoItem) => void
}

const ModalTabelaPrecoItem: React.FC<TabelaPrecoItemModalProps> = ({
  modal,
  setModal,
  item,
  index,
  tabelaPrecoId,
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
          tabelaPrecoId: tabelaPrecoId,
          laboratorioId: laboratorioId,
          index,
        }}
        handleItemChange={handleItemChange}
        handleAdicionarItem={handleAdicionarItem}
      />
    </CModal>
  )
}

export default ModalTabelaPrecoItem
