'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CMultiSelect } from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { Empresa, FuncaoSistema } from '@/types/geral'

interface CustomMultiSelectProps {
  id: number | null | undefined // Permitir múltiplos IDs
  setId: (value: any) => void
  setDescricao?: (value: any) => void
}

const SelectEmpresa: React.FC<CustomMultiSelectProps> = ({ id, setId, setDescricao }) => {
  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<{ value: number; label: string; selected: boolean }[]>(
    []
  )

  const getRegistros = useCallback(
    async (search = '') => {
      setLoading(true)
      const response = await apiGeral.getResource<Empresa>('/empresa', {
        search,
        pageSize: 15,
      })
      const registrosData = (response.data ?? []).map((record: Empresa) => ({
        value: record.id,
        label: record.nomeFantasia,
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
      if (setDescricao) {
        setDescricao(selectedValues[0].label)
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
      placeholder="Empresa"
      search="external"
      virtualScroller
      multiple={false}
      optionsStyle="text"
      style={{ width: '600px' }}
      onChange={(e: any) => handleSelect(e)}
    />
  )
}

export default SelectEmpresa
