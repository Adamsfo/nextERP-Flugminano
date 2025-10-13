import { useState, useEffect, useCallback } from 'react'
import {
  ColumnFilterValue,
  SorterValue,
} from '@coreui/react-pro/dist/esm/components/smart-table/types'

interface Meta {
  totalPages: number
}

export interface UseSmartTableProps {
  activePage: number
  itemsPerPage: number
  columnFilter: Record<string, ColumnFilterValue>
  columnSorter: SorterValue | null
  search: string
  fetchFunction?: (params: Record<string, any>) => Promise<any>
  empresaId: number[]
  filtroFixo?: Record<string, any>
  filtroPorEmpresa: boolean
  atualizar?: boolean
}

const useSmartTable = ({
  activePage,
  itemsPerPage,
  columnFilter,
  columnSorter,
  search,
  fetchFunction,
  empresaId,
  filtroFixo,
  filtroPorEmpresa,
  atualizar,
}: UseSmartTableProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [registros, setRegistros] = useState<any[]>([])
  const [meta, setMeta] = useState<Meta>({ totalPages: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Record<string, ColumnFilterValue> = { ...columnFilter }

      if (filtroPorEmpresa) {
        if (empresaId && empresaId.length > 0) {
          filters.empresaId = empresaId.join(',') as any // Concatena os IDs separados por vírgula
        } else {
          filters.empresaId = '0' as any
        }
      }

      // Adiciona o filtro fixo, se ele existir
      if (filtroFixo) {
        Object.keys(filtroFixo).forEach((key) => {
          filters[key] = filtroFixo[key] as any
        })
      }

      const params: Record<string, any> = {
        page: activePage,
        pageSize: itemsPerPage,
        sortBy: columnSorter?.column || 'id',
        order: columnSorter?.state || 'asc',
        filters: filters,
      }

      if (search) {
        params.search = search
      }

      const response = fetchFunction && (await fetchFunction(params)) // Usa a função de busca passada
      if (response && response.success) {
        setMeta({ totalPages: response.meta?.totalPages || 0 })
        setRegistros(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [
    activePage,
    itemsPerPage,
    columnFilter,
    columnSorter,
    search,
    fetchFunction,
    empresaId,
    atualizar,
  ])

  const refreshTable = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { loading, registros, meta, refreshTable }
}

export default useSmartTable
