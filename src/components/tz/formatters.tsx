// Função para formatar valores em moeda BRL (R$)
export const formatCurrency = (value: string | number): string => {
  const numericValue =
    typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value
  return isNaN(numericValue)
    ? 'R$ 0,00'
    : numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
}

export const formatCurrencyNoSymbol = (value: string | number): string => {
  const numericValue =
    typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value
  return isNaN(numericValue)
    ? '0,00'
    : numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
}

// Função para formatar valores numéricos com casas decimais (2 casas decimais por padrão)
export const formatDecimal = (value: string | number, decimalPlaces: number = 2): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(numericValue) ? '0.00' : numericValue.toFixed(decimalPlaces).replace('.', ',')
}

// Função para formatar valores inteiros
export const formatInteger = (value: string | number): string => {
  const numericValue =
    typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : Math.round(value)
  return isNaN(numericValue) ? '0' : numericValue.toLocaleString('pt-BR')
}

/** Data em dd/MM/yyyy (pt-BR). Retorna '-' se inválida ou ausente. */
export const formatDateBr = (value?: string | Date | null): string => {
  if (value == null || value === '') return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatarCpfExibicao = (cpf?: string | null): string => {
  if (!cpf) return '-'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export const formatarWhatsApp = (valor?: string | null): string => {
  if (!valor) return '-'
  const digits = valor.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return valor
}
