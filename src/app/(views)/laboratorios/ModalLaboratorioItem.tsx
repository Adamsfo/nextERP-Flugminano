'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import {
  CButton,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import { LaboratoriosItem } from '@/types/geral'
import TextInputField from '@/components/tz/TextInputField'

const STATUS_OPCOES = ['Gerado', 'Recebido', 'Em análise', 'Finalizado', 'Cancelado']

interface ModalLaboratorioItemProps {
  visible: boolean
  setVisible: (v: boolean) => void
  item: LaboratoriosItem | null
  onSaved: () => void
}

const ModalLaboratorioItem: React.FC<ModalLaboratorioItemProps> = ({
  visible,
  setVisible,
  item,
  onSaved,
}) => {
  const endpointApi = '/laboratoriositem'
  const [form, setForm] = useState<Partial<LaboratoriosItem>>({})
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item && visible) {
      setForm({ ...item })
      setErro('')
    }
  }, [item, visible])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setVisible(false)
    setErro('')
  }

  const handleSave = async () => {
    if (!item?.id) return
    setErro('')
    setLoading(true)
    try {
      const ret = await apiGeral.updateResorce<LaboratoriosItem>(endpointApi, {
        id: item.id,
        status: form.status,
        metodo: form.metodo,
        unidade: form.unidade,
        prazoDias:
          form.prazoDias !== undefined &&
          form.prazoDias !== null &&
          String(form.prazoDias).trim() !== ''
            ? Number(form.prazoDias)
            : undefined,
        vpmMinimo: form.vpmMinimo,
        vpmMaximo: form.vpmMaximo,
        lqMinimo: form.lqMinimo,
        lqMaximo: form.lqMaximo,
      })
      if (!ret.success) {
        setErro(ret.message || 'Não foi possível salvar o item.')
        return
      }
      handleClose()
      onSaved()
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose} size="lg">
      <CModalHeader>
        <CModalTitle>Alterar análise do laboratório</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="g-3">
          <CCol md={12}>
            <TextInputField
              name="analiseNome"
              placeholder="Análise"
              value={form.analiseNome ?? ''}
              onChange={handleChange}
              disabled
            />
          </CCol>
          <CCol md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={form.status ?? ''} onChange={handleChange}>
              {STATUS_OPCOES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={6}>
            <TextInputField
              name="prazoDias"
              type="number"
              placeholder="Prazo (dias)"
              value={form.prazoDias?.toString() ?? ''}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={6}>
            <TextInputField name="metodo" placeholder="Método" value={form.metodo ?? ''} onChange={handleChange} />
          </CCol>
          <CCol md={6}>
            <TextInputField name="unidade" placeholder="Unidade" value={form.unidade ?? ''} onChange={handleChange} />
          </CCol>
          <CCol md={3}>
            <TextInputField
              name="vpmMinimo"
              placeholder="VPM Min"
              value={form.vpmMinimo?.toString() ?? ''}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <TextInputField
              name="vpmMaximo"
              placeholder="VPM Max"
              value={form.vpmMaximo?.toString() ?? ''}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <TextInputField
              name="lqMinimo"
              placeholder="LQ Min"
              value={form.lqMinimo?.toString() ?? ''}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3}>
            <TextInputField
              name="lqMaximo"
              placeholder="LQ Max"
              value={form.lqMaximo?.toString() ?? ''}
              onChange={handleChange}
            />
          </CCol>
        </CRow>
        {erro && <div className="text-danger mt-2">{erro}</div>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando…' : 'Salvar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalLaboratorioItem
