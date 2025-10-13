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
  Ticket,
  TicketHistorico,
  TorneioItem,
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
import SelectTorneio from '@/components/select/SelectTorneio'
import SelectJogador from '@/components/select/SelectJogador'
import SelectTorneioItem from '@/components/select/SelectTorneioItem'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'
import FormattedDateTime from '@/components/tz/FormattedDateTime'

const initialFormData: Ticket = {
  id: 0,
}

type Registro = Ticket

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/ticket'
  const endpointApi = '/ticket'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [ticketHistorico, setTicketHistorico] = useState<TicketHistorico[] | undefined>([]) // Estado para manter os registros da tabela
  const [toneioItem, setTorneioItem] = useState<TorneioItem | undefined>() // Estado para manter os registros da tabela
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const usuario = useTypedSelector((state) => state.usuario)
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

        const response = await apiGeral.getResource<TicketHistorico>('/tickethistorico', {
          filters: { ticketId: parseInt(params.id) },
          pageSize: 200,
        })

        setTicketHistorico(response.data)
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  useEffect(() => {
    async function fetchData() {
      if (formData.torneioItemId) {
        const registro = await apiGeral.getResourceById('/torneioitem', formData.torneioItemId)
        setTorneioItem(registro as TorneioItem)
      }
    }

    fetchData()
  }, [formData.torneioItemId])

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
        ret = await apiGeral.createResource<Registro>(endpointApi, {
          ...formData,
          usuarioId: usuario.id,
        })
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

    // if (!formData.nomeFantasia) newErrors.nomeFantasia = 'Nome fantasia é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    // if (!formData.cnpjCpf) newErrors.cnpjCpf = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  const columns = [
    // { key: 'id', _style: { width: '10%' }, label: 'Código' },
    {
      key: 'data',
      _style: { width: '10%' },
      label: 'Data do Lançamento',
    },
    { key: 'descricao', _style: { width: '50%' }, label: 'Descrição' },
    { key: 'status', _style: { width: '10%' }, label: 'Status' },
  ]

  const data = (item: any) => {
    return (
      <td style={{ height: '110%' }}>
        <FormattedDateTime date={item.data} />
      </td>
    )
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando ticket' : 'Cadastrando ticket'}</strong>
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
              <CCol md={2}>
                <TextInputField
                  name="id"
                  placeholder="Status Atual"
                  value={formData.status || ''}
                  onChange={handleChange}
                  invalid={!!errors.status}
                  feedbackMessage={errors.status}
                  disabled={true}
                />
              </CCol>

              <div className="w-100"></div>

              <CCol md={4}>
                <SelectJogador
                  id={formData.clienteId}
                  setId={(clienteId) => handleChange(undefined, 'clienteId', clienteId)}
                  invalid={!!errors.clienteId}
                  feedbackMessage={errors.clienteId}
                  disabled={formData.id !== 0}
                ></SelectJogador>
              </CCol>

              <CCol md={4}>
                <SelectTorneio
                  id={formData.torneioId}
                  setId={(torneioId) => handleChange(undefined, 'torneioId', torneioId)}
                  invalid={!!errors.torneioId}
                  feedbackMessage={errors.torneioId}
                  disabled={formData.id !== 0}
                ></SelectTorneio>
              </CCol>

              <CCol md={4}>
                <SelectTorneioItem
                  id={formData.torneioItemId}
                  setId={(torneioItemId) => handleChange(undefined, 'torneioItemId', torneioItemId)}
                  torneioId={formData.torneioId}
                  invalid={!!errors.torneioItemId}
                  feedbackMessage={errors.torneioItemId}
                  disabled={formData.id !== 0}
                ></SelectTorneioItem>
              </CCol>

              <CCol xs={12}>
                <CCard style={{ marginTop: '20px' }}>
                  <CCardHeader>
                    <strong>Pagamento</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CCol md={2}>
                      <TextInputFieldReais
                        name="totalInscricao"
                        placeholder="Total"
                        value={toneioItem?.totalInscricao ?? ''} // Mantém o valor decimal
                        onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                        invalid={!!errors.totalInscricao}
                        disabled
                        feedbackMessage={errors.totalInscricao}
                      />
                    </CCol>
                    <SelectField
                      name="metodoPagamento"
                      placeholder="Método de Pagamento"
                      value={formData.metodoPagamento ?? ''}
                      onChange={handleChange}
                      options={[
                        { value: 'Pagamento', label: 'Pagamento' },
                        { value: 'Crédito na Conta', label: 'Crédito na Conta' },
                      ]}
                      invalid={!!errors.tipoRake}
                      feedbackMessage={errors.tipoRake}
                    />
                  </CCardBody>
                </CCard>
              </CCol>

              {formData.id !== 0 ? (
                <CCol xs={12}>
                  <CCard style={{ marginTop: '20px' }}>
                    <CCardHeader>
                      <strong>Histórico do Ticket</strong>
                    </CCardHeader>
                    <CCardBody>
                      <SmartTableWrapper
                        items={ticketHistorico}
                        columns={columns}
                        filtroPorEmpresa={false}
                        columnFilter={false}
                        columnSorter={false}
                        itemsPerPageSelect={false}
                        scopedColumns={{
                          data,
                        }}
                      />
                    </CCardBody>
                  </CCard>
                </CCol>
              ) : null}

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
