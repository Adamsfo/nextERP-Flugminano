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
import {
  Blind,
  BlindItem,
  ClienteFornecedor,
  EstruturaTorneio,
  EstruturaTorneioItem,
  FormPropsEdit,
  QueryParams,
} from '@/types/geral'
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

const initialFormData: EstruturaTorneio = {
  id: 0,
  descricao: '',
  empresaId: 0,
  blindId: 0,
}

type Registro = EstruturaTorneio

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/estrutura'
  const endpointApi = '/estrutura'
  const endpointApiItem = '/estruturaitem'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [registros, setRegistros] = useState<EstruturaTorneioItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<EstruturaTorneioItem[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensAtualizados, setItensAtualizados] = useState<EstruturaTorneioItem[]>([]) // Itens atualizados
  const [modalItem, setModalItem] = useState(false)
  const [index, setIndex] = useState(0)
  const [item, setItem] = useState<EstruturaTorneioItem | null>(null)

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
    const reg = await apiGeral.getResource<EstruturaTorneioItem>(endpointApiItem, {
      ...params,
      pageSize: 200,
    })
    setRegistros(reg.data || [])
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)

        getRegistros({ filters: { estruturaId: params.id } })
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
        item.estruturaId = ret.data?.id
        await apiGeral.createResource<EstruturaTorneioItem>(endpointApiItem, item)
      }

      // Atualizar os itens modificados
      for (let item of itensAtualizados) {
        if (item.id) {
          await apiGeral.updateResorce<EstruturaTorneioItem>(endpointApiItem, item)
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
    if (!formData.blindId) newErrors.blindId = 'Blind é obrigatório.'

    return newErrors
  }

  const handleAdicionarItem = (item: EstruturaTorneioItem) => {
    console.log('chegou')
    setRegistros([...(registros || []), item])
    setItensAdicionados((prev) => [...prev, item])
  }

  const handleItemChange = <K extends keyof EstruturaTorneioItem>(
    index: number,
    field: K,
    value: EstruturaTorneioItem[K]
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
    { key: 'totalInscricao', _style: { width: '10%' }, label: 'Total Inscrição' },
    { key: 'rake', _style: { width: '10%' }, label: 'Rake' },
    // { key: 'order', _style: { width: '20%' }, label: 'order' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
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

  const totalInscricao = (item: any) => {
    return <td style={{ height: '110%' }}>{formatCurrency(item.totalInscricao.toString())}</td>
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

  const handleAlterarClick = (item: EstruturaTorneioItem, index: number) => {
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

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando estrutura' : 'Cadastrando estrutura'}</strong>
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

              <CCol md={4}>
                <SelectBlind
                  id={formData.blindId}
                  setId={(blindId) => handleChange(undefined, 'blindId', blindId)}
                  invalid={!!errors.blindId}
                  feedbackMessage={errors.blindId}
                ></SelectBlind>
              </CCol>

              <CCol md={12} className="d-flex justify-content-end">
                <CButtonAdd onClick={() => handleNovoClick()} />
              </CCol>

              <SmartTableWrapper
                items={registros}
                columns={columns}
                scopedColumns={{
                  fichas,
                  valorInscricao,
                  limiteJogador,
                  taxaAdm,
                  totalInscricao,
                  rake,
                  qtdePorJogador,
                  show_details,
                }}
                // , bigBlind, ante, duracao,
                filtroPorEmpresa={false}
                filtroFixo={{ idFuncaoUsuario: params.id }}
                columnFilter={false}
                columnSorter={false}
                // itemsPerPage={20}
                // search={search}
                // empresaId={empresaId}
              />
              {/* <CCol md={4} style={{ marginTop: '25px' }}>
                <CButtonAdd label="Adicionar Blind" onClick={() => handleAdicionarItem('blind')} />
                <CButtonAdd
                  label="Adicionar Intervalor"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleAdicionarItem('intervalo')}
                />
              </CCol> */}
              {/* <CCol md={2} style={{ marginTop: '25px' }}></CCol> */}
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
            <ModalEstruturaItem
              modal={modalItem}
              setModal={setModalItem}
              item={item || ({} as EstruturaTorneioItem)}
              index={index}
              estruturaId={params.id ? parseInt(params.id) : 0}
              handleItemChange={handleItemChange}
              handleAdicionarItem={handleAdicionarItem}
            ></ModalEstruturaItem>
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
