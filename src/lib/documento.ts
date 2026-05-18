import { apenasDigitosCpf, cpfValido } from './cpf'

export function apenasDigitosDocumento(doc: string): string {
  return doc.replace(/\D/g, '')
}

export { cpfValido, apenasDigitosCpf }

export function cnpjValido(cnpj: string): boolean {
  const digits = apenasDigitosDocumento(cnpj)
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const calcDigit = (base: string, weights: number[]) => {
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(base.charAt(i), 10) * weights[i]
    }
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }

  const base12 = digits.slice(0, 12)
  const d1 = calcDigit(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit(base12 + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return digits === base12 + String(d1) + String(d2)
}

export function documentoValido(tipoDocumento: string | undefined, documento: string): boolean {
  const tipo = (tipoDocumento || '').toUpperCase()
  if (tipo === 'CPF') return cpfValido(documento)
  if (tipo === 'CNPJ') return cnpjValido(documento)
  return apenasDigitosDocumento(documento).length >= 1
}
