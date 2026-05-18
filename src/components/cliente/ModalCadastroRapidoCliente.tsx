'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import { ClienteFornecedor, EnderecoClienteFornecedor } from '@/types/geral'
import { apiGeral } from '@/lib/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import ClienteFornecedorFormFields from './ClienteFornecedorFormFields'
import {
  buscarEnderecoPorCep,
  initialClienteFornecedorForm,
  initialEnderecoClienteFornecedor,
  tipoDocumentoFromPessoa,
  TipoPessoa,
  validateClienteFornecedor,
} from '@/lib/clienteFornecedorForm'
import { AppToastColor } from '@/components/tz/useAppToast'

type DuplicidadeResponse = {
  exists: boolean
  cliente: ClienteFornecedor | null
}

export type ModalCadastroRapidoClienteProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  empresaId: number
  onClienteSalvo: (clienteId: number) => void
  onToast?: (message: string, color: AppToastColor) => void
}

export default function ModalCadastroRapidoCliente({
  visible,
  setVisible,
  empresaId,
  onClienteSalvo,
  onToast,
}: ModalCadastroRapidoClienteProps) {
  const [formData, setFormData] = useState<ClienteFornecedor>({
    ...initialClienteFornecedorForm,
    empresaId,
  })
  const [formDataEndereco, setFormDataEndereco] = useState<EnderecoClienteFornecedor>(
    initialEnderecoClienteFornecedor
  )
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('Fisica')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setFormData({ ...initialClienteFornecedorForm, empresaId })
    setFormDataEndereco({ ...initialEnderecoClienteFornecedor })
    setTipoPessoa('Fisica')
    setErrors({})
  }

  useEffect(() => {
    if (!visible) return
    resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, empresaId])

  const handleChangeCliente = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: unknown
  ) => {
    if (e) {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else if (customName) {
      setFormData((prev) => ({ ...prev, [customName]: customValue }))
    }
  }

  const handleChangeEndereco = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: unknown
  ) => {
    if (e) {
      const { name, value } = e.target
      setFormDataEndereco((prev) => {
        const next = { ...prev, [name]: value }
        if (name === 'cep' && value.length === 9) {
          void aplicarCep(value)
        }
        return next
      })
    } else if (customName) {
      setFormDataEndereco((prev) => ({ ...prev, [customName]: customValue }))
    }
  }

  const aplicarCep = async (cep: string) => {
    try {
      const data = await buscarEnderecoPorCep(cep)
      if (!data) {
        onToast?.('CEP não encontrado.', 'warning')
        return
      }
      setFormDataEndereco((prev) => ({
        ...prev,
        uf: data.uf ?? prev.uf,
        nomeCidade: data.nomeCidade ?? prev.nomeCidade,
        cidadeId: data.cidadeId ? Number(data.cidadeId) : prev.cidadeId,
        bairro: data.bairro ?? prev.bairro,
        rua: data.rua ?? prev.rua,
        complemento: data.complemento ?? prev.complemento,
        observacao: data.observacao ?? prev.observacao,
      }))
    } catch {
      onToast?.('Erro ao buscar o CEP.', 'danger')
    }
  }

  const fechar = () => {
    if (!saving) setVisible(false)
  }

  const verificarDuplicidade = async (): Promise<ClienteFornecedor | null | 'erro'> => {
    const ret = await apiGeral.verificarClienteDuplicidade({
      cnpjCpf: formData.cnpjCpf,
      email: formData.email?.trim() || undefined,
      empresaId,
    })
    if (!ret.success) {
      onToast?.(ret.message || 'Erro ao verificar duplicidade.', 'danger')
      return 'erro'
    }
    const payload = ret.data as DuplicidadeResponse | undefined
    if (payload?.exists && payload.cliente) {
      return payload.cliente
    }
    return null
  }

  const salvar = async () => {
    setErrors({})
    const tipoDocumento = tipoDocumentoFromPessoa(tipoPessoa)
    const validationErrors = validateClienteFornecedor(
      { ...formData, tipoDocumento },
      'quick'
    )
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!empresaId) {
      onToast?.('Selecione uma empresa para cadastrar o cliente.', 'danger')
      return
    }

    setSaving(true)
    try {
      const existente = await verificarDuplicidade()
      if (existente === 'erro') return

      if (existente) {
        const confirmar = window.confirm(
          'Cliente já cadastrado.\n\nDeseja selecionar o cliente existente?'
        )
        if (confirmar) {
          setVisible(false)
          onClienteSalvo(existente.id)
        } else {
          setErrors({ cnpjCpf: 'Cliente já cadastrado.' })
        }
        return
      }

      const payload: ClienteFornecedor = {
        ...formData,
        empresaId,
        tipo: 'Cliente',
        tipoDocumento,
        consumidorFinal: formData.consumidorFinal || 'Sim',
        contribuinte: formData.contribuinte || 'Sim',
      }

      const ret = await apiGeral.createResource<ClienteFornecedor>('/clienteFornecedor', payload)
      if (!ret.success || !ret.data) {
        onToast?.(ret.message || 'Erro ao cadastrar cliente.', 'danger')
        return
      }

      const novoId = (ret.data as ClienteFornecedor).id
      await apiGeral.createResource<EnderecoClienteFornecedor>('/endereco', {
        ...formDataEndereco,
        clienteFornecedorId: novoId,
      })

      onToast?.('Cliente cadastrado com sucesso', 'success')
      setVisible(false)
      onClienteSalvo(novoId)
    } catch {
      onToast?.('Erro ao cadastrar cliente.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleTipoPessoaChange = (tipo: TipoPessoa) => {
    setTipoPessoa(tipo)
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: tipoDocumentoFromPessoa(tipo),
      cnpjCpf: '',
    }))
  }

  return (
    <PermissionGate permission={2}>
      <CModal visible={visible} onClose={fechar} alignment="center" size="xl" scrollable>
        <CModalHeader>
          <CModalTitle>Cadastrar Cliente</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ClienteFornecedorFormFields
            formData={{ ...formData, tipoDocumento: tipoDocumentoFromPessoa(tipoPessoa) }}
            formDataEndereco={formDataEndereco}
            errors={errors}
            tipoPessoa={tipoPessoa}
            onTipoPessoaChange={handleTipoPessoaChange}
            onChangeCliente={handleChangeCliente}
            onChangeEndereco={handleChangeEndereco}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" disabled={saving} onClick={fechar}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={() => void salvar()}>
            {saving ? <CSpinner size="sm" className="me-2" /> : null}
            Salvar
          </CButton>
        </CModalFooter>
      </CModal>
    </PermissionGate>
  )
}
