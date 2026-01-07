from rest_framework import serializers
from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication,
    VolunteerReview,
    OrganizationReview
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'password',
            'user_type',
            'phone',
            'avatar',
            'bio',
            'city',
            'is_verified',
            'created_at',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_verified': {'read_only': True},
            'created_at': {'read_only': True},
        }

    # НАЧАЛО ИЗМЕНЕНИЯ: сохранение user_type только при создании
    def create(self, validated_data):
        password = validated_data.pop('password')
        user_type = validated_data.pop('user_type')

        user = CustomUser(**validated_data, user_type=user_type)
        user.set_password(password)
        user.save()
        return user
    # КОНЕЦ ИЗМЕНЕНИЯ: сохранение user_type только при создании


class VolunteerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = '__all__'
        read_only_fields = ['user', 'rating', 'created_at']


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['user', 'rating', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['organization', 'created_at']


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = '__all__'
        read_only_fields = ['volunteer', 'status', 'applied_at']


class VolunteerReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = VolunteerReview
        fields = '__all__'


class OrganizationReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = OrganizationReview
        fields = '__all__'
