import LaboratoriosForm from '../form'
import { CCol, CRow } from '@coreui/react-pro'
import { FormPropsEdit } from '@/types/geral'

export default function LaboratoriosEditPage({ params }: { params: FormPropsEdit }) {
  const id = params.id !== 'new' ? params.id : ''

  return (
    <CRow>
      <CCol xs={12}>
        <LaboratoriosForm params={{ id }} />
      </CCol>
    </CRow>
  )
}
