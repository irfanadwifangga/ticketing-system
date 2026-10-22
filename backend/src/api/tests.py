from django.test import TestCase
from rest_framework.test import APIClient

from .models import Ticket


class TicketApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/tickets/"

    def test_priority_ordering_is_ordinal(self):
        for priority in (
            Ticket.Priority.LOW,
            Ticket.Priority.MEDIUM,
            Ticket.Priority.HIGH,
            Ticket.Priority.URGENT,
        ):
            Ticket.objects.create(
                title=f"Ticket {priority}",
                description="Test ticket",
                priority=priority,
            )

        response = self.client.get(self.url, {"ordering": "priority"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["priority"] for item in response.data["results"]],
            ["low", "medium", "high", "urgent"],
        )

        response = self.client.get(self.url, {"ordering": "-priority"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["priority"] for item in response.data["results"]],
            ["urgent", "high", "medium", "low"],
        )

    def test_page_size_handling(self):
        Ticket.objects.bulk_create(
            [
                Ticket(title=f"Ticket {index}", description="Test ticket")
                for index in range(150)
            ]
        )

        response = self.client.get(self.url, {"page_size": 500})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 100)

        response = self.client.get(self.url, {"page_size": 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 10)

        response = self.client.get(self.url, {"page_size": "abc"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 10)

    def test_invalid_enum_filter_returns_400(self):
        response = self.client.get(self.url, {"status": "foo"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("status", response.data)
