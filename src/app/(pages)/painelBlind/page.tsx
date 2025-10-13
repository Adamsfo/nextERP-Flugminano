// src/pages/index.tsx

import WebSocketComponent from '@/components/tz/WebSocket'

const Home = () => {
  return (
    <div>
      <h1>Bem-vindo ao Sistema de Torneios</h1>
      <WebSocketComponent />
    </div>
  )
}

export default Home
