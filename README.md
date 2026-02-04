# Aggregator Of Volunteer Organisations

Платформа для волонтёров и организаций:
- регистрация/авторизация;
- создание инициатив волонтёрами;
- создание мероприятий организациями;
- фильтры и поиск по мероприятиям, организациям и волонтёрам;
- карта с предстоящими мероприятиями, где ещё есть свободные места;
- отмена участия волонтёром только не позже чем за 24 часа до начала;
- автоматическая оценка `1/5` за no-show без подтверждённой причины.

## Стек

- Backend: Django + DRF + JWT
- Frontend: React + Vite + Tailwind
- DB: PostgreSQL
- Контейнеризация: Docker / Docker Compose

## Локальный запуск

1. Скопируйте переменные:
   - `cp .env.example .env`
2. Запустите:
   - `docker compose up --build`
3. Приложение:
   - frontend: `http://localhost:5173`
   - backend API: `http://localhost:8000/api/v1`

## Dokploy

Для деплоя подготовлен `docker-compose.dokploy.yml`.
В нём уже есть отдельный сервис `scheduler`, который каждые 30 минут запускает:
- `python manage.py process_no_shows`

Обязательные env-переменные в Dokploy:
- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `VITE_API_URL`
- `VITE_YANDEX_MAPS_API_KEY` (опционально)
- `YANDEX_MAPS_API_KEY` (опционально)
