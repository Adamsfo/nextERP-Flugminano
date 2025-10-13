'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import {
  BlindItem,
  ClienteFornecedor,
  EnderecoClienteFornecedor,
  FormPropsEdit,
} from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'

const initialFormData: BlindItem = {
  id: 0,
  nivel: 0,
  smallBlind: 0,
  bigBlind: 0,
  duracao: 0,
  blindId: 0,
  ante: 0,
  order: 0,
}

type Registro = BlindItem

export interface FormPropsEditBlind {
  id?: string
  onClose?: () => void
  blindId: number
}

export default function BlindItemForm({ params }: { params: FormPropsEditBlind }) {
  const endpoint = '/blind'
  const endpointApi = '/blinditem'
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
        setFormData(registro as Registro)
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
        ret = await apiGeral.createResource<Registro>(endpointApi, {
          ...formData,
          blindId: params.blindId,
        })
      }
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
        return
      }
      router.push(`${endpoint}/${params.blindId}`)
      if (params.onClose) {
        params.onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  const handleVoltar = async () => {
    router.push(`${endpoint}/${params.blindId}`)
    if (params.onClose) {
      params.onClose()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nivel) newErrors.nivel = 'Nível é obrigatório.'
    if (!formData.smallBlind) newErrors.smallBlind = 'Small Blind é obrigatório.'
    if (!formData.bigBlind) newErrors.cnpjCpf = 'Big Blind é obrigatório.'
    if (!formData.ante) newErrors.ante = 'Ante é obrigatório.'
    if (!formData.duracao) newErrors.duracao = 'Duração é obrigatório.'

    return newErrors
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando nível de blind' : 'Cadastrando nível de blind'}</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={1}>
                <TextInputField
                  name="nivel"
                  placeholder="Nível"
                  value={formData.nivel.toString()}
                  onChange={handleChange}
                  invalid={!!errors.descricao}
                  feedbackMessage={errors.descricao}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="smallBlind"
                  placeholder="Small Blind (SB)"
                  value={formData.smallBlind.toString()}
                  onChange={handleChange}
                  invalid={!!errors.smallBlind}
                  feedbackMessage={errors.smallBlind}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="bigBlind"
                  placeholder="Big Blind (BB)"
                  value={formData.bigBlind.toString()}
                  onChange={handleChange}
                  invalid={!!errors.bigBlind}
                  feedbackMessage={errors.bigBlind}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="ante"
                  placeholder="Ante"
                  value={formData.ante.toString()}
                  onChange={handleChange}
                  invalid={!!errors.ante}
                  feedbackMessage={errors.ante}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="duracao"
                  placeholder="Duração"
                  value={formData.duracao.toString()}
                  onChange={handleChange}
                  invalid={!!errors.duracao}
                  feedbackMessage={errors.duracao}
                />
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
            <CButtonSave label={params.id ? 'Atualizar' : 'Cadastrar'} onClick={handleSubmit} />
          </CCardFooter>
        </CCard>
      </CForm>
    </PermissionGate>
  )
}
