import React, { ElementType } from 'react'
import {
  cilApplicationsSettings,
  cilBeaker,
  cilColumns,
  cilExcerpt,
  cilFactory,
  cilPeople,
  cilSettings,
  cilShortText,
  cilSpeedometer,
  cilTruck,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiagnoses } from '@fortawesome/free-solid-svg-icons'

export type Badge = {
  color: string
  text: string
}

export type NavItem = {
  component: string | ElementType
  name: string | JSX.Element
  icon?: string | JSX.Element
  badge?: Badge
  href?: string
  items?: NavItem[]
}

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NEW',
    },
    href: '/',
  },
  {
    component: CNavItem,
    name: 'Torneio',
    // icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    icon: <FontAwesomeIcon icon={faDiagnoses} style={{ paddingRight: '12px', fontSize: '18px' }} />,
    badge: {
      color: 'info-gradient',
    },
    href: '/torneio',
  },
  {
    component: CNavItem,
    name: 'Proposta Comercial',
    // icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    icon: <FontAwesomeIcon icon={faDiagnoses} style={{ paddingRight: '12px', fontSize: '18px' }} />,
    badge: {
      color: 'info-gradient',
    },
    href: '/propostaComercial',
  },
  // {
  //   component: CNavItem,
  //   name: 'Ticket',
  //   // icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  //   icon: <CIcon icon={cilShortText} customClassName="nav-icon" />,
  //   badge: {
  //     color: 'info-gradient',
  //   },
  //   href: '/ticket',
  // },
  {
    component: CNavGroup,
    name: 'Cadastro',
    href: '/notifications',
    icon: <CIcon icon={cilApplicationsSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Cliente',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/cliente',
      },
      // {
      //   component: CNavItem,
      //   name: 'Estrutura',
      //   icon: <CIcon icon={cilColumns} customClassName="nav-icon" />,
      //   badge: {
      //     color: 'info-gradient',
      //     // text: 'NEW',
      //   },
      //   href: '/estrutura',
      // },
      {
        component: CNavItem,
        name: 'Blind',
        icon: <CIcon icon={cilExcerpt} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/blind',
      },
      // {
      //   component: CNavItem,
      //   name: 'Fornecedor',
      //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      //   badge: {
      //     color: 'info-gradient',
      //     // text: 'NEW',
      //   },
      //   href: '/fornecedor',
      // },
      {
        component: CNavItem,
        name: 'Laboratório',
        icon: <CIcon icon={cilBeaker} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/laboratorio',
      },
      {
        component: CNavItem,
        name: 'Análise',
        icon: <CIcon icon={cilBeaker} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/analise',
      },
      {
        component: CNavItem,
        name: 'Tabela de Preço',
        icon: <CIcon icon={cilBeaker} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/tabelapreco',
      },
      {
        component: CNavItem,
        name: 'Cidade',
        icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
        },
        href: '/cidade',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Config. de Sistema',
    href: '/notifications',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Função do Usuário',
        // icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/configuracao/funcaoUsuario',
      },
      {
        component: CNavItem,
        name: 'Usuário do Sistema',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        badge: {
          color: 'info-gradient',
          // text: 'NEW',
        },
        href: '/configuracao/usuario',
      },
    ],
  },
]

export default _nav
