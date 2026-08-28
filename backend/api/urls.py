from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_endpoint, name='chat'),
    path('tts/', views.tts_endpoint, name='tts'),
<<<<<<< HEAD

    path('reports/pdf/', views.reports_pdf_endpoint, name='reports_pdf'),
    path('reports/compare/', views.reports_compare_endpoint, name='reports_compare'),
    path('documents/', views.documents_list_upload_endpoint, name='documents_list_upload'),
    path('documents/<str:doc_id>/', views.documents_detail_endpoint, name='documents_detail'),
=======
    path('emergency/dispatch/', views.emergency_dispatch_endpoint, name='emergency_dispatch'),
    path('emergency/nearby/', views.emergency_nearby_endpoint, name='emergency_nearby'),
    path('reports/pdf/', views.reports_pdf_endpoint, name='reports_pdf'),
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    path('doctors/book/', views.doctor_booking_endpoint, name='doctor_booking'),
    path('insights/analyze/', views.mood_insights_endpoint, name='mood_insights'),
]

