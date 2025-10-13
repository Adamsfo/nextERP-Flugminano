'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CCard,
  CCol,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CFormCheck,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import {
  FormPropsEdit,
  FuncaoUsuario,
  FuncaoUsuarioAcesso,
  QueryParams,
  Usuario,
  UsuarioEmpresa,
} from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import SelectFuncaoSistema from '@/components/select/SelectFuncaoSistema'
import SmartTableWrapper from '@/components/hooks/SmartTableWrapper'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilLockLocked, cilX } from '@coreui/icons'
import ModalMsg from '@/components/modal/ModalMsg'
import CButtonAdd from '@/components/tz/CButtonAdd'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import SelectFuncaoUsuario from '@/components/select/SelectFuncaoUsuario'
import SelectEmpresa from '@/components/select/SelectEmpresa'

const initialFormData: Usuario = {
  id: 0,
  login: '',
  email: '',
  nomeCompleto: '',
}

type Registro = Usuario

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/configuracao/usuario'
  const endpointApi = '/usuario'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [modalMsg, setModalMsg] = useState(false)
  const [empresaId, setEmpresaId] = useState(0)
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [msg, setMsg] = useState('')
  const [registros, setRegistros] = useState<UsuarioEmpresa[] | undefined>([]) // Estado para manter os registros da tabela
  const [itensAdicionados, setItensAdicionados] = useState<UsuarioEmpresa[]>([]) // Itens adicionados localmente
  const [itensExcluidos, setItensExcluidos] = useState<number[]>([]) // IDs dos itens excluídos

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

        getRegistros({ filters: { usuarioId: params.id } })
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
    console.log(validationErrors)
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
        await apiGeral.createResource<UsuarioEmpresa>('/usuarioempresa', item)
      }

      // Excluir os itens removidos
      for (const itemId of itensExcluidos) {
        await apiGeral.deleteResorce('/usuarioempresa', itemId.toString())
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

    if (!formData.login) newErrors.login = 'Campo é obrigatório.'
    if (!formData.email.includes('@')) newErrors.email = 'Campo é obrigatório ou não é um email.'
    // if (!formData.senha) newErrors.senha = 'Campo é obrigatório.'
    if (!formData.nomeCompleto) newErrors.nomeCompleto = 'Campo é obrigatório.'
    if (!formData.idFuncaoUsuario) newErrors.idFuncaoUsuario = 'Campo é obrigatório.'

    return newErrors
  }

  const getRegistros = async (params: QueryParams) => {
    const reg = await apiGeral.getResource<UsuarioEmpresa>('/usuarioempresa', params)
    setRegistros(reg.data)
  }

  const columns = [
    {
      key: 'empresa_nomeFantasia',
      _style: { minWidth: '100px' },
      label: 'Empresa(s) adicionada(s) para esse usuário ter acesso',
    },
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

  // Manipulador para excluir itens localmente
  const handleExcluirItemClick = (id: number) => {
    if (id !== 0) {
      setItensExcluidos((prev) => [...prev, id])
    }
    setRegistros((prev: UsuarioEmpresa[] | undefined) => prev?.filter((item) => item.id !== id))
  }

  // Manipulador para adicionar novos itens à tabela (sem enviar ainda para a API)
  const handleAdicionarItem = () => {
    const itemExiste = registros?.some((item) => item.empresaId === empresaId)

    if (itemExiste) {
      setErrors({ existe: 'Empresa já cadastrada.' })
      return
    }

    const novoItem: UsuarioEmpresa = {
      empresaId: empresaId,
      usuarioId: formData.id || 0,
      empresa_nomeFantasia: nomeFantasia,
    }
    setRegistros((prev: UsuarioEmpresa[] | undefined) => [...prev!, novoItem])
    setItensAdicionados((prev) => [...prev, novoItem])
  }

  return (
    <PermissionGate permission={10}>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CRow>
            <CCol md={1}>
              <TextInputField
                name="id"
                placeholder="Código"
                value={formData.id ? formData.id.toString() : ''}
                onChange={handleChange}
                invalid={!!errors.id}
                feedbackMessage={errors.id}
                disabled={true}
              />
            </CCol>

            {/* <div className="w-100"></div> */}
            <CCol md={1}>
              <CFormCheck
                id="ativo"
                name="ativo"
                label="Ativo"
                style={{ cursor: 'pointer' }}
                checked={formData.ativo}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormCheck
                id="alterarSenha"
                name="alterarSenha"
                label="Alterar senha proximo login"
                checked={formData.alterarSenha}
                style={{ cursor: 'pointer' }}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CCol md={6}>
            <TextInputField
              name="login"
              placeholder="Login"
              value={formData.login}
              onChange={handleChange}
              invalid={!!errors.login}
              feedbackMessage={errors.login}
            />
          </CCol>
          <CCol md={6}>
            <CInputGroup className="mb-3">
              <CInputGroupText>@</CInputGroupText>
              <CFormInput
                placeholder="Email"
                autoComplete="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                invalid={!!errors.email}
              />
              {errors.email && <CFormFeedback invalid>{errors.email}</CFormFeedback>}
            </CInputGroup>
          </CCol>
          <CCol md={6}>
            <TextInputField
              name="nomeCompleto"
              placeholder="Nome Completo"
              value={formData.nomeCompleto}
              onChange={handleChange}
              invalid={!!errors.nomeCompleto}
              feedbackMessage={errors.nomeCompleto}
            />
          </CCol>

          <CCol md={6}>
            <SelectFuncaoUsuario
              id={formData.idFuncaoUsuario}
              setId={(idFuncaoUsuario) =>
                handleChange(undefined, 'idFuncaoUsuario', idFuncaoUsuario)
              }
            />
            {errors.idFuncaoUsuario && <div className="text-danger">{errors.idFuncaoUsuario}</div>}
          </CCol>

          <CCol md={6} style={{ marginTop: '25px' }}>
            <SelectEmpresa
              id={empresaId}
              setId={setEmpresaId}
              setDescricao={setNomeFantasia}
            ></SelectEmpresa>
          </CCol>
          <CCol md={2} style={{ marginTop: '25px' }}>
            <CButtonAdd label="Adicionar" onClick={() => handleAdicionarItem()} />
          </CCol>

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

          <CCol md={3}>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Senha"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                invalid={!!errors.senha}
              />
              {errors.senha && <CFormFeedback invalid>{errors.senha}</CFormFeedback>}
            </CInputGroup>
          </CCol>
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
