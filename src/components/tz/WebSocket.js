'use client'

import { useEffect, useState } from 'react'

const WebSocketComponent = () => {
  const [mensagem, setMensagem] = useState('')
  const [statusTorneio, setStatusTorneio] = useState(null)
  const [torneio, setTorneio] = useState({
    id: 0,
    descricao: '',
    empresaId: 0,
    blindId: 0,
    status: '',
    blindItem: {
      nivel: 0,
      smallBlind: 0,
      bigBlind: 0,
    },
    tempoRestanteNivel: 0,
  })
  const [proximoNivel, setProximoNivel] = useState({
    id: 0,
    nivel: 0,
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    duracao: 0,
    order: 0,
    torneioId: 0,
  })

  useEffect(() => {
    // Verificar suporte ao WebSocket
    if (!('WebSocket' in window)) {
      console.error('WebSocket não suportado neste dispositivo')
      return
    }

    // const ws = new WebSocket('ws://201.71.153.116:9000')
    const ws = new WebSocket('ws://localhost:9000')

    ws.onopen = () => {
      console.log('Conectado ao WebSocket')
    }

    ws.onmessage = (event) => {
      try {
        const torneioData = JSON.parse(event.data)
        setStatusTorneio(torneioData)
        setTorneio(torneioData.torneio || torneio)
        setProximoNivel(torneioData.proximoNivel || proximoNivel)
        setMensagem('Mensagem recebida do servidor')
      } catch (error) {
        console.error('Erro ao processar a mensagem:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error)
    }

    // Manter o WebSocket ativo com pings periódicos (se necessário)
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Envia um ping a cada 30 segundos

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }
  }, [])

  return (
    <div>
      {torneio ? (
        <div>
          <h2>Status do Torneio</h2>
          <p>Nome: {torneio.descricao}</p>
          <p>Estado: {torneio.status}</p>
          {torneio.blindItem && (
            <div>
              <p>
                Nível Atual: {torneio.blindItem.nivel === 0 ? 'Intervalo' : torneio.blindItem.nivel}
              </p>
              <p>Small Blind: {torneio.blindItem.smallBlind}</p>
              <p>Big Blind: {torneio.blindItem.bigBlind}</p>
            </div>
          )}
          <p>Tempo Restante no Nível: {torneio.tempoRestanteNivel} segundos</p>
          <p>Proximo Nível: {proximoNivel.nivel === 0 ? 'Intervalo' : proximoNivel.nivel} </p>
          <p>Small Blind: {proximoNivel.smallBlind}</p>
          <p>Big Blind: {proximoNivel.bigBlind}</p>
          <p>Quantidade de Entradas: {torneio.quantidadeTicketsUtilizados}</p>
        </div>
      ) : (
        <p>Carregando status do torneio...</p>
      )}
    </div>
  )
}

export default WebSocketComponent
