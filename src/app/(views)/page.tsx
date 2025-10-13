'use client'

import { CCard, CCardBody, CCardFooter, CFormLabel, CRow } from '@coreui/react-pro'
import AuthWrapper from '../../components/auth/AuthWrapper'

const Dashboard = () => {
  return (
    <AuthWrapper>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>{/* <CFormLabel>Ola Mundo!</CFormLabel> */}</CRow>
        </CCardBody>
        <CCardFooter>{/* <CFormLabel>Ola Mundo footer!</CFormLabel> */}</CCardFooter>
      </CCard>
    </AuthWrapper>
  )
}

export default Dashboard
