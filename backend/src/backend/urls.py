from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .views import ScalarDocsView, health_check

urlpatterns = [
    path("health/", health_check),
    path("api/", include("api.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/docs/", ScalarDocsView.as_view(), name="scalar-docs"),
]
