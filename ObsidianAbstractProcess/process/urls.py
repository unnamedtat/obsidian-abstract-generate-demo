# example/urls.py
from django.urls import path

# from process.views import BotView
from process.views import index


# urlpatterns = [
#     path('', BotView.as_view(), name='index'),
# ]
urlpatterns = [
    path('', index, name='index'),
]