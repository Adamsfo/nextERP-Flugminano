'use client'

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
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
  mesclarEnderecoCliente,
  prepareClienteFornecedorSavePayload,
  prepareEnderecoClienteFornecedorPayload,
  tipoDocumentoFromPessoa,
  TipoPessoa,
  validateClienteFornecedor,
} from '@/lib/clienteFornecedorForm'
import { AppToastColor } from '@/components/tz/useAppToast'
import { useConsultaDocumentoCliente } from '@/components/hooks/useConsultaDocumentoCliente'

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
  const [formSession, setFormSession] = useState(0)

  const formDataEnderecoRef = useRef(formDataEndereco)
  formDataEnderecoRef.current = formDataEndereco

  const resetForm = () => {
    setFormData({ ...initialClienteFornecedorForm, empresaId })
    setFormDataEndereco({ ...initialEnderecoClienteFornecedor })
    formDataEnderecoRef.current = { ...initialEnderecoClienteFornecedor }
    setTipoPessoa('Fisica')
    setErrors({})
  }

  useEffect(() => {
    if (!visible) return
    resetForm()
    setFormSession((prev) => prev + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, empresaId])

  const persistirEndereco = useCallback(
    async (clienteId: number, endereco: EnderecoClienteFornecedor) => {
      console.log('Endereco Form', endereco)
      const ret = await apiGeral.salvarEnderecoClienteFornecedor(clienteId, endereco)
      if (!ret.success) {
        onToast?.(ret.message || 'Erro ao salvar endereço do cliente.', 'danger')
        return false
      }
      return true
    },
    [onToast]
  )

  const selecionarClienteExistente = useCallback(
    async (clienteId: number, endereco?: EnderecoClienteFornecedor) => {
      const enderecoMesclado = mesclarEnderecoCliente(
        formDataEnderecoRef.current,
        endereco
      )

      await persistirEndereco(clienteId, enderecoMesclado)

      setVisible(false)
      onClienteSalvo(clienteId)
      onToast?.('Cliente já cadastrado e selecionado automaticamente.', 'success')
    },
    [onClienteSalvo, onToast, persistirEndereco, setVisible]
  )

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
        formDataEnderecoRef.current = next
        if (name === 'cep' && value.length === 9) {
          void aplicarCep(value)
        }
        return next
      })
    } else if (customName) {
      setFormDataEndereco((prev) => {
        const next = { ...prev, [customName]: customValue }
        formDataEnderecoRef.current = next
        return next
      })
    }
  }

  const aplicarCep = useCallback(
    async (cep: string): Promise<EnderecoClienteFornecedor | null> => {
      try {
        const data = await buscarEnderecoPorCep(cep)
        if (!data) {
          onToast?.('CEP não encontrado.', 'warning')
          return null
        }

        const next = mesclarEnderecoCliente(formDataEnderecoRef.current, {
          tipoEndereco: formDataEnderecoRef.current.tipoEndereco || 'Residencial',
          uf: data.uf,
          nomeCidade: data.nomeCidade,
          cidadeId: data.cidadeId ? Number(data.cidadeId) : undefined,
          bairro: data.bairro,
          rua: data.rua,
          complemento: data.complemento,
          observacao: data.observacao,
          cep,
        })

        formDataEnderecoRef.current = next
        setFormDataEndereco(next)
        return next
      } catch {
        onToast?.('Erro ao buscar o CEP.', 'danger')
        return null
      }
    },
    [onToast]
  )

  const fechar = () => {
    if (!saving) setVisible(false)
  }

  const verificarDuplicidade = async (
    documento: string
  ): Promise<ClienteFornecedor | null | 'erro'> => {
    const ret = await apiGeral.verificarClienteDuplicidade({
      cnpjCpf: documento,
      email: formData.email?.trim() || undefined,
      empresaId,
    })

    if (!ret.success) {
      onToast?.(ret.message || 'Erro ao verificar duplicidade.', 'danger')
      return 'erro'
    }

    const payload = ret.data as DuplicidadeResponse | undefined
    if (!payload || typeof payload !== 'object') {
      onToast?.('Resposta inválida ao verificar duplicidade.', 'danger')
      return 'erro'
    }

    if (payload.exists === true && payload.cliente) {
      return payload.cliente
    }
    return null
  }

  const salvar = async () => {
    setErrors({})
    const tipoDocumento = tipoDocumentoFromPessoa(tipoPessoa)
    const documentoDigits = formData.cnpjCpf.replace(/\D/g, '')
    const formComTipo = { ...formData, tipoDocumento }

    const validationErrors = validateClienteFornecedor(formComTipo, 'quick')
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
      const existente = await verificarDuplicidade(documentoDigits)
      if (existente === 'erro') return

      if (existente) {
        await selecionarClienteExistente(existente.id, formDataEnderecoRef.current)
        return
      }

      const payload = prepareClienteFornecedorSavePayload(formData, {
        empresaId,
        tipoDocumento,
      })

      const enderecoPayload = prepareEnderecoClienteFornecedorPayload(
        formDataEnderecoRef.current,
        0
      )

      console.log('Endereco Form', formDataEnderecoRef.current)
      console.log('Payload Cliente', payload)
      console.log('Payload Endereco', enderecoPayload)

      const ret = await apiGeral.createResource<ClienteFornecedor>('/clienteFornecedor', payload)

      if (!ret.success || !ret.data) {
        onToast?.(ret.message || 'Erro ao cadastrar cliente.', 'danger')
        return
      }

      const novoId = (ret.data as ClienteFornecedor).id
      if (novoId == null) {
        onToast?.('Cliente salvo, mas ID não retornado pela API.', 'danger')
        return
      }

      const retEndereco = await apiGeral.salvarEnderecoClienteFornecedor(
        novoId,
        formDataEnderecoRef.current
      )

      if (!retEndereco.success) {
        onToast?.(retEndereco.message || 'Cliente salvo, mas erro ao salvar endereço.', 'danger')
        return
      }

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
      razaoSocialNome: '',
      nomeFantasia: '',
    }))
  }

  const tipoDocumentoAtual = tipoDocumentoFromPessoa(tipoPessoa)

  const { consultandoDocumento } = useConsultaDocumentoCliente({
    formData: { ...formData, tipoDocumento: tipoDocumentoAtual },
    formDataEndereco,
    setFormData,
    setFormDataEndereco,
    onCepCompleto: aplicarCep,
    onToast,
    onClienteExistente: selecionarClienteExistente,
    empresaId,
    enabled: visible && empresaId > 0,
    resetKey: formSession,
  })

  return (
    <PermissionGate permission={2}>
      <CModal visible={visible} onClose={fechar} alignment="center" size="xl" scrollable>
        <CModalHeader>
          <CModalTitle>Cadastrar Cliente</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ClienteFornecedorFormFields
            formData={{ ...formData, tipoDocumento: tipoDocumentoAtual }}
            formDataEndereco={formDataEndereco}
            errors={errors}
            tipoPessoa={tipoPessoa}
            onTipoPessoaChange={handleTipoPessoaChange}
            onChangeCliente={handleChangeCliente}
            onChangeEndereco={handleChangeEndereco}
            consultandoDocumento={consultandoDocumento}
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
