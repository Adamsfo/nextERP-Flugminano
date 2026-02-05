'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import { Analise, FormPropsEdit } from '@/types/geral'
import SelectLaboratorio from '@/components/select/SelectLaboratorio'

const initialFormData: Analise = {
  id: 0,
  laboratorioId: 0,
  nome: '',
  metodo: '',
  unidade: '',
}

type Registro = typeof initialFormData

export default function AnaliseForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/analise'
  const endpointApi = '/analise'

  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)
      }
    }
    fetchData()
  }, [params.id])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.nome) newErrors.nome = 'Nome do laboratório é obrigatório.'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      let ret

      if (params.id) {
        ret = await apiGeral.updateResorce<Registro>(endpointApi, formData)
      } else {
        ret = await apiGeral.createResource<Registro>(endpointApi, formData)
      }

      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro ao salvar registro' })
        return
      }

      router.push(`${endpoint}?filter=${ret.data?.id}`)
      params.onClose?.()
    } catch (error) {
      setMsg('Erro ao salvar registro: ' + error)
      setModalMsg(true)
    }
  }

  const handleVoltar = () => {
    router.push(endpoint)
    params.onClose?.()
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando Análise' : 'Cadastrando Análise'}</strong>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-3">
              <CCol md={1}>
                <TextInputField
                  name="id"
                  placeholder="Código"
                  value={formData.id ? formData.id.toString() : ''}
                  onChange={handleChange}
                  disabled
                />
              </CCol>

              <CCol md={6} style={{ marginTop: '25px' }}>
                <SelectLaboratorio
                  id={formData.laboratorioId}
                  setId={(value) => setFormData((prev) => ({ ...prev, laboratorioId: value }))}
                  setDescricao={undefined}
                ></SelectLaboratorio>
              </CCol>

              <CCol md={5}>
                <TextInputField
                  name="nome"
                  placeholder="Nome da Análise"
                  value={formData.nome}
                  onChange={handleChange}
                  invalid={!!errors.nome}
                  feedbackMessage={errors.nome}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="metodo"
                  placeholder="Método"
                  value={formData.metodo || ''}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="unidade"
                  placeholder="Unidade"
                  value={formData.unidade || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {errors.api && <div className="text-danger mt-2">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg} />
          </CCardBody>

          <CCardFooter>
            <CButtonBack onClick={handleVoltar} />
            <CButtonSave type="submit" label={params.id ? 'Atualizar' : 'Cadastrar'} />
          </CCardFooter>
        </CCard>
      </CForm>
    </PermissionGate>
  )
}
