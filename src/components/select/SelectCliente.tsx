'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CButton, CFormFeedback, CFormLabel, CMultiSelect, CTooltip } from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { ClienteFornecedor } from '@/types/geral'
import CIcon from '@coreui/icons-react'
import { cilLoopCircular, cilPlus } from '@coreui/icons'
import PermissionGate from '@/components/auth/PermissionGate'
import { formatClienteFornecedorSelectLabel } from '@/lib/clienteFornecedorForm'
import {
  ClienteSelectFallback,
  ClienteSelectOption,
  ensureClienteSelectOption,
} from '@/lib/clienteSelectOptions'
import { useTypedSelector } from '@/store'

interface CustomMultiSelectProps {
  id: number | null | undefined
  setId: (value: number | null) => void
  setDescricao?: (value: string) => void
  invalid?: boolean
  feedbackMessage?: string
  showQuickAdd?: boolean
  onQuickAddClick?: () => void
  showRefresh?: boolean
  onRefreshClick?: () => void
  refreshToken?: number
  /** Rótulo temporário quando o cliente ainda não está na lista (ex.: snapshot da proposta). */
  fallbackOption?: ClienteSelectFallback | null
  empresaIds?: number[]
  [key: string]: unknown
}

let timer: NodeJS.Timeout

function mapClienteToOption(record: ClienteFornecedor): ClienteSelectOption {
  return {
    value: record.id,
    label: formatClienteFornecedorSelectLabel(record),
    selected: false,
  }
}

const SelectCliente: React.FC<CustomMultiSelectProps> = ({
  id,
  setId,
  setDescricao,
  invalid = false,
  feedbackMessage,
  showQuickAdd = false,
  onQuickAddClick,
  showRefresh = false,
  onRefreshClick,
  refreshToken = 0,
  fallbackOption = null,
  empresaIds: empresaIdsProp,
  ...rest
}) => {
  const empresaIdHeader = useTypedSelector((state) => state.empresaId)
  const empresaIds =
    empresaIdsProp && empresaIdsProp.length > 0 ? empresaIdsProp : empresaIdHeader

  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<ClienteSelectOption[]>([])
  const loadSeqRef = useRef(0)
  const selectedIdRef = useRef<number | null | undefined>(id)
  const fallbackRef = useRef(fallbackOption)

  selectedIdRef.current = id
  fallbackRef.current = fallbackOption

  const buildListFilters = useCallback((): Record<string, string | number> => {
    const filters: Record<string, string | number> = { tipo: 'Cliente' }
    if (empresaIds?.length) {
      filters.empresaId = empresaIds.join(',')
    }
    return filters
  }, [empresaIds])

  const fetchClienteById = useCallback(async (clienteId: number): Promise<ClienteSelectOption | null> => {
    const response = await apiGeral.getResource<ClienteFornecedor>('/clienteFornecedor', {
      filters: { id: clienteId },
      pageSize: 1,
    })
    const record = response.data?.[0]
    if (!record) return null
    return mapClienteToOption(record)
  }, [])

  const carregarRegistros = useCallback(
    async (search = '', selectedId?: number | null) => {
      const seq = ++loadSeqRef.current
      setLoading(true)
      try {
        const response = await apiGeral.getResource<ClienteFornecedor>('/clienteFornecedor', {
          search,
          pageSize: 30,
          sortBy: 'razaoSocialNome',
          order: 'asc',
          filters: buildListFilters(),
        })

        if (seq !== loadSeqRef.current) return

        let options = (response.data ?? []).map((record) => mapClienteToOption(record))

        const resolvedId = selectedId ?? selectedIdRef.current
        if (resolvedId && !options.some((o) => o.value === resolvedId)) {
          const fetched = await fetchClienteById(resolvedId)
          if (seq !== loadSeqRef.current) return
          if (fetched) {
            options = [fetched, ...options]
          }
        }

        const finalOptions = ensureClienteSelectOption(
          options,
          resolvedId,
          fallbackRef.current
        )

        if (seq !== loadSeqRef.current) return
        setRegistros(finalOptions)
      } finally {
        if (seq === loadSeqRef.current) {
          setLoading(false)
        }
      }
    },
    [buildListFilters, fetchClienteById]
  )

  const getRegistros = useCallback(
    (search = '') => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        void carregarRegistros(search, selectedIdRef.current ?? undefined)
      }, 400)
    },
    [carregarRegistros]
  )

  useEffect(() => {
    void carregarRegistros('', id ?? undefined)
  }, [id, refreshToken, carregarRegistros, empresaIds, fallbackOption])

  useEffect(() => {
    if (!id || id <= 0) return
    setRegistros((prev) => ensureClienteSelectOption(prev, id, fallbackOption))
  }, [id, fallbackOption])

  const handleSelect = (selectedValues: { value: number | string; label: string }[]) => {
    if (!selectedValues?.length || !selectedValues[0]) {
      return
    }
    const clienteId = Number(selectedValues[0].value)
    if (!Number.isFinite(clienteId) || clienteId <= 0) return
    setId(clienteId)
    if (setDescricao) {
      setDescricao(selectedValues[0].label)
    }
  }

  const selectBlock = (
    <div
      className={`mydivborder ${invalid ? 'is-invalid' : ''}`}
      style={{
        flexDirection: 'column',
        height: '60px',
        borderRadius: '6px',
        margin: 0,
        border: '1px solid',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ marginTop: '2px', height: '17px', padding: 0, marginBottom: '2px' }}>
        <CFormLabel
          style={{
            margin: 0,
            fontSize: '13px',
            marginRight: '10px',
            marginLeft: '10px',
            color: '#b1b7c1',
          }}
          htmlFor="validationText"
        >
          Cliente
        </CFormLabel>
      </div>
      <CMultiSelect
        loading={loading}
        onFilterChange={(value) => getRegistros(value)}
        options={registros}
        name="clienteId"
        placeholder="Selecione um Cliente"
        search="external"
        virtualScroller
        multiple={false}
        optionsStyle="text"
        resetSelectionOnOptionsChange={false}
        onChange={(e: any) => handleSelect(e)}
        className="my-custom-multiselect"
        {...rest}
      />
      {invalid && feedbackMessage && (
        <CFormFeedback invalid style={{ display: 'block' }}>
          {feedbackMessage}
        </CFormFeedback>
      )}
    </div>
  )

  if (!showQuickAdd && !showRefresh) {
    return <div style={{ marginBottom: '7px' }}>{selectBlock}</div>
  }

  return (
    <div style={{ marginBottom: '7px', width: '100%' }}>
      <div className="d-flex align-items-start gap-2">
        {selectBlock}
        {showQuickAdd && (
          <PermissionGate permission={2}>
            <CTooltip content="Cadastrar cliente" placement="top">
              <CButton
                type="button"
                color="primary"
                variant="outline"
                className="px-2"
                style={{ height: '60px', minWidth: '40px' }}
                onClick={onQuickAddClick}
                aria-label="Cadastrar cliente"
              >
                <CIcon icon={cilPlus} size="lg" />
              </CButton>
            </CTooltip>
          </PermissionGate>
        )}
        {showRefresh && (
          <CTooltip content="Atualizar pesquisa" placement="top">
            <CButton
              type="button"
              color="secondary"
              variant="ghost"
              className="px-2"
              style={{ height: '60px', minWidth: '40px' }}
              onClick={onRefreshClick}
              aria-label="Atualizar pesquisa de clientes"
            >
              <CIcon icon={cilLoopCircular} size="lg" />
            </CButton>
          </CTooltip>
        )}
      </div>
    </div>
  )
}

export default SelectCliente
