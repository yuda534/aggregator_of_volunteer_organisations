import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
export default function Register() {
  const [formData, setFormData] = useState({username: '',email: '',password: '',user_type: 'volunteer',});const [error, setError] = useState('');const { register } = useAuth();const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {e.preventDefault();setError('');try {await register(formData);navigate('/');} catch (err) {setError('Ошибка регистрации');}};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {setFormData({ ...formData, [e.target.name]: e.target.value });};
  return (<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Card className="w-full max-w-md"><CardHeader><CardTitle className="text-center">Регистрация в Go2Help</CardTitle></CardHeader><CardContent>{error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium mb-1">Логин</label><Input name="username" value={formData.username} onChange={handleChange} required/></div><div><label className="block text-sm font-medium mb-1">Email</label><Input name="email" type="email" value={formData.email} onChange={handleChange} required/></div><div><label className="block text-sm font-medium mb-1">Пароль</label><Input name="password" type="password" value={formData.password} onChange={handleChange} required/></div><div><label className="block text-sm font-medium mb-1">Тип аккаунта</label><select name="user_type" value={formData.user_type} onChange={handleChange} className="w-full p-2 border rounded-md"><option value="volunteer">Волонтёр</option><option value="organization">Организация</option></select></div><Button type="submit" className="w-full">Зарегистрироваться</Button></form><div className="mt-4 text-center text-sm">Уже есть аккаунт? <Link to="/login" className="text-blue-600 hover:underline">Войти</Link></div></CardContent></Card></div>);
}
