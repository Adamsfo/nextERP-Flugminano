import CidadeForm from '../form'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react-pro'
import { FormPropsEdit } from '@/types/geral'

export default function edit({ params }: { params: FormPropsEdit }) {
  // Verifica se o id é 'new', se for, envia um objeto vazio
  const id = params.id !== 'new' ? params.id : ''

  return (
    <CRow>
      <CCol xs={12}>
        <CidadeForm params={{ id }} />
      </CCol>
    </CRow>
  )
}
