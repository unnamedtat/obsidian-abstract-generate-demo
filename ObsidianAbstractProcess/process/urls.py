# example/urls.py
from django.urls import path

from process.views import index


urlpatterns = [
    path('', index),
]