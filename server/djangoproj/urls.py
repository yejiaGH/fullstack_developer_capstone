"""URL configuration for the djangoproj project.

The page routes (anything that should render the React shell) live here,
while the JSON API routes live in djangoapp/urls.py.
"""
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from djangoapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    # The landing page of the site.
    path('', views.home, name='home'),
    # Static pages served straight from server/frontend/static.
    path('about/', TemplateView.as_view(template_name="About.html")),
    path('contact/', TemplateView.as_view(template_name="Contact.html")),
    # Page routes that hand the React entry point back to the browser.
    path('login/', TemplateView.as_view(template_name="index.html")),
    path('register/', TemplateView.as_view(template_name="index.html")),
    path('dealers/', TemplateView.as_view(template_name="index.html")),
    path('dealer/<int:dealer_id>',
         TemplateView.as_view(template_name="index.html")),
    path('postreview/<int:dealer_id>',
         TemplateView.as_view(template_name="index.html")),
    path('searchcars/<int:dealer_id>',
         TemplateView.as_view(template_name="index.html")),
]
