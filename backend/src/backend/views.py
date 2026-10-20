from django.http import HttpResponse, JsonResponse
from django.views import View


def health_check(request):
    return JsonResponse({"status": "ok"})


SCALAR_API_REFERENCE_HTML = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Scalar API Reference</title>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/schema/"
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
"""


class ScalarDocsView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse(SCALAR_API_REFERENCE_HTML, content_type="text/html; charset=utf-8")
