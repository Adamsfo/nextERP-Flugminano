'use client'

import { CButton, CFormInput, CFormLabel, CSmartTable } from '@coreui/react-pro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useFilters from '@/components/hooks/useFilters'
import useSmartTable from '@/components/hooks/useSmartTable'
import { CSmartTableProps } from '@coreui/react-pro/dist/esm/components/smart-table/CSmartTableInterface'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilPlus } from '@coreui/icons'
import { useTypedSelector } from '../../store'

interface SmartTableWrapperProps
  extends Omit<CSmartTableProps, 'columns' | 'items' | 'loading' | 'paginationProps'> {
  fetchFunction?: (params: Record<string, any>) => Promise<any> // Ajuste no tipo da função de busca
  columns: CSmartTableProps['columns']
  search?: string
  refreshSmartTable?: (refreshTable: () => void) => void
  filtroPorEmpresa?: boolean
  filtroFixo?: Record<string, any>
  items?: any[]
  atualizar?: boolean
}

const SmartTableWrapper: React.FC<SmartTableWrapperProps> = ({
  fetchFunction,
  columns,
  search = '', // Provide a default value for search
  refreshSmartTable,
  filtroPorEmpresa = true,
  filtroFixo,
  items,
  atualizar,
  ...rest
}) => {
  const {
    columnFilter,
    columnSorter,
    itemsPerPage,
    activePage,
    setColumnSorter,
    setItemsPerPage,
    setActivePage,
    handleColumnFilterChange,
  } = useFilters()

  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)

  const { loading, registros, meta, refreshTable } = useSmartTable({
    activePage,
    itemsPerPage,
    columnFilter,
    columnSorter,
    search, // Adiciona o parâmetro de busca
    fetchFunction: items ? undefined : fetchFunction,
    empresaId: empresaIdSelecionada,
    filtroFixo,
    filtroPorEmpresa,
    atualizar,
  })

  const [externalItems, setExternalItems] = useState<any[]>([])

  // Atualizar o estado quando os `items` externos mudarem
  useEffect(() => {
    if (items) {
      setExternalItems(items)
    }
  }, [items])

  const columnSettings = useMemo(() => columns, [columns])

  // Memoize the refreshTable callback to avoid re-rendering issues
  const memoizedRefreshTable = useCallback(() => {
    if (refreshSmartTable) {
      refreshSmartTable(refreshTable)
    }
  }, [refreshSmartTable, refreshTable])

  useEffect(() => {
    memoizedRefreshTable()
  }, [memoizedRefreshTable])

  return (
    <div>
      <CSmartTable
        columns={columnSettings}
        columnFilter={{ external: true }}
        columnSorter={{ external: true }}
        loading={loading && !items}
        items={items || registros}
        itemsPerPageSelect
        itemsPerPage={itemsPerPage}
        pagination={{ external: true }}
        paginationProps={{
          activePage: activePage,
          pages: meta.totalPages,
        }}
        tableProps={{
          className: 'add-this-class',
          responsive: true,
          striped: true,
          hover: true,
        }}
        columnFilterValue={columnFilter}
        onColumnFilterChange={handleColumnFilterChange}
        onSorterChange={setColumnSorter}
        onActivePageChange={setActivePage}
        onItemsPerPageChange={(itemsPerPage) => {
          setItemsPerPage(itemsPerPage)
          setActivePage(1)
        }}
        itemsPerPageLabel="Registros por página"
        noItemsLabel="Nenhum registro encontrado"
        tableFilterLabel="Filtrar"
        tableFilterPlaceholder="Digite para filtrar"
        // cleaner
        {...rest}
      />
    </div>
  )
}

export default SmartTableWrapper
