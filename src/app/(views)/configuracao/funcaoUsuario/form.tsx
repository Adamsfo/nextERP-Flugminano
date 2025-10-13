'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
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
import { FormPropsEdit, FuncaoUsuario, FuncaoUsuarioAcesso, QueryParams } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import SelectFuncaoSistema from '@/components/select/SelectFuncaoSistema'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilX } from '@coreui/icons'
import ModalMsg from '@/components/modal/ModalMsg'
import CButtonAdd from '@/components/tz/CButtonAdd'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'

const initialFormData: FuncaoUsuario = {
  id: 0,
  funcaoUsuario: '',
}

type Registro = FuncaoUsuario

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/configuracao/funcaoUsuario'
  const endpointApi = '/funcaousuario'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [idFuncaoSistema, setIdFuncaoSistema] = useState<number>(0)
  const [FuncaoSistema, setFuncaoSistema] = useState('')
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [registros, setRegistros] = useState<FuncaoUsuarioAcesso[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<FuncaoUsuarioAcesso[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // Verifica o tipo do alvo para garantir que a lógica funcione para ambos os casos
    if (type === 'select-one') {
      // Lógica para o select
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    } else {
      // Lógica para o input
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)

        getRegistros({ filters: { idFuncaoUsuario: params.id } })
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  // Manipulador para adicionar novos itens à tabela (sem enviar ainda para a API)
  const handleAdicionarItem = () => {
    const itemExiste = registros?.some((item) => item.funcaoSistema_funcaoSistema === FuncaoSistema)

    if (itemExiste) {
      setErrors({ existe: 'Função do Usuário já cadastrada.' })
      return
    }

    const novoItem: FuncaoUsuarioAcesso = {
      idFuncaoSistema: idFuncaoSistema,
      idFuncaoUsuario: formData.id,
      funcaoSistema_funcaoSistema: FuncaoSistema,
    }
    setRegistros((prev: FuncaoUsuarioAcesso[] | undefined) => [...prev!, novoItem])
    setItensAdicionados((prev) => [...prev, novoItem])
  }

  // Manipulador para excluir itens localmente
  const handleExcluirItemClick = (id: number) => {
    if (id !== 0) {
      setItensExcluidos((prev) => [...prev, id])
    }
    setRegistros((prev: FuncaoUsuarioAcesso[] | undefined) =>
      prev?.filter((item) => item.id !== id)
    )
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
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
        return
      }

      // Salvar os itens adicionados
      for (const item of itensAdicionados) {
        await apiGeral.createResource<FuncaoUsuarioAcesso>('/funcaousuarioacesso', item)
      }

      // Excluir os itens removidos
      for (const itemId of itensExcluidos) {
        await apiGeral.deleteResorce('/funcaousuarioacesso', itemId.toString())
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

    if (!formData.funcaoUsuario) newErrors.nomeFantasia = 'Campo é obrigatório.'

    return newErrors
  }

  const getRegistros = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<FuncaoUsuarioAcesso>('/funcaousuarioacesso', params)
    setRegistros(reg.data)
  }

  const columns = [
    { key: 'funcaoSistema_funcaoSistema', _style: { minWidth: '100px' }, label: 'Função Sistema' },
    // { key: 'idFuncaoUsuario', _style: { minWidth: '100px' }, label: 'idFuncaoUsuario' },
    { key: 'show_details', label: 'Ação', _style: { width: '2%' }, filter: false, sorter: false },
  ]

  const show_details = (item: any) => {
    return (
      <td className="py-2">
        <CDropdown variant="dropdown">
          <CDropdownToggle className="py-0" color="primary">
            <CIcon icon={cilAlignCenter} size="lg" className="me" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0">
            <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>
            <CDropdownItem onClick={() => handleExcluirItemClick(item.id)}>
              <CTooltip content="Lançamento de Amostra para Laboratório" placement="top">
                <CIcon icon={cilX} size="xl" style={{ marginRight: '6px' }} />
              </CTooltip>
              Excluir
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </td>
    )
  }

  return (
    <PermissionGate permission={8}>
      <CForm onSubmit={handleSubmit}>
        <CRow>
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

            <CCol md={10}>
              <TextInputField
                name="funcaoUsuario"
                placeholder="Função do Usuário"
                value={formData.funcaoUsuario ?? ''}
                onChange={handleChange}
                invalid={!!errors.funcaoUsuario}
                feedbackMessage={errors.funcaoUsuario}
              />
            </CCol>
          </CRow>

          <CCol md={10}>
            <SelectFuncaoSistema
              id={idFuncaoSistema}
              setId={setIdFuncaoSistema}
              setFuncaoSistema={setFuncaoSistema}
            ></SelectFuncaoSistema>
          </CCol>
          <CCol md={2}>
            <CButtonAdd label="Adicionar" onClick={() => handleAdicionarItem()} />
          </CCol>
          {errors.existe && <div className="text-danger">{errors.existe}</div>}

          <SmartTableWrapper
            items={registros}
            columns={columns}
            scopedColumns={{ show_details }}
            filtroPorEmpresa={false}
            filtroFixo={{ idFuncaoUsuario: params.id }}
            columnFilter={false}
            columnSorter={false}
            // search={search}
            // empresaId={empresaId}
          />

          {/* Exibição de erro da API */}
          {errors.api && <div className="text-danger">{errors.api}</div>}
        </CRow>

        <CButtonBack onClick={handleVoltar} />

        <CButtonSave type="submit" label={params.id ? 'Atualizar' : 'Cadastrar'}></CButtonSave>
      </CForm>
      <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
    </PermissionGate>
  )
}
