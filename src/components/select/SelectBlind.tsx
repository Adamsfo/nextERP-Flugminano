'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CFormFeedback, CFormLabel, CMultiSelect } from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { Blind, FuncaoUsuario } from '@/types/geral'

interface CustomMultiSelectProps {
  id: number | null | undefined // Permitir múltiplos IDs
  setId: (value: any) => void
  setDescricao?: (value: any) => void
  invalid?: boolean
  feedbackMessage?: string
  [key: string]: any
}

let timer: NodeJS.Timeout

const SelectBlind: React.FC<CustomMultiSelectProps> = ({
  id,
  setId,
  setDescricao,
  invalid = false,
  feedbackMessage,
  ...rest
}) => {
  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<{ value: number; label: string; selected: boolean }[]>(
    []
  )
  const [lastPesquisa, setLastPesquisa] = useState(' ')

  const getRegistros = useCallback(
    async (search = '') => {
      clearTimeout(timer)
      if (lastPesquisa === search) return
      timer = setTimeout(async () => {
        setLoading(true)
        const response = await apiGeral.getResource<Blind>('/blind', {
          search,
          pageSize: 15,
        })
        const registrosData = (response.data ?? []).map((record: Blind) => ({
          value: record.id,
          label: record.descricao,
        }))

        setRegistros(registrosData.map((item) => ({ ...item, selected: false })))
        setLastPesquisa(search)
        setLoading(false)

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
      }, 400)

      // Se o ID foi passado e existe no resultado, selecione-o
    },
    [id]
  )

  useEffect(() => {
    if (id) {
      getRegistros(id.toString())
    } else {
      if (registros.length === 0) {
        getRegistros()
      }
    }
  }, [id, getRegistros])

  const handleSelect = (selectedValues: { value: number; label: string }[]) => {
    if (selectedValues[0]) {
      setId(selectedValues[0].value) // Passa apenas os valores para setId
      if (setDescricao) {
        setDescricao(selectedValues[0].label)
      }
    }
    // else {
    //   setId(null)
    // }
  }

  return (
    <div
      className={`mydivborder ${invalid ? 'is-invalid' : ''}`}
      style={{
        flexDirection: 'column',
        height: '60px',
        borderRadius: '6px',
        margin: '0px',
        border: '1px solid',
        borderColor: '',
        marginBottom: '7px',
      }}
    >
      <div style={{ marginTop: '2px', height: '17px', padding: '0px', marginBottom: '2px' }}>
        <CFormLabel
          style={{
            margin: '0px',
            fontSize: '13px',
            marginRight: '10px',
            marginLeft: '10px',
            color: '#b1b7c1',
          }}
          htmlFor="validationText"
        >
          Blind
        </CFormLabel>
      </div>
      <CMultiSelect
        loading={loading}
        onFilterChange={(value) => getRegistros(value)}
        options={registros}
        name="blindId"
        placeholder="Selecione um Blind"
        search="external"
        virtualScroller
        multiple={false}
        optionsStyle="text"
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
}

export default SelectBlind
