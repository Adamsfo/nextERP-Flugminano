'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { FormPropsEdit, QueryParams, TabelaPreco, TabelaPrecoItem } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import SelectField from '@/components/tz/SelectField'
import ModalMsg from '@/components/modal/ModalMsg'
import SelectLaboratorio from '@/components/select/SelectLaboratorio'
import { formatCurrency } from '@/components/tz/formatters'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilDelete, cilPencil } from '@coreui/icons'
import CButtonAdd from '@/components/tz/CButtonAdd'
import ModalTabelaPrecoItem from './modalItem'

const initialFormData: TabelaPreco = {
  id: 0,
  laboratorioId: 0,
  nome: '',
  valor: 0,
  ativa: 'Sim',
}

type Registro = typeof initialFormData

export default function TabelaPrecoForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/tabelapreco'
  const endpointApi = '/tabelaPreco'
  const endpointApiItem = '/tabelaprecoitem'

  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const [registros, setRegistros] = useState<TabelaPrecoItem[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<TabelaPrecoItem[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos
  const [itensAtualizados, setItensAtualizados] = useState<TabelaPrecoItem[]>([]) // Itens atualizados

  const [item, setItem] = useState<TabelaPrecoItem | null>(null)
  const [index, setIndex] = useState(0)
  const [modalItem, setModalItem] = useState(false)

  const handleChange = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    if (e) {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'valor' ? Number(value) : value,
      }))
    } else if (customName) {
      setFormData((prev) => ({
        ...prev,
        [customName]: customValue,
      }))
    }
  }

  const getRegistros = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<TabelaPrecoItem>(endpointApiItem, {
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

        getRegistros({ filters: { tabela_preco_id: params.id } })
      }
    }
    if (params.id) fetchData()
  }, [params.id])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nome) newErrors.nome = 'Nome é obrigatório'
    if (!formData.laboratorioId) newErrors.laboratorioId = 'Laboratório é obrigatório'

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
      let ret: { data?: { id: number }; success?: boolean; message?: string } = {}
      if (params.id) {
        ret = await apiGeral.updateResorce<Registro>(endpointApi, formData)
      } else {
        ret = await apiGeral.createResource<Registro>(endpointApi, formData)
      }

      // Salvar os itens adicionados
      for (const item of itensAdicionados) {
        item.tabelaPrecoId = ret.data?.id || 0
        await apiGeral.createResource<TabelaPrecoItem>(endpointApiItem, item)
      }

      // Atualizar os itens modificados
      for (const item of itensAtualizados) {
        if (item.id) {
          await apiGeral.updateResorce<TabelaPrecoItem>(endpointApiItem, item)
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

  const handleItemChange = <K extends keyof TabelaPrecoItem>(
    index: number,
    field: K,
    value: TabelaPrecoItem[K]
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

  const handleExcluirClick = async (id: number) => {
    const index = (registros || []).findIndex((registro) => registro.id === id)

    if (index !== -1) {
      const [registroExcluido] = (registros || []).splice(index, 1) // Remove o registro do array
      setItensExcluidos((prev) => [...prev, registroExcluido.id!])
      setRegistros(registros || [])
    } else {
      console.log(`Registro com ID ${id} não encontrado.`)
    }
  }

  const handleAdicionarItem = (item: TabelaPrecoItem) => {
    console.log('chegou')
    setRegistros([...(registros || []), item])
    setItensAdicionados((prev) => [...prev, item])
  }

  const handleNovo = () => {}

  const handleAlterar = (item: TabelaPrecoItem, index: number) => {
    setItem(item)
    setIndex(index)
    setModalItem(true)

    console.log('item', item)
    console.log('index', index)
  }

  const show_details = (item: TabelaPrecoItem, index: number) => {
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

  const columnsItens = [
    { key: 'id', _style: { width: '10%' }, label: 'Código' },
    // {
    //   key: 'nivel',
    //   _style: { width: '8%' },
    //   label: 'Nível',
    // },
    { key: 'analise_nome', _style: { width: '20%' }, label: 'Análise' },
    { key: 'prazoDias', _style: { width: '20%' }, label: 'Prazo em dias' },
    { key: 'vpmMinimo', _style: { width: '20%' }, label: 'Vpm Mínimo' },
    { key: 'vpmMaximo', _style: { width: '20%' }, label: 'Vpm Máximo' },
    { key: 'lqMinimo', _style: { width: '20%' }, label: 'LQ Mínimo' },
    { key: 'lqMaximo', _style: { width: '20%' }, label: 'LQ Máximo' },
    // { key: 'order', _style: { width: '20%' }, label: 'order' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const handleNovoItem = () => {
    setItem(null)
    setIndex(-1)
    setModalItem(true)
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>
              {params.id ? 'Alterando Tabela de Preço' : 'Cadastrando Tabela de Preço'}
            </strong>
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

              <CCol md={11} style={{ marginTop: '25px' }}>
                <SelectLaboratorio
                  id={formData.laboratorioId}
                  setId={(value) => setFormData((prev) => ({ ...prev, laboratorioId: value }))}
                  setDescricao={undefined}
                ></SelectLaboratorio>
              </CCol>

              <CCol md={6}>
                <TextInputField
                  name="nome"
                  placeholder="Nome da Tabela"
                  value={formData.nome}
                  onChange={handleChange}
                  invalid={!!errors.nome}
                  feedbackMessage={errors.nome}
                />
              </CCol>

              <CCol md={3}>
                <TextInputFieldReais
                  name="valor"
                  placeholder="Valor"
                  value={formData.valor?.toString() || ''} // Mantém o valor decimal
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.valor}
                  feedbackMessage={errors.valor}
                />
              </CCol>

              <CCol md={3}>
                <SelectField
                  name="ativa"
                  value={formData.ativa}
                  onChange={handleChange}
                  options={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                  ]}
                  placeholder="Ativo"
                />
              </CCol>

              <CCol md={12} className="text-end" style={{ marginTop: '25px' }}>
                <CButtonAdd label="Adicionar Análise" onClick={() => handleNovoItem()} />
              </CCol>

              <SmartTableWrapper
                items={registros}
                columns={columnsItens}
                scopedColumns={{ show_details }}
                filtroPorEmpresa={false}
                columnFilter={false}
                columnSorter={false}
              />

              <ModalTabelaPrecoItem
                modal={modalItem}
                setModal={setModalItem}
                item={item || ({} as TabelaPrecoItem)}
                index={index}
                tabelaPrecoId={params.id ? parseInt(params.id) : 0}
                laboratorioId={formData.laboratorioId}
                handleItemChange={handleItemChange}
                handleAdicionarItem={handleAdicionarItem}
              ></ModalTabelaPrecoItem>
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
