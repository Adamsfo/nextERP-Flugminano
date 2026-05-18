import { PropostaAprovacaoLinkStatus } from '@/types/geral'

interface StatusStyle {
  color: string
  background: string
  label: string
}

export function getStatusAprovacaoLinkStyle(status: PropostaAprovacaoLinkStatus | string): StatusStyle {
  const map: Record<string, StatusStyle> = {
    PENDENTE: { color: '#856404', background: '#fff3cd', label: 'Aguardando' },
    APROVADA: { color: '#198754', background: '#e6f4ea', label: 'Aprovada' },
    REPROVADA: { color: '#dc3545', background: '#fbeaea', label: 'Reprovada' },
    EXPIRADO: { color: '#6c757d', background: '#f1f3f5', label: 'Expirada' },
  }
  return map[status] || map.EXPIRADO
}
