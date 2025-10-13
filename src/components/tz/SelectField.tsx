import React from 'react'
import { CFormFloating, CFormSelect, CFormLabel, CFormFeedback } from '@coreui/react-pro'

// Interface para as propriedades do SelectField
interface SelectFieldProps {
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: { value: string; label: string }[]
  invalid?: boolean
  feedbackMessage?: string
  placeholder?: string
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  value,
  onChange,
  options,
  invalid = false,
  feedbackMessage,
  placeholder = ' ', // Placeholder default
}) => (
  <CFormFloating className="mb-3">
    <CFormSelect name={name} value={value} onChange={onChange} invalid={invalid}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </CFormSelect>
    <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>
    {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
  </CFormFloating>
)

export default SelectField
