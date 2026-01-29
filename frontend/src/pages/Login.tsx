import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await login(username, password);
    navigate('/profile');
  };

  return (
    <div className="container py-16 max-w-lg">
      <SectionHeader title="Вход" subtitle="Используйте логин и пароль." />
      <Card>
        <CardHeader>
          <CardTitle>Войти</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Логин"
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль"
            />
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Нет аккаунта? <Link to="/register" className="text-primary">Зарегистрируйтесь</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
