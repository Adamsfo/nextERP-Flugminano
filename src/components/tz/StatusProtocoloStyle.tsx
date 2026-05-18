import type { ProtocoloStatus } from '@/types/geral'

interface StatusStyle {
  color: string
  background: string
}

export function getStatusProtocoloStyle(status: ProtocoloStatus): StatusStyle {
  const map: Record<ProtocoloStatus, StatusStyle> = {
    Protocolado: {
      color: '#0d6efd',
      background: '#e7f1ff',
    },
    'Lab. Gerado(s)': {
      color: '#0f766e',
      background: '#ccfbf1',
    },
    Recebido: {
      color: '#fd7e14',
      background: '#fff4e6',
    },
    'Em análise': {
      color: '#6f42c1',
      background: '#f3e8ff',
    },
    Finalizado: {
      color: '#198754',
      background: '#e6f4ea',
    },
    Cancelado: {
      color: '#dc3545',
      background: '#fbeaea',
    },
  }

  return (
    map[status] ?? {
      color: '#6c757d',
      background: '#f8f9fa',
    }
  )
}
