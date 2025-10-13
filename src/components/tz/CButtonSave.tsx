import React from 'react'
import { CButton } from '@coreui/react-pro'
import { cilCheck } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

interface CButtonAddProps extends React.ComponentProps<typeof CButton> {
  label?: string
}

const CButtonSave: React.FC<CButtonAddProps> = ({ label = 'Adicionar', ...props }) => {
  return (
    <CButton color="primary" style={{ marginLeft: '5px', marginRight: '5px' }} {...props}>
      <CIcon icon={cilCheck} className="me-2" />
      {label}
    </CButton>
  )
}

export default CButtonSave
