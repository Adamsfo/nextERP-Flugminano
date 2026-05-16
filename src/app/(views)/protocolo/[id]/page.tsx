import ProtocoloForm from '../form'
import { CCol, CRow } from '@coreui/react-pro'
import { FormPropsEdit } from '@/types/geral'

export default function ProtocoloEditPage({ params }: { params: FormPropsEdit }) {
  const id = params.id !== 'new' ? params.id : ''

  return (
    <CRow>
      <CCol xs={12}>
        <ProtocoloForm params={{ id }} />
      </CCol>
    </CRow>
  )
}
