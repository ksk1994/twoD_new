from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout_view', views.logout_view, name='logout_view'),
    path('register', views.register, name='register'),
    path('recover', views.recover, name='recover'),
    path('history/<int:id>', views.history, name='history'),



    ## api path
    path('add_value', views.add_value, name="add_value"),
    path('create_comm', views.create_comm, name="create_comm"),
    path('deleteLog', views.deleteLog, name="deleteLog"),
    path('closeEntry', views.close_entry, name="closeEntry"),
    path('getArcs', views.get_arcs, name="getArcs"),
    path('addJp', views.add_jp, name="addJp"),
    path('changeComm', views.change_comm, name="changeComm"),
    path('setLimit', views.set_limit, name="setLimit"),
    path('getSession', views.get_session, name="getSession"),

]