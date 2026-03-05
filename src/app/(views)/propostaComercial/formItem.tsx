'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { PropostaComercialItem } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputFieldInteger from '@/components/tz/TextInputFieldInteger'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import ModalMsg from '@/components/modal/ModalMsg'
import TextInputFieldReais from '@/components/tz/TextInputFieldReais'
import { formatInteger } from '@/components/tz/formatters'
import TextInputFieldDecimalBig from '@/components/tz/TextInputFieldDecimalBig'
import SelectAnalise from '@/components/select/SelectAnalise'

const initialFormData: PropostaComercialItem = {
  id: 0,
  propostaComercialId: 0,
  analiseId: 0,

  analiseNome: '',
  metodo: '',
  unidade: '',

  prazoDias: 0,

  vpmMinimo: 0,
  vpmMaximo: 0,
  lqMinimo: 0,
  lqMaximo: 0,

  quantidade: 1,
  valorUnitario: 0,
  valorTotal: 0,
}

type Registro = typeof initialFormData

interface FormPropsEditPropostaComercialItem {
  item: Registro
  propostaComercialId: number
  laboratorioId: number
  index: number
  onClose: () => void
}

interface PropostaComercialItemFormProps {
  params: FormPropsEditPropostaComercialItem
  handleItemChange: <K extends keyof PropostaComercialItem>(
    index: number,
    field: K,
    value: PropostaComercialItem[K]
  ) => void
  handleAdicionarItem: (item: Registro) => void
}

export default function PropostaComercialItemForm({
  params,
  handleItemChange,
  handleAdicionarItem,
}: PropostaComercialItemFormProps) {
  const endpoint = '/propostacomercial'
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
    if (e) {
      const { name, value, type } = e.target

      let parsedValue: any = value

      if (type === 'number') parsedValue = Number(value)
      if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked

      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }))
    } else if (customName) {
      setFormData((prev) => ({
        ...prev,
        [customName]: customValue,
      }))
    }
  }

  useEffect(() => {
    if (params.item && Object.keys(params.item).length > 0) {
      setFormData(params.item)
      setNovo(false)
    } else {
      setFormData(initialFormData)
      setNovo(true)
    }
  }, [params.item])

  // cálculo automático
  useEffect(() => {
    const total = (Number(formData.quantidade) || 0) * (Number(formData.valorUnitario) || 0)

    setFormData((prev) => ({
      ...prev,
      valorTotal: total,
    }))
  }, [formData.quantidade, formData.valorUnitario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      if (novo) {
        if (empresaIdSelecionada.length !== 1) {
          setErrors({ api: 'Selecione apenas uma empresa!' })
          return
        }

        const novoItem = {
          ...formData,
          propostaComercialId: params.propostaComercialId,
        }

        handleAdicionarItem(novoItem)
      } else {
        for (const key in formData) {
          const customName = key as keyof PropostaComercialItem
          const customValue = formData[customName]

          if (customName !== 'id') {
            handleItemChange(params.index, customName, customValue)
          }
        }
      }

      params.onClose?.()
    } catch (error) {
      console.error(error)
    }
  }

  const handleVoltar = () => {
    router.push(`${endpoint}/${params.propostaComercialId}`)
    params.onClose?.()
  }

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>
              {formData.id > 0 ? 'Alterando item de proposta' : 'Cadastrando item de proposta'}
            </strong>
          </CCardHeader>

          <CCardBody>
            <CRow>
              <CCol md={4}>
                <TextInputFieldInteger
                  name="prazoDias"
                  placeholder="Prazo (dias)"
                  value={formatInteger(formData.prazoDias?.toString() || '')}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol>

              <CCol md={6}>
                <SelectAnalise
                  id={formData.analiseId}
                  setId={(id) => handleChange(undefined, 'analiseId', id)}
                  setDescricao={(desc) => handleChange(undefined, 'analise_nome', desc)}
                  laboratorioId={params.laboratorioId}
                  // disabled={formData.id !== 0}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldInteger
                  name="quantidade"
                  placeholder="Quantidade"
                  value={formatInteger(formData.quantidade?.toString() || '')}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol>

              {/* <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="vpmMinimo"
                  placeholder="VPM Min"
                  value={formData.vpmMinimo?.toString() || ''}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="vpmMaximo"
                  placeholder="VPM Max"
                  value={formData.vpmMaximo?.toString() || ''}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="lqMinimo"
                  placeholder="LQ Min"
                  value={formData.lqMinimo?.toString() || ''}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol>

              <CCol md={2}>
                <TextInputFieldDecimalBig
                  name="lqMaximo"
                  placeholder="LQ Max"
                  value={formData.lqMaximo?.toString() || ''}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol> */}

              {/* <CCol md={2}>
                <TextInputFieldReais
                  name="valorUnitario"
                  placeholder="Valor Unitário"
                  value={formData.valorUnitario?.toString() || ''}
                  onChange={(n, v) => handleChange(undefined, n, v)}
                />
              </CCol> */}
            </CRow>

            {errors.api && <div className="text-danger">{errors.api}</div>}

            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg} />
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
