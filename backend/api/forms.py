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
    # Обязательное поле email для всех
    email = forms.EmailField(
        required=True,
        label='Email',
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    
    # Дополнительные поля для организаций
    organization_name = forms.CharField(
        required=False,
        label='Название организации',
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        help_text='Заполняется только для организаций'
    )
    
    organization_address = forms.CharField(
        required=False,
        label='Адрес организации',
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        help_text='Заполняется только для организаций'
    )

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2', 'user_type')
        labels = {
            'username': 'Логин',
            'user_type': 'Тип аккаунта',
        }
        widgets = {
            'user_type': forms.Select(attrs={'class': 'form-control'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        user_type = cleaned_data.get('user_type')
        organization_name = cleaned_data.get('organization_name')
        organization_address = cleaned_data.get('organization_address')
        
        # Проверка для организаций
        if user_type == 'organization':
            if not organization_name:
                self.add_error('organization_name', 'Это поле обязательно для организаций')
            if not organization_address:
                self.add_error('organization_address', 'Это поле обязательно для организаций')
        
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
            # Если это организация - создаём профиль организации
            if user.user_type == 'organization':
                Organization.objects.create(
                    user=user,
                    name=self.cleaned_data.get('organization_name', ''),
                    description='Организация зарегистрирована в Go2Help',
                    contact_email=user.email,
                    address=self.cleaned_data.get('organization_address', '')
                )
            # Если это волонтёр - создаём профиль волонтёра
            elif user.user_type == 'volunteer':
                VolunteerProfile.objects.create(user=user)
        
        return user


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
    RATING_CHOICES = [
        (5, '⭐⭐⭐⭐⭐ - Отлично'),
        (4, '⭐⭐⭐⭐ - Хорошо'),
        (3, '⭐⭐⭐ - Удовлетворительно'),
        (2, '⭐⭐ - Плохо'),
        (1, '⭐ - Очень плохо'),
    ]
    
    rating = forms.ChoiceField(
        choices=RATING_CHOICES,
        widget=forms.RadioSelect,
        label='Оценка'
    )
    
    class Meta:
        model = VolunteerReview
        fields = ('rating', 'positive_comment', 'negative_comment')
        widgets = {
            'positive_comment': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Что понравилось в работе волонтёра?'
            }),
            'negative_comment': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Что можно было бы улучшить?'
            }),
        }
        labels = {
            'positive_comment': 'Что понравилось',
            'negative_comment': 'Что можно улучшить',
        }


class OrganizationReviewForm(forms.ModelForm):
    RATING_CHOICES = [
        (5, '⭐⭐⭐⭐⭐ - Отлично'),
        (4, '⭐⭐⭐⭐ - Хорошо'),
        (3, '⭐⭐⭐ - Удовлетворительно'),
        (2, '⭐⭐ - Плохо'),
        (1, '⭐ - Очень плохо'),
    ]
    
    rating = forms.ChoiceField(
        choices=RATING_CHOICES,
        widget=forms.RadioSelect,
        label='Оценка'
    )
    
    class Meta:
        model = OrganizationReview
        fields = ('rating', 'positive_comment', 'negative_comment')
        widgets = {
            'positive_comment': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Что понравилось в организации мероприятия?'
            }),
            'negative_comment': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Что можно было бы улучшить?'
            }),
        }
        labels = {
            'positive_comment': 'Что понравилось',
            'negative_comment': 'Что можно улучшить',
        }


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