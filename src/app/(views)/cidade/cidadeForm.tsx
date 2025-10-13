'use client'

import { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CForm,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { Cidade, FormPropsEdit } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'

type Registro = Cidade

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/cidade'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>({
    id: 0,
    descricao: '',
    uf: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById<Registro>(endpoint, parseInt(params.id))
        setFormData(registro as Registro)
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
        ret = await apiGeral.updateResorce<Registro>(endpoint, formData)
      } else {
        ret = await apiGeral.createResource(endpoint, formData)
      }
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
      }
      router.push(`${endpoint}?filter=${ret.data?.id}`)
      if (params.onClose) {
        params.onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar cidade:', error)
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

    if (!formData.descricao) newErrors.descricao = 'A descrição é obrigatória.'
    if (!formData.uf) newErrors.uf = 'A UF é obrigatório.'

    return newErrors
  }

  return (
    <PermissionGate permission={6}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando Cidade' : 'Cadastrando Cidade'}</strong>
          </CCardHeader>
          <CCardBody>
            <CFormFloating className="mb-3">
              <CFormInput
                type="text"
                id="descricao"
                name="descricao"
                placeholder=" "
                value={formData.descricao}
                onChange={handleChange}
                invalid={!!errors.descricao}
              />
              <CFormLabel htmlFor="descricao">Descrição</CFormLabel>
              {errors.descricao && <CFormFeedback invalid>{errors.descricao}</CFormFeedback>}
            </CFormFloating>

            <CFormFloating className="mb-2">
              <CFormInput
                type="text"
                id="floatingInput"
                floatingClassName="mb-2"
                placeholder=""
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                invalid={!!errors.uf}
              />
              <CFormLabel htmlFor="descricao">UF</CFormLabel>
              {errors.uf && <CFormFeedback invalid>{errors.uf}</CFormFeedback>}
            </CFormFloating>

            {/* Exibição de erro da API */}
            {errors.api && <div className="text-danger">{errors.api}</div>}
          </CCardBody>
          <CCardFooter>
            <CButton color="secondary" className="mt-3" onClick={handleVoltar}>
              Voltar
            </CButton>

            <CButton type="submit" color="primary" className="mt-3" style={{ marginLeft: '10px' }}>
              {params.id ? 'Atualizar' : 'Cadastrar'}
            </CButton>
          </CCardFooter>
        </CCard>
      </CForm>
    </PermissionGate>
  )
}
