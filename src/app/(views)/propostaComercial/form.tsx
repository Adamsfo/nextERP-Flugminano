'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CDatePicker,
  CForm,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CHeader,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import {
  ClienteFornecedor,
  EnderecoClienteFornecedor,
  FormPropsEdit,
  PropostaComercial,
} from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import MaskedInputField from '@/components/tz/MaskedInputField'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import SelectField from '@/components/tz/SelectField'
import SelectPais from '@/components/select/SelectPais'
import ModalMsg from '@/components/modal/ModalMsg'
import SelectCliente from '@/components/select/SelectCliente'

const initialFormData: PropostaComercial = {
  id: 0,
  empresaId: 1,
  clienteFornecedorId: 0,
  numero: '',
  data: new Date(),
  validade: undefined,
  clienteNome: '',
  clienteDocumento: '',
  clienteEmail: '',
  clienteTelefone: '',
  enderecoRua: '',
  enderecoNumero: '',
  enderecoBairro: '',
  enderecoCidade: '',
  enderecoUf: '',
  enderecoCep: '',
  valorTotal: 0,
  status: 'Rascunho',
  observacao: '',
}

type Registro = typeof initialFormData

export default function PropostaComercialForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/propostaComercial'
  const endpointApi = '/proposta'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    if (e) {
      const { name, value, type } = e.target

      // Verifica o tipo do alvo para garantir que a lógica funcione para ambos os casos
      if (type === 'select-one') {
        // Lógica para o select
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      } else if (type === 'checkbox') {
        // Lógica para o checkbox
        const checked = (e.target as HTMLInputElement).checked
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }))
      } else {
        // Lógica para o input
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      }
    } else if (customName && customValue !== undefined) {
      setFormData((prevData) => ({
        ...prevData,
        [customName]: customValue,
      }))
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as unknown as Registro)
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
        ret = await apiGeral.updateResorce<Registro>(endpointApi, formData)
      } else {
        if (empresaIdSelecionada.length !== 1) {
          setErrors({ api: 'Selecione apenas uma empresa para criar o registro nesta empresa!' })
          return
        }
        formData.empresaId = empresaIdSelecionada[0]
        ret = await apiGeral.createResource<Registro>(endpointApi, formData)
      }
      console.log('ret', ret)
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

    if (!formData.clienteNome) newErrors.clienteNome = 'Nome do cliente é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    if (!formData.clienteDocumento) newErrors.clienteDocumento = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>
              {params.id ? 'Alterando proposta comercial' : 'Cadastrando proposta comercial'}
            </strong>
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

              <CCol md={3}>
                <TextInputField
                  name="numero"
                  placeholder="Número da Proposta"
                  value={formData.numero ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.numero}
                  feedbackMessage={errors.numero}
                  disabled={true}
                />
              </CCol>

              <CCol md={3}>
                <CFormFloating>
                  <CFormInput
                    type="date"
                    name="data"
                    id="data"
                    placeholder="Data da Proposta"
                    value={formData.data ? new Date(formData.data).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    invalid={!!errors.data}
                    disabled={true}
                  />
                  <CFormLabel htmlFor="data">Data da Proposta</CFormLabel>
                  <CFormFeedback invalid>{errors.data}</CFormFeedback>
                </CFormFloating>
              </CCol>

              <CCol md={3}>
                <CFormFloating>
                  <CFormInput
                    type="date"
                    name="validade"
                    id="validade"
                    placeholder="Data de Validade"
                    value={
                      formData.validade
                        ? new Date(formData.validade).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={handleChange}
                    invalid={!!errors.validade}
                    // disabled={true}
                  />
                  <CFormLabel htmlFor="validade">Data de Validade</CFormLabel>
                  <CFormFeedback invalid>{errors.validade}</CFormFeedback>
                </CFormFloating>
              </CCol>

              <div className="w-100"></div>

              <CCol md={4}>
                <SelectCliente
                  id={formData.clienteFornecedorId}
                  setId={(clienteId) => handleChange(undefined, 'clienteFornecedorId', clienteId)}
                  invalid={!!errors.clienteFornecedorId}
                  feedbackMessage={errors.clienteFornecedorId}
                  // disabled={formData.id !== 0}
                ></SelectCliente>
              </CCol>

              {/* <CCol md={2}>
                <SelectField
                  name="tipoDocumento"
                  value={formData.tipoDocumento ?? ''}
                  onChange={handleChange}
                  options={[
                    { value: 'RG', label: 'RG' },
                    { value: 'CPF', label: 'CPF' },
                    { value: 'CNPJ', label: 'CNPJ' },
                    { value: 'Passaporte', label: 'Passaporte' },
                    { value: 'Outro', label: 'Outro' },
                  ]}
                  invalid={!!errors.tipoDocumento}
                  feedbackMessage={errors.tipoDocumento}
                  placeholder="Tipo Documento"
                />
              </CCol>

              <CCol md={2}>
                <MaskedInputField
                  name="telefoneFixo"
                  placeholder="Telefone Fixo"
                  value={formData.telefoneFixo || ''}
                  onChange={handleChange}
                  mask="(99) 9.9999-9999" // Ajuste conforme necessário
                  invalid={!!errors.telefoneFixo}
                  feedbackMessage={errors.telefoneFixo}
                />
              </CCol>               */}
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
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
