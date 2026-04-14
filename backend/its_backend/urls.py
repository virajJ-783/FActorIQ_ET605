from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import FileResponse
from django.conf import settings
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

def serve_react(request):
    index_path = os.path.join(settings.BASE_DIR, 'dist', 'index.html')
    return FileResponse(open(index_path, 'rb'))

urlpatterns += [
    path('', serve_react),
]
