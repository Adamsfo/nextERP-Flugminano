'use client'

import { useState, useEffect, ChangeEvent, useCallback } from 'react'
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
  CFormSelect,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter, useSearchParams } from 'next/navigation'
import { laboratoriosListUrl, readLaboratoriosReturnFromSearchParams } from '@/lib/laboratoriosNav'
import { apiGeral } from '@/lib/geral'
import { FormPropsEdit, Laboratorios, LaboratoriosItem, LaboratoriosStatus } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilDelete, cilPencil } from '@coreui/icons'
import ModalLaboratorioItem from './ModalLaboratorioItem'

const initialFormData: Laboratorios = {
  id: 0,
  protocoloId: 0,
  empresaId: 0,
  clienteFornecedorId: 0,
  laboratorioId: 0,
  numero: '',
  sequenciaAmostra: 0,
  dataGeracao: '',
  status: 'Gerado',
  observacao: '',
}

const STATUS_OPTIONS: LaboratoriosStatus[] = [
  'Gerado',
  'Recebido',
  'Em análise',
  'Finalizado',
  'Cancelado',
]

const exibirValor = (valor: unknown) => {
  if (valor === null || valor === undefined || valor === '') return '-'
  return String(valor)
}

export default function LaboratoriosForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/laboratorios'
  const endpointApi = '/laboratorios'
  const endpointItensApi = '/laboratoriositem'
  const router = useRouter()
  const searchParams = useSearchParams()
  const listReturnUrl = laboratoriosListUrl(readLaboratoriosReturnFromSearchParams(searchParams))
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Laboratorios>(initialFormData)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [itens, setItens] = useState<LaboratoriosItem[]>([])
  const [totalItens, setTotalItens] = useState(0)
  const [itemEdicao, setItemEdicao] = useState<LaboratoriosItem | null>(null)
  const [modalItem, setModalItem] = useState(false)

  const laboratorioRegistroId = params.id ? parseInt(params.id, 10) : 0

  const carregarItens = useCallback(async () => {
    if (!laboratorioRegistroId) return
    const reg = await apiGeral.getResource<LaboratoriosItem>(endpointItensApi, {
      filters: { laboratoriosId: String(laboratorioRegistroId) },
      pageSize: 500,
      sortBy: 'id',
      order: 'asc',
    })
    const lista = reg.data || []
    setItens(lista)
    const meta = reg.meta as { totalItems?: number } | undefined
    setTotalItens(meta?.totalItems ?? lista.length)
  }, [laboratorioRegistroId])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById<Laboratorios>(
          endpointApi,
          parseInt(params.id)
        )
        setFormData(registro as Laboratorios)
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  useEffect(() => {
    carregarItens()
  }, [carregarItens])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const ret = await apiGeral.updateResorce<Laboratorios>(endpointApi, {
        id: formData.id,
        status: formData.status,
        observacao: formData.observacao,
      })
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
        return
      }
      router.push(listReturnUrl)
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  const handleVoltar = () => {
    router.push(listReturnUrl)
  }

  const dataGeracaoLabel =
    formData.dataGeracao && !Number.isNaN(new Date(formData.dataGeracao).getTime())
      ? new Date(formData.dataGeracao).toLocaleString()
      : ''

  const columnsItens = [
    { key: 'id', _style: { width: '6%' }, label: 'Código' },
    { key: 'analiseNome', label: 'Análise' },
    { key: 'norma_descricao', label: 'Norma' },
    { key: 'metodo', label: 'Método' },
    { key: 'unidade', label: 'Unidade' },
    { key: 'prazoDias', label: 'Prazo (dias)' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const celulaTexto = (item: LaboratoriosItem, campo: keyof LaboratoriosItem) => (
    <td>{exibirValor(item[campo])}</td>
  )

  const colAnalise = (item: LaboratoriosItem) => (
    <td>{exibirValor(item.analiseNome || item.analise_nome)}</td>
  )

  const colNorma = (item: LaboratoriosItem) => <td>{exibirValor(item.norma_descricao)}</td>

  const show_details = (item: LaboratoriosItem) => (
    <td className="py-2">
      <CDropdown variant="dropdown" style={{ position: 'unset' }}>
        <CDropdownToggle className="py-0" color="primary">
          <CIcon icon={cilAlignCenter} size="lg" className="me" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0">
          <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
          <CDropdownItem
            onClick={() => {
              setItemEdicao(item)
              setModalItem(true)
            }}
          >
            <CTooltip content="Alterar análise" placement="top">
              <CIcon icon={cilPencil} size="xl" style={{ marginRight: '6px' }} />
            </CTooltip>
            Alterar
          </CDropdownItem>
          <CDropdownItem onClick={() => handleExcluirItemClick(String(item.id))}>
            <CTooltip content="Excluir análise" placement="top">
              <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
            </CTooltip>
            Excluir
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </td>
  )

  const { handleExcluirClick: handleExcluirItemClick, ConfirmModalComponent } =
    useDeleteWithConfirm(async (id: string) => {
      const ret = await apiGeral.deleteResorce(endpointItensApi, id)
      if (!ret.success) {
        setMsg(ret.message || 'Erro ao excluir item.')
        setModalMsg(true)
        return
      }
      await carregarItens()
    })

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Alterando laboratório</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={1}>
                <TextInputField
                  name="id"
                  placeholder="Código"
                  value={formData.id !== 0 ? formData.id.toString() : ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>
              <CCol md={3}>
                <TextInputField
                  name="numero"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>
              <CCol md={2}>
                <TextInputField
                  name="sequenciaAmostra"
                  placeholder="Seq. amostra"
                  value={formData.sequenciaAmostra?.toString() ?? ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>
              <CCol md={3}>
                <TextInputField
                  name="protocolo_numero"
                  placeholder="Protocolo"
                  value={formData.protocolo_numero ?? ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>
              <CCol md={3}>
                <TextInputField
                  name="dataGeracao"
                  placeholder="Data geração"
                  value={dataGeracaoLabel}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>

              <div className="w-100" />

              <CCol md={6}>
                <TextInputField
                  name="cliente_nomeFantasia"
                  placeholder="Cliente"
                  value={formData.cliente_nomeFantasia ?? ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>
              <CCol md={6}>
                <TextInputField
                  name="laboratorio_nome"
                  placeholder="Laboratório"
                  value={formData.laboratorio_nome ?? ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </CCol>

              <CCol md={12}>
                <TextInputField
                  name="observacao"
                  placeholder="Observação"
                  value={formData.observacao ?? ''}
                  onChange={handleChange}
                />
              </CCol>

              {laboratorioRegistroId > 0 ? (
                <>
                  <div className="w-100" />
                  <CCol md={12} className="d-flex justify-content-end align-items-center pt-2">
                    <span className="text-body-secondary">
                      Total de análises: <strong>{totalItens}</strong>
                    </span>
                  </CCol>
                  <CCol md={12}>
                    <SmartTableWrapper
                      items={itens}
                      columns={columnsItens}
                      filtroPorEmpresa={false}
                      columnFilter={false}
                      columnSorter={false}
                      scopedColumns={{
                        analiseNome: colAnalise,
                        norma_descricao: colNorma,
                        metodo: (item: LaboratoriosItem) => celulaTexto(item, 'metodo'),
                        unidade: (item: LaboratoriosItem) => celulaTexto(item, 'unidade'),
                        prazoDias: (item: LaboratoriosItem) => celulaTexto(item, 'prazoDias'),
                        show_details,
                      }}
                    />
                  </CCol>
                </>
              ) : null}
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
          </CCardBody>
          <CCardFooter>
            <CButtonBack onClick={handleVoltar} />
            <CButtonSave type="submit" label="Atualizar" />
          </CCardFooter>
        </CCard>
      </CForm>

      <ModalLaboratorioItem
        visible={modalItem}
        setVisible={setModalItem}
        item={itemEdicao}
        onSaved={carregarItens}
      />
      {ConfirmModalComponent}
    </PermissionGate>
  )
}
