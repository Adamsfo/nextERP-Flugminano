'use client'

import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormLabel,
  CFormText,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import TextInputField from '@/components/tz/TextInputField'
import { apiGeral } from '@/lib/geral'
import { Ticket } from '@/types/geral'
import { formatInteger } from '@/components/tz/formatters'
import { useTypedSelector } from '@/store'

interface ModalEntradaTorneioProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  torneioId: number
}

const ModalEntradaTorneio: React.FC<ModalEntradaTorneioProps> = ({
  visible,
  setVisible,
  torneioId,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [uidTicket, setUidTicket] = useState('')
  const [ticket, setTicket] = useState<Ticket | undefined>() // Estado para manter os registros da tabela
  const [atualizaTicket, setAtualizaTicket] = useState(false)
  const usuario = useTypedSelector((state) => state.usuario)
  const handleClose = () => {
    setVisible(false) // Fecha o modal definindo visible como false
    setUidTicket('') // Limpa o campo de busca
    setTicket(undefined) // Limpa o estado de ticket
  }

  useEffect(() => {
    async function fetchData() {
      if (uidTicket) {
        try {
          const registro = await apiGeral.getResourceByUidTicket<Ticket>(uidTicket)

          if (registro) {
            setTicket(registro as Ticket)
          }
        } catch (error) {
          setTicket(undefined)
        }
      }
    }

    fetchData()
  }, [uidTicket, atualizaTicket])

  const handleConfirmaTicket = async () => {
    try {
      if (!ticket) {
        setErrors({ status: 'Ticket não encontrado' })
        return
      }

      if (ticket.torneioId !== torneioId) {
        setErrors({ status: 'Ticket não é deste Torneio' })
        return
      }

      if (ticket.status !== 'DISPONÍVEL') {
        setErrors({ status: 'Ticket não disponível' })
        return
      }

      setErrors({})

      let ret: { data?: { id: number }; success?: boolean; message?: string } = {}
      if (ticket.id) {
        ret = await apiGeral.updateResorce<Ticket>('/ticketutilizado', {
          id: ticket.id,
          usuarioId: usuario.id,
        })
      }

      if (ret.message) {
        setErrors({ status: ret.message })
        setAtualizaTicket(!atualizaTicket)
      }

      handleClose()

      // Implementar a lógica de entrada no torneio
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Entrada no Torneio com Ticket</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCol md={12}>
          <TextInputField
            name="uidTicket"
            placeholder="QR code do Ticket"
            value={uidTicket}
            onChange={(e) => setUidTicket(e.target.value)}
            invalid={!!errors.status}
            feedbackMessage={errors.status}
          />
        </CCol>
        <CCol md={12}>
          <CFormLabel
            style={{
              backgroundColor:
                torneioId === ticket?.torneioId
                  ? ticket?.status === 'DISPONÍVEL'
                    ? 'green'
                    : 'red'
                  : ticket && 'red',
              fontSize: '25px',
              textAlign: 'center',
              width: '100%',
              height: '50px',
              alignContent: 'center',
            }}
          >
            {torneioId === ticket?.torneioId
              ? ticket?.status
              : ticket && 'Ticket não é deste Torneio'}
          </CFormLabel>
        </CCol>
        <CCol md={12}>
          <TextInputField
            name="ClienteFornecedor_razaoSocialNome"
            placeholder="Jogador"
            value={ticket?.ClienteFornecedor_razaoSocialNome || ''}
            invalid={!!errors.status}
            feedbackMessage={errors.status}
            disabled
          />
        </CCol>
        <CCol md={12}>
          <TextInputField
            name="torneioItem_descricao"
            placeholder="Tipo de Entrada"
            value={ticket?.torneioItem_descricao ?? ''}
            invalid={!!errors.torneioItem_descricao}
            feedbackMessage={errors.torneioItem_descricao}
            disabled
          />
        </CCol>
        <CCol md={12}>
          <TextInputField
            name="fichas"
            placeholder="Fichas"
            value={formatInteger(ticket?.fichas ?? '')}
            invalid={!!errors.fichas}
            feedbackMessage={errors.fichas}
            disabled
          />
        </CCol>
      </CModalBody>
      <CModalFooter>
        <CRow className="w-100">
          <CCol md={6}>
            <CButton
              color="success"
              style={{ width: '100%', margin: '10px' }}
              onClick={handleConfirmaTicket}
            >
              Confirma
            </CButton>
          </CCol>
          <CCol md={6}>
            <CButton color="danger" style={{ width: '100%', margin: '10px' }} onClick={handleClose}>
              Cancelar
            </CButton>
          </CCol>
        </CRow>
      </CModalFooter>
    </CModal>
  )
}

export default ModalEntradaTorneio
