import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createEvent } from '@/api/events';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [requiredVolunteers, setRequiredVolunteers] = useState('10');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = async () => {
    const event = await createEvent({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      location,
      required_volunteers: Number(requiredVolunteers),
      status: 'active',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Создать мероприятие" subtitle="Опишите событие и опубликуйте его." />
      <Card>
        <CardHeader>
          <CardTitle>Параметры события</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Локация" />
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            type="number"
            value={requiredVolunteers}
            onChange={(e) => setRequiredVolunteers(e.target.value)}
            placeholder="Требуемое число волонтёров"
          />
          <Input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Широта (для карты)"
          />
          <Input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Долгота (для карты)"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            className="md:col-span-2"
          />
          <Button className="md:col-span-2" onClick={handleSubmit}>
            Опубликовать
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
