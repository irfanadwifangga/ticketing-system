from django.db.models import Case, IntegerField, Q, Value, When
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Ticket
from .serializers import TicketSerializer


PRIORITY_ORDER = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "urgent": 4,
}


class TicketPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        if not self.page_size_query_param:
            return self.page_size
        raw = request.query_params.get(self.page_size_query_param)
        if raw is None:
            return self.page_size
        try:
            value = int(raw)
        except (TypeError, ValueError):
            return self.page_size
        if value <= 0:
            return self.page_size
        if self.max_page_size is not None:
            return min(value, self.max_page_size)
        return value


STATUSES = {choice[0] for choice in Ticket.Status.choices}
PRIORITIES = {choice[0] for choice in Ticket.Priority.choices}
CATEGORIES = {choice[0] for choice in Ticket.Category.choices}

ALLOWED_ORDERING = {
    "created_at",
    "-created_at",
    "title",
    "-title",
    "priority",
    "-priority",
    "updated_at",
    "-updated_at",
}


class TicketViewSet(ModelViewSet):
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()
    pagination_class = TicketPagination

    def _validate_filters(self, params):
        errors = {}
        status_value = params.get("status")
        priority_value = params.get("priority")
        category_value = params.get("category")
        if status_value and status_value not in STATUSES:
            errors["status"] = [f'"{status_value}" is not a valid choice.']
        if priority_value and priority_value not in PRIORITIES:
            errors["priority"] = [f'"{priority_value}" is not a valid choice.']
        if category_value and category_value not in CATEGORIES:
            errors["category"] = [f'"{category_value}" is not a valid choice.']
        if errors:
            raise ValidationError(errors)

    def get_queryset(self):
        queryset = Ticket.objects.all()
        request: Request = self.request
        params = request.query_params

        self._validate_filters(params)

        status = params.get("status")
        priority = params.get("priority")
        category = params.get("category")
        assignee = params.get("assignee")
        requester = params.get("requester")
        search = params.get("search")
        ordering = params.get("ordering")

        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category=category)
        if assignee:
            queryset = queryset.filter(assignee_name__icontains=assignee)
        if requester:
            queryset = queryset.filter(
                Q(requester_name__icontains=requester)
                | Q(requester_email__icontains=requester)
            )
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(requester_name__icontains=search)
                | Q(requester_email__icontains=search)
                | Q(assignee_name__icontains=search)
            )

        queryset = queryset.annotate(
            _priority_order=Case(
                *[When(priority=key, then=Value(value)) for key, value in PRIORITY_ORDER.items()],
                default=Value(0),
                output_field=IntegerField(),
            )
        )

        if ordering:
            if ordering not in ALLOWED_ORDERING:
                raise ValidationError({"ordering": ["Unsupported ordering field."]})
            order_field = ordering
            if ordering == "priority":
                order_field = "_priority_order"
            elif ordering == "-priority":
                order_field = "-_priority_order"
            queryset = queryset.order_by(order_field, "-id")
        else:
            queryset = queryset.order_by("-created_at", "-id")

        return queryset

    def stats(self, request):
        from django.db.models import Count

        queryset = Ticket.objects.all()
        total = queryset.count()
        by_status = {choice[0]: 0 for choice in Ticket.Status.choices}
        for row in queryset.values("status").annotate(count=Count("id")):
            by_status[row["status"]] = row["count"]
        return Response({"total": total, "by_status": by_status})
