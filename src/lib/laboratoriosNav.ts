/** Query de retorno da listagem de laboratórios (filtro de busca / protocolo). */
export type LaboratoriosListQuery = {
  search?: string | null
  filterField?: string | null
}

export function laboratoriosListUrl(query?: LaboratoriosListQuery): string {
  const q = new URLSearchParams()
  const search = query?.search?.trim()
  if (search) {
    q.set('search', search)
  }
  if (query?.filterField) {
    q.set('filterField', query.filterField)
  }
  const qs = q.toString()
  return qs ? `/laboratorios?${qs}` : '/laboratorios'
}

export function laboratoriosEditUrl(
  id: number | string,
  returnQuery?: LaboratoriosListQuery
): string {
  const q = new URLSearchParams()
  const search = returnQuery?.search?.trim()
  if (search) {
    q.set('search', search)
  }
  if (returnQuery?.filterField) {
    q.set('filterField', returnQuery.filterField)
  }
  const qs = q.toString()
  return `/laboratorios/${id}${qs ? `?${qs}` : ''}`
}

export function readLaboratoriosReturnFromSearchParams(
  searchParams: URLSearchParams
): LaboratoriosListQuery {
  return {
    search: searchParams.get('search') ?? searchParams.get('filter'),
    filterField: searchParams.get('filterField'),
  }
}

export type LaboratoriosListFilterState = {
  search: string
  filtroFixo?: Record<string, string | number>
}

/** Estado de busca/filtro da listagem a partir da querystring (campo + filtro da API). */
export function laboratoriosListStateFromSearchParams(
  searchParams: URLSearchParams
): LaboratoriosListFilterState {
  const { search: searchParam, filterField } = readLaboratoriosReturnFromSearchParams(searchParams)
  const valor = searchParam?.trim() ?? ''

  if (!valor) {
    return { search: '', filtroFixo: undefined }
  }

  if (filterField === 'protocolo_numero') {
    return { search: valor, filtroFixo: { protocolo_numero: valor } }
  }

  return { search: valor, filtroFixo: undefined }
}

export function laboratoriosListQueryFromState(
  search: string,
  filtroFixo?: Record<string, string | number>
): LaboratoriosListQuery {
  const trimmed = search.trim()
  if (!trimmed) {
    return {}
  }
  if (filtroFixo?.protocolo_numero !== undefined) {
    return { search: trimmed, filterField: 'protocolo_numero' }
  }
  return { search: trimmed }
}
