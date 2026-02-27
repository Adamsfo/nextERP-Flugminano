type Status = 'Rascunho' | 'Enviada' | 'Aprovada' | 'Reprovada' | 'Cancelada' | 'Expirada'

interface StatusStyle {
  color: string
  background: string
  label: string
}

export function getStatusPropostaStyle(status: Status): StatusStyle {
  const map: Record<Status, StatusStyle> = {
    Rascunho: {
      color: '#6c757d',
      background: '#f1f3f5',
      label: 'Rascunho',
    },
    Enviada: {
      color: '#0d6efd',
      background: '#e7f1ff',
      label: 'Enviada',
    },
    Aprovada: {
      color: '#198754',
      background: '#e6f4ea',
      label: 'Aprovada',
    },
    Reprovada: {
      color: '#dc3545',
      background: '#fbeaea',
      label: 'Reprovada',
    },
    Cancelada: {
      color: '#fd7e14',
      background: '#fff4e6',
      label: 'Cancelada',
    },
    Expirada: {
      color: '#6f42c1',
      background: '#f3e8ff',
      label: 'Expirada',
    },
  }

  return map[status]
}
