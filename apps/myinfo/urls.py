from django.urls import path, re_path
from . import views

urlpatterns = [
    path(r'getAuthoriseUrl/', views.get_authorise_url, name='get_authorise_url'),
    path(r'getPerson/', views.get_person, name='get_person'),
    path(r'callback/', views.callback, name='callback'),
    path(r'', views.index, name='index'),
]
