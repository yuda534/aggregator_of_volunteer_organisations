from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

from .models import (
    Event,
    Organization,
    VolunteerProfile,
    VolunteerApplication
)


# =========================
# PAGES
# =========================

def home_view(request):
    return render(request, 'pages/home.html')


def event_list_view(request):
    events = Event.objects.filter(status='active').order_by('start_date')
    return render(request, 'pages/event_list.html', {'events': events})


def event_detail_view(request, pk):
    event = get_object_or_404(Event, pk=pk)
    return render(request, 'pages/event_detail.html', {'event': event})


def organization_list_view(request):
    organizations = Organization.objects.all()
    return render(request, 'api/organization_list.html', {'organizations': organizations})


def organization_detail_view(request, pk):
    organization = get_object_or_404(Organization, pk=pk)
    return render(request, 'api/organization_detail.html', {'organization': organization})


def volunteer_list_view(request):
    volunteers = VolunteerProfile.objects.select_related('user')
    return render(request, 'api/volunteer_list.html', {'volunteers': volunteers})


def volunteer_detail_view(request, pk):
    volunteer = get_object_or_404(VolunteerProfile, pk=pk)
    return render(request, 'api/volunteer_detail.html', {'volunteer': volunteer})


def application_list_view(request):
    applications = VolunteerApplication.objects.all()
    return render(request, 'api/application_list.html', {'applications': applications})


def application_detail_view(request, pk):
    application = get_object_or_404(VolunteerApplication, pk=pk)
    return render(request, 'api/application_detail.html', {'application': application})


def map_view(request):
    events = Event.objects.filter(
        status='active',
        latitude__isnull=False,
        longitude__isnull=False
    )
    return render(request, 'api/map.html', {'events': events})


# =========================
# AUTH (HTML)
# =========================

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Неверный логин или пароль')

    return render(request, 'auth/login.html')


def logout_view(request):
    logout(request)
    return redirect('home')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()

    return render(request, 'auth/register.html', {'form': form})
