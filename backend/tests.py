# Test discovery starts at the project root and skips the non-package src/
# directory, so re-export the tests that live with the api app.
from api.tests import TicketApiTests  # noqa: F401
