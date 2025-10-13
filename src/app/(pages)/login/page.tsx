'use client'

import Link from 'next/link'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { FormEvent, useState } from 'react'
import { apiAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { apiGeral } from '@/lib/geral'
import { FuncaoUsuarioAcesso, UsuarioEmpresa } from '@/types/geral'

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const dispatch = useDispatch()
  const router = useRouter()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const result = await apiAuth.login({ login: email, senha: password })
    if (result.success) {
      const response = await apiAuth.getUsuario({ search: email })
      if (response.data[0].ativo === false) {
        setError('Usuário não esta ativo!')
        return
      }
      const reg = await apiGeral.getResource<UsuarioEmpresa>('/usuarioempresa', {
        filters: { usuarioId: response.data[0].id },
      })

      const empresaIds = reg?.data?.map((item) => item.empresaId) || []
      if (empresaIds.length === 0) {
        setError('Usuário não possui empresa vinculada!')
        return
      }

      if (!response.data[0].idFuncaoUsuario) {
        setError('Usuário não possui função vinculada!')
        return
      }

      const permissions = await apiGeral.getResource<FuncaoUsuarioAcesso>('/funcaousuarioacesso', {
        filters: { idFuncaoUsuario: response.data[0].idFuncaoUsuario },
      })
      const permissionIds = permissions?.data?.map((item) => item.idFuncaoSistema) || []

      dispatch({ type: 'set', usuario: response.data[0] })
      dispatch({ type: 'set', empresaId: [empresaIds[0]] })
      dispatch({ type: 'set', empresasId: empresaIds })
      dispatch({ type: 'set', permissions: permissionIds })
      router.push('/')
    } else {
      setError(result.message || 'Erro desconhecido')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Entre com seu email ou usuário</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      {error && <CAlert color="danger">{error}</CAlert>}
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Entrar
                        </CButton>
                      </CCol>
                      {/* <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol> */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Cadastrar-se</h2>
                    <p>
                      Caso não tenho cadastro de usuario no sistema, faça seu cadastro e informe seu
                      supervisor para fazer devida configuração de acesso.
                    </p>
                    <Link href="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Criar Conta!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
