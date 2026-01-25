from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q, Count, F

from .forms import (
    RegisterForm, 
    VolunteerReviewForm, 
    OrganizationReviewForm, 
    EventForm,
    UserProfileForm,            
    VolunteerProfileForm,       
    OrganizationProfileForm    
)
from .models import (
    CustomUser, Event, Organization, VolunteerProfile,
    VolunteerApplication, VolunteerReview, OrganizationReview
)

# =========================
# HOME
# =========================
def home_view(request):
    context = {}
    if request.user.is_authenticated:
        if request.user.user_type == 'volunteer':
            latest_events = Event.objects.filter(status='active').order_by('-created_at')[:3]
            context['latest_events'] = latest_events
        elif request.user.user_type == 'organization':
            context['can_create_event'] = True
    return render(request, 'pages/home.html', context)


# =========================
# PROFILE
# =========================
def profile_view(request, user_id):
    user_obj = get_object_or_404(CustomUser, pk=user_id)
    context = {'user_obj': user_obj}
    
    now = timezone.now()

    if user_obj.user_type == 'volunteer':
        profile = get_object_or_404(VolunteerProfile, user=user_obj)
        
        # Все заявки волонтёра (только одобренные для истории)
        all_applications = VolunteerApplication.objects.filter(
            volunteer=profile,
            status='approved'
        ).select_related('event', 'event__organization').order_by('-applied_at')
        
        # Текущие/активные заявки (мероприятия еще не завершены)
        current_applications = all_applications.filter(
            event__end_date__gt=now
        )
        
        # История (завершенные мероприятия)
        history_applications = all_applications.filter(
            event__end_date__lte=now
        )
        
        # Проверяем, можно ли оставить отзыв для каждого мероприятия
        for app in history_applications:
            # Проверяем, есть ли уже отзыв от волонтера об этой организации по этому мероприятию
            has_review = OrganizationReview.objects.filter(
                organization=app.event.organization,
                event=app.event,
                volunteer=profile
            ).exists()
            app.can_review = not has_review  # Добавляем атрибут can_review
        
        context.update({
            'profile': profile,
            'current_applications': current_applications,
            'history_applications': history_applications,
            'all_applications': all_applications,
        })
        
    elif user_obj.user_type == 'organization':
        profile = get_object_or_404(Organization, user=user_obj)
        
        # Все мероприятия организации
        all_events = Event.objects.filter(organization=profile).order_by('-start_date')
        
        # Текущие мероприятия (еще не завершены)
        current_events = all_events.filter(end_date__gt=now)
        
        # История (завершенные мероприятия)
        history_events = all_events.filter(end_date__lte=now)
        
        # Для каждого завершенного мероприятия получаем волонтеров, которым можно оставить отзыв
        for event in history_events:
            # Получаем одобренных волонтеров для этого мероприятия
            approved_volunteers = VolunteerApplication.objects.filter(
                event=event,
                status='approved'
            ).select_related('volunteer__user')
            
            # Для каждого волонтера проверяем, оставлен ли отзыв
            event.volunteers_with_reviews = []
            for app in approved_volunteers:
                has_review = VolunteerReview.objects.filter(
                    volunteer=app.volunteer,
                    event=event
                ).exists()
                event.volunteers_with_reviews.append({
                    'volunteer': app.volunteer,
                    'has_review': has_review
                })
        
        context.update({
            'profile': profile,
            'current_events': current_events,
            'history_events': history_events,
            'all_events': all_events,
        })

    return render(request, 'pages/profile.html', context)


# =========================
# CREATE EVENT
# =========================
def create_event_view(request):
    if not request.user.is_authenticated or request.user.user_type != 'organization':
        messages.error(request, 'Доступ запрещён')
        return redirect('home')

    organization = get_object_or_404(Organization, user=request.user)

    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save(commit=False)
            event.organization = organization
            event.status = 'active'
            event.save()
            messages.success(request, 'Мероприятие создано')
            return redirect('organization_detail', pk=organization.pk)
    else:
        form = EventForm()

    return render(request, 'pages/create_event.html', {'form': form})


# =========================
# EVENTS / ORGANIZATIONS / VOLUNTEERS
# =========================
def event_list_view(request):
    # Показываем только активные мероприятия, которые еще не завершены
    now = timezone.now()
    
    # Основной запрос
    events = Event.objects.filter(
        status='active',  # только активные
        end_date__gt=now  # которые еще не завершились
    ).annotate(
        approved_count=Count('volunteerapplication', filter=Q(volunteerapplication__status='approved'))
    ).filter(
        approved_count__lt=F('required_volunteers')  # где еще есть свободные места
    ).select_related('organization').order_by('start_date')
    
    return render(request, 'pages/event_list.html', {'events': events})


def event_detail_view(request, pk):
    event = get_object_or_404(Event, pk=pk)
    now = timezone.now()
    
    # Проверяем, можно ли подавать заявки
    can_apply = (
        event.is_open_for_applications()
        and request.user.is_authenticated
        and request.user.user_type == 'volunteer'
    )
    
    if request.method == 'POST' and can_apply:
        if not request.user.is_authenticated:
            return redirect('login')

        if request.user.user_type != 'volunteer':
            messages.error(request, 'Только волонтёры могут подавать заявки')
            return redirect('event_detail', pk=pk)

        if not can_apply:
            messages.error(request, 'Набор на это мероприятие закрыт')
            return redirect('event_detail', pk=pk)

        volunteer = get_object_or_404(VolunteerProfile, user=request.user)

        if VolunteerApplication.objects.filter(volunteer=volunteer, event=event).exists():
            messages.warning(request, 'Вы уже подали заявку на это мероприятие')
            return redirect('event_detail', pk=pk)

        VolunteerApplication.objects.create(volunteer=volunteer, event=event)
        messages.success(request, 'Заявка успешно отправлена')
        return redirect('event_detail', pk=pk)

    return render(request, 'pages/event_detail.html', {
        'event': event,
        'can_apply': can_apply,
        'available_spots': event.required_volunteers - event.approved_count,
    })


def organization_list_view(request):
    organizations = Organization.objects.all()
    return render(request, 'pages/organization_list.html', {'organizations': organizations})


def organization_detail_view(request, pk):
    organization = get_object_or_404(Organization, pk=pk)
    return render(request, 'pages/organization_detail.html', {'organization': organization})


def volunteer_list_view(request):
    volunteers = VolunteerProfile.objects.select_related('user')
    return render(request, 'pages/volunteer_list.html', {'volunteers': volunteers})


def volunteer_detail_view(request, pk):
    volunteer = get_object_or_404(VolunteerProfile, pk=pk)
    return render(request, 'pages/volunteer_detail.html', {'volunteer': volunteer})


def map_view(request):
    # Фильтруем мероприятия: активные, еще не начались, есть координаты
    now = timezone.now()
    events = Event.objects.filter(
        status='active',
        start_date__gt=now,  # Мероприятие еще не началось
        latitude__isnull=False,
        longitude__isnull=False
    ).annotate(
        approved_count=Count('volunteerapplication', filter=Q(volunteerapplication__status='approved'))
    ).filter(
        approved_count__lt=F('required_volunteers')  # Есть свободные места
    )
    return render(request, 'pages/map.html', {'events': events})


# =========================
# AUTH
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
        messages.error(request, 'Неверный логин или пароль')
    return render(request, 'auth/login.html')


def logout_view(request):
    logout(request)
    return redirect('home')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Форма сама создаст пользователя и профиль
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = RegisterForm()

    return render(request, 'auth/register.html', {'form': form})


# =========================
# APPLICATIONS
# =========================
def my_applications_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.user_type != 'volunteer':
        messages.error(request, 'Доступ только для волонтёров')
        return redirect('home')

    volunteer = get_object_or_404(VolunteerProfile, user=request.user)
    applications = (
        VolunteerApplication.objects
        .filter(volunteer=volunteer)
        .select_related('event')
        .order_by('-applied_at')
    )
    return render(request, 'pages/my_applications.html', {'applications': applications})


def organization_applications_view(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.user.user_type != 'organization':
        messages.error(request, 'Доступ только для организаций')
        return redirect('home')

    organization = get_object_or_404(Organization, user=request.user)

    applications = (
        VolunteerApplication.objects
        .filter(event__organization=organization)
        .select_related('volunteer__user', 'event')
        .order_by('-applied_at')
    )

    return render(request, 'pages/organization_applications.html', {
        'applications': applications
    })


def update_application_status_view(request, pk, status):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.user_type != 'organization':
        messages.error(request, 'Доступ запрещён')
        return redirect('home')

    application = get_object_or_404(VolunteerApplication, pk=pk)
    if application.event.organization.user != request.user:
        messages.error(request, 'Вы не можете управлять этой заявкой')
        return redirect('home')

    if status not in ['approved', 'rejected']:
        messages.error(request, 'Некорректный статус')
        return redirect('organization_applications')
    
    # Проверяем, не превышен ли лимит волонтеров
    if status == 'approved':
        approved_count = application.event.approved_count
        if approved_count >= application.event.required_volunteers:
            messages.error(request, 'Достигнут лимит волонтёров для этого мероприятия')
            return redirect('organization_applications')

    application.status = status
    application.save(update_fields=['status'])
    
    # Автоматически обновляем статус мероприятия
    application.event.auto_update_status()
    
    messages.success(request, 'Статус заявки обновлён')
    return redirect('organization_applications')


def mark_no_show_view(request, pk):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.user_type != 'organization':
        messages.error(request, 'Доступ запрещён')
        return redirect('home')

    application = get_object_or_404(VolunteerApplication, pk=pk)
    if application.event.organization.user != request.user:
        messages.error(request, 'Вы не можете управлять этой заявки')
        return redirect('organization_applications')

    if application.status != 'approved':
        messages.error(request, 'Можно отметить неявку только для одобренной заявки')
        return redirect('organization_applications')

    if application.no_show_marked:
        messages.warning(request, 'Неявка уже была отмечена')
        return redirect('organization_applications')

    application.no_show_marked = True
    application.save(update_fields=['no_show_marked'])

    volunteer = application.volunteer
    volunteer.rating = max(volunteer.rating - 1, 0)
    volunteer.save(update_fields=['rating'])

    messages.success(request, 'Неявка отмечена, рейтинг волонтёра снижен')
    return redirect('organization_applications')


# =========================
# REVIEWS
# =========================
def leave_volunteer_review_view(request, event_id, volunteer_id):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.user_type != 'organization':
        messages.error(request, 'Доступ только для организаций')
        return redirect('home')

    organization = get_object_or_404(Organization, user=request.user)
    volunteer = get_object_or_404(VolunteerProfile, pk=volunteer_id)
    event = get_object_or_404(Event, pk=event_id, organization=organization)
    
    # Проверяем, что мероприятие завершено
    if event.end_date > timezone.now():
        messages.error(request, 'Отзыв можно оставить только после завершения мероприятия')
        return redirect('organization_applications')
    
    # Проверяем, что волонтер действительно участвовал в мероприятии
    if not VolunteerApplication.objects.filter(
        volunteer=volunteer,
        event=event,
        status='approved'
    ).exists():
        messages.error(request, 'Этот волонтёр не участвовал в мероприятии')
        return redirect('organization_applications')
    
    # Проверяем, что отзыв еще не оставлен
    if VolunteerReview.objects.filter(volunteer=volunteer, event=event).exists():
        messages.warning(request, 'Вы уже оставили отзыв об этом волонтёре')
        return redirect('organization_applications')

    if request.method == 'POST':
        form = VolunteerReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.volunteer = volunteer
            review.organization = organization
            review.event = event
            review.save()
            messages.success(request, 'Отзыв успешно сохранён')
            return redirect('organization_applications')
    else:
        form = VolunteerReviewForm()

    return render(request, 'reviews/leave_volunteer_review.html', {
        'form': form,
        'volunteer': volunteer,
        'event': event
    })


def leave_organization_review_view(request, event_id, organization_id):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.user_type != 'volunteer':
        messages.error(request, 'Доступ только для волонтёров')
        return redirect('home')

    volunteer = get_object_or_404(VolunteerProfile, user=request.user)
    organization = get_object_or_404(Organization, pk=organization_id)
    event = get_object_or_404(Event, pk=event_id, organization=organization)
    
    # Проверяем, что мероприятие завершено
    if event.end_date > timezone.now():
        messages.error(request, 'Отзыв можно оставить только после завершения мероприятия')
        return redirect('my_applications')
    
    # Проверяем, что волонтер действительно участвовал в мероприятии
    if not VolunteerApplication.objects.filter(
        volunteer=volunteer,
        event=event,
        status='approved'
    ).exists():
        messages.error(request, 'Вы не участвовали в этом мероприятии')
        return redirect('my_applications')
    
    # Проверяем, что отзыв еще не оставлен
    if OrganizationReview.objects.filter(
        volunteer=volunteer,
        event=event,
        organization=organization
    ).exists():
        messages.warning(request, 'Вы уже оставили отзыв об этой организации')
        return redirect('my_applications')

    if request.method == 'POST':
        form = OrganizationReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.volunteer = volunteer
            review.organization = organization
            review.event = event
            review.save()
            messages.success(request, 'Отзыв успешно сохранён')
            return redirect('my_applications')
    else:
        form = OrganizationReviewForm()

    return render(request, 'reviews/leave_organization_review.html', {
        'form': form,
        'organization': organization,
        'event': event
    })


def edit_profile_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    user = request.user
    if request.method == 'POST':
        user_form = UserProfileForm(request.POST, request.FILES, instance=user)
        
        if user_form.is_valid():
            user_form.save()
            
            if user.user_type == 'volunteer':
                profile = get_object_or_404(VolunteerProfile, user=user)
                profile_form = VolunteerProfileForm(request.POST, instance=profile)
            else:
                profile = get_object_or_404(Organization, user=user)
                profile_form = OrganizationProfileForm(request.POST, request.FILES, instance=profile)
            
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, 'Профиль успешно обновлён')
                return redirect('profile', user_id=user.id)
    else:
        user_form = UserProfileForm(instance=user)
        
        if user.user_type == 'volunteer':
            profile = get_object_or_404(VolunteerProfile, user=user)
            profile_form = VolunteerProfileForm(instance=profile)
        else:
            profile = get_object_or_404(Organization, user=user)
            profile_form = OrganizationProfileForm(instance=profile)
    
    return render(request, 'pages/edit_profile.html', {
        'user_form': user_form,
        'profile_form': profile_form,
    })