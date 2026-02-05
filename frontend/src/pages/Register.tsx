import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        ...form,
        user_type: userType,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Register error:', err);
      let errorMsg = 'Ошибка при регистрации.';
      
      // Обработка ошибок валидации
      if (err.response?.data) {
        const data = err.response.data;
        
        // Собираем все ошибки в одну строку
        const fieldErrors = Object.entries(data)
          .filter(([key]) => key !== 'non_field_errors')
          .map(([key, value]: [string, any]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('; ');
        
        if (data.non_field_errors) {
          errorMsg = data.non_field_errors.join(' ');
        } else if (fieldErrors) {
          errorMsg = fieldErrors;
        } else if (data.detail) {
          errorMsg = data.detail;
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12 sm:py-16 max-w-2xl">
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
                disabled={isLoading}
              />
              <Input
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="Почта"
                disabled={isLoading}
              />
              <Input
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder="Пароль"
                disabled={isLoading}
              />
              <Select 
                value={userType} 
                onValueChange={(value) => setUserType(value as 'volunteer' | 'organization')}
                disabled={isLoading}
              >
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
                placeholder={userType === 'organization' ? 'Имя менеджера' : 'Имя'}
                disabled={isLoading}
              />
              <Input
                value={form.last_name}
                onChange={(event) => handleChange('last_name', event.target.value)}
                placeholder={userType === 'organization' ? 'Фамилия менеджера' : 'Фамилия'}
                disabled={isLoading}
              />
              <Input
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="Телефон"
                disabled={isLoading}
              />
              <Input
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Город"
                disabled={isLoading}
              />
            </div>
            <Textarea
              value={form.bio}
              onChange={(event) => handleChange('bio', event.target.value)}
              placeholder="О себе"
              disabled={isLoading}
            />
            {userType === 'volunteer' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.skills}
                  onChange={(event) => handleChange('skills', event.target.value)}
                  placeholder="Навыки"
                  disabled={isLoading}
                />
                <Input
                  value={form.experience}
                  onChange={(event) => handleChange('experience', event.target.value)}
                  placeholder="Опыт"
                  disabled={isLoading}
                />
              </div>
            )}
            {userType === 'organization' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Название организации"
                  disabled={isLoading}
                />
                <Input
                  value={form.website}
                  onChange={(event) => handleChange('website', event.target.value)}
                  placeholder="Сайт"
                  disabled={isLoading}
                />
                <Input
                  value={form.contact_email}
                  onChange={(event) => handleChange('contact_email', event.target.value)}
                  placeholder="Почта для связи"
                  disabled={isLoading}
                />
                <Input
                  value={form.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                  placeholder="Адрес"
                  disabled={isLoading}
                />
                <Textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  placeholder="Описание организации"
                  className="md:col-span-2"
                  disabled={isLoading}
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
            </Button>
          </form>
          <div className="pb-2">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт? <Link to="/login" className="text-primary">Войти</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
