from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TicketViewSet

router = DefaultRouter()
router.register("tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path("tickets/stats/", TicketViewSet.as_view({"get": "stats"}), name="ticket-stats"),
    path("", include(router.urls)),
]