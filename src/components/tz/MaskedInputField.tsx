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

type InputMaskRenderProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onFocus' | 'onBlur' | 'onMouseDown' | 'onPaste' | 'className' | 'style' | 'disabled' | 'readOnly'
>

/** react-input-mask@2 usa children como render prop; @types v3 descreve API diferente. */
type InputMaskV2Props = {
  mask: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  maskChar?: string | null
  children: (inputProps: InputMaskRenderProps) => React.ReactElement
}

const MaskedInput = InputMask as unknown as React.ComponentType<InputMaskV2Props>

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
    <MaskedInput mask={mask} value={value ?? ''} onChange={onChange} maskChar={null}>
      {(inputProps) => (
        <CFormInput
          {...inputProps}
          type="text"
          id={name}
          name={name}
          placeholder={placeholder}
          value={value ?? ''}
          invalid={invalid}
        />
      )}
    </MaskedInput>
    <CFormLabel htmlFor={name}>{placeholder}</CFormLabel>
    {invalid && feedbackMessage && <CFormFeedback invalid>{feedbackMessage}</CFormFeedback>}
  </CFormFloating>
)

export default MaskedInputField
