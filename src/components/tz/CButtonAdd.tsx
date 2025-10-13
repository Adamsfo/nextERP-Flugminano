import React from 'react'
import { CButton } from '@coreui/react-pro'
import { cilPlaylistAdd } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

interface CButtonAddProps extends React.ComponentProps<typeof CButton> {
  label?: string
}

const CButtonAdd: React.FC<CButtonAddProps> = ({ label = 'Novo', ...props }) => {
  return (
    <CButton color="primary" {...props}>
      <CIcon icon={cilPlaylistAdd} className="me-2" />
      {label}
    </CButton>
  )
}

export default CButtonAdd
