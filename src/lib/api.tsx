// lib/auth.ts

import { ApiResponse, QueryParams } from '@/types/geral'

const BASEAPI = [
  'http://163.176.252.58:9000',
  // 'http://201.71.153.116:9000',
  'Homologação',
  '1.0.32',
  'https://api.sistema-agroanalise.com.br:8002',
]

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('token') !== null
}

class Api {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private buildQueryString(params: QueryParams): string {
    const query = Object.entries(params)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      .join('&')
    return query ? `?${query}` : ''
  }

  public async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
    params?: QueryParams,
    responseType: 'json' | 'blob' = 'json'
  ): Promise<ApiResponse<T>> {
    try {
      const queryString = this.buildQueryString(params || {})

      const response = await fetch(`${this.baseUrl}${endpoint}${queryString}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: body && method !== 'GET' ? JSON.stringify(body) : null,
      })

      let data: any

      if (responseType === 'blob') {
        data = await response.blob()
      } else {
        data = await response.json()
      }

      if (response.status === 403) {
        window.location.href = '/login'
        return { success: false, message: 'Token inválido!' }
      }

      if (responseType === 'blob') {
        return { success: true, data }
      }

      if (data.status === 'fail') {
        return { success: false, message: data.message }
      }

      if (method === 'GET') {
        return { success: true, data: data.data, meta: data.meta, headers: response.headers }
      }

      if (endpoint === '/login') {
        return { success: true, data: data.data, meta: data.meta }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  public async downloadBlob(endpoint: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (response.status === 403) {
        window.location.href = '/login'
        return { success: false, message: 'Token inválido!' }
      }

      if (!response.ok) {
        let message = 'Erro ao baixar arquivo'
        try {
          const errBody = (await response.json()) as { message?: string }
          if (errBody.message) message = errBody.message
        } catch {
          // resposta não JSON
        }
        return { success: false, message }
      }

      const data = await response.blob()
      return { success: true, data }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao baixar arquivo'
      return { success: false, message }
    }
  }
}

export const API_BASE_URL = BASEAPI[0]

export const api = new Api(BASEAPI[0]) // Use o ambiente correto conforme necessário
