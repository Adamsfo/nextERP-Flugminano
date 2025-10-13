import React from 'react'

import { CFooter } from '@coreui/react-pro'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="http://tanztecnologia.com.br" target="_blank" rel="noopener noreferrer">
          TANZ Tecnologia
        </a>
        <span className="ms-1">&copy; 2024</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Desenvolvido em Next.js</span>
        {/* <a
          href="https://coreui.io/react"
          target="_blank"
          rel="noopener noreferrer"
        >
          CoreUI for React
        </a> */}
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
