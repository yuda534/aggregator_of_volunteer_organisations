import { useEffect, useRef, useState } from 'react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    ymaps: any;
  }
}

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Загрузка скрипта Яндекс.Карт
  useEffect(() => {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
    
    // Проверяем, загружен ли уже скрипт
    if (window.ymaps) {
      setIsScriptLoaded(true);
      return;
    }

    // Создаём скрипт
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      console.log('Yandex Maps API loaded');
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Yandex Maps API');
      setError('Не удалось загрузить карту. Проверьте интернет-соединение.');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Инициализация карты после загрузки скрипта
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || map) return;

    try {
      window.ymaps.ready(() => {
        const ymap = new window.ymaps.Map(mapRef.current, {
          center: [55.751574, 37.573856], // Москва
          zoom: 10,
          controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl'],
        }, {
          suppressMapOpenBlock: true,
        });

        // Добавляем пример меток (замените на реальные данные)
        const myPlacemark = new window.ymaps.Placemark(
          [55.751574, 37.573856],
          {
            balloonContent: 'Пример события',
            iconCaption: 'Событие',
          },
          {
            preset: 'islands#icon',
            iconColor: '#0095b6',
          }
        );

        ymap.geoObjects.add(myPlacemark);
        
        setMap(ymap);
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Ошибка инициализации карты.');
      setIsLoading(false);
    }
  }, [isScriptLoaded, map]);

  // Поиск по карте
  const handleSearch = () => {
    if (!map || !searchQuery.trim()) return;

    window.ymaps.geocode(searchQuery.trim()).then((res: any) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        map.setCenter(coords, 15);
        
        // Добавляем метку на найденное место
        const placemark = new window.ymaps.Placemark(coords, {
          balloonContent: searchQuery,
        }, {
          preset: 'islands#redDotIcon',
        });
        
        map.geoObjects.removeAll();
        map.geoObjects.add(placemark);
      } else {
        setError('Место не найдено.');
      }
    }).catch((err: any) => {
      console.error('Search error:', err);
      setError('Ошибка поиска.');
    });
  };

  // Обработка нажатия Enter в поле поиска
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container py-8">
      <SectionHeader title="Карта событий" subtitle="Найдите волонтёрские мероприятия рядом с вами." />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Поиск на карте</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите адрес или название места..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!isScriptLoaded}>
              Найти
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 h-[600px]">
          {!isScriptLoaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Загрузка карты...</p>
              </div>
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
    </div>
  );
}