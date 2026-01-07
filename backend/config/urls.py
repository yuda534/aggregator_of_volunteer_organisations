from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from swagger.swagger import schema_view
from api.views import home  # 👈 ДОБАВЛЕНО


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('api.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),

    path('', home, name='home'),  # 👈 ГЛАВНАЯ СТРАНИЦА
]
