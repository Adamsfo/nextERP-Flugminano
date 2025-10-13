import React from 'react'
import {  
  CDropdown,  
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import {
  cilAccountLogout,  
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch } from 'react-redux'

import { apiAuth } from '@/lib/auth'

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()

  const logout = () => {
    apiAuth.logout()
    dispatch({ type: 'set', usuario: {
      id: 0,
      login: '',
      email: '',
      senha: '',
      nomeCompleto: '',
    } }) 
  } 

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0" caret={false}>
        {/* <CAvatar src={avatar8.src} size="md" /> */}
        <CIcon icon={cilUser} size='xl' style={{marginTop:'5px'}}></CIcon>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" >        
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Minha Conta
        </CDropdownItem>       
        <CDropdownItem href="#" onClick={logout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Sair
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
