'use client'

import { useState, useEffect, ChangeEvent, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CDatePicker,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CHeader,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import {
  ClienteFornecedor,
  EnderecoClienteFornecedor,
  FormPropsEdit,
  PropostaComercial,
  PropostaComercialItem,
  QueryParams,
  TabelaPrecoItem,
  Norma,
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
import { getStatusPropostaStyle } from '@/components/tz/StatusPropostaStyle'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilDelete, cilLoopCircular, cilPencil } from '@coreui/icons'
import CButtonAdd from '@/components/tz/CButtonAdd'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import SelectLaboratorio from '@/components/select/SelectLaboratorio'
import SelectTabelaPreco from '@/components/select/SelectTabelaPreco'
import TextInputFieldInteger from '@/components/tz/TextInputFieldInteger'
import ModalPropostaComercialItem from './modalItem'
import { formatCurrency } from '@/components/tz/formatters'
import SelectMatriz from '@/components/select/SelectMatriz'

const initialFormData: PropostaComercial = {
  id: 0,
  empresaId: 1,
  clienteFornecedorId: 0,
  laboratorioId: 0,
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
  const endpointApiItem = '/propostaitem'
  const endpointApiTabelaPrecoItem = '/tabelaprecoitem'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [atualizarCliente, setAtualizarCliente] = useState(false)
  const firstLoadRef = useRef(true)
  const [tabelaPrecoId, setTabelaPrecoId] = useState<number | null>(null)
  const [quantidade, setQuantidade] = useState<number | null>(null)

  const [registros, setRegistros] = useState<PropostaComercialItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<PropostaComercialItem[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensAtualizados, setItensAtualizados] = useState<PropostaComercialItem[]>([]) // Itens atualizados

  const [item, setItem] = useState<PropostaComercialItem | null>(null)
  const [index, setIndex] = useState(0)
  const [modalItem, setModalItem] = useState(false)

  const getRegistros = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<PropostaComercialItem>(endpointApiItem, {
      ...params,
      pageSize: 200,
    })
    setRegistros(reg.data || [])
  }

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

        getRegistros({ filters: { propostaComercialId: params.id } })
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const fetchClienteFornecedor = async (clienteFornecedorId: number) => {
    if (clienteFornecedorId > 0) {
      try {
        const clienteFornecedor = await apiGeral.getResourceById<ClienteFornecedor>(
          '/clienteFornecedor',
          clienteFornecedorId
        )
        return clienteFornecedor as ClienteFornecedor
      } catch (error) {
        console.error('Erro ao buscar cliente/fornecedor:', error)
        return null
      }
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      if (formData.clienteFornecedorId <= 0) return

      const clienteFornecedor = await fetchClienteFornecedor(formData.clienteFornecedorId)

      if (!clienteFornecedor) return

      const nomeNovo = clienteFornecedor.nomeFantasia || clienteFornecedor.razaoSocialNome || ''

      // 🚫 BLOQUEIA PRIMEIRA CARGA
      if (firstLoadRef.current) {
        firstLoadRef.current = false
        if (!formData.clienteFornecedorId) {
          return
        }
      }

      // 🟢 Cenário normal (mudou ID)
      const deveAtualizar = atualizarCliente || formData.clienteNome !== nomeNovo

      if (!deveAtualizar) return

      const enderecoResponse = await apiGeral.getResource<EnderecoClienteFornecedor>('/endereco', {
        filters: { clienteFornecedorId: formData.clienteFornecedorId },
      })
      const endereco = enderecoResponse.data?.[0]

      // let cidade: any = null
      // if (clienteFornecedor.enderecos_cidadeId) {
      //   cidade = await apiGeral.getResourceById(
      //     '/cidade',
      //     Number(clienteFornecedor.enderecos_cidadeId)
      //   )
      // }

      setFormData((prev) => ({
        ...prev,
        clienteNome: nomeNovo,
        clienteDocumento: clienteFornecedor.cnpjCpf || '',
        clienteEmail: clienteFornecedor.email,
        clienteTelefone: clienteFornecedor.telefoneFixo || clienteFornecedor.telefoneCelular || '',
        enderecoRua: endereco?.rua || '',
        enderecoNumero: endereco?.numero || '',
        enderecoBairro: endereco?.bairro || '',
        enderecoCidade: endereco?.nomeCidade || '',
        enderecoUf: endereco?.uf || '',
        enderecoCep: endereco?.cep || '',
      }))
    }

    fetchData()
  }, [formData.clienteFornecedorId, atualizarCliente])

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
      const { valorTotal, ...payload } = formData
      if (params.id) {
        ret = await apiGeral.updateResorce<Registro>(endpointApi, payload)
      } else {
        ret = await apiGeral.createResource<Registro>(endpointApi, {
          ...payload,
          empresaId: empresaIdSelecionada[0],
        })
      }

      // Salvar os itens adicionados
      for (const item of itensAdicionados) {
        item.propostaComercialId = ret.data?.id || 0
        await apiGeral.createResource<PropostaComercialItem>(endpointApiItem, item)
      }

      // Atualizar os itens modificados
      for (const item of itensAtualizados) {
        if (item.id) {
          await apiGeral.updateResorce<PropostaComercialItem>(endpointApiItem, item)
        }
      }

      // Excluir os itens removidos
      for (const itemId of itensExcluidos) {
        await apiGeral.deleteResorce(endpointApiItem, itemId.toString())
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

    if (!formData.clienteNome) newErrors.clienteNome = 'Nome do cliente é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    if (!formData.clienteDocumento) newErrors.clienteDocumento = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  const getRegistrosTabelaPrecoItem = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<TabelaPrecoItem>(endpointApiTabelaPrecoItem, {
      ...params,
      pageSize: 200,
    })
    return reg.data || []
  }

  const handleNovoItem = async () => {
    setItem(null)
    setIndex(-1)

    const registros = await getRegistrosTabelaPrecoItem({
      filters: { tabelaPrecoId: tabelaPrecoId },
    })

    let normaidTemp: number | undefined = undefined
    let norma: Norma
    const novosItens: PropostaComercialItem[] = await Promise.all(
      registros.map(async (registro: TabelaPrecoItem) => {
        if (registro.tabelaPreco_normaId != normaidTemp) {
          norma = (await apiGeral.getResourceById<Norma>(
            '/norma',
            registro.tabelaPreco_normaId!
          )) as Norma

          normaidTemp = registro.tabelaPreco_normaId
        }

        return {
          id: 0,
          analiseId: registro.analiseId,
          tabelaPrecoId: registro.tabelaPrecoId,
          tabelaPrecoItemId: registro.id,
          analiseNome: registro.analise_nome || '',
          metodo: registro.analise_metodo,
          unidade: registro.analise_unidade,
          prazoDias: registro.prazoDias,
          vpmMinimo: registro.vpmMinimo,
          vpmMaximo: registro.vpmMaximo,
          lqMinimo: registro.lqMinimo,
          lqMaximo: registro.lqMaximo,
          quantidade: quantidade || 0,
          valorUnitario: registro.valor,
          valorTotal: ((quantidade || 0) * (registro.valor as number)).toFixed(
            2
          ) as unknown as number,
          normaId: registro.tabelaPreco_normaId,
          norma_descricao: norma?.descricao || '',
        }
      })
    )

    console.log('novosItens', novosItens)

    // adiciona na lista existente
    setRegistros((prev) => [...(prev ?? []), ...novosItens])
    setItensAdicionados((prev) => [...prev, ...novosItens])
  }

  const columnsItens = [
    { key: 'analiseId', _style: { width: '10%' }, label: 'Código da Análise' },
    // {
    //   key: 'nivel',
    //   _style: { width: '8%' },
    //   label: 'Nível',
    // },
    { key: 'analiseNome', _style: { width: '20%' }, label: 'Análise' },
    { key: 'norma_descricao', _style: { width: '20%' }, label: 'Norma' },
    { key: 'quantidade', _style: { width: '20%' }, label: 'Quantidade' },
    { key: 'valorUnitario', _style: { width: '20%' }, label: 'Valor Unitário' },
    { key: 'valorTotal', _style: { width: '20%' }, label: 'Valor Total' },
    // { key: 'lqMinimo', _style: { width: '20%' }, label: 'LQ Mínimo' },
    // { key: 'lqMaximo', _style: { width: '20%' }, label: 'LQ Máximo' },
    // { key: 'order', _style: { width: '20%' }, label: 'order' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const valorUnitario = (item: any, index: any) => {
    return (
      <td>
        <CFormLabel>{formatCurrency(item.valorUnitario)}</CFormLabel>
      </td>
    )
  }

  const valorTotal = (item: any, index: any) => {
    return (
      <td>
        <CFormLabel>{formatCurrency(item.valorTotal)}</CFormLabel>
      </td>
    )
  }

  const show_details = (item: PropostaComercialItem, index: number) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => handleAlterar(item, index)}>
              <CTooltip content="Alterar item da tabela de preço" placement="top">
                <CIcon icon={cilPencil} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(item.id)}>
              <CTooltip content="Excluir item da tabela de preço" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const handleAlterar = (item: PropostaComercialItem, index: number) => {
    setItem(item)
    setIndex(index)
    setModalItem(true)
  }

  const handleExcluirClick = (id: number) => {
    setRegistros((prev) => {
      if (!prev) return prev

      const registroExcluido = prev.find((r) => r.id === id)

      if (!registroExcluido) {
        console.log(`Registro com ID ${id} não encontrado.`)
        return prev
      }

      // adiciona na lista de excluídos
      setItensExcluidos((old) => [...old, registroExcluido.id!])

      // retorna novo array (SEM mutar)
      return prev.filter((r) => r.id !== id)
    })
  }

  const handleItemChange = <K extends keyof PropostaComercialItem>(
    index: number,
    field: K,
    value: PropostaComercialItem[K]
  ) => {
    console.log(value)
    const updatedItens = [...registros!]
    updatedItens[index][field] = value
    setRegistros(updatedItens)

    const existingItem = registros![index]

    // Checa se o item já foi atualizado e, se sim, adiciona na lista de itens atualizados
    if (!itensAtualizados.some((item) => item.id === existingItem.id)) {
      setItensAtualizados((prev) => [...prev, existingItem])
    }
  }

  const handleAdicionarItem = (item: PropostaComercialItem) => {
    console.log('chegou')
    setRegistros([...(registros || []), item])
    setItensAdicionados((prev) => [...prev, item])
  }

  useEffect(() => {
    const parseValor = (valorTotal: any) => {
      if (!valorTotal) return 0

      console.log('valorTotal', valorTotal, typeof valorTotal)

      // Se já for número
      if (typeof valorTotal === 'number') return valorTotal

      // Se for string tipo "5,30"
      if (typeof valorTotal === 'string') {
        return Number(valorTotal) || 0
      }

      return 0
    }

    const total = (registros || []).reduce((acc, item) => {
      return acc + parseValor(item.valorTotal)
    }, 0)

    setFormData((prev) => ({
      ...prev,
      valorTotal: total,
    }))
  }, [registros])

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

              <CCol md={4}></CCol>

              <CCol md={1}>
                <TextInputField
                  name="status"
                  placeholder="Status"
                  value={formData.status ?? ''}
                  invalid={!!errors.status}
                  feedbackMessage={errors.status}
                  disabled={true}
                  style={{
                    color: getStatusPropostaStyle(formData.status).color,
                    backgroundColor: getStatusPropostaStyle(formData.status).background,
                    fontWeight: 'bold',
                  }}
                />
              </CCol>

              <div className="w-100"></div>

              <CCol md={4}>
                <SelectLaboratorio
                  id={formData.laboratorioId}
                  setId={(value) => setFormData((prev) => ({ ...prev, laboratorioId: value }))}
                  setDescricao={undefined}
                ></SelectLaboratorio>
              </CCol>

              <CCol md={3} className="d-flex align-items-center">
                <div style={{ flex: 1 }}>
                  <SelectCliente
                    id={formData.clienteFornecedorId}
                    setId={(clienteId) => handleChange(undefined, 'clienteFornecedorId', clienteId)}
                    invalid={!!errors.clienteFornecedorId}
                    feedbackMessage={errors.clienteFornecedorId}
                  />
                </div>

                <CTooltip content="Atualizar Pesquisa" placement="top">
                  <CIcon
                    icon={cilLoopCircular}
                    size="xl"
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                    onClick={() => setAtualizarCliente((prev) => !prev)}
                  />
                </CTooltip>
              </CCol>

              <CCol md={2}>
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

              <CCol md={4}>
                <TextInputField
                  name="clienteNome"
                  placeholder="Nome Fantasia"
                  value={formData.clienteNome ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.clienteNome}
                  feedbackMessage={errors.clienteNome}
                  disabled={true}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="clienteDocumento"
                  placeholder="CNPJ"
                  value={formData.clienteDocumento ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.clienteDocumento}
                  feedbackMessage={errors.clienteDocumento}
                  disabled={true}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="clienteTelefone"
                  placeholder="Telefone do Cliente"
                  value={formData.clienteTelefone ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.clienteTelefone}
                  feedbackMessage={errors.clienteTelefone}
                  disabled={true}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="clienteEmail"
                  placeholder="Email do Cliente"
                  value={formData.clienteEmail ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.clienteEmail}
                  feedbackMessage={errors.clienteEmail}
                  disabled={true}
                />
              </CCol>

              <CCol xs={12}>
                <CCard className="mb-3" style={{ padding: 0 }}>
                  <CCardHeader>Endereço do Cliente</CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={1}>
                        <TextInputField
                          name="enderecoCep"
                          placeholder="CEP"
                          value={formData.enderecoCep ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoCep}
                          feedbackMessage={errors.enderecoCep}
                          disabled={true}
                        />
                      </CCol>

                      <CCol md={1}>
                        <TextInputField
                          name="enderecoUf"
                          placeholder="UF"
                          value={formData.enderecoUf ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoUf}
                          feedbackMessage={errors.enderecoUf}
                          disabled={true}
                        />
                      </CCol>

                      <CCol md={2}>
                        <TextInputField
                          name="enderecoCidade"
                          placeholder="Cidade"
                          value={formData.enderecoCidade ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoCidade}
                          feedbackMessage={errors.enderecoCidade}
                          disabled={true}
                        />
                      </CCol>

                      <CCol md={3}>
                        <TextInputField
                          name="enderecoBairro"
                          placeholder="Bairro"
                          value={formData.enderecoBairro ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoBairro}
                          feedbackMessage={errors.enderecoBairro}
                          disabled={true}
                        />
                      </CCol>

                      <CCol md={4}>
                        <TextInputField
                          name="enderecoRua"
                          placeholder="Rua"
                          value={formData.enderecoRua ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoRua}
                          feedbackMessage={errors.enderecoRua}
                          disabled={true}
                        />
                      </CCol>

                      <CCol md={1}>
                        <TextInputField
                          name="enderecoNumero"
                          placeholder="Número"
                          value={formData.enderecoNumero ?? ''}
                          // onChange={handleChange}
                          invalid={!!errors.enderecoNumero}
                          feedbackMessage={errors.enderecoNumero}
                          disabled={true}
                        />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={3}>
                <SelectMatriz
                  id={formData.matrizId}
                  setId={(matrizId) => handleChange(undefined, 'matrizId', matrizId)}
                  laboratorioId={formData.laboratorioId}
                  invalid={!!errors.matrizId}
                  feedbackMessage={errors.matrizId}
                  disabled={formData.laboratorioId === 0}
                ></SelectMatriz>
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="especificacao"
                  placeholder="Especificação"
                  value={formData.especificacao ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.especificacao}
                  feedbackMessage={errors.especificacao}
                />
              </CCol>

              <CCol md={6}>
                <TextInputField
                  name="observacao"
                  placeholder="Observação"
                  value={formData.observacao ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.observacao}
                  feedbackMessage={errors.observacao}
                />
              </CCol>

              <CCol md={12}>
                <hr className="my-4 border-0" />
              </CCol>

              <CCol md={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {/* BOTÃO MENOS */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        quantidadeAmostras: Math.max(0, (prev.quantidadeAmostras || 0) - 1),
                      }))
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    −
                  </button>

                  {/* INPUT */}
                  <div style={{ flex: 1 }}>
                    <TextInputFieldInteger
                      name="quantidadeAmostras"
                      placeholder="Qtd Amostras"
                      value={formData.quantidadeAmostras ?? ''}
                      onChange={(name, rawValue) => {
                        const numero = Number(rawValue) || 0

                        setFormData((prev) => ({
                          ...prev,
                          quantidadeAmostras: numero,
                        }))
                      }}
                      invalid={!!errors.quantidadeAmostras}
                      feedbackMessage={errors.quantidadeAmostras}
                    />
                  </div>

                  {/* BOTÃO MAIS */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        quantidadeAmostras: (prev.quantidadeAmostras || 0) + 1,
                      }))
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    +
                  </button>
                </div>
              </CCol>

              <CCol md={6}>
                <SelectTabelaPreco
                  id={tabelaPrecoId}
                  setId={(value) => {
                    setTabelaPrecoId(value)
                  }}
                  laboratorioId={formData.laboratorioId}
                  invalid={!!errors.analiseId}
                  feedbackMessage={errors.analiseId}
                  disabled={formData.laboratorioId === 0}
                ></SelectTabelaPreco>
              </CCol>

              <CCol md={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {/* BOTÃO MENOS */}
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({})
                      setQuantidade((prev) => Math.max(0, (prev || 0) - 1))
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    −
                  </button>

                  {/* INPUT */}
                  <TextInputField
                    name="quantidade"
                    type="number"
                    placeholder="Qtde de Análises"
                    value={quantidade?.toString() ?? ''}
                    min={0}
                    step={1}
                    onChange={(e) => {
                      let value = e.target.value

                      if (value === '') {
                        setQuantidade(0)
                        return
                      }

                      let numero = Number(value)
                      if (isNaN(numero)) return

                      if (numero < 0) numero = 0

                      const qtdAmostras = Number(formData.quantidadeAmostras || 0)

                      if (numero > qtdAmostras) {
                        setErrors((prev) => ({
                          ...prev,
                          quantidade: 'Quantidade de análises não pode ser maior que a de amostras',
                        }))
                        numero = qtdAmostras
                      } else {
                        setErrors((prev) => ({
                          ...prev,
                          quantidade: '',
                        }))
                      }

                      setQuantidade(numero)
                    }}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    invalid={!!errors.quantidade}
                    feedbackMessage={errors.quantidade}
                  />

                  {/* BOTÃO MAIS */}
                  <button
                    type="button"
                    onClick={() => {
                      const qtdAmostras = Number(formData.quantidadeAmostras || 0)

                      setQuantidade((prev) => {
                        const novo = (prev || 0) + 1

                        if (novo > qtdAmostras) {
                          setErrors((prevErr) => ({
                            ...prevErr,
                            quantidade:
                              'Quantidade de análises não pode ser maior que a de amostras',
                          }))
                          return qtdAmostras
                        }

                        setErrors((prevErr) => ({
                          ...prevErr,
                          quantidade: '',
                        }))

                        return novo
                      })
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    +
                  </button>
                </div>
              </CCol>

              <CCol md={2} style={{ marginTop: '10px' }}>
                <CButtonAdd label="Adicionar Análise" onClick={async () => handleNovoItem()} />
              </CCol>

              <SmartTableWrapper
                items={registros}
                columns={columnsItens}
                scopedColumns={{ valorUnitario, valorTotal, show_details }}
                filtroPorEmpresa={false}
                columnFilter={false}
                columnSorter={false}
              />

              <CCol md={10}></CCol>

              <CCol md={2}>
                <TextInputField
                  name="valorTotal"
                  placeholder="Valor Total"
                  value={formatCurrency(formData.valorTotal) ?? ''}
                  // onChange={handleChange}
                  invalid={!!errors.valorTotal}
                  feedbackMessage={errors.valorTotal}
                  disabled={true}
                />
              </CCol>

              <ModalPropostaComercialItem
                modal={modalItem}
                setModal={setModalItem}
                item={item || ({} as PropostaComercialItem)}
                index={index}
                propostaComercialId={params.id ? parseInt(params.id) : 0}
                laboratorioId={formData.laboratorioId}
                handleItemChange={handleItemChange}
                handleAdicionarItem={handleAdicionarItem}
              ></ModalPropostaComercialItem>

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
