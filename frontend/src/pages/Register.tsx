import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'volunteer' | 'organization'>('volunteer');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    bio: '',
    skills: '',
    experience: '',
    name: '',
    description: '',
    website: '',
    contact_email: '',
    address: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await register({
      ...form,
      user_type: userType,
    });
    navigate('/profile');
  };

  return (
    <div className="container py-16 max-w-2xl">
      <SectionHeader title="Регистрация" subtitle="Создайте профиль волонтёра или организации." />
      <Card>
        <CardHeader>
          <CardTitle>Новый аккаунт</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
                placeholder="Логин"
              />
              <Input
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="Email"
              />
              <Input
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder="Пароль"
              />
              <Select value={userType} onValueChange={(value) => setUserType(value as 'volunteer' | 'organization')}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип пользователя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Волонтёр</SelectItem>
                  <SelectItem value="organization">Организация</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={form.first_name}
                onChange={(event) => handleChange('first_name', event.target.value)}
                placeholder="Имя"
              />
              <Input
                value={form.last_name}
                onChange={(event) => handleChange('last_name', event.target.value)}
                placeholder="Фамилия"
              />
              <Input
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="Телефон"
              />
              <Input
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Город"
              />
            </div>

            <Textarea
              value={form.bio}
              onChange={(event) => handleChange('bio', event.target.value)}
              placeholder="О себе"
            />

            {userType === 'volunteer' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.skills}
                  onChange={(event) => handleChange('skills', event.target.value)}
                  placeholder="Навыки"
                />
                <Input
                  value={form.experience}
                  onChange={(event) => handleChange('experience', event.target.value)}
                  placeholder="Опыт"
                />
              </div>
            )}

            {userType === 'organization' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Название организации"
                />
                <Input
                  value={form.website}
                  onChange={(event) => handleChange('website', event.target.value)}
                  placeholder="Сайт"
                />
                <Input
                  value={form.contact_email}
                  onChange={(event) => handleChange('contact_email', event.target.value)}
                  placeholder="Email для связи"
                />
                <Input
                  value={form.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                  placeholder="Адрес"
                />
                <Textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  placeholder="Описание организации"
                  className="md:col-span-2"
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Создать аккаунт
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт? <Link to="/login" className="text-primary">Войти</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
