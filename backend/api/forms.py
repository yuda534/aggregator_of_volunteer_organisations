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
