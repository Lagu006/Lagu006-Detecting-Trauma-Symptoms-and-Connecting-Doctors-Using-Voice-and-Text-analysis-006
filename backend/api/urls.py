from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_endpoint, name='chat'),
    path('tts/', views.tts_endpoint, name='tts'),
    path('emergency/dispatch/', views.emergency_dispatch_endpoint, name='emergency_dispatch'),
    path('emergency/nearby/', views.emergency_nearby_endpoint, name='emergency_nearby'),
    path('reports/pdf/', views.reports_pdf_endpoint, name='reports_pdf'),
    path('doctors/book/', views.doctor_booking_endpoint, name='doctor_booking'),
    path('insights/analyze/', views.mood_insights_endpoint, name='mood_insights'),
]

