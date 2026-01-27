import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
export default function Login() {
  const [username, setUsername] = useState('');const [password, setPassword] = useState('');const [error, setError] = useState('');const { login } = useAuth();const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {e.preventDefault();setError('');try {await login(username, password);navigate('/');} catch (err) {setError('Неверный логин или пароль');}};
  return (<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Card className="w-full max-w-md"><CardHeader><CardTitle className="text-center">Вход в Go2Help</CardTitle></CardHeader><CardContent>{error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium mb-1">Логин</label><Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/></div><div><label className="block text-sm font-medium mb-1">Пароль</label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/></div><Button type="submit" className="w-full">Войти</Button></form><div className="mt-4 text-center text-sm">Нет аккаунта? <Link to="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link></div></CardContent></Card></div>);
}
