'use client'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { apiGeral } from '@/lib/geral'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilChevronBottom, cilChevronRight, cilDelete } from '@coreui/icons'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Laboratorios, LaboratoriosItem, QueryParams } from '@/types/geral'
import LaboratorioItensResumo, {
  LaboratorioItensCacheEntry,
} from './LaboratorioItensResumo'
import './laboratorios-list.css'
import PermissionGate from '@/components/auth/PermissionGate'
import ModalMsg from '@/components/modal/ModalMsg'
import FilterTableWrapper from '@/components/hooks/FilterTableWrapper'
import { useDeleteWithConfirm } from '@/components/hooks/useDeleteWithConfirm'
import { getStatusLaboratoriosStyle } from '@/components/tz/StatusLaboratoriosStyle'
import { formatDateBr } from '@/components/tz/formatters'
import {
  laboratoriosEditUrl,
  laboratoriosListQueryFromState,
  laboratoriosListStateFromSearchParams,
} from '@/lib/laboratoriosNav'
import LaboratorioNomeInline from './LaboratorioNomeInline'
import ModalPreencherNomesSequencial from './ModalPreencherNomesSequencial'
import { LaboratoriosToaster, useLaboratoriosToast } from './LaboratoriosToast'

const Page = () => {
  const endpoint = '/laboratorios'
  const endpointApi = '/laboratorios'
  const searchParams = useSearchParams()
  const filtroInicial = laboratoriosListStateFromSearchParams(searchParams)

  const [search, setSearch] = useState(filtroInicial.search)
  const [filtroFixo, setFiltroFixo] = useState<Record<string, string | number> | undefined>(
    filtroInicial.filtroFixo
  )
  const [atualizar, setAtualizar] = useState(false)
  const router = useRouter()
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [itensCache, setItensCache] = useState<Record<number, LaboratorioItensCacheEntry>>({})
  const [modalPreencherNomes, setModalPreencherNomes] = useState(false)
  const { toasts, pushToast } = useLaboratoriosToast()

  const protocoloNumeroFiltro =
    filtroFixo?.protocolo_numero != null ? String(filtroFixo.protocolo_numero).trim() : ''

  const endpointItensApi = '/laboratorios-itens'

  const extrairNomeAnalise = (item: LaboratoriosItem): string | null => {
    const nome =
      item.analiseNome ||
      item.analise_nome ||
      (item as LaboratoriosItem & { analise?: { nome?: string } }).analise?.nome
    if (!nome || !String(nome).trim()) return null
    return String(nome).trim()
  }

  const loadItens = useCallback(async (laboratorioId: number) => {
    setItensCache((prev) => ({
      ...prev,
      [laboratorioId]: {
        loading: true,
        loaded: false,
        nomes: prev[laboratorioId]?.nomes ?? [],
      },
    }))

    try {
      const reg = await apiGeral.getResource<LaboratoriosItem>(endpointItensApi, {
        laboratorioId: String(laboratorioId),
        pageSize: 500,
        sortBy: 'id',
        order: 'asc',
      })
      const nomes = (reg.data || [])
        .map(extrairNomeAnalise)
        .filter((nome): nome is string => Boolean(nome))
      setItensCache((prev) => ({
        ...prev,
        [laboratorioId]: { loading: false, loaded: true, nomes },
      }))
    } catch {
      setItensCache((prev) => ({
        ...prev,
        [laboratorioId]: { loading: false, loaded: true, nomes: [] },
      }))
    }
  }, [])

  const ensureItensLoaded = useCallback(
    (laboratorioId: number) => {
      setItensCache((prev) => {
        const atual = prev[laboratorioId]
        if (atual?.loaded || atual?.loading) return prev
        void loadItens(laboratorioId)
        return prev
      })
    },
    [loadItens]
  )

  const toggleExpand = (laboratorioId: number) => {
    setExpandedRows((prev) => {
      if (prev[laboratorioId]) {
        const next = { ...prev }
        delete next[laboratorioId]
        return next
      }
      ensureItensLoaded(laboratorioId)
      return { ...prev, [laboratorioId]: true }
    })
  }

  useEffect(() => {
    const next = laboratoriosListStateFromSearchParams(searchParams)
    setSearch(next.search)
    setFiltroFixo(next.filtroFixo)
    setAtualizar((v) => !v)
  }, [searchParams])

  const columns = [
    {
      key: 'detalhes',
      label: 'Detalhes',
      _style: { width: '4%' },
      filter: false,
      sorter: false,
    },
    { key: 'id', _style: { width: '6%' }, label: 'Código' },
    { key: 'numero', label: 'Número' },
    { key: 'protocolo_numero', label: 'Protocolo' },
    { key: 'sequenciaAmostra', label: 'Seq. Amostra' },
    { key: 'nome', label: 'Nome da Amostra', _style: { minWidth: '160px' } },
    { key: 'dataGeracao', label: 'Data geração' },
    { key: 'dataEntregaCliente', label: 'Entrega Cliente' },
    { key: 'cliente_nomeFantasia', _style: { minWidth: '100px' }, label: 'Cliente' },
    { key: 'laboratorio_nome', label: 'Laboratório' },
    { key: 'status', label: 'Status' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const dataGeracao = (item: any) => {
    const date = new Date(item.dataGeracao)
    return <td>{date.toLocaleDateString()}</td>
  }

  const dataEntregaCliente = (item: Laboratorios) => (
    <td>{formatDateBr(item.dataEntregaCliente)}</td>
  )

  const status = (item: any) => {
    const statusStyle = getStatusLaboratoriosStyle(item.status)
    return (
      <td style={{ textAlign: 'center' }}>
        <span
          style={{
            color: statusStyle.color,
            backgroundColor: statusStyle.background,
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '6px',
            display: 'inline-block',
            fontSize: '12px',
          }}
        >
          {item.status}
        </span>
      </td>
    )
  }

  const nomeAmostra = (item: Laboratorios) => (
    <LaboratorioNomeInline
      item={item}
      onToast={pushToast}
      onSaved={() => setAtualizar((v) => !v)}
    />
  )

  const detalhes = (item: any) => {
    const aberto = Boolean(expandedRows[item.id])
    return (
      <td className="py-2 text-center">
        <button
          type="button"
          className="btn btn-link p-0 border-0 text-body"
          aria-expanded={aberto}
          aria-label={aberto ? 'Recolher análises' : 'Expandir análises'}
          onClick={(e) => {
            e.stopPropagation()
            toggleExpand(item.id)
          }}
        >
          <CIcon icon={aberto ? cilChevronBottom : cilChevronRight} size="lg" />
        </button>
      </td>
    )
  }

  const detailRow = (item: any) => {
    if (!expandedRows[item.id]) {
      return <div className="laboratorio-detail-row-hidden" aria-hidden />
    }
    return (
      <div className="laboratorio-detail-expanded">
        <LaboratorioItensResumo cache={itensCache[item.id]} />
      </div>
    )
  }

  const show_details = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown" style={{ position: 'unset' }}>
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" style={{ cursor: 'pointer' }}>
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem
              onClick={() =>
                router.push(
                  laboratoriosEditUrl(item.id, laboratoriosListQueryFromState(search, filtroFixo))
                )
              }
            >
              <CTooltip content="Alterar laboratório" placement="top">
                <CIcon icon={cilAlignCenter} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Alterar
            </CDropdownItem>
            <CDropdownItem onClick={() => handleExcluirClick(String(item.id))}>
              <CTooltip content="Excluir laboratório" placement="top">
                <CIcon icon={cilDelete} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  const getRegistros = async (params: QueryParams) => {
    return await apiGeral.getResource(endpointApi, params)
  }

  const { handleExcluirClick, ConfirmModalComponent } = useDeleteWithConfirm(async (id: string) => {
    try {
      const ret = await apiGeral.deleteResorce(endpointApi, id)
      if (!ret.success) {
        setMsg('Erro ao excluir registro:' + ret.message)
        return
      }
      setMsg('Registro excluído com sucesso.')
      setModalMsg(true)
      router.refresh()
    } catch (error) {
      setMsg('Erro ao excluir registro:' + error)
    }
  })

  return (
    <PermissionGate permission={1}>
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Laboratórios</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol
                  md={12}
                  className="d-flex flex-wrap align-items-center justify-content-end gap-2"
                >
                  <CTooltip
                    content={
                      protocoloNumeroFiltro
                        ? 'Preencher nomes das amostras deste protocolo em sequência'
                        : 'Filtre por protocolo (busca com filtro de protocolo) para usar o preenchimento em lote'
                    }
                  >
                    <span className="d-inline-block">
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        disabled={!protocoloNumeroFiltro}
                        onClick={() => setModalPreencherNomes(true)}
                      >
                        Preencher sequencialmente
                      </CButton>
                    </span>
                  </CTooltip>
                  <FilterTableWrapper
                    search={search}
                    setSearch={setSearch}
                    atualizar={atualizar}
                    setAtualizar={setAtualizar}
                  />
                </CCol>
              </CRow>
              <SmartTableWrapper
                fetchFunction={getRegistros}
                columns={columns}
                scopedColumns={{
                  detalhes,
                  nome: nomeAmostra,
                  status,
                  dataGeracao,
                  dataEntregaCliente,
                  show_details,
                  details: detailRow,
                }}
                search={search}
                filtroFixo={filtroFixo}
                atualizar={atualizar}
                tableProps={{
                  className: 'add-this-class laboratorios-expandable-table',
                  responsive: true,
                  striped: true,
                  hover: true,
                }}
              />
            </CCardBody>
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
            {ConfirmModalComponent}
            <ModalPreencherNomesSequencial
              visible={modalPreencherNomes}
              setVisible={setModalPreencherNomes}
              protocoloNumero={protocoloNumeroFiltro}
              onToast={pushToast}
              onSuccess={() => setAtualizar((v) => !v)}
            />
            <LaboratoriosToaster toasts={toasts} />
          </CCard>
        </CCol>
      </CRow>
    </PermissionGate>
  )
}

export default Page
