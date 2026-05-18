import { API_BASE_URL } from '@/lib/api'

type ApiPayload<T> = {
  success?: boolean
  data?: T
  message?: string
}

async function publicRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data: ApiPayload<T> = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível processar a solicitação.')
  }

  return data.data as T
}

export type PropostaPublicaData = {
  link: {
    status: string
    expiraEm: string
    nomeDestinatario: string
    aprovadoEm?: string
    nomeAprovador?: string
    observacaoReprovacao?: string
  }
  proposta: {
    numero: string
    data: string
    validade?: string
    valorTotal?: number
    status: string
    clienteNome: string
    clienteDocumento: string
    clienteEmail?: string
    clienteTelefone?: string
  }
  empresa: {
    nomeFantasia?: string
    razaoSocial?: string
  }
  podeResponder: boolean
  mensagemBloqueio?: string | null
}

export function getPropostaPublicaPdfUrl(token: string): string {
  return `${API_BASE_URL}/proposta-publica/${token}/pdf`
}

export function fetchPropostaPublica(token: string) {
  return publicRequest<PropostaPublicaData>(`/proposta-publica/${token}`)
}

export function aprovarPropostaPublica(
  token: string,
  body: { nomeAprovador: string; cpfAprovador: string }
) {
  return publicRequest(`/proposta-publica/${token}/aprovar`, 'POST', body)
}

export function reprovarPropostaPublica(
  token: string,
  body: { nomeAprovador: string; cpfAprovador: string; observacaoReprovacao: string }
) {
  return publicRequest(`/proposta-publica/${token}/reprovar`, 'POST', body)
}
