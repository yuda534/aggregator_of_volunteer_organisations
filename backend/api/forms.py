from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, VolunteerProfile, Organization, Event, VolunteerApplication, VolunteerReview, OrganizationReview

# =========================
# РЕГИСТРАЦИЯ
# =========================

class RegisterForm(UserCreationForm):
    """
    Форма регистрации для всех типов пользователей.
    Поле user_type задаётся через select в HTML.
    """

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'password1', 'password2', 'user_type')
        labels = {
            'username': 'Логин',
            'user_type': 'Тип аккаунта',
        }

    def clean_user_type(self):
        user_type = self.cleaned_data.get('user_type')
        if user_type not in ['volunteer', 'organization']:
            raise forms.ValidationError("Выберите корректный тип пользователя")
        return user_type

# =========================
# ПРОФИЛЬ ВОЛОНТЁРА
# =========================

class VolunteerProfileForm(forms.ModelForm):
    class Meta:
        model = VolunteerProfile
        fields = ('skills', 'experience', 'date_of_birth')
        labels = {
            'skills': 'Навыки',
            'experience': 'Опыт',
            'date_of_birth': 'Дата рождения',
        }

# =========================
# ОРГАНИЗАЦИЯ
# =========================

class OrganizationForm(forms.ModelForm):
    class Meta:
        model = Organization
        fields = ('name', 'description', 'website', 'contact_email', 'address')
        labels = {
            'name': 'Название организации',
            'description': 'Описание',
            'website': 'Сайт',
            'contact_email': 'Email',
            'address': 'Адрес',
        }

# =========================
# МЕРОПРИЯТИЕ
# =========================

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ('title', 'description', 'start_date', 'end_date', 'location', 'required_volunteers')
        labels = {
            'title': 'Название',
            'description': 'Описание',
            'start_date': 'Дата начала',
            'end_date': 'Дата окончания',
            'location': 'Место проведения',
            'required_volunteers': 'Требуется волонтёров',
        }

# =========================
# ЗАЯВКА
# =========================

class VolunteerApplicationForm(forms.ModelForm):
    class Meta:
        model = VolunteerApplication
        fields = ()

# =========================
# ОТЗЫВЫ
# =========================

class VolunteerReviewForm(forms.ModelForm):
    class Meta:
        model = VolunteerReview
        fields = ('rating', 'comment')
        labels = {
            'rating': 'Оценка',
            'comment': 'Комментарий',
        }

class OrganizationReviewForm(forms.ModelForm):
    class Meta:
        model = OrganizationReview
        fields = ('rating', 'comment')
        labels = {
            'rating': 'Оценка',
            'comment': 'Комментарий',
        }
