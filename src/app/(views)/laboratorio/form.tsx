'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import SelectField from '@/components/tz/SelectField'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import { FormPropsEdit, Laboratorio } from '@/types/geral'
import FileUpload from './upload'

const initialFormData: Laboratorio = {
  id: 0,
  nome: '',
  responsavelTecnico: '',
  registroCRQ: '',
  ativo: 'Sim',
}

export default function LaboratorioForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/laboratorio'
  const endpointApi = '/laboratorio'
  const router = useRouter()

  const [formData, setFormData] = useState<Laboratorio>(initialFormData)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    if (e) {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else if (customName) {
      setFormData((prev) => ({ ...prev, [customName]: customValue }))
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, Number(params.id))
        setFormData(registro as Laboratorio)
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

      delete formData.nomeTemplateProposta
      delete formData.fileTemplateProposta

      if (params.id) {
        ret = await apiGeral.updateResorce<Laboratorio>(endpointApi, formData)
      } else {
        ret = await apiGeral.createResource<Laboratorio>(endpointApi, formData)
      }

      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro ao salvar registro' })
        return
      }

      router.push(`${endpoint}?filter=${ret.data?.id}`)
      params.onClose?.()
    } catch (error) {
      console.error(error)
      setMsg('Erro inesperado ao salvar laboratório')
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
            <strong>{params.id ? 'Alterar Laboratório' : 'Cadastrar Laboratório'}</strong>
          </CCardHeader>

          <CCardBody>
            <CRow>
              <CCol md={2}>
                <TextInputField
                  name="id"
                  placeholder="Código"
                  value={formData.id ? String(formData.id) : ''}
                  disabled
                />
              </CCol>

              <div className="w-100" />

              <CCol md={6}>
                <TextInputField
                  name="nome"
                  placeholder="Nome do Laboratório"
                  value={formData.nome}
                  onChange={handleChange}
                  invalid={!!errors.nome}
                  feedbackMessage={errors.nome}
                />
              </CCol>

              <CCol md={4}>
                <TextInputField
                  name="responsavelTecnico"
                  placeholder="Responsável Técnico"
                  value={formData.responsavelTecnico || ''}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={4}>
                <TextInputField
                  name="registroCRQ"
                  placeholder="Registro CRQ"
                  value={formData.registroCRQ || ''}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={3}>
                <SelectField
                  name="ativo"
                  placeholder="Ativo"
                  value={formData.ativo}
                  onChange={handleChange}
                  options={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                  ]}
                />
              </CCol>

              <FileUpload laboratorio={formData} />
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
