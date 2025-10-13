'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormSwitch,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { EstruturaTorneioItem } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'
import { formatCurrency, formatCurrencyNoSymbol, formatInteger } from '@/components/tz/formatters'
import TextInputFieldInteger from '@/components/tz/TextInputFieldInteger'
import SelectField from '@/components/tz/SelectField'
import TextInputFieldDecimal from '@/components/tz/TextInputFieldDecimal'

const initialFormData: EstruturaTorneioItem = {
  id: 0,
  descricao: '',
  fichas: 0,
  limiteJogador: false,
  qtdePorJogador: 1,
  valorInscricao: 0,
  taxaAdm: 0,
  tipoRake: 'R$',
  rake: 0,
  estruturaId: 0,
  totalInscricao: 0,
}

type Registro = EstruturaTorneioItem

interface FormPropsEditEstruturaItem {
  item: Registro
  estruturaId: number
  index: number
  onClose: () => void
}

interface EstruturaItemFormProps {
  params: FormPropsEditEstruturaItem
  handleItemChange: <K extends keyof EstruturaTorneioItem>(
    index: number,
    field: K,
    value: EstruturaTorneioItem[K]
  ) => void
  handleAdicionarItem: (item: Registro) => void
}

export default function EstruturaItemForm({
  params,
  handleItemChange,
  handleAdicionarItem,
}: EstruturaItemFormProps) {
  const endpoint = '/estrutura'
  const endpointApi = '/estruturaitem'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')
  const [novo, setNovo] = useState(true)

  const handleChange = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    console.log(e)
    console.log(customName)
    console.log(customValue)
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
    if (params.item && Object.keys(params.item).length > 0) {
      setFormData(params.item) // Se houver um item, usa-o
      setNovo(false)
    } else {
      setFormData(initialFormData) // Se for um registro novo, usa os dados iniciais
      setNovo(true)
    }
  }, [params.item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    try {
      if (novo) {
        if (empresaIdSelecionada.length !== 1) {
          setErrors({ api: 'Selecione apenas uma empresa para criar o registro nesta empresa!' })
          return
        }

        formData.estruturaId = params.estruturaId

        handleAdicionarItem(formData)
      } else {
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key)) {
            const customName = key as keyof EstruturaTorneioItem
            const customValue = formData[customName]
            console.log(customName, customValue)
            if (customName != 'id') {
              handleItemChange(params.index, customName as keyof EstruturaTorneioItem, customValue)
            }
          }
        }
      }

      if (params.onClose) {
        params.onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  const handleVoltar = async () => {
    router.push(`${endpoint}/${params.estruturaId}`)
    if (params.onClose) {
      params.onClose()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.descricao) newErrors.nivel = 'Descrição é obrigatório.'
    if (!formData.fichas) newErrors.smallBlind = 'Fichas é obrigatório.'
    if (!formData.valorInscricao) newErrors.cnpjCpf = 'Valor de Inscrição é obrigatório.'
    if (formData.limiteJogador && formData.qtdePorJogador < 1)
      newErrors.qtdePorJogador = 'Quantidade de jogador tem que ser maior que 0.'

    return newErrors
  }

  // Atualiza totalInscricao automaticamente
  useEffect(() => {
    const valorInscricao = formatCurrency(String(formData.valorInscricao)).replace(/\D/g, '')
    const taxaAdm = formatCurrency(String(formData.taxaAdm)).replace(/\D/g, '')
    const totalInscricao = parseFloat(valorInscricao) + parseFloat(taxaAdm)
    handleChange(undefined, 'totalInscricao', totalInscricao)
  }, [formData.valorInscricao, formData.taxaAdm])

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>
              {formData.id > 0 ? 'Alterando nível de blind' : 'Cadastrando nível de blind'}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <TextInputField
                  name="descricao"
                  placeholder="Descrição"
                  value={formData.descricao?.toString() || ''}
                  onChange={handleChange}
                  invalid={!!errors.descricao}
                  feedbackMessage={errors.descricao}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldReais
                  name="valorInscricao"
                  placeholder="Valor da Inscrição"
                  value={formData.valorInscricao} // Mantém o valor decimal
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.valorInscricao}
                  feedbackMessage={errors.valorInscricao}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldReais
                  name="taxaAdm"
                  placeholder="Taxa Administrativa"
                  value={formData.taxaAdm?.toString() || ''}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.taxaAdm}
                  feedbackMessage={errors.taxaAdm}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldReais
                  name="totalInscricao"
                  placeholder="Total Inscrição"
                  value={formData.totalInscricao?.toString() || ''}
                  disabled
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.totalInscricao}
                  feedbackMessage={errors.totalInscricao}
                />
              </CCol>

              <CCol md={2}>
                <SelectField
                  name="tipoRake"
                  placeholder="Tipo Rake"
                  value={formData.tipoRake ?? ''}
                  onChange={handleChange}
                  options={[
                    { value: '%', label: '%' },
                    { value: 'R$', label: 'R$' },
                  ]}
                  invalid={!!errors.tipoRake}
                  feedbackMessage={errors.tipoRake}
                />
              </CCol>

              <CCol md={2}>
                {formData.tipoRake === 'R$' ? (
                  <TextInputFieldReais
                    name="rake"
                    placeholder="Rake"
                    value={formData.rake?.toString() || ''}
                    onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                    invalid={!!errors.rake}
                    feedbackMessage={errors.rake}
                  />
                ) : (
                  <TextInputFieldDecimal
                    name="rake"
                    placeholder="Rake"
                    value={formData.rake?.toString() || ''}
                    onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                    invalid={!!errors.rake}
                    feedbackMessage={errors.rake}
                  />
                )}
              </CCol>

              <CCol md={2}>
                <TextInputFieldInteger
                  name="fichas"
                  placeholder="Fichas"
                  value={formatInteger(formData.fichas?.toString() || '')}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.fichas}
                  feedbackMessage={errors.fichas}
                />
              </CCol>

              <CCol md={2}>
                <CFormSwitch
                  label="Limite por Jogador"
                  id="formSwitchCheckChecked"
                  name="limiteJogador"
                  checked={formData.limiteJogador}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="qtdePorJogador"
                  placeholder="Qtde por Jogador"
                  value={formData.limiteJogador ? formData.qtdePorJogador?.toString() || '' : ''}
                  onChange={handleChange}
                  disabled={!formData.limiteJogador}
                  invalid={!!errors.qtdePorJogador}
                  feedbackMessage={errors.qtdePorJogador}
                />
              </CCol>
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            {errors.estruturaId && <div className="text-danger">{errors.estruturaId}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
          </CCardBody>
          <CCardFooter>
            <CButtonBack onClick={handleVoltar} />
            <CButtonSave
              label={formData.id > 0 ? 'Atualizar' : 'Cadastrar'}
              onClick={handleSubmit}
            />
          </CCardFooter>
        </CCard>
      </CForm>
    </PermissionGate>
  )
}
