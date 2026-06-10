import { PropostaComercial } from '@/types/geral'

export type PropostaComercialFormErrors = Record<string, string>

export const PROPOSTA_CAMPO_LABELS: Record<string, string> = {
  validade: 'Data de validade',
  clienteFornecedorId: 'Cliente',
  matrizId: 'Matriz',
  clienteNome: 'Nome do cliente',
  clienteDocumento: 'CPF / CNPJ',
  empresaId: 'Empresa',
}

/** Ordem de foco/scroll ao validar o formulário. */
export const PROPOSTA_VALIDACAO_ORDEM: string[] = [
  'validade',
  'clienteFornecedorId',
  'matrizId',
  'clienteNome',
  'clienteDocumento',
  'empresaId',
]

const FIELD_FOCUS_SELECTORS: Record<string, string> = {
  validade: '#validade',
  clienteFornecedorId: '#field-clienteFornecedorId',
  matrizId: '#field-matrizId',
  clienteNome: '#clienteNome',
  clienteDocumento: '#clienteDocumento',
}

export function validatePropostaComercialForm(
  formData: PropostaComercial,
  options?: { isCreate?: boolean; empresaIdSelecionada?: number[] }
): PropostaComercialFormErrors {
  const errors: PropostaComercialFormErrors = {}

  const validade = formData.validade as Date | string | null | undefined
  const validadeVazia =
    validade === undefined ||
    validade === null ||
    (validade instanceof Date && Number.isNaN(validade.getTime())) ||
    (typeof validade === 'string' && !validade.trim())

  if (validadeVazia) {
    errors.validade = 'Informe a data de validade da proposta.'
  }

  if (!formData.clienteFornecedorId || formData.clienteFornecedorId <= 0) {
    errors.clienteFornecedorId = 'Selecione um cliente.'
  }

  if (!formData.clienteNome?.trim()) {
    errors.clienteNome = 'Nome do cliente é obrigatório.'
  }

  if (!formData.clienteDocumento?.trim()) {
    errors.clienteDocumento = 'CPF / CNPJ é obrigatório.'
  }

  if (formData.laboratorioId > 0 && (!formData.matrizId || formData.matrizId <= 0)) {
    errors.matrizId = 'Selecione uma matriz.'
  }

  if (options?.isCreate && options.empresaIdSelecionada?.length !== 1) {
    errors.empresaId = 'Selecione uma empresa para cadastrar a proposta.'
  }

  return errors
}

export function resumoCamposInvalidosProposta(errors: PropostaComercialFormErrors): string[] {
  return PROPOSTA_VALIDACAO_ORDEM.filter((key) => errors[key]).map(
    (key) => PROPOSTA_CAMPO_LABELS[key] || key
  )
}

export function focarPrimeiroCampoInvalidoProposta(errors: PropostaComercialFormErrors): void {
  const firstKey = PROPOSTA_VALIDACAO_ORDEM.find((key) => errors[key])
  if (!firstKey) return

  const selector = FIELD_FOCUS_SELECTORS[firstKey] || `#${firstKey}`
  const container = document.querySelector(selector)
  if (!(container instanceof HTMLElement)) return

  container.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const focusable =
    container.matches('input, select, textarea, button')
      ? container
      : container.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]')

  focusable?.focus()
}
