'use client'

import { CBadge } from '@coreui/react-pro'

export type LaboratorioItensCacheEntry = {
  loading: boolean
  loaded: boolean
  nomes: string[]
}

type Props = {
  cache?: LaboratorioItensCacheEntry
}

export default function LaboratorioItensResumo({ cache }: Props) {
  if (!cache || cache.loading) {
    return <span className="text-body-secondary">Carregando análises...</span>
  }

  if (cache.loaded && cache.nomes.length === 0) {
    return <span className="text-body-secondary">Sem análises vinculadas</span>
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      <span className="fw-semibold me-1">Análises do laboratório:</span>
      {cache.nomes.map((nome, index) => (
        <CBadge key={`${nome}-${index}`} color="secondary" className="fw-normal">
          {nome}
        </CBadge>
      ))}
    </div>
  )
}
