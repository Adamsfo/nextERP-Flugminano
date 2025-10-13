'use client'

import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { apiAuth } from '@/lib/auth'
import { Usuario } from '@/types/geral'

const Register = () => {
  const [formData, setFormData] = useState<Usuario>({
    login: '',
    email: '',
    senha: '',
    nomeCompleto: '',
    confirmaSenha: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.login) newErrors.login = 'O nome é obrigatório.'
    if (!formData.email) newErrors.email = 'O email é obrigatório.'
    if (!formData.senha) newErrors.senha = 'A senha é obrigatória.'
    if (!formData.nomeCompleto) newErrors.nomeCompleto = 'Nome Completo é obrigatório.'
    if (formData.senha !== formData.confirmaSenha) {
      newErrors.confirmaSenha = 'As senhas não coincidem.'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await apiAuth.addlogin(formData)
      if (response.success) setSuccess(response.success)
      if (!response.success) {
        setErrors({ api: response.message || 'Erro desconhecido ao registrar usuário.' })
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      setErrors({ api: 'Erro ao registrar usuário. Tente novamente mais tarde.' + error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Cadastro</h1>
                  <p className="text-medium-emphasis">Crie sua conta de usuário</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Usuário"
                      autoComplete="usuário"
                      id="login"
                      name="login"
                      value={formData.login}
                      onChange={handleChange}
                      invalid={!!errors.login}
                    />
                    {errors.login && <CFormFeedback invalid>{errors.login}</CFormFeedback>}
                  </CInputGroup>
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
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nome Completo"
                      autoComplete="Nome Completo"
                      id="nomeCompleto"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      invalid={!!errors.nomeCompleto}
                    />
                    {errors.nomeCompleto && (
                      <CFormFeedback invalid>{errors.nomeCompleto}</CFormFeedback>
                    )}
                  </CInputGroup>
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
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repetir senha"
                      id="confirmaSenha"
                      name="confirmaSenha"
                      value={formData.confirmaSenha}
                      onChange={handleChange}
                      invalid={!!errors.confirmaSenha}
                    />
                    {errors.confirmaSenha && (
                      <CFormFeedback invalid>{errors.confirmaSenha}</CFormFeedback>
                    )}
                  </CInputGroup>

                  {/* Exibição de erro da API */}
                  {errors.api && <div className="text-danger">{errors.api}</div>}

                  <div className="d-grid">
                    <CButton color="success" type="submit" disabled={isLoading}>
                      {isLoading ? 'Criando...' : 'Criar conta'}
                    </CButton>
                  </div>

                  {success && (
                    <div className="text-success mt-3">Registro realizado com sucesso!</div>
                  )}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
