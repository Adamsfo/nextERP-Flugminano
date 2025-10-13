import { useTypedSelector } from '../../store'

type PermissionGateProps = {
  children: React.ReactNode
  permission?: number // Agora permission é um único número
}

const PermissionGate = ({ children, permission }: PermissionGateProps) => {
  const permissions = useTypedSelector((state) => state.permissions)

  // Se permission não for passado ou se o usuário tiver a permissão necessária
  if (!permission || permissions?.includes(permission)) {
    return <>{children}</>
  }

  return <div>Sem permissão para acessar esta página, contate o administrador do sistema!</div>
}

export default PermissionGate
