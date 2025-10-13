import React, { useEffect, useState, useCallback } from 'react'
import { CFormFloating, CFormSelect, CFormLabel, CFormFeedback } from '@coreui/react-pro'
import axios from 'axios'

interface SelectFieldProps {
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  invalid?: boolean
  feedbackMessage?: string
  placeholder?: string
}

// Novo componente SelectPais usando CFormSelect
const SelectPais: React.FC<{
  id: string | null
  setId: (value: string) => void
  invalid?: boolean
  feedbackMessage?: string
}> = ({ id, setId, invalid = false, feedbackMessage }) => {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  // Função para carregar os países da API
  const getPaises = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('https://restcountries.com/v2/all')
      const optionsData = response.data.map((country: any) => ({
        value: country.name,
        label: country.name,
      }))
      setOptions(optionsData)
    } catch (error) {
      console.error('Erro ao buscar países:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getPaises() // Chamar a função para carregar os países na montagem do componente
  }, [getPaises])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setId(e.target.value) // Atualiza o ID selecionado
  }

  return (
    <CFormFloating className="mb-3">
      <CFormSelect
        name="pais"
        value={id || ''}
        onChange={handleChange}
        disabled={loading}
        invalid={invalid}
      >
        <option value="" disabled>
          Selecione um país
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </CFormSelect>
      <CFormLabel htmlFor="pais">Nacionalidade</CFormLabel>
      {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
    </CFormFloating>
  )
}

export default SelectPais
