import React from 'react'
import { CFormFloating, CFormInput, CFormLabel, CFormFeedback } from '@coreui/react-pro'

interface TextInputFieldDecimalProps {
  name: string
  placeholder: string
  value: string | number
  onChange: (name: string, rawValue: string) => void
  invalid?: boolean
  feedbackMessage?: string
  disabled?: boolean
}

const TextInputFieldDecimalBig: React.FC<TextInputFieldDecimalProps> = ({
  name,
  placeholder,
  value,
  onChange,
  invalid = false,
  feedbackMessage,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value

    // Permite apenas números e separador decimal
    v = v.replace(/[^0-9.,]/g, '')

    // Troca vírgula por ponto (padrão decimal banco)
    v = v.replace(',', '.')

    // Garante apenas UM ponto decimal
    const parts = v.split('.')
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('')
    }

    onChange(name, v)
  }

  return (
    <CFormFloating className="mb-3">
      <CFormInput
        type="text"
        id={name}
        name={name}
        placeholder=" "
        value={value ?? ''}
        onChange={handleChange}
        invalid={invalid}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
      />
      <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>

      {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
    </CFormFloating>
  )
}

export default TextInputFieldDecimalBig
