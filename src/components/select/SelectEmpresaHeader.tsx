'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CMultiSelect } from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { Empresa } from '@/types/geral'
import { useTypedSelector } from '../../store'
import { useDispatch } from 'react-redux'

const SelectEmpresa: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const [registros, setRegistros] = useState<{ value: number; label: string; selected: boolean }[]>(
    []
  )
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const empresasId = useTypedSelector((state) => state.empresasId)
  console.log(empresaIdSelecionada)

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

      let registrosDataFilter = registrosData.filter((item) => empresasId.includes(item.value))

      // setRegistros(registrosDataFilter.map((item) => ({ ...item, selected: false })))
      setLoading(false)

      // Se o ID foi passado e existe no resultado, selecione-o
      if (empresaIdSelecionada?.[0]) {
        setRegistros(
          registrosDataFilter.map((item: any) => {
            if (item.value === empresaIdSelecionada[0]) {
              return { ...item, selected: true }
            }
            return item
          })
        )
      }
    },
    [empresaIdSelecionada]
  )

  useEffect(() => {
    if (empresaIdSelecionada && empresaIdSelecionada.length > 0) {
      getRegistros(empresaIdSelecionada[0].toString())
    } else {
      getRegistros()
    }
  }, [empresaIdSelecionada, getRegistros])

  const handleSelect = (selectedValues: { value: number; label: string }[]) => {
    const values = selectedValues.map((option) => option.value)
    if (values.length != empresaIdSelecionada.length) {
      dispatch({ type: 'set', empresaId: values })
    }
  }

  return (
    <CMultiSelect
      loading={loading}
      onFilterChange={(value) => getRegistros(value)}
      options={registros}
      placeholder="Empresa"
      search="external"
      virtualScroller
      selectAllLabel="Selecione varias"
      multiple={true}
      optionsStyle="checkbox"
      style={{ width: '600px' }}
      onChange={(e: any) => handleSelect(e)}
    />
  )
}

export default SelectEmpresa
