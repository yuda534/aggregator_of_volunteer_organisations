import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createEvent } from '@/api/events';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemark, setPlacemark] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [requiredVolunteers, setRequiredVolunteers] = useState('10');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
    if (window.ymaps) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError('Не удалось загрузить карту.');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || map) return;

    window.ymaps.ready(() => {
      const ymap = new window.ymaps.Map(
        mapRef.current,
        {
          center: [55.751574, 37.573856],
          zoom: 10,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl'],
        },
        {
          suppressMapOpenBlock: true,
        }
      );

      ymap.events.add('click', (event: any) => {
        const coords = event.get('coords') as [number, number];
        updatePlacemark(coords);
        reverseGeocode(coords);
      });

      setMap(ymap);
    });
  }, [isScriptLoaded, map]);

  useEffect(() => {
    if (!map || !coordinates) return;
    updatePlacemark(coordinates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, coordinates]);

  const updatePlacemark = (coords: [number, number]) => {
    setCoordinates(coords);
    if (!map) return;
    if (placemark) {
      placemark.geometry.setCoordinates(coords);
    } else {
      const marker = new window.ymaps.Placemark(coords, {}, { preset: 'islands#blueIcon' });
      map.geoObjects.add(marker);
      setPlacemark(marker);
    }
    map.setCenter(coords, 14);
  };

  const reverseGeocode = (coords: [number, number]) => {
    if (!window.ymaps) {
      return;
    }
    window.ymaps
      .geocode(coords)
      .then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          setLocation(firstGeoObject.getAddressLine());
        }
      })
      .catch(() => setError('Не удалось определить адрес.'));
  };

  const geocodeAddress = async () => {
    if (!location.trim()) return;
    if (!window.ymaps) {
      setError('Карта ещё загружается.');
      return;
    }
    try {
      const result = await window.ymaps.geocode(location.trim());
      const firstGeoObject = result.geoObjects.get(0);
      if (!firstGeoObject) {
        setError('Адрес не найден.');
        return;
      }
      const coords = firstGeoObject.geometry.getCoordinates() as [number, number];
      updatePlacemark(coords);
      setLocation(firstGeoObject.getAddressLine());
    } catch {
      setError('Не удалось найти адрес.');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSaving(true);
      const event = await createEvent({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        required_volunteers: Number(requiredVolunteers),
        status: 'active',
        latitude: coordinates ? coordinates[0] : null,
        longitude: coordinates ? coordinates[1] : null,
      });
      navigate(`/events/${event.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Не удалось создать мероприятие.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.user_type !== 'organization') {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertDescription>Создавать мероприятия могут только организации.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Создать мероприятие" subtitle="Опишите событие и опубликуйте его." />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Параметры события</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={geocodeAddress}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  geocodeAddress();
                }
              }}
              placeholder="Адрес"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={geocodeAddress} disabled={!isScriptLoaded}>
              Найти
            </Button>
          </div>
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
          <div className="md:col-span-2">
            <div className="h-64 w-full rounded-2xl border bg-muted/30 sm:h-72">
              {isScriptLoaded ? (
                <div ref={mapRef} className="h-full w-full rounded-2xl" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Загрузка карты...
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Кликните по карте, чтобы выбрать место, или введите адрес вручную.
            </p>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            className="md:col-span-2"
          />
          <Button className="md:col-span-2" onClick={handleSubmit}>
            {isSaving ? 'Публикация...' : 'Опубликовать'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
