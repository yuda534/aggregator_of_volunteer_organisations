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

Шаблон env для Dokploy: `.env.dokploy.example`.
Скопируйте и задайте свои значения в настройках проекта Dokploy.

Обязательные env-переменные в Dokploy:
- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS` (домен/домены проекта)
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `CORS_ALLOWED_ORIGINS` (например `https://example.com`)
- `CSRF_TRUSTED_ORIGINS` (например `https://example.com`)
- `VITE_API_URL` (например `https://example.com/api/v1`)
- `VITE_YANDEX_MAPS_API_KEY` (опционально)
- `YANDEX_MAPS_API_KEY` (опционально)
- `AWS_ACCESS_KEY_ID` (если используете S3/MinIO для медиа)
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`
- `AWS_S3_ENDPOINT_URL`
