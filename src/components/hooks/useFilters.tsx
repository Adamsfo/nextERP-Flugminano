import { useState, useRef } from 'react'
import {
  ColumnFilterValue,
  SorterValue,
} from '@coreui/react-pro/dist/esm/components/smart-table/types'

const useFilters = () => {
  const [columnFilter, setColumnFilter] = useState<Record<string, ColumnFilterValue>>({})
  const [columnSorter, setColumnSorter] = useState<SorterValue | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)
  const [activePage, setActivePage] = useState<number>(1)
  const [search, setSearch] = useState<string>('') // Inicializa com string vazia

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleColumnFilterChange = (filter: Record<string, ColumnFilterValue>) => {
    const hasChanged = Object.keys(filter).some(
      (key) => JSON.stringify(filter[key]) !== JSON.stringify(columnFilter[key])
    )

    if (hasChanged) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setColumnFilter(filter)
        setActivePage(1)
      }, 500)
    }
  }

  const handleSearchChange = (newSearch: string) => {
    if (newSearch !== search) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setSearch(newSearch ?? '') // Garante que search nunca seja null/undefined
        setActivePage(1)
      }, 500)
    }
  }

  return {
    columnFilter,
    columnSorter,
    itemsPerPage,
    activePage,
    search,
    setColumnFilter,
    setColumnSorter,
    setItemsPerPage,
    setActivePage,
    setSearch: handleSearchChange,
    handleColumnFilterChange,
  }
}

export default useFilters
