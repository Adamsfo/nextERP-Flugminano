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
