from django.db import models


class Ticket(models.Model):
    class Category(models.TextChoices):
        HARDWARE = "hardware", "Hardware"
        SOFTWARE = "software", "Software"
        NETWORK = "network", "Network"
        ACCESS = "access", "Access"
        ACCOUNT = "account", "Account"
        PRINTING = "printing", "Printing"
        OTHER = "other", "Other"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        WAITING_CUSTOMER = "waiting_customer", "Waiting Customer"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    requester_name = models.CharField(max_length=255, blank=True, default="")
    requester_email = models.EmailField(blank=True, default="")
    assignee_name = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
