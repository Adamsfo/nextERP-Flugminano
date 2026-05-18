import { ClienteFornecedor, EnderecoClienteFornecedor } from '@/types/geral'
import { documentoValido } from './documento'

export type ClienteFornecedorLabelSource = Pick<
  ClienteFornecedor,
  'razaoSocialNome' | 'nomeFantasia' | 'cnpjCpf' | 'tipoDocumento'
>

/** Rótulo do select: PJ → "Razão Social - CNPJ"; PF → "Nome - CPF". */
export function formatClienteFornecedorSelectLabel(record: ClienteFornecedorLabelSource): string {
  const documento = (record.cnpjCpf || '').trim()
  const isPj = record.tipoDocumento === 'CNPJ'

  const nomePrincipal = (record.razaoSocialNome || '').trim()
  const nomeFantasia = (record.nomeFantasia || '').trim()

  const nome = isPj
    ? nomePrincipal || nomeFantasia
    : nomePrincipal || nomeFantasia

  if (nome && documento) {
    return `${nome} - ${documento}`
  }
  if (nome) return nome
  if (documento) return documento
  return 'Cliente sem identificação'
}

export type ClienteFormMode = 'full' | 'quick'

export type TipoPessoa = 'Fisica' | 'Juridica'

export const initialClienteFornecedorForm: ClienteFornecedor = {
  id: 0,
  tipo: 'Cliente',
  cnpjCpf: '',
  razaoSocialNome: '',
  consumidorFinal: 'Sim',
  contribuinte: 'Sim',
  empresaId: 1,
  tipoDocumento: 'CPF',
  nacionalidade: 'Brazil',
}

export const initialEnderecoClienteFornecedor: EnderecoClienteFornecedor = {
  tipoEndereco: 'Residencial',
}

export function tipoDocumentoFromPessoa(tipoPessoa: TipoPessoa): 'CPF' | 'CNPJ' {
  return tipoPessoa === 'Juridica' ? 'CNPJ' : 'CPF'
}

export function tipoPessoaFromDocumento(tipoDocumento?: string): TipoPessoa {
  return tipoDocumento === 'CNPJ' ? 'Juridica' : 'Fisica'
}

export function getClienteDocumentoMask(tipoDocumento?: string): string {
  const tipo = tipoDocumento || 'CPF'
  if (tipo === 'CPF') return '999.999.999-99'
  if (tipo === 'CNPJ') return '99.999.999/9999-99'
  if (tipo === 'RG') return '99.999.999-9'
  return ''
}

export function validateClienteFornecedor(
  formData: ClienteFornecedor,
  mode: ClienteFormMode = 'full'
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!formData.razaoSocialNome?.trim()) {
    errors.razaoSocialNome = 'Nome / Razão Social é obrigatório.'
  }

  if (mode === 'full' && !formData.nomeFantasia?.trim()) {
    errors.nomeFantasia = 'Nome fantasia é obrigatório.'
  }

  if (!formData.tipoDocumento) {
    errors.tipoDocumento = 'Tipo de documento é obrigatório.'
  }

  if (!formData.cnpjCpf?.trim()) {
    errors.cnpjCpf = 'CPF / CNPJ é obrigatório.'
  } else if (!documentoValido(formData.tipoDocumento, formData.cnpjCpf)) {
    errors.cnpjCpf =
      formData.tipoDocumento === 'CNPJ'
        ? 'CNPJ inválido.'
        : formData.tipoDocumento === 'CPF'
          ? 'CPF inválido.'
          : 'Documento inválido.'
  }

  if (formData.email?.trim()) {
    const email = formData.email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'E-mail inválido.'
    }
  }

  return errors
}

export type ViaCepResult = {
  uf?: string
  nomeCidade?: string
  cidadeId?: string
  bairro?: string
  rua?: string
  complemento?: string
  observacao?: string
}

export async function buscarEnderecoPorCep(cep: string): Promise<ViaCepResult | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { mode: 'cors' })
  if (!response.ok) return null

  const data = await response.json()
  if (data?.erro) return null

  return {
    uf: data.uf,
    nomeCidade: data.localidade,
    cidadeId: data.ibge,
    bairro: data.bairro,
    rua: data.logradouro,
    complemento: data.complemento,
    observacao: data.unidade,
  }
}
