from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOrganization(BasePermission):
    """
    Доступ только для пользователей с типом organization
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.user_type == 'organization'
        )


class IsVolunteer(BasePermission):
    """
    Доступ только для пользователей с типом volunteer
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.user_type == 'volunteer'
        )
