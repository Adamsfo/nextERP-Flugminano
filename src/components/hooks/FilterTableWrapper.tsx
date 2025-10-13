import React, { useState } from 'react'
import { CFormLabel, CFormInput, CTooltip } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilFilterX, cilLoopCircular } from '@coreui/icons'
import CButtonAdd from '../tz/CButtonAdd'

interface FilterInputProps {
  search: string
  setSearch: (value: string) => void
  handleNewClick?: () => void
  atualizar?: boolean
  setAtualizar?: (value: boolean) => void
}

const FilterTableWrapper: React.FC<FilterInputProps> = ({
  search,
  setSearch,
  handleNewClick,
  atualizar,
  setAtualizar,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {setAtualizar && (
        <CTooltip content="Atualizar Pesquisa" placement="top">
          <CIcon
            icon={cilLoopCircular}
            size="xl"
            style={{ marginRight: '6px', cursor: 'pointer' }}
            onClick={() => setAtualizar(!atualizar)}
          />
        </CTooltip>
      )}
      <CFormLabel style={{ marginTop: '6px' }}>Procurar</CFormLabel>
      <CFormInput
        style={{ marginLeft: '15px', width: '300px', marginRight: '8px' }}
        placeholder="Digite para filtrar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <CIcon
        icon={cilFilterX}
        size="xl"
        style={{ marginRight: '6px', cursor: 'pointer' }}
        onClick={() => setSearch('')}
      />
      {handleNewClick && <CButtonAdd onClick={handleNewClick} />}
      {/* <CButtonAdd onClick={handleNewClick} /> */}
    </div>
  )
}

export default FilterTableWrapper
