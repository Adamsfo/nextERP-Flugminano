'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { FormPropsEdit, TabelaPreco } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import SelectField from '@/components/tz/SelectField'
import ModalMsg from '@/components/modal/ModalMsg'
import SelectLaboratorio from '@/components/select/SelectLaboratorio'
import { formatCurrency } from '@/components/tz/formatters'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'

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

  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

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

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as Registro)
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
      let ret: any = {}

      if (params.id) {
        ret = await apiGeral.updateResorce(endpointApi, formData)
      } else {
        ret = await apiGeral.createResource(endpointApi, formData)
      }

      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro ao salvar' })
        return
      }

      router.push(`${endpoint}?filter=${ret.data?.id}`)
      params.onClose?.()
    } catch (error) {
      console.error(error)
    }
  }

  const handleVoltar = () => {
    router.push(endpoint)
    params.onClose?.()
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

              <CCol md={6} style={{ marginTop: '25px' }}>
                <SelectLaboratorio
                  id={formData.laboratorioId}
                  setId={(value) => setFormData((prev) => ({ ...prev, laboratorioId: value }))}
                  setDescricao={undefined}
                ></SelectLaboratorio>
              </CCol>

              <CCol md={4}>
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
