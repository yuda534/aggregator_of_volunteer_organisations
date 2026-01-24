from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication,
    VolunteerReview,
    OrganizationReview
)

# =========================
# РЕГИСТРАЦИЯ
# =========================

class RegisterForm(UserCreationForm):
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
# МЕРОПРИЯТИЕ
# =========================

class EventForm(forms.ModelForm):
    start_date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={
            'type': 'datetime-local',
            'class': 'form-control'
        }),
        label='Дата начала'
    )

    end_date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={
            'type': 'datetime-local',
            'class': 'form-control'
        }),
        label='Дата окончания'
    )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        
        if start_date and end_date and end_date <= start_date:
            raise forms.ValidationError(
                "Дата окончания должна быть позже даты начала."
            )
        
        return cleaned_data

    class Meta:
        model = Event
        fields = (
            'title',
            'description',
            'start_date',
            'end_date',
            'location',
            'required_volunteers',
            'latitude',
            'longitude',
        )
        labels = {
            'title': 'Название мероприятия',
            'description': 'Описание',
            'location': 'Адрес',
            'required_volunteers': 'Количество волонтёров',
        }
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4
            }),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'required_volunteers': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 1
            }),
            'latitude': forms.HiddenInput(),
            'longitude': forms.HiddenInput(),
        }


# =========================
# ПРОЧЕЕ (без изменений)
# =========================

class VolunteerApplicationForm(forms.ModelForm):
    class Meta:
        model = VolunteerApplication
        fields = ()


class VolunteerReviewForm(forms.ModelForm):
    class Meta:
        model = VolunteerReview
        fields = ('rating', 'comment')


class OrganizationReviewForm(forms.ModelForm):
    class Meta:
        model = OrganizationReview
        fields = ('rating', 'comment')


# =========================
# ФОРМЫ РЕДАКТИРОВАНИЯ ПРОФИЛЯ
# =========================

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['email', 'phone', 'avatar', 'bio', 'city']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'email': 'Email',
            'phone': 'Телефон',
            'avatar': 'Аватар',
            'bio': 'О себе',
            'city': 'Город',
        }


class VolunteerProfileForm(forms.ModelForm):
    class Meta:
        model = VolunteerProfile
        fields = ['skills', 'experience', 'date_of_birth']
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'skills': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'experience': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }
        labels = {
            'skills': 'Навыки',
            'experience': 'Опыт',
            'date_of_birth': 'Дата рождения',
        }


class OrganizationProfileForm(forms.ModelForm):
    class Meta:
        model = Organization
        fields = ['name', 'description', 'logo', 'website', 'contact_email', 'address']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={
                'rows': 4, 
                'class': 'form-control'
            }),
            'website': forms.URLInput(attrs={'class': 'form-control'}),
            'contact_email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={
                'rows': 3, 
                'class': 'form-control'
            }),
        }
        labels = {
            'name': 'Название организации',
            'description': 'Описание организации',
            'logo': 'Логотип',
            'website': 'Веб-сайт',
            'contact_email': 'Контактный email',
            'address': 'Адрес',
        }
        help_texts = {
            'contact_email': 'Будет виден волонтёрам',
            'address': 'Физический адрес организации',
        }