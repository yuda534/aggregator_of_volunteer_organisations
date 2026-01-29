from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from swagger.swagger import schema_view

urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/v1/', include('api.api_urls')),
    
    # Swagger
    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),
]

# Обслуживание медиафайлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
