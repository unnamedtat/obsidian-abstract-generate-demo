# example/urls.py
from django.urls import path

from process.views import BotView


urlpatterns = [
    path('', BotView.as_view(), name='index'),
]