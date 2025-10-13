'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { ClienteFornecedor, FormPropsEdit } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import MaskedInputField from '@/components/tz/MaskedInputField'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonBack from '@/components/tz/CButtonBack'
import CButtonSave from '@/components/tz/CButtonSave'

const initialFormData: ClienteFornecedor = {
  id: 0,
  tipo: 'Fornecedor',
  cnpjCpf: '',
  razaoSocialNome: '',
  consumidorFinal: 'Sim',
  contribuinte: 'Sim',
  empresaId: 1,
}

type Registro = ClienteFornecedor

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/fornecedor'
  const endpointApi = '/clienteFornecedor'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // Verifica o tipo do alvo para garantir que a lógica funcione para ambos os casos
    if (type === 'select-one') {
      // Lógica para o select
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    } else {
      // Lógica para o input
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as ClienteFornecedor)
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      let ret: { data?: { id: number }; success?: boolean; message?: string } = {}
      if (params.id) {
        ret = await apiGeral.updateResorce<ClienteFornecedor>(endpointApi, formData)
      } else {
        if (empresaIdSelecionada.length !== 1) {
          setErrors({ api: 'Selecione apenas uma empresa para criar o registro nesta empresa!' })
          return
        }
        formData.empresaId = empresaIdSelecionada[0]
        ret = await apiGeral.createResource<ClienteFornecedor>(endpointApi, formData)
      }
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
        return
      }
      router.push(`${endpoint}?filter=${ret.data?.id}`)
      if (params.onClose) {
        params.onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  const handleVoltar = async () => {
    router.push(endpoint)
    if (params.onClose) {
      params.onClose()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nomeFantasia) newErrors.nomeFantasia = 'Nome fantasia é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    if (!formData.cnpjCpf) newErrors.cnpjCpf = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  return (
    <PermissionGate permission={4}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando' : 'Cadastrando'} fornecedor</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={1}>
                <TextInputField
                  name="id"
                  placeholder="Código"
                  value={formData.id !== 0 ? formData.id.toString() : ''}
                  onChange={handleChange}
                  invalid={!!errors.id}
                  feedbackMessage={errors.id}
                  disabled={true}
                />
              </CCol>

              {/* <CCol md={2}>
            <SelectField
              name="consumidorFinal"
              value={formData.consumidorFinal}
              onChange={handleChange}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
              ]}
              invalid={!!errors.consumidorFinal}
              feedbackMessage={errors.consumidorFinal}
              placeholder="Consumidor Final"
            />
          </CCol>

          <CCol md={2}>
            <SelectField
              name="contribuinte"
              value={formData.contribuinte}
              onChange={handleChange}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
              ]}
              invalid={!!errors.contribuinte}
              feedbackMessage={errors.contribuinte}
              placeholder="Contribuinte"
            />
          </CCol> */}

              <div className="w-100"></div>

              <CCol md={6}>
                <TextInputField
                  name="nomeFantasia"
                  placeholder="Nome Fantasia"
                  value={formData.nomeFantasia ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.nomeFantasia}
                  feedbackMessage={errors.nomeFantasia}
                />
              </CCol>

              <CCol md={6}>
                <TextInputField
                  name="razaoSocialNome"
                  placeholder="Razão Social"
                  value={formData.razaoSocialNome ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.razaoSocialNome}
                  feedbackMessage={errors.razaoSocialNome}
                />
              </CCol>

              <CCol md={6}>
                <MaskedInputField
                  name="cnpjCpf"
                  placeholder="CPF / CNPJ"
                  value={formData.cnpjCpf}
                  onChange={handleChange}
                  invalid={!!errors.cnpjCpf}
                  feedbackMessage={errors.cnpjCpf}
                  mask={
                    formData.cnpjCpf.replace(/\D/g, '').length <= 11
                      ? '999.999.999-999'
                      : '99.999.999/9999-99'
                  }
                />
              </CCol>

              <CCol md={6}>
                <CFormFloating className="mb-3">
                  <CFormInput
                    type="email"
                    id="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    invalid={!!errors.email}
                  />
                  <CFormLabel>e-mail</CFormLabel>
                  {errors.email && <CFormFeedback invalid>{errors.email}</CFormFeedback>}
                </CFormFloating>
              </CCol>

              <CCol md={6}>
                <MaskedInputField
                  name="insEstadual"
                  placeholder="Inscrição Estadual"
                  value={formData.insEstadual || ''}
                  onChange={handleChange}
                  mask="9999999999-9" // Ajuste conforme necessário
                  invalid={!!errors.insEstadual}
                  feedbackMessage={errors.insEstadual}
                />
              </CCol>

              <CCol md={6}>
                <TextInputField
                  name="insMunicipal"
                  placeholder="Razão Social"
                  value={formData.insMunicipal || ''}
                  onChange={handleChange}
                  invalid={!!errors.insMunicipal}
                  feedbackMessage={errors.insEstadual}
                />
              </CCol>

              <CCol md={3}>
                <MaskedInputField
                  name="telefoneFixo"
                  placeholder="Telefone Fixo"
                  value={formData.telefoneFixo || ''}
                  onChange={handleChange}
                  mask="(99) 9.9999-9999" // Ajuste conforme necessário
                  invalid={!!errors.telefoneFixo}
                  feedbackMessage={errors.telefoneFixo}
                />
              </CCol>

              <CCol md={3}>
                <MaskedInputField
                  name="telefoneCelular"
                  placeholder="Telefone Celular"
                  value={formData.telefoneCelular || ''}
                  onChange={handleChange}
                  mask="(99) 9.9999-9999" // Ajuste conforme necessário
                  invalid={!!errors.telefoneCelular}
                  feedbackMessage={errors.telefoneCelular}
                />
              </CCol>

              {/* <CCol md={3}>
            <MaskedInputField
              name="telefoneAlternativo"
              placeholder="Telefone Alternativo"
              value={formData.telefoneAlternativo || ''}
              onChange={handleChange}
              mask="(99) 9.9999-9999" // Ajuste conforme necessário
              invalid={!!errors.telefoneAlternativo}
              feedbackMessage={errors.telefoneAlternativo}
            />
          </CCol>

          <CCol md={3}>
            <MaskedInputField
              name="telefoneWhatsApp"
              placeholder="Telefone WhatsApp"
              value={formData.telefoneWhatsApp || ''}
              onChange={handleChange}
              mask="(99) 9.9999-9999" // Ajuste conforme necessário
              invalid={!!errors.telefoneWhatsApp}
              feedbackMessage={errors.telefoneWhatsApp}
            />
          </CCol> */}
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
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
