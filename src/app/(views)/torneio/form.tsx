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
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { FormPropsEdit, QueryParams, Torneio, TorneioBlindItem, TorneioItem } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import {
  cilAlignCenter,
  cilArrowThickBottom,
  cilArrowThickTop,
  cilDelete,
  cilPlaylistAdd,
} from '@coreui/icons'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import CButtonAdd from '@/components/tz/CButtonAdd'
import ModalEstruturaItem from './modalItem'
import { formatCurrency, formatCurrencyNoSymbol, formatInteger } from '@/components/tz/formatters'
import SelectBlind from '@/components/select/SelectBlind'
import SelectEstrutura from '@/components/select/SelectEstrutura'
import PageTicket from './pageTicket'

const initialFormData: Torneio = {
  id: 0,
  descricao: '',
  empresaId: 0,
  blindId: 0,
}

type Registro = Torneio

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/torneio'
  const endpointApi = '/torneio'
  const endpointApiItem = '/torneioitem'
  const endpointApiBlindItem = '/torneioblinditem'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [registros, setRegistros] = useState<TorneioItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<TorneioItem[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensAtualizados, setItensAtualizados] = useState<TorneioItem[]>([]) // Itens atualizados
  const [registrosBlind, setRegistrosBlind] = useState<TorneioBlindItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensBlindAdicionados, setItensBlindAdicionados] = useState<TorneioBlindItem[]>([]) // Itens adicionados localmente
  const [itensBlindExcluidos, setItensBlindExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensBlindAtualizados, setItensBlindAtualizados] = useState<TorneioBlindItem[]>([]) // Itens atualizados
  const [modalItem, setModalItem] = useState(false)
  const [index, setIndex] = useState(0)
  const [item, setItem] = useState<TorneioItem | null>(null)
  const [activeTab, setActiveTab] = useState(1)

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

  const getRegistros = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<TorneioItem>(endpointApiItem, {
      ...params,
      pageSize: 200,
    })
    setRegistros(reg.data || [])

    const regBlind = await apiGeral.getResource<TorneioBlindItem>(endpointApiBlindItem, {
      ...params,
      pageSize: 400,
    })
    setRegistrosAndOrder(regBlind.data || [])
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)

        getRegistros({ filters: { torneioId: params.id } })
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

      await handleAtualizarBlind()

      // Salvar os itens adicionados
      // for (const item of itensAdicionados) {
      //   item.torneioId = ret.data?.id
      //   await apiGeral.createResource<TorneioItem>(endpointApiItem, item)
      // }

      // // Atualizar os itens modificados
      // for (let item of itensAtualizados) {
      //   if (item.id) {
      //     await apiGeral.updateResorce<TorneioItem>(endpointApiItem, item)
      //   }
      // }

      // // Excluir os itens removidos
      // for (const itemId of itensExcluidos) {
      //   await apiGeral.deleteResorce(endpointApiItem, itemId.toString())
      // }

      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido salvar torneio' })
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

    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatório.'
    if (!formData.blindId) newErrors.blindId = 'Blind é obrigatório.'

    return newErrors
  }

  const handleAdicionarItem = (item: TorneioItem) => {
    console.log('chegou')
    setRegistros([...(registros || []), item])
    setItensAdicionados((prev) => [...prev, item])
  }

  const handleItemChange = <K extends keyof TorneioItem>(
    index: number,
    field: K,
    value: TorneioItem[K]
  ) => {
    const updatedItens = [...registros!]
    updatedItens[index][field] = value
    setRegistros(updatedItens)

    const existingItem = registros![index]

    // Checa se o item já foi atualizado e, se sim, adiciona na lista de itens atualizados
    if (!itensAtualizados.some((item) => item.id === existingItem.id)) {
      setItensAtualizados((prev) => [...prev, existingItem])
    }
  }

  const columns = [
    // { key: 'id', _style: { width: '10%' }, label: 'Código' },
    {
      key: 'descricao',
      _style: { width: '20%' },
      label: 'Descrição',
    },
    { key: 'fichas', _style: { width: '10%' }, label: 'Fichas' },
    { key: 'limiteJogador', _style: { width: '10%' }, label: 'Limite por Jogador' },
    { key: 'qtdePorJogador', _style: { width: '10%' }, label: 'Qtde. por Jogador' },
    { key: 'valorInscricao', _style: { width: '10%' }, label: 'Valor Inscrição' },
    { key: 'taxaAdm', _style: { width: '10%' }, label: 'Taxa Inscrição' },
    { key: 'rake', _style: { width: '10%' }, label: 'Rake' },
    // { key: 'order', _style: { width: '20%' }, label: 'order' },
    // { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const columnsBlind = [
    // { key: 'id', _style: { width: '10%' }, label: 'Código' },
    {
      key: 'nivel',
      _style: { width: '8%' },
      label: 'Nível',
    },
    { key: 'smallBlind', _style: { width: '20%' }, label: 'Small Blind (SB)' },
    { key: 'bigBlind', _style: { width: '20%' }, label: 'Big Blind (BB)' },
    { key: 'ante', _style: { width: '20%' }, label: 'Ante' },
    { key: 'duracao', _style: { width: '20%' }, label: 'Tempo (Minutos)' },
    // { key: 'order', _style: { width: '20%' }, label: 'order' },
    {
      key: 'show_detailsBlind',
      label: 'Ação',
      _style: { width: '2%' },
      filter: false,
      sorter: false,
    },
  ]

  const fichas = (item: any) => {
    return <td style={{ height: '110%' }}>{formatInteger(item.fichas)}</td>
  }

  const limiteJogador = (item: any) => {
    return <td style={{ height: '110%' }}>{item.limiteJogador ? 'Sim' : 'Não'}</td>
  }

  const valorInscricao = (item: any) => {
    return <td style={{ height: '110%' }}>{formatCurrency(item.valorInscricao.toString())}</td>
  }

  const taxaAdm = (item: any) => {
    return <td style={{ height: '110%' }}>{formatCurrency(item.taxaAdm.toString())}</td>
  }

  const rake = (item: any) => {
    return (
      <td style={{ height: '110%' }}>
        {item.tipoRake} {formatCurrencyNoSymbol(item.rake.toString())}
      </td>
    )
  }

  const qtdePorJogador = (item: any) => {
    return <td style={{ height: '110%' }}>{item.limiteJogador ? item.qtdePorJogador : '--'}</td>
  }

  const show_details = (item: any, index: number) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => handleAlterarClick(item, index)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const handleAlterarClick = (item: TorneioItem, index: number) => {
    setItem(item)
    setIndex(index)
    setModalItem(true)
  }

  const handleNovoClick = () => {
    setItem(null)
    setIndex(-1)
    setModalItem(true)
  }

  const handleExcluirClick = async (id: number) => {
    const index = (registros || []).findIndex((registro) => registro.id === id)

    if (index !== -1) {
      const [registroExcluido] = (registros || []).splice(index, 1) // Remove o registro do array
      setItensExcluidos((prev) => [...prev, registroExcluido.id!])
    } else {
      console.log(`Registro com ID ${id} não encontrado.`)
    }
  }

  const nivel = (item: TorneioBlindItem, index: any) => {
    return (
      <td>
        <CFormLabel>{item.nivel === 0 ? 'Intervalo' : item.nivel}</CFormLabel>
      </td>
    )
  }

  const smallBlind = (item: TorneioBlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          name="smallBlind"
          value={item.smallBlind}
          onChange={(e) => handleItemBlindChange(index, 'smallBlind', Number(e.target.value))}
        />
      </td>
    )
  }

  const bigBlind = (item: TorneioBlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.bigBlind}
          onChange={(e) => handleItemBlindChange(index, 'bigBlind', Number(e.target.value))}
        />
      </td>
    )
  }

  const duracao = (item: TorneioBlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.duracao}
          onChange={(e) => handleItemBlindChange(index, 'duracao', Number(e.target.value))}
        />
      </td>
    )
  }

  const ante = (item: TorneioBlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.ante}
          onChange={(e) => handleItemBlindChange(index, 'ante', Number(e.target.value))}
        />
      </td>
    )
  }

  const handleExcluirBlindClick = async (id: number) => {
    const index = (registrosBlind || []).findIndex((registro) => registro.id === id)

    if (index !== -1) {
      const [registroExcluido] = (registros || []).splice(index, 1) // Remove o registro do array
      setItensBlindExcluidos((prev) => [...prev, registroExcluido.id!])
      setRegistrosAndOrder(registrosBlind || [])
    } else {
      console.log(`Registro com ID ${id} não encontrado.`)
    }
  }

  const handleAdicionarBlindItem = (tipo: string) => {
    const registroComMaxNivel = (registrosBlind || []).reduce(
      (prev, curr) => (curr.nivel > prev.nivel ? curr : prev),
      { nivel: 0, duracao: 20 }
    )

    const registroComMaxOrder = (registrosBlind || []).reduce(
      (prev, curr) => (curr.order > prev.order ? curr : prev),
      { order: 0 }
    )

    const novoItem: TorneioBlindItem = {
      nivel: tipo === 'blind' ? registroComMaxNivel.nivel + 1 : 0,
      smallBlind: 0,
      bigBlind: 0,
      duracao: registroComMaxNivel.duracao,
      torneioId: params.id ? parseInt(params.id) : 0,
      ante: 0,
      order: registroComMaxOrder.order + 1,
    }
    setRegistrosAndOrder([...(registrosBlind || []), novoItem])
    setItensBlindAdicionados((prev) => [...prev, novoItem])
  }

  const handleCriarNivel = (item: TorneioBlindItem, tipo: string, abaixoOrAcima: string) => {
    // Calcula a nova ordem
    let novaOrder =
      abaixoOrAcima === 'acima'
        ? parseFloat(item.order.toString()) - 0.01
        : parseFloat(item.order.toString()) + 0.01

    let registrosAtualizados = (registrosBlind ?? []).map((reg) => {
      const orderNumber = parseFloat(reg.order.toString()) // Garante que reg.order é um número
      console.log(orderNumber, novaOrder)

      if (Math.abs(orderNumber - novaOrder) < 0.0001) {
        // Usando uma tolerância para números de ponto flutuante
        reg.order = abaixoOrAcima === 'acima' ? orderNumber - 0.01 : orderNumber + 0.01
      }

      return reg
    })

    // Cria o novo item com a ordem ajustada
    const novoItem: TorneioBlindItem = {
      nivel: tipo === 'blind' ? item.nivel + 1 : 0,
      smallBlind: 0,
      bigBlind: 0,
      duracao: item.duracao,
      torneioId: params.id ? parseInt(params.id) : 0,
      ante: 0,
      order: novaOrder, // Usa a ordem ajustada
    }

    // Adiciona o novo item à lista localmente
    registrosAtualizados.push(novoItem)

    // Atualiza o estado com a nova lista de registros ordenados
    setRegistrosAndOrder(registrosAtualizados)

    // Atualiza a lista de itens adicionados
    setItensBlindAdicionados((prev) => [...prev, novoItem])
  }

  const setRegistrosAndOrder = (lista: TorneioBlindItem[]) => {
    let novaLista = lista.sort((a, b) => a.order - b.order)
    let nivel = 1
    novaLista = novaLista.map((item, index) => {
      if (item.nivel != 0) {
        item.nivel = nivel
        nivel = nivel + 1
      }

      if (!itensAtualizados.some((i) => i.id === item.id)) {
        setItensBlindAtualizados((prev) => [...prev, item])
      }

      return item
    })
    setRegistrosBlind(novaLista)
  }

  const handleItemBlindChange = <K extends keyof TorneioBlindItem>(
    index: number,
    field: K,
    value: TorneioBlindItem[K]
  ) => {
    const updatedItens = [...registrosBlind!]
    updatedItens[index][field] = value
    setRegistrosAndOrder(updatedItens)

    const existingItem = registrosBlind![index]

    // Checa se o item já foi atualizado e, se sim, adiciona na lista de itens atualizados
    if (!itensBlindAtualizados.some((item) => item.id === existingItem.id)) {
      setItensBlindAtualizados((prev) => [...prev, existingItem])
    }
  }

  const show_detailsBlind = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => handleCriarNivel(item, 'blind', 'acima')}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilArrowThickTop} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Criar Nível Acima
            </CDropdownItem>
            <CDropdownItem onClick={() => handleCriarNivel(item, 'blind', 'abaixo')}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilArrowThickBottom} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Criar Nível Abaixo
            </CDropdownItem>
            <CDropdownItem onClick={() => handleCriarNivel(item, '', 'acima')}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilArrowThickTop} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Criar Intervalo Acima
            </CDropdownItem>
            <CDropdownItem onClick={() => handleCriarNivel(item, '', 'abaixo')}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilArrowThickBottom} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Criar Intervalo Abaixo
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirBlindClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const handleAtualizarBlind = async () => {
    try {
      let ret: { data?: { id: number }; success?: boolean; message?: string } = {}

      // Salvar os itens adicionados
      for (const item of itensBlindAdicionados) {
        item.torneioId = params.id ? parseInt(params.id) : 0
        await apiGeral.createResource<TorneioBlindItem>(endpointApiBlindItem, item)
      }

      // Atualizar os itens modificados
      for (const item of itensBlindAtualizados) {
        if (item.id) {
          await apiGeral.updateResorce<TorneioBlindItem>(endpointApiBlindItem, item)
        }
      }

      // Excluir os itens removidos
      for (const itemId of itensBlindExcluidos) {
        await apiGeral.deleteResorce(endpointApiBlindItem, itemId.toString())
      }

      return
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
      return
    }
  }

  return (
    <PermissionGate permission={2}>
      <CRow>
        <CCol>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                style={{ cursor: 'pointer' }}
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
                role="tab"
              >
                Detahes do Torneio
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                style={{ cursor: 'pointer' }}
                active={activeTab === 2}
                onClick={() => setActiveTab(2)}
                role="tab"
              >
                Ticket
              </CNavLink>
            </CNavItem>
            {/* <CNavItem>
              <CNavLink
                style={{ cursor: 'pointer' }}
                active={activeTab === 3}
                onClick={() => setActiveTab(3)}
                role="tab"
              >
                Aba 3
              </CNavLink>
            </CNavItem> */}
          </CNav>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <CTabContent>
            <CTabPane visible={activeTab === 1}>
              <CForm onSubmit={handleSubmit}>
                <CCard style={{ borderTop: 'none', borderTopLeftRadius: '0px' }}>
                  {/* <CCardHeader>
                    <strong>{params.id ? 'Detalhes do Torneio' : 'Cadastrando torneio'}</strong>
                  </CCardHeader> */}
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

                      <div className="w-100"></div>

                      <CCol md={8}>
                        <TextInputField
                          name="descricao"
                          placeholder="Descrição"
                          value={formData.descricao}
                          onChange={handleChange}
                          invalid={!!errors.descricao}
                          feedbackMessage={errors.descricao}
                        />
                      </CCol>

                      <CCol md={2}>
                        <SelectEstrutura
                          id={formData.estruturaId}
                          setId={(estruturaId) =>
                            handleChange(undefined, 'estruturaId', estruturaId)
                          }
                          invalid={!!errors.estruturaId}
                          feedbackMessage={errors.estruturaId}
                          disabled={formData.id !== 0}
                        ></SelectEstrutura>
                      </CCol>

                      <CCol md={2}>
                        <SelectBlind
                          id={formData.blindId}
                          setId={(blindId) => handleChange(undefined, 'blindId', blindId)}
                          invalid={!!errors.blindId}
                          feedbackMessage={errors.blindId}
                          disabled={formData.id !== 0}
                        ></SelectBlind>
                      </CCol>

                      {/* <CCol md={12} className="d-flex justify-content-end">
                <CButtonAdd onClick={() => handleNovoClick()} />
              </CCol> */}

                      <CCol xs={12}>
                        <CCard>
                          <CCardHeader>
                            <strong>Estrutura</strong>
                          </CCardHeader>
                          <CCardBody>
                            <SmartTableWrapper
                              items={registros}
                              columns={columns}
                              scopedColumns={{
                                fichas,
                                valorInscricao,
                                limiteJogador,
                                taxaAdm,
                                rake,
                                qtdePorJogador,
                                // show_details,
                              }}
                              filtroPorEmpresa={false}
                              filtroFixo={{ idFuncaoUsuario: params.id }}
                              columnFilter={false}
                              columnSorter={false}
                              itemsPerPageSelect={false}
                            />
                          </CCardBody>
                        </CCard>
                      </CCol>

                      <CCol xs={12}>
                        <CCard style={{ marginTop: '20px' }}>
                          <CCardHeader>
                            <strong>Blinds</strong>
                          </CCardHeader>
                          <CCardBody>
                            <SmartTableWrapper
                              items={registrosBlind}
                              columns={columnsBlind}
                              scopedColumns={{
                                nivel,
                                smallBlind,
                                bigBlind,
                                ante,
                                duracao,
                                show_detailsBlind,
                              }}
                              // , bigBlind, ante, duracao,
                              filtroPorEmpresa={false}
                              // filtroFixo={{ idFuncaoUsuario: params.id }}
                              columnFilter={false}
                              columnSorter={false}
                              itemsPerPageSelect={false}
                              // itemsPerPage={20}
                              // search={search}
                              // empresaId={empresaId}
                            />
                            <CCol md={4} style={{ marginTop: '25px' }}>
                              <CButtonAdd
                                label="Adicionar Blind"
                                onClick={() => handleAdicionarBlindItem('blind')}
                              />
                              <CButtonAdd
                                label="Adicionar Intervalor"
                                style={{ marginLeft: '10px' }}
                                onClick={() => handleAdicionarBlindItem('intervalo')}
                              />
                            </CCol>
                          </CCardBody>
                          {/* <CCardFooter>
                    <CButtonSave label={params.id ? 'Atualizar' : 'Cadastrar'} onClick={() => handleAtualizarBlind()} />
                  </CCardFooter> */}
                        </CCard>
                      </CCol>
                    </CRow>
                    {errors.api && <div className="text-danger">{errors.api}</div>}
                    <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
                    {/* <ModalEstruturaItem
              modal={modalItem}
              setModal={setModalItem}
              item={item || ({} as EstruturaTorneioItem)}
              index={index}
              estruturaId={params.id ? parseInt(params.id) : 0}
              handleItemChange={handleItemChange}
              handleAdicionarItem={handleAdicionarItem}
            ></ModalEstruturaItem> */}
                    {/* <BlindItemModal
              modal={modal}
              setModal={setModal}
              id={idEdit}
              blindId={params.id ? parseInt(params.id) : 0}
            ></BlindItemModal> */}
                  </CCardBody>
                  <CCardFooter>
                    <CButtonBack onClick={handleVoltar} />
                    <CButtonSave type="submit" label={params.id ? 'Atualizar' : 'Cadastrar'} />
                  </CCardFooter>
                </CCard>
              </CForm>
            </CTabPane>
          </CTabContent>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <CTabContent>
            <CTabPane visible={activeTab === 2}>
              <PageTicket torneioId={formData.id}></PageTicket>
            </CTabPane>
          </CTabContent>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}
