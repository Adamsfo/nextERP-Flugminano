import {
  ApiResponse,
  ClienteFornecedor,
  ConsultaDocumentoClienteResponse,
  EnderecoClienteFornecedor,
} from '@/types/geral'
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

export function isClienteDocumentoCnpj(tipoDocumento?: string): boolean {
  return tipoDocumento === 'CNPJ'
}

export function isClienteDocumentoCpf(tipoDocumento?: string): boolean {
  return tipoDocumento === 'CPF'
}

export function getClienteNomeFantasiaPlaceholder(
  tipoDocumento?: string,
  required = false
): string {
  const suffix = required ? ' *' : ''
  if (isClienteDocumentoCnpj(tipoDocumento)) {
    return `Nome Fantasia${suffix}`
  }
  if (isClienteDocumentoCpf(tipoDocumento)) {
    return `Nome${suffix}`
  }
  return `Nome Fantasia${suffix}`
}

export function validateClienteFornecedor(
  formData: ClienteFornecedor,
  mode: ClienteFormMode = 'full'
): Record<string, string> {
  const errors: Record<string, string> = {}
  const isCnpj = isClienteDocumentoCnpj(formData.tipoDocumento)
  const isCpf = isClienteDocumentoCpf(formData.tipoDocumento)

  if (isCnpj) {
    if (!formData.razaoSocialNome?.trim()) {
      errors.razaoSocialNome = 'Razão Social é obrigatória.'
    }
    if (mode === 'full' && !formData.nomeFantasia?.trim()) {
      errors.nomeFantasia = 'Nome fantasia é obrigatório.'
    }
  } else if (isCpf) {
    const nomeCpf = (formData.nomeFantasia || formData.razaoSocialNome || '').trim()
    if (!nomeCpf) {
      errors.nomeFantasia = 'Nome é obrigatório.'
    }
  } else {
    if (!formData.razaoSocialNome?.trim()) {
      errors.razaoSocialNome = 'Nome / Razão Social é obrigatório.'
    }
    if (mode === 'full' && !formData.nomeFantasia?.trim()) {
      errors.nomeFantasia = 'Nome fantasia é obrigatório.'
    }
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

/** Normaliza payload de salvamento para CPF e CNPJ. */
export function prepareClienteFornecedorSavePayload(
  formData: ClienteFornecedor,
  options: {
    empresaId: number
    tipoDocumento: 'CPF' | 'CNPJ'
  }
): ClienteFornecedor {
  const payload: ClienteFornecedor = {
    ...formData,
    empresaId: options.empresaId,
    tipo: 'Cliente',
    tipoDocumento: options.tipoDocumento,
    consumidorFinal: formData.consumidorFinal || 'Sim',
    contribuinte: formData.contribuinte || 'Sim',
  }

  if (isClienteDocumentoCpf(options.tipoDocumento)) {
    const nome = (formData.nomeFantasia || formData.razaoSocialNome || '').trim()
    return {
      ...payload,
      nomeFantasia: nome,
      razaoSocialNome: nome,
    }
  }

  if (isClienteDocumentoCnpj(options.tipoDocumento)) {
    const razao = (formData.razaoSocialNome || '').trim()
    const fantasia = (formData.nomeFantasia || '').trim()
    return {
      ...payload,
      razaoSocialNome: razao,
      nomeFantasia: fantasia || razao,
    }
  }

  return payload
}

export type ConsultaPreenchimentoResult = {
  tipoDocumento: 'CPF' | 'CNPJ'
  consultouApi: boolean
  encontrado: boolean
  mensagem?: string
  dadosMapeados?: {
    cliente: ClienteFornecedor
    endereco: EnderecoClienteFornecedor
    cepParaBuscar?: string
  }
}

export type DuplicidadeClienteResult = {
  exists: boolean
  cliente: ClienteFornecedor | null
}

export type DadosMapeadosConsulta = NonNullable<ConsultaPreenchimentoResult['dadosMapeados']>

export type ProcessarDocumentoCadastroRapidoResult =
  | { acao: 'cliente_existente'; cliente: ClienteFornecedor; dadosMapeados?: DadosMapeadosConsulta }
  | { acao: 'preencher'; dadosMapeados: DadosMapeadosConsulta }
  | { acao: 'nenhum' }
  | { acao: 'erro'; mensagem: string }

export function mesclarEnderecoCliente(
  base: EnderecoClienteFornecedor,
  parcial?: EnderecoClienteFornecedor
): EnderecoClienteFornecedor {
  if (!parcial) return { ...base }
  return {
    ...base,
    ...(parcial.cep?.trim() ? { cep: parcial.cep.trim() } : {}),
    ...(parcial.uf?.trim() ? { uf: parcial.uf.trim() } : {}),
    ...(parcial.nomeCidade?.trim() ? { nomeCidade: parcial.nomeCidade.trim() } : {}),
    ...(parcial.cidadeId != null ? { cidadeId: parcial.cidadeId } : {}),
    ...(parcial.bairro?.trim() ? { bairro: parcial.bairro.trim() } : {}),
    ...(parcial.rua?.trim() ? { rua: parcial.rua.trim() } : {}),
    ...(parcial.numero?.trim() ? { numero: parcial.numero.trim() } : {}),
    ...(parcial.complemento?.trim() ? { complemento: parcial.complemento.trim() } : {}),
    ...(parcial.observacao?.trim() ? { observacao: parcial.observacao.trim() } : {}),
  }
}

export function enderecoTemDadosParaSalvar(endereco: EnderecoClienteFornecedor): boolean {
  return Boolean(
    endereco.cep?.trim() ||
      endereco.rua?.trim() ||
      endereco.bairro?.trim() ||
      endereco.uf?.trim() ||
      endereco.nomeCidade?.trim()
  )
}

export function prepareEnderecoClienteFornecedorPayload(
  endereco: EnderecoClienteFornecedor,
  clienteFornecedorId: number
): EnderecoClienteFornecedor {
  return {
    ...endereco,
    id: endereco.id,
    clienteFornecedorId,
    tipoEndereco: endereco.tipoEndereco || 'Residencial',
    cep: endereco.cep?.trim() || '',
    uf: endereco.uf?.trim() || '',
    nomeCidade: endereco.nomeCidade?.trim() || '',
    bairro: endereco.bairro?.trim() || '',
    rua: endereco.rua?.trim() || '',
    numero: endereco.numero?.trim() || '',
    complemento: endereco.complemento?.trim() ?? '',
    observacao: endereco.observacao?.trim() || undefined,
    cidadeId: endereco.cidadeId,
    inscricaoEstadual: endereco.inscricaoEstadual,
  }
}

export function documentoCompletoParaProcessamento(
  tipoDocumento: string | undefined,
  documento: string
): boolean {
  const digits = documento.replace(/\D/g, '')
  if (isClienteDocumentoCnpj(tipoDocumento)) return digits.length === 14
  if (isClienteDocumentoCpf(tipoDocumento)) return digits.length === 11
  return false
}

/**
 * Fluxo único do cadastro rápido: consulta CNPJ (se PJ) → duplicidade → mapeamento.
 * CPF: apenas verifica duplicidade (sem consulta externa).
 */
export async function processarDocumentoCadastroRapido(
  tipoDocumento: string | undefined,
  documento: string,
  clienteAtual: ClienteFornecedor,
  enderecoAtual: EnderecoClienteFornecedor,
  deps: {
    empresaId: number
    verificarDuplicidade: (digits: string) => Promise<ApiResponse<DuplicidadeClienteResult>>
    consultarApi: (digits: string) => Promise<ApiResponse<ConsultaDocumentoClienteResponse>>
  }
): Promise<ProcessarDocumentoCadastroRapidoResult> {
  const digits = documento.replace(/\D/g, '')

  console.log('Tipo Documento', tipoDocumento)

  if (!documentoCompletoParaProcessamento(tipoDocumento, documento)) {
    return { acao: 'nenhum' }
  }

  if (!documentoValido(tipoDocumento, documento)) {
    return { acao: 'nenhum' }
  }

  let dadosConsultaCnpj: DadosMapeadosConsulta | undefined

  if (isClienteDocumentoCnpj(tipoDocumento)) {
    const resultado = await consultarEPreencherDocumento(
      tipoDocumento,
      documento,
      clienteAtual,
      enderecoAtual,
      deps.consultarApi
    )

    if (!resultado.consultouApi) {
      return { acao: 'nenhum' }
    }

    if (!resultado.encontrado || !resultado.dadosMapeados) {
      return {
        acao: 'erro',
        mensagem: resultado.mensagem || 'CNPJ não encontrado para preenchimento automático.',
      }
    }

    dadosConsultaCnpj = resultado.dadosMapeados
  }

  const dupRet = await deps.verificarDuplicidade(digits)
  if (!dupRet.success) {
    return { acao: 'erro', mensagem: dupRet.message || 'Erro ao verificar duplicidade.' }
  }

  const dup = dupRet.data
  if (dup?.exists === true && dup.cliente?.id != null) {
    return {
      acao: 'cliente_existente',
      cliente: dup.cliente,
      dadosMapeados: dadosConsultaCnpj,
    }
  }

  if (isClienteDocumentoCpf(tipoDocumento)) {
    return { acao: 'nenhum' }
  }

  if (dadosConsultaCnpj) {
    return { acao: 'preencher', dadosMapeados: dadosConsultaCnpj }
  }

  return { acao: 'nenhum' }
}

/**
 * Consulta e mapeia documento para o formulário.
 * CNPJ: consulta API pública. CPF: sem consulta automática (preenchimento manual).
 */
export async function consultarEPreencherDocumento(
  tipoDocumento: string | undefined,
  documento: string,
  clienteAtual: ClienteFornecedor,
  enderecoAtual: EnderecoClienteFornecedor,
  consultarApi: (digits: string) => Promise<ApiResponse<ConsultaDocumentoClienteResponse>>
): Promise<ConsultaPreenchimentoResult> {
  const tipo = isClienteDocumentoCnpj(tipoDocumento)
    ? 'CNPJ'
    : isClienteDocumentoCpf(tipoDocumento)
      ? 'CPF'
      : null

  console.log('Tipo Documento', tipoDocumento)

  if (!tipo) {
    return {
      tipoDocumento: 'CPF',
      consultouApi: false,
      encontrado: false,
      mensagem: 'Tipo de documento não suportado para consulta automática.',
    }
  }

  if (tipo === 'CPF') {
    return {
      tipoDocumento: 'CPF',
      consultouApi: false,
      encontrado: false,
      mensagem: 'Consulta automática disponível apenas para CNPJ.',
    }
  }

  const digits = documento.replace(/\D/g, '')
  const ret = await consultarApi(digits)

  if (!ret.success) {
    return {
      tipoDocumento: 'CNPJ',
      consultouApi: true,
      encontrado: false,
      mensagem: ret.message || 'Erro ao consultar documento.',
    }
  }

  const response = ret.data as ConsultaDocumentoClienteResponse
  console.log('Resposta Consulta', response)

  if (!response || typeof response !== 'object') {
    return {
      tipoDocumento: 'CNPJ',
      consultouApi: true,
      encontrado: false,
      mensagem: 'Resposta inválida ao consultar CNPJ.',
    }
  }

  if (!response.encontrado) {
    return {
      tipoDocumento: 'CNPJ',
      consultouApi: true,
      encontrado: false,
      mensagem: response.mensagem || 'CNPJ não encontrado para preenchimento automático.',
    }
  }

  const dadosMapeados = mapearConsultaDocumentoParaFormulario(
    clienteAtual,
    enderecoAtual,
    response
  )
  console.log('Dados enviados ao formulário', dadosMapeados)

  return {
    tipoDocumento: 'CNPJ',
    consultouApi: true,
    encontrado: true,
    dadosMapeados,
  }
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

function preencherCampoSeApiRetornou<T extends string | number | undefined>(
  atual: T | undefined,
  valorApi: string | number | null | undefined
): T | undefined {
  if (valorApi === undefined || valorApi === null) return atual
  const texto = String(valorApi).trim()
  if (!texto) return atual
  return valorApi as T
}

/** Mapeia resposta da consulta de documento (CNPJ) para o formulário. */
export function mapearConsultaDocumentoParaFormulario(
  clienteAtual: ClienteFornecedor,
  enderecoAtual: EnderecoClienteFornecedor,
  consulta: ConsultaDocumentoClienteResponse
): {
  cliente: ClienteFornecedor
  endereco: EnderecoClienteFornecedor
  cepParaBuscar?: string
} {
  const cliente = { ...clienteAtual }
  const endereco = { ...enderecoAtual }
  const apiCliente = consulta.cliente
  const apiEndereco = consulta.endereco

  if (apiCliente?.razaoSocialNome?.trim()) {
    cliente.razaoSocialNome = apiCliente.razaoSocialNome.trim()
  }
  if (apiCliente?.nomeFantasia?.trim()) {
    cliente.nomeFantasia = apiCliente.nomeFantasia.trim()
  }
  if (apiCliente?.email?.trim()) {
    cliente.email = apiCliente.email.trim()
  }
  if (apiCliente?.telefoneFixo?.trim()) {
    cliente.telefoneFixo = apiCliente.telefoneFixo.trim()
  }
  if (apiCliente?.telefoneCelular?.trim()) {
    cliente.telefoneCelular = apiCliente.telefoneCelular.trim()
  }
  if (apiCliente?.situacaoCadastral?.trim()) {
    const situacaoObservacao = `Situação cadastral: ${apiCliente.situacaoCadastral.trim()}`
    cliente.observacao = preencherCampoSeApiRetornou(cliente.observacao, situacaoObservacao)
  }

  if (apiEndereco?.cep?.trim()) {
    endereco.cep = apiEndereco.cep.trim()
  }
  if (apiEndereco?.uf?.trim()) {
    endereco.uf = apiEndereco.uf.trim()
  }
  if (apiEndereco?.nomeCidade?.trim()) {
    endereco.nomeCidade = apiEndereco.nomeCidade.trim()
  }
  if (apiEndereco?.bairro?.trim()) {
    endereco.bairro = apiEndereco.bairro.trim()
  }
  if (apiEndereco?.rua?.trim()) {
    endereco.rua = apiEndereco.rua.trim()
  }
  if (apiEndereco?.numero?.trim()) {
    endereco.numero = apiEndereco.numero.trim()
  }
  if (apiEndereco?.complemento?.trim()) {
    endereco.complemento = apiEndereco.complemento.trim()
  }

  let cepParaBuscar: string | undefined
  const cepDigits = (apiEndereco?.cep || '').replace(/\D/g, '')
  if (cepDigits.length === 8) {
    cepParaBuscar = apiEndereco?.cep?.includes('-')
      ? apiEndereco.cep
      : `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`
  }

  return { cliente, endereco, cepParaBuscar }
}

/** @deprecated Use mapearConsultaDocumentoParaFormulario */
export function preencherFormularioComConsultaCnpj(
  clienteAtual: ClienteFornecedor,
  enderecoAtual: EnderecoClienteFornecedor,
  consulta: ConsultaDocumentoClienteResponse
) {
  return mapearConsultaDocumentoParaFormulario(clienteAtual, enderecoAtual, consulta)
}

/** @deprecated Use mapearConsultaDocumentoParaFormulario */
export function aplicarConsultaDocumento(
  clienteAtual: ClienteFornecedor,
  enderecoAtual: EnderecoClienteFornecedor,
  consulta: ConsultaDocumentoClienteResponse
) {
  return mapearConsultaDocumentoParaFormulario(clienteAtual, enderecoAtual, consulta)
}

export function documentoCompletoParaConsulta(
  tipoDocumento: string | undefined,
  documento: string
): boolean {
  return documentoCompletoParaProcessamento(tipoDocumento, documento)
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
