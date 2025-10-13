import React from 'react'
import { CButton } from '@coreui/react-pro'
import { cilMediaStepBackward } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

interface CButtonAddProps extends React.ComponentProps<typeof CButton> {
  label?: string
}

const CButtonBack: React.FC<CButtonAddProps> = ({ label = 'Voltar', ...props }) => {
  return (
    <CButton color="secondary" style={{ marginLeft: '5px', marginRight: '5px' }} {...props}>
      <CIcon icon={cilMediaStepBackward} className="me-2" />
      {label}
    </CButton>
  )
}

export default CButtonBack
