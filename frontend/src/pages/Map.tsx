import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { getMapEvents } from '@/api/events';
import type { Event } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEFAULT_CENTER = [55.751574, 37.573856];

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    getMapEvents()
      .then(setEvents)
      .catch(() => {
        setEvents([]);
        setError('Не удалось загрузить мероприятия для карты.');
      });
  }, []);

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
          center: DEFAULT_CENTER,
          zoom: 10,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl'],
        },
        {
          suppressMapOpenBlock: true,
        }
      );
      setMap(ymap);
    });
  }, [isScriptLoaded, map]);

  useEffect(() => {
    if (!map) return;

    map.geoObjects.removeAll();

    if (!events.length) {
      map.setCenter(DEFAULT_CENTER, 10);
      return;
    }

    events.forEach((event) => {
      if (event.latitude == null || event.longitude == null) return;
      const freeSpots = event.required_volunteers - event.approved_count;
      const placemark = new window.ymaps.Placemark(
        [event.latitude, event.longitude],
        {
          balloonContentHeader: event.title,
          balloonContentBody: `
            <div>
              <div>${new Date(event.start_date).toLocaleString('ru-RU')}</div>
              <div>Свободных мест: ${freeSpots}</div>
              <div>${event.location}</div>
            </div>
          `,
          balloonContentFooter: `<a href="/events/${event.id}">Подробнее</a>`,
          hintContent: event.title,
        },
        {
          preset: 'islands#greenIcon',
        }
      );
      map.geoObjects.add(placemark);
    });

    const firstEvent = events.find((event) => event.latitude != null && event.longitude != null);
    if (firstEvent?.latitude != null && firstEvent?.longitude != null) {
      map.setCenter([firstEvent.latitude, firstEvent.longitude], 11);
    }
  }, [events, map]);

  return (
    <div className="container py-8 space-y-6">
      <SectionHeader
        title="Карта мероприятий"
        subtitle="Только предстоящие мероприятия с доступными местами для волонтёров."
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0 h-[420px] sm:h-[480px] md:h-[560px]">
          {!isScriptLoaded ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Загрузка карты...
            </div>
          ) : (
            <div
              ref={mapRef}
              id="map"
              style={{ width: '100%', height: '100%' }}
              className="rounded-lg overflow-hidden"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мероприятия на карте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Пока нет подходящих мероприятий с координатами.
            </p>
          )}
          {events.map((event) => {
            const freeSpots = event.required_volunteers - event.approved_count;
            return (
              <div
                key={event.id}
                className="flex flex-col gap-2 rounded-xl border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.start_date).toLocaleString('ru-RU')} • свободно мест: {freeSpots}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to={`/events/${event.id}`}>Открыть</Link>
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
