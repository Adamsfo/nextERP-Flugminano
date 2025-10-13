import React from 'react'
import { CFormFloating, CFormInput, CFormLabel, CFormFeedback } from '@coreui/react-pro'
import InputMask from 'react-input-mask'

interface MaskedInputFieldProps {
  name: string
  placeholder: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  mask: string
  invalid?: boolean
  feedbackMessage?: string
}

const MaskedInputField: React.FC<MaskedInputFieldProps> = ({
  name,
  placeholder,
  value,
  onChange,
  mask,
  invalid = false,
  feedbackMessage,
}) => (
  <CFormFloating className="mb-3">
    <InputMask
      mask={mask}
      value={value}
      onChange={onChange}
      maskChar={null} // Não exibir caracteres de máscara como sublinhados
    >
      {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
        <CFormInput
          {...inputProps}
          type="text"
          id={name}
          name={name}
          placeholder={placeholder}
          invalid={invalid}
        />
      )}
    </InputMask>
    <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>
    {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
  </CFormFloating>
)

export default MaskedInputField
