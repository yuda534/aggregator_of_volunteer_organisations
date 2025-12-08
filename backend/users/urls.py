from rest_framework.routers import DefaultRouter
from .views import indexView

router = DefaultRouter()
router.register("/", indexView)

urlpatterns = router.urls