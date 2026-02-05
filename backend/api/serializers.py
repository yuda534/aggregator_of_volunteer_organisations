from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication,
    VolunteerReview,
    OrganizationReview,
    Initiative,
    Notification,
)


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'user_type',
            'city',
            'avatar',
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'user_type',
            'phone',
            'avatar',
            'bio',
            'city',
            'is_verified',
            'created_at',
        ]
        read_only_fields = ['is_verified', 'created_at', 'user_type']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = [
            'id',
            'user',
            'skills',
            'experience',
            'date_of_birth',
            'rating',
            'is_active',
            'created_at',
        ]


class VolunteerProfileMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = [
            'id',
            'skills',
            'experience',
            'date_of_birth',
            'rating',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['rating', 'created_at']


class OrganizationSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id',
            'user',
            'name',
            'description',
            'logo',
            'website',
            'contact_email',
            'address',
            'rating',
            'is_verified',
            'created_at',
        ]


class OrganizationMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'description',
            'logo',
            'website',
            'contact_email',
            'address',
            'rating',
            'is_verified',
            'created_at',
        ]
        read_only_fields = ['rating', 'is_verified', 'created_at']


class OrganizationSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'rating']


class VolunteerSummarySerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = ['id', 'user', 'rating', 'is_active']


class EventSerializer(serializers.ModelSerializer):
    organization = OrganizationSummarySerializer(read_only=True)
    approved_count = serializers.IntegerField(read_only=True)
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'organization',
            'title',
            'description',
            'start_date',
            'end_date',
            'location',
            'required_volunteers',
            'status',
            'status_label',
            'latitude',
            'longitude',
            'created_at',
            'approved_count',
        ]

    def get_status_label(self, obj):
        return obj.get_status_display_with_details()


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'start_date',
            'end_date',
            'location',
            'required_volunteers',
            'status',
            'latitude',
            'longitude',
        ]


class EventSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'start_date',
            'end_date',
            'status',
        ]


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    volunteer = VolunteerSummarySerializer(read_only=True)
    event = EventSummarySerializer(read_only=True)
    can_volunteer_cancel = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerApplication
        fields = [
            'id',
            'volunteer',
            'event',
            'status',
            'applied_at',
            'cancelled_at',
            'no_show_marked',
            'absence_reason_document',
            'absence_reason_comment',
            'absence_reason_approved',
            'can_volunteer_cancel',
        ]

    def get_can_volunteer_cancel(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.user_type != 'volunteer':
            return False
        if obj.volunteer.user_id != request.user.id:
            return False
        return obj.can_be_cancelled_by_volunteer()


class VolunteerReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    event_details = EventSummarySerializer(source='event', read_only=True)

    class Meta:
        model = VolunteerReview
        fields = [
            'id',
            'volunteer',
            'organization',
            'event',
            'event_details',
            'rating',
            'positive_comment',
            'negative_comment',
            'improvement_comment',
            'created_at',
        ]
        read_only_fields = ['created_at', 'organization']


class OrganizationReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    event_details = EventSummarySerializer(source='event', read_only=True)

    class Meta:
        model = OrganizationReview
        fields = [
            'id',
            'organization',
            'volunteer',
            'event',
            'event_details',
            'rating',
            'positive_comment',
            'negative_comment',
            'improvement_comment',
            'created_at',
        ]
        read_only_fields = ['created_at', 'volunteer']


class InitiativeSerializer(serializers.ModelSerializer):
    volunteer = VolunteerSummarySerializer(read_only=True)
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Initiative
        fields = [
            'id',
            'volunteer',
            'title',
            'description',
            'image',
            'status',
            'status_label',
            'created_at',
            'updated_at',
        ]

    def get_status_label(self, obj):
        return obj.get_status_display()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPE_CHOICES)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)

    # Volunteer fields
    skills = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    # Organization fields
    name = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        user_type = attrs.get('user_type')
        if user_type == 'organization' and not attrs.get('name'):
            raise serializers.ValidationError({'name': 'Название организации обязательно.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user_type = validated_data.pop('user_type')

        volunteer_fields = {
            'skills': validated_data.pop('skills', ''),
            'experience': validated_data.pop('experience', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
        }

        organization_fields = {
            'name': validated_data.pop('name', ''),
            'description': validated_data.pop('description', ''),
            'website': validated_data.pop('website', ''),
            'contact_email': validated_data.pop('contact_email', ''),
            'address': validated_data.pop('address', ''),
        }

        with transaction.atomic():
            user = CustomUser(**validated_data, user_type=user_type)
            user.set_password(password)
            user.save()

            if user_type == 'volunteer':
                VolunteerProfile.objects.create(user=user, **volunteer_fields)
            else:
                Organization.objects.create(user=user, **organization_fields)

        return user


class MeSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'user_type',
            'phone',
            'avatar',
            'bio',
            'city',
            'is_verified',
            'created_at',
            'profile',
        ]

    def get_profile(self, obj):
        if obj.user_type == 'volunteer':
            profile = VolunteerProfile.objects.filter(user=obj).first()
            return VolunteerProfileMeSerializer(profile).data if profile else None
        if obj.user_type == 'organization':
            organization = Organization.objects.filter(user=obj).first()
            return OrganizationMeSerializer(organization).data if organization else None
        return None


class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'link',
            'created_at',
            'read_at',
            'is_read',
        ]

    def get_is_read(self, obj):
        return obj.is_read
