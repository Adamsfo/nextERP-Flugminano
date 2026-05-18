import { LaboratoriosStatus } from '@/types/geral'

type StatusStyle = { color: string; background: string }

export function getStatusLaboratoriosStyle(status: LaboratoriosStatus): StatusStyle {
  switch (status) {
    case 'Gerado':
      return { color: '#0d6efd', background: '#e7f1ff' }
    case 'Recebido':
      return { color: '#198754', background: '#d1e7dd' }
    case 'Em análise':
      return { color: '#fd7e14', background: '#fff3cd' }
    case 'Finalizado':
      return { color: '#6f42c1', background: '#e2d9f3' }
    case 'Cancelado':
      return { color: '#dc3545', background: '#f8d7da' }
    default:
      return { color: '#6c757d', background: '#f8f9fa' }
  }
}
