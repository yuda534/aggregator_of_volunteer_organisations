import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Загрузка профиля...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
