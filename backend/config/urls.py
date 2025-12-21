from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from swagger.swagger import schema_view


urlpatterns = [
    path('admin/', admin.site.urls),

    # ===============================
    # НАЧАЛО ИЗМЕНЕНИЯ: единая точка входа API
    # ===============================
    path('api/', include('api.urls')),
    # ===============================
    # КОНЕЦ ИЗМЕНЕНИЯ: единая точка входа API
    # ===============================

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),
]
