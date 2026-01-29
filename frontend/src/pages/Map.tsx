import { useEffect, useRef, useState } from 'react';

import { getMapEvents } from '@/api/events';
import type { Event } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';

export function Map() {
  const [events, setEvents] = useState<Event[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    getMapEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!apiKey || !mapRef.current || events.length === 0) return;

    const scriptId = 'yandex-maps-sdk';
    const existing = document.getElementById(scriptId);

    const initMap = () => {
      if (!window.ymaps || !mapRef.current) return;
      window.ymaps.ready(() => {
        const center = events[0]?.latitude && events[0]?.longitude
          ? [events[0].latitude, events[0].longitude]
          : [55.751244, 37.618423];
        const map = new window.ymaps.Map(mapRef.current, {
          center,
          zoom: 10,
        });

        events.forEach((event) => {
          if (event.latitude && event.longitude) {
            const placemark = new window.ymaps.Placemark(
              [event.latitude, event.longitude],
              {
                balloonContent: `<strong>${event.title}</strong><br/>${event.location}`,
              },
              {
                preset: 'islands#orangeDotIcon',
              }
            );
            map.geoObjects.add(placemark);
          }
        });
      });
    };

    if (!existing) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [apiKey, events]);

  return (
    <div className="container py-12 space-y-6">
      <SectionHeader title="Карта событий" subtitle="Смотрите мероприятия на карте города." />
      {!apiKey && (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Укажите VITE_YANDEX_MAPS_API_KEY в .env, чтобы включить карту.
        </div>
      )}
      <div ref={mapRef} className="h-[480px] w-full rounded-3xl border" />
    </div>
  );
}
