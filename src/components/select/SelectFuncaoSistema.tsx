'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CMultiSelect } from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { FuncaoSistema } from '@/types/geral'

interface CustomMultiSelectProps {
  id: number | null | undefined // Permitir múltiplos IDs
  setId: (value: any) => void
  setFuncaoSistema?: (value: any) => void
}

const SelectFuncaoSistema: React.FC<CustomMultiSelectProps> = ({ id, setId, setFuncaoSistema }) => {
  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<{ value: number; label: string; selected: boolean }[]>(
    []
  )

  const getRegistros = useCallback(
    async (search = '') => {
      setLoading(true)
      const response = await apiGeral.getResource<FuncaoSistema>('/funcaosistema', {
        search,
        pageSize: 15,
      })
      const registrosData = (response.data ?? []).map((record: FuncaoSistema) => ({
        value: record.id,
        label: record.funcaoSistema,
      }))

      setRegistros(registrosData.map((item) => ({ ...item, selected: false })))
      setLoading(false)

      // Se o ID foi passado e existe no resultado, selecione-o
      if (id) {
        setRegistros(
          registrosData.map((item: any) => {
            if (item.value === id) {
              return { ...item, selected: true }
            }
            return item
          })
        )
      }
    },
    [id]
  )

  useEffect(() => {
    if (id) {
      getRegistros(id.toString())
    } else {
      getRegistros()
    }
  }, [id, getRegistros])

  const handleSelect = (selectedValues: { value: number; label: string }[]) => {
    if (selectedValues[0]) {
      setId(selectedValues[0].value) // Passa apenas os valores para setId
      if (setFuncaoSistema) {
        setFuncaoSistema(selectedValues[0].label)
      }
    }

    // console.log(selectedValues.value)
    // console.log(selectedValues.label)
  }

  return (
    <CMultiSelect
      loading={loading}
      onFilterChange={(value) => getRegistros(value)}
      options={registros}
      placeholder="Funcão do Sistema"
      search="external"
      virtualScroller
      multiple={false}
      optionsStyle="text"
      style={{ width: '600px' }}
      onChange={(e: any) => handleSelect(e)}
    />
  )
}

export default SelectFuncaoSistema
