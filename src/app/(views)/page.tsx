'use client'

import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardFooter, CCol, CRow, CWidgetStatsA } from '@coreui/react-pro'
import AuthWrapper from '../../components/auth/AuthWrapper'
import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { api } from '@/lib/api'
import { ClienteFornecedor } from '@/types/geral'

// Função para buscar total de clientes
const fetchTotalClientes = async (): Promise<number> => {
  const endpoint = '/cliente'
  try {
    const response = await api.request<ClienteFornecedor[]>(endpoint, 'GET', null, { empresaId: 1 })
    console.log(response)

    // Retorna o total de registros (ajuste conforme sua API)
    return response.length
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return 0
  }
}

const Dashboard = () => {
  const [totalClientes, setTotalClientes] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const carregarDados = async () => {
      const total = await fetchTotalClientes()
      setTotalClientes(total)
      setLoading(false)
    }
    // carregarDados()
  }, [])

  return (
    <AuthWrapper>
      <CRow className="mb-4">
        <CCol xs={12} md={6} xl={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={loading ? 'Carregando...' : totalClientes.toLocaleString('pt-BR')}
            title="Total de Clientes"
            action={<CIcon icon={cilUser} size="xl" />}
          />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardBody>
          <h5>Resumo Geral</h5>
          <p>
            Aqui você pode incluir gráficos, estatísticas ou cards adicionais com outras métricas do
            sistema.
          </p>
        </CCardBody>
        <CCardFooter>Atualizado automaticamente via API</CCardFooter>
      </CCard>
    </AuthWrapper>
  )
}

export default Dashboard
