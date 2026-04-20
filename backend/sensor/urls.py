from django.urls import path
from . import views

urlpatterns = [
    path('nodes/', views.node_list, name='node-list'),
    path('nodes/<int:node_id>/', views.node_detail, name='node-detail'),
    path('logs/', views.logs, name='logs'),
    path('status/', views.system_status, name='system-status'),
    path('train/', views.train_model, name='train-model'),
]
