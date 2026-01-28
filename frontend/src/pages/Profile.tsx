import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVolunteer } from '@/api/volunteers';
import { getOrganization } from '@/api/organizations';

interface VolunteerProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    city?: string;
  };
  skills: string;
  experience: string;
  rating: number;
  is_active: boolean;
  created_at: string;
}

interface OrganizationProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    city?: string;
  };
  name: string;
  description: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<VolunteerProfile | OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<'volunteer' | 'organization'>('volunteer');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      setLoading(true);
      // Сначала попробуем получить как волонтёра
      try {
        const volunteer = await getVolunteer(parseInt(id!));
        setProfile(volunteer);
        setProfileType('volunteer');
      } catch {
        // Если не волонтёр, пробуем как организацию
        const organization = await getOrganization(parseInt(id!));
        setProfile(organization);
        setProfileType('organization');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  if (!profile) {
    return <div className="text-center py-10">Профиль не найден</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {profileType === 'volunteer' 
              ? `Волонтёр: ${(profile as VolunteerProfile).user.username}`
              : `Организация: ${(profile as OrganizationProfile).name}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Основная информация</h3>
              <div className="space-y-2">
                <p><strong>Имя пользователя:</strong> {profile.user.username}</p>
                <p><strong>Email:</strong> {profile.user.email}</p>
                {profile.user.city && <p><strong>Город:</strong> {profile.user.city}</p>}
                <p><strong>Рейтинг:</strong> {profile.rating} ★</p>
                <p><strong>Дата регистрации:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">
                {profileType === 'volunteer' ? 'Навыки и опыт' : 'Описание'}
              </h3>
              {profileType === 'volunteer' ? (
                <>
                  <p><strong>Навыки:</strong> {(profile as VolunteerProfile).skills || 'Не указано'}</p>
                  <p><strong>Опыт:</strong> {(profile as VolunteerProfile).experience || 'Не указано'}</p>
                  <p><strong>Статус:</strong> {(profile as VolunteerProfile).is_active ? 'Активен' : 'Неактивен'}</p>
                </>
              ) : (
                <>
                  <p><strong>Описание:</strong> {(profile as OrganizationProfile).description || 'Не указано'}</p>
                  <p><strong>Верификация:</strong> {(profile as OrganizationProfile).is_verified ? '✓ Верифицирована' : 'Не верифицирована'}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            {profileType === 'volunteer' ? (
              <Button variant="outline">
                Показать мероприятия волонтёра
              </Button>
            ) : (
              <Button variant="outline">
                Показать мероприятия организации
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}