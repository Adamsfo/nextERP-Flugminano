/**
 * Converte valor monetário para o formato esperado pela API (nodeERP).
 * Campos DECIMAL sem "." na string são tratados como centavos e divididos por 100.
 * Valores em reais (ex.: 10 da tabela de preço) devem ir como "10.00".
 */
export function valorMonetarioParaApi(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') {
    return '0.00'
  }

  if (typeof valor === 'string') {
    const trimmed = valor.trim()
    if (!trimmed) return '0.00'

    if (!trimmed.includes('.') && !trimmed.includes(',')) {
      const digits = trimmed.replace(/\D/g, '')
      if (!digits) return '0.00'
      return (parseInt(digits, 10) / 100).toFixed(2)
    }

    const normalized = trimmed.includes(',')
      ? trimmed.replace(/\./g, '').replace(',', '.')
      : trimmed
    const reais = parseFloat(normalized)
    return Number.isFinite(reais) ? reais.toFixed(2) : '0.00'
  }

  const numero = Number(valor)
  if (!Number.isFinite(numero)) return '0.00'
  return numero.toFixed(2)
}

export function prepararItemMonetarioParaApi<
  T extends { valorUnitario?: unknown; valorTotal?: unknown },
>(item: T): T {
  return {
    ...item,
    valorUnitario: valorMonetarioParaApi(item.valorUnitario),
    valorTotal: valorMonetarioParaApi(item.valorTotal),
  }
}
