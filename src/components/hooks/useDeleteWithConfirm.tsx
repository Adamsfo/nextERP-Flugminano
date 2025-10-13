import { useState } from 'react'
import ModalConfirm from '@/components/modal/ModalConfirm'

export const useDeleteWithConfirm = (onDelete: (id: string) => Promise<void>) => {
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const handleExcluirClick = (id: string) => {
    setCurrentId(id)
    setConfirmVisible(true)
  }

  const confirmDeletion = async () => {
    if (currentId) {
      await onDelete(currentId)
      setCurrentId(null)
    }
  }

  const ConfirmModalComponent = (
    <ModalConfirm
      visible={confirmVisible}
      setVisible={setConfirmVisible}
      onConfirm={confirmDeletion}
      message="Tem certeza que deseja excluir este registro?"
    />
  )

  return { handleExcluirClick, ConfirmModalComponent }
}
