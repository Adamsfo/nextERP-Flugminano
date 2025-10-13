import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CFormLabel,
  useColorModes,
} from '@coreui/react-pro'
import { cilApplicationsSettings, cilContrast, cilMenu, cilMoon, cilSun } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useTypedSelector } from '../../store'
import { useRouter } from 'next/navigation'
import SelectEmpresa from '../select/SelectEmpresaHeader'
import {
  AppHeaderDropdown,
  AppHeaderDropdownMssg,
  AppHeaderDropdownNotif,
  AppHeaderDropdownTasks,
} from './header/index'

const AppHeader = (): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>(null)
  const { colorMode, setColorMode } = useColorModes(
    'coreui-pro-next-js-admin-template-theme-default'
  )
  const router = useRouter()
  const dispatch = useDispatch()
  const sidebarShow = useTypedSelector((state) => state.sidebarShow)
  const usuario = useTypedSelector((state) => state.usuario)

  useEffect(() => {
    // Redireciona ao login se usuario.id === 0 e o caminho não contiver 'painelBlind'
    if (usuario.id === 0 && !window.location.pathname.includes('painelBlind')) {
      router.push('/login')
    }
  }, [usuario.id])

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-auto d-md-flex ms-auto" style={{ marginRight: '15px' }}>
          <CFormLabel style={{ marginTop: '4px', marginRight: '7px' }}>Empresa</CFormLabel>
          <SelectEmpresa />
        </CHeaderNav>

        <CHeaderNav className="ms-auto ms-md-0">
          <CFormLabel className="d-flex align-items-center">{usuario.nomeCompleto}</CFormLabel>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem active={colorMode === 'light'} onClick={() => setColorMode('light')}>
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'dark'} onClick={() => setColorMode('dark')}>
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'auto'} onClick={() => setColorMode('auto')}>
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
