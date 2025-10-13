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
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { Blind, BlindItem, ClienteFornecedor, FormPropsEdit, QueryParams } from '@/types/geral'
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
import BlindItemModal from './blindItemModal'
import CButtonAdd from '@/components/tz/CButtonAdd'

const initialFormData: Blind = {
  id: 0,
  descricao: '',
  empresaId: 0,
}

type Registro = Blind

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/blind'
  const endpointApi = '/blind'
  const endpointApiItem = '/blinditem'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [registros, setRegistros] = useState<BlindItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<BlindItem[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensAtualizados, setItensAtualizados] = useState<BlindItem[]>([]) // Itens atualizados

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
    const reg = await apiGeral.getResource<BlindItem>(endpointApiItem, { ...params, pageSize: 200 })
    setRegistrosAndOrder(reg.data || [])
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)

        getRegistros({ filters: { blindId: params.id } })
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

      // Salvar os itens adicionados
      for (const item of itensAdicionados) {
        item.blindId = ret.data?.id || 0
        await apiGeral.createResource<BlindItem>(endpointApiItem, item)
      }

      // Atualizar os itens modificados
      for (const item of itensAtualizados) {
        if (item.id) {
          await apiGeral.updateResorce<BlindItem>(endpointApiItem, item)
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

    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    // if (!formData.cnpjCpf) newErrors.cnpjCpf = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  const handleItemChange = <K extends keyof BlindItem>(
    index: number,
    field: K,
    value: BlindItem[K]
  ) => {
    const updatedItens = [...registros!]
    updatedItens[index][field] = value
    setRegistrosAndOrder(updatedItens)

    const existingItem = registros![index]

    // Checa se o item já foi atualizado e, se sim, adiciona na lista de itens atualizados
    if (!itensAtualizados.some((item) => item.id === existingItem.id)) {
      setItensAtualizados((prev) => [...prev, existingItem])
    }
  }

  const columns = [
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
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const nivel = (item: BlindItem, index: any) => {
    return (
      <td>
        <CFormLabel>{item.nivel === 0 ? 'Intervalo' : item.nivel}</CFormLabel>
        {/* <CFormInput
          name="nivel"
          value={item.nivel}
          onChange={(e) => handleItemChange(index, 'nivel', Number(e.target.value))}
        /> */}
      </td>
    )
  }

  const smallBlind = (item: BlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          name="smallBlind"
          value={item.smallBlind}
          onChange={(e) => handleItemChange(index, 'smallBlind', Number(e.target.value))}
        />
      </td>
    )
  }

  const bigBlind = (item: BlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.bigBlind}
          onChange={(e) => handleItemChange(index, 'bigBlind', Number(e.target.value))}
        />
      </td>
    )
  }

  const duracao = (item: BlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.duracao}
          onChange={(e) => handleItemChange(index, 'duracao', Number(e.target.value))}
        />
      </td>
    )
  }

  const ante = (item: BlindItem, index: any) => {
    return (
      <td>
        <CFormInput
          value={item.ante}
          onChange={(e) => handleItemChange(index, 'ante', Number(e.target.value))}
        />
      </td>
    )
  }

  const show_details = (item: any) => {
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

  // const handleAlterarNivel = (id: string) => {
  //   setIdEdit(id)
  //   setModal(true)
  // }

  // const handleCriarNivel = (id: string) => {
  //   setIdEdit('')
  //   setModal(true)
  // }

  const handleExcluirClick = async (id: number) => {
    const index = (registros || []).findIndex((registro) => registro.id === id)

    if (index !== -1) {
      const [registroExcluido] = (registros || []).splice(index, 1) // Remove o registro do array
      setItensExcluidos((prev) => [...prev, registroExcluido.id!])
      setRegistrosAndOrder(registros || [])
    } else {
      console.log(`Registro com ID ${id} não encontrado.`)
    }
  }

  const handleAdicionarItem = (tipo: string) => {
    const registroComMaxNivel = (registros || []).reduce(
      (prev, curr) => (curr.nivel > prev.nivel ? curr : prev),
      { nivel: 0, duracao: 20 }
    )

    const registroComMaxOrder = (registros || []).reduce(
      (prev, curr) => (curr.order > prev.order ? curr : prev),
      { order: 0 }
    )

    const novoItem: BlindItem = {
      nivel: tipo === 'blind' ? registroComMaxNivel.nivel + 1 : 0,
      smallBlind: 0,
      bigBlind: 0,
      duracao: registroComMaxNivel.duracao,
      blindId: params.id ? parseInt(params.id) : 0,
      ante: 0,
      order: parseFloat(registroComMaxOrder.order.toString()) + 1,
    }
    setRegistrosAndOrder([...(registros || []), novoItem])
    setItensAdicionados((prev) => [...prev, novoItem])
  }

  const handleCriarNivel = (item: BlindItem, tipo: string, abaixoOrAcima: string) => {
    // Calcula a nova ordem
    let novaOrder =
      abaixoOrAcima === 'acima'
        ? parseFloat(item.order.toString()) - 0.01
        : parseFloat(item.order.toString()) + 0.01

    let registrosAtualizados = (registros ?? []).map((reg) => {
      const orderNumber = parseFloat(reg.order.toString()) // Garante que reg.order é um número
      console.log(orderNumber, novaOrder)

      if (Math.abs(orderNumber - novaOrder) < 0.0001) {
        // Usando uma tolerância para números de ponto flutuante
        reg.order = abaixoOrAcima === 'acima' ? orderNumber - 0.01 : orderNumber + 0.01
      }

      return reg
    })

    // Cria o novo item com a ordem ajustada
    const novoItem: BlindItem = {
      nivel: tipo === 'blind' ? item.nivel + 1 : 0,
      smallBlind: 0,
      bigBlind: 0,
      duracao: item.duracao,
      blindId: params.id ? parseInt(params.id) : 0,
      ante: 0,
      order: novaOrder, // Usa a ordem ajustada
    }

    // Adiciona o novo item à lista localmente
    registrosAtualizados.push(novoItem)

    // Atualiza o estado com a nova lista de registros ordenados
    setRegistrosAndOrder(registrosAtualizados)

    // Atualiza a lista de itens adicionados
    setItensAdicionados((prev) => [...prev, novoItem])
  }

  const setRegistrosAndOrder = (lista: BlindItem[]) => {
    let novaLista = lista.sort((a, b) => a.order - b.order)
    let nivel = 1
    novaLista = novaLista.map((item, index) => {
      if (item.nivel != 0) {
        item.nivel = nivel
        nivel = nivel + 1
      }

      if (!itensAtualizados.some((i) => i.id === item.id)) {
        setItensAtualizados((prev) => [...prev, item])
      }

      return item
    })
    console.log(novaLista)
    setRegistros(novaLista)
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando blind' : 'Cadastrando blind'}</strong>
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

              <div className="w-100"></div>

              <CCol md={12}>
                <TextInputField
                  name="descricao"
                  placeholder="Descrição"
                  value={formData.descricao}
                  onChange={handleChange}
                  invalid={!!errors.descricao}
                  feedbackMessage={errors.descricao}
                />
              </CCol>

              {/* {registros &&
                registros.map((item, index) => (
                  <CRow key={index} className="g-3">
                    <CCol md={1}>
                      <CFormInput
                        name={`nivel-${index}`}
                        value={item.nivel}
                        onChange={(e) => handleItemChange(index, 'nivel', Number(e.target.value))}
                        label="Nível"
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        name={`smallBlind-${index}`}
                        value={item.smallBlind}
                        onChange={(e) =>
                          handleItemChange(index, 'smallBlind', Number(e.target.value))
                        }
                        label="Small Blind"
                      />
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormInput
                        name={`bigBlind-${index}`}
                        value={item.bigBlind}
                        onChange={(e) =>
                          handleItemChange(index, 'bigBlind', Number(e.target.value))
                        }
                        label="Big Blind"
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        name={`ante-${index}`}
                        value={item.ante}
                        onChange={(e) => handleItemChange(index, 'ante', Number(e.target.value))}
                        label="Ante"
                      />
                    </CCol>
                  </CRow>
                ))} */}

              <SmartTableWrapper
                items={registros}
                columns={columns}
                scopedColumns={{ nivel, smallBlind, bigBlind, ante, duracao, show_details }}
                // , bigBlind, ante, duracao,
                filtroPorEmpresa={false}
                columnFilter={false}
                columnSorter={false}
                // itemsPerPage={20}
                // search={search}
                // empresaId={empresaId}
              />
              <CCol md={4} style={{ marginTop: '25px' }}>
                <CButtonAdd label="Adicionar Blind" onClick={() => handleAdicionarItem('blind')} />
                <CButtonAdd
                  label="Adicionar Intervalor"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleAdicionarItem('intervalo')}
                />
              </CCol>
              {/* <CCol md={2} style={{ marginTop: '25px' }}></CCol> */}
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
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
    </PermissionGate>
  )
}
