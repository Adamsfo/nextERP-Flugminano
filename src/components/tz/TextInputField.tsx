import React from 'react'
import { CFormFloating, CFormInput, CFormLabel, CFormFeedback } from '@coreui/react-pro'

interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  placeholder: string
  value: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  invalid?: boolean
  feedbackMessage?: string
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  name,
  placeholder,
  value,
  onChange,
  invalid = false,
  feedbackMessage,
  disabled = false,
  style,
}) => (
  <CFormFloating className="mb-3">
    <CFormInput
      type="text"
      id={name}
      name={name}
      placeholder=" "
      value={value}
      onChange={onChange}
      invalid={invalid}
      disabled={disabled}
      style={style}
    />
    <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>
    {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
  </CFormFloating>
)

export default TextInputField
