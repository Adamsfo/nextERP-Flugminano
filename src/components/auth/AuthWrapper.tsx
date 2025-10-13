import { ReactNode, useEffect, useState } from 'react';
import { isAuthenticated } from '../../lib/auth';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated()) {
      window.location.href = '/login';
    }
  }, [isClient]);

  if (!isClient) {
    return <div>Loading...</div>; // Renderiza um placeholder até que o cliente seja montado
  }

  return <>{children}</>;
};

export default AuthWrapper;
