# Руководство по оформлению ветки dev-back

## Текущее состояние
- Ветка: `dev-back`
- Ветка опережает `origin/dev-back` на 1 коммит
- Есть изменения, которые не закоммичены

## Что было сделано

### Исправленные баги:
1. ✅ `AUTH_USER_MODEL` перенесен после импортов в `config/settings.py`
2. ✅ Удалена дублирующая строка `DJANGO_SETTINGS_MODULE` из `manage.py`

### Обновления:
- Добавлены недостающие зависимости в `requirements.txt`:
  - `djangorestframework` (для API)
  - `psycopg2-binary` (для PostgreSQL)
  - `Pillow` (для работы с изображениями)

## Рекомендуемые шаги

### 1. Проверка изменений
```bash
# Посмотреть все изменения
git status

# Посмотреть детальные изменения
git diff
```

### 2. Добавление файлов в staging

**Вариант A: Все изменения одним коммитом**
```bash
# Добавить все измененные файлы
git add backend/

# Добавить новые файлы
git add requirements.txt .gitignore

# Или добавить все сразу
git add .
```

**Вариант B: Разделить на логические коммиты (рекомендуется)**

**Коммит 1: Исправления багов**
```bash
git add backend/config/settings.py backend/manage.py
git commit -m "fix: исправлен порядок AUTH_USER_MODEL и удален дубликат DJANGO_SETTINGS_MODULE

- AUTH_USER_MODEL перенесен после импортов в settings.py
- Удалена дублирующая строка DJANGO_SETTINGS_MODULE из manage.py"
```

**Коммит 2: Обновление зависимостей**
```bash
git add requirements.txt
git commit -m "chore: добавлены недостающие зависимости

- djangorestframework для REST API
- psycopg2-binary для PostgreSQL
- Pillow для работы с изображениями"
```

**Коммит 3: Миграции базы данных**
```bash
git add backend/api/migrations/
git commit -m "feat: добавлены начальные миграции для моделей"
```

**Коммит 4: Остальные изменения backend**
```bash
git add backend/accounts/ backend/api/ backend/config/ backend/events/ backend/manage.py backend/settings.py
git commit -m "feat: реализована базовая структура Django backend

- Настроены модели (CustomUser, VolunteerProfile, Organization, Event, VolunteerApplication)
- Настроены сериализаторы и ViewSets для REST API
- Настроена структура приложений (api, accounts, events, users)
- Настроены URL-маршруты"
```

**Коммит 5: Конфигурационные файлы**
```bash
git add .gitignore
git commit -m "chore: добавлен .gitignore для Python/Django проекта"
```

### 3. Проверка перед пушем
```bash
# Посмотреть историю коммитов
git log --oneline -10

# Проверить, что все в порядке
git status
```

### 4. Отправка в удаленный репозиторий
```bash
# Отправить изменения
git push origin dev-back

# Если ветка еще не отслеживается
git push -u origin dev-back
```

### 5. Создание Pull Request (если нужно)
После пуша можно создать Pull Request из `dev-back` в основную ветку через интерфейс GitHub/GitLab.

## Важные заметки

1. **Миграции**: Убедитесь, что миграции созданы правильно:
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Переменные окружения**: Создайте файл `.env` на основе `.env.example` с необходимыми переменными:
   - `DJANGO_SECRET_KEY`
   - `USE_SQLITE` (True/False)
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (если используется PostgreSQL)

3. **Тестирование**: Рекомендуется протестировать API перед коммитом:
   ```bash
   cd backend
   python manage.py runserver
   # Протестировать эндпоинты через curl или Postman
   ```

## Формат сообщений коммитов

Рекомендуется использовать conventional commits:
- `feat:` - новая функциональность
- `fix:` - исправление бага
- `chore:` - обновление зависимостей, конфигурации
- `docs:` - документация
- `refactor:` - рефакторинг кода

## Если что-то пошло не так

```bash
# Отменить последний коммит (но сохранить изменения)
git reset --soft HEAD~1

# Отменить изменения в файле
git restore <file>

# Отменить все незакоммиченные изменения
git restore .
```


