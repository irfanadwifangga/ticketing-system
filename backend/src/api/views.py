from django.db.models import Q
from rest_framework import viewsets
from rest_framework.request import Request

from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()

    def get_queryset(self):
        queryset = Ticket.objects.all()
        request: Request = self.request
        status = request.query_params.get("status")
        priority = request.query_params.get("priority")
        category = request.query_params.get("category")
        assignee = request.query_params.get("assignee")
        requester = request.query_params.get("requester")

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
        return queryset
