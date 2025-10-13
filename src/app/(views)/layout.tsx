'use client'

import { AppAside, AppSidebar, AppFooter, AppHeader } from '@/components/framework'
// import { CContainer } from '@coreui/react-pro'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          {/* <CContainer style={{width:'3000px'}} xxl className="px-4">{children} </CContainer> */}
          {children}
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </>
  )
}
