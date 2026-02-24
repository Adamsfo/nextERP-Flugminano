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
import { EstruturaTorneioItem, TabelaPrecoItem } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'
import { formatInteger } from '@/components/tz/formatters'
import TextInputFieldInteger from '@/components/tz/TextInputFieldInteger'
import SelectField from '@/components/tz/SelectField'
import TextInputFieldDecimal from '@/components/tz/TextInputFieldDecimal'
import TextInputFieldDecimalBig from '@/components/tz/TextInputFieldDecimalBig'
import SelectAnalise from '@/components/select/SelectAnalise'

const initialFormData: TabelaPrecoItem = {
  id: 0,
  tabelaPrecoId: 0,
  analiseId: 0,
  prazoDias: 0,
  valor: 0,
}

type Registro = typeof initialFormData

interface FormPropsEditTabelaPrecoItem {
  item: Registro
  tabelaPrecoId: number
  laboratorioId: number
  index: number
  onClose: () => void
}

interface TabelaPrecoItemFormProps {
  params: FormPropsEditTabelaPrecoItem
  handleItemChange: <K extends keyof TabelaPrecoItem>(
    index: number,
    field: K,
    value: TabelaPrecoItem[K]
  ) => void
  handleAdicionarItem: (item: Registro) => void
}

export default function TabelaPrecoItemForm({
  params,
  handleItemChange,
  handleAdicionarItem,
}: TabelaPrecoItemFormProps) {
  const endpoint = '/tabelapreco'
  const endpointApi = '/tabelaprecoitem'
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
    console.log(params.item)
    if (params.item && Object.keys(params.item).length > 0) {
      setFormData(params.item) // Se houver um item, usa-o
      console.log('alteracao')
      setNovo(false)
    } else {
      setFormData(initialFormData) // Se for um registro novo, usa os dados iniciais
      console.log('novo')
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

        formData.tabelaPrecoId = params.tabelaPrecoId

        handleAdicionarItem(formData)
      } else {
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key)) {
            const customName = key as keyof TabelaPrecoItem
            const customValue = formData[customName]
            console.log(customName, customValue)
            if (customName != 'id') {
              handleItemChange(params.index, customName as keyof TabelaPrecoItem, customValue)
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
    router.push(`${endpoint}/${params.tabelaPrecoId}`)
    if (params.onClose) {
      params.onClose()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    // if (!formData.descricao) newErrors.nivel = 'Descrição é obrigatório.'
    // if (!formData.fichas) newErrors.smallBlind = 'Fichas é obrigatório.'
    // if (!formData.valorInscricao) newErrors.cnpjCpf = 'Valor de Inscrição é obrigatório.'
    // if (formData.limiteJogador && formData.qtdePorJogador < 1)
    //   newErrors.qtdePorJogador = 'Quantidade de jogador tem que ser maior que 0.'

    return newErrors
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>
              {formData.id > 0
                ? 'Alterando item de tabela de preço'
                : 'Cadastrando item de tabela de preço'}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={4}>
                <TextInputFieldInteger
                  name="prazoDias"
                  placeholder="Prazo (dias)"
                  value={formatInteger(formData.prazoDias?.toString() || '')}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.prazoDias}
                  feedbackMessage={errors.prazoDias}
                />
              </CCol>

              <CCol md={8}>
                <SelectAnalise
                  id={formData.analiseId}
                  setId={(analiseId) => handleChange(undefined, 'analiseId', analiseId)}
                  setDescricao={(analise_nome) =>
                    handleChange(undefined, 'analise_nome', analise_nome)
                  }
                  laboratorioId={params.laboratorioId}
                  invalid={!!errors.analiseId}
                  feedbackMessage={errors.analiseId}
                  disabled={formData.id !== 0}
                ></SelectAnalise>
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="vpmMinimo"
                  placeholder="VPM Mímimo"
                  value={formData.vpmMinimo?.toString() || ''}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.vpmMinimo}
                  feedbackMessage={errors.vpmMinimo}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="vpmMaximo"
                  placeholder="VPM Máximo"
                  value={formData.vpmMaximo?.toString() || ''}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.vpmMaximo}
                  feedbackMessage={errors.vpmMaximo}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="lqMinimo"
                  placeholder="LQ Mínimo"
                  value={formData.lqMinimo?.toString() || ''}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.lqMinimo}
                  feedbackMessage={errors.lqMinimo}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="lqMaximo"
                  placeholder="LQ Máximo"
                  value={formData.lqMaximo?.toString() || ''}
                  onChange={(name, rawValue) => handleChange(undefined, name, rawValue)}
                  invalid={!!errors.lqMaximo}
                  feedbackMessage={errors.lqMaximo}
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
