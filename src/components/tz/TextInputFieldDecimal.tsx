import React from 'react'
import { CFormFloating, CFormInput, CFormLabel, CFormFeedback } from '@coreui/react-pro'
import { formatCurrency, formatCurrencyNoSymbol, formatDecimal } from './formatters'

interface TextInputFieldReaisProps {
  name: string
  placeholder: string
  value: string | number
  onChange: (name: string, rawValue: string) => void // Mudança para simplificar o `onChange`
  invalid?: boolean
  feedbackMessage?: string
  disabled?: boolean
}

const TextInputFieldDecimal: React.FC<TextInputFieldReaisProps> = ({
  name,
  placeholder,
  value,
  onChange,
  invalid = false,
  feedbackMessage,
  disabled = false,
}) => {
  // Função para manipular a mudança de valor no campo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '') // Limpa o valor para números
    onChange(name, rawValue) // Passa o valor "limpo" para o formulário
  }

  return (
    <CFormFloating className="mb-3">
      <CFormInput
        type="text"
        id={name}
        name={name}
        placeholder=" "
        value={formatCurrencyNoSymbol(String(value))} // Exibe o valor formatado
        onChange={handleChange}
        invalid={invalid}
        disabled={disabled}
      />
      <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>
      {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
    </CFormFloating>
  )
}

export default TextInputFieldDecimal
