# Backend API Contract (A0, revised)

Source of truth: `backend/src/api/models.py`, `backend/src/api/serializers.py`, `backend/src/api/views.py`, `backend/src/api/urls.py`, `backend/src/backend/urls.py`, `backend/src/backend/settings.py`.

Base server: `http://127.0.0.1:8000/` in local development.

## Health

- `GET /health/`
- Response `200`:
  ```json
  { "status": "ok" }
  ```

## Tickets resource

Resource base: `/api/tickets/`

### Fields

| Field | Type | Required | Read-only | Default | Rules |
|---|---|---|---|---|---|
| `id` | integer | no | yes | — | Auto-generated primary key. |
| `title` | string | yes | no | — | Min/Max 255 chars. |
| `description` | string | yes | no | — | Free text. |
| `category` | string (enum) | no | no | `other` | Exact value from Category list. |
| `priority` | string (enum) | no | no | `medium` | Exact value from Priority list. |
| `status` | string (enum) | no | no | `open` | Exact value from Status list. |
| `requester_name` | string | no | no | `""` | Max 255 chars. |
| `requester_email` | string (email) | no | no | `""` | May be empty; when filled, valid email. |
| `assignee_name` | string | no | no | `""` | Max 255 chars. |
| `created_at` | datetime | no | yes | — | Set on creation. |
| `updated_at` | datetime | no | yes | — | Set on creation/update. |

### Category values

- `hardware` — Hardware
- `software` — Software
- `network` — Network
- `access` — Access
- `account` — Account
- `printing` — Printing
- `other` — Other

### Priority values

- `low` — Low
- `medium` — Medium
- `high` — High
- `urgent` — Urgent

### Status values

- `open` — Open
- `in_progress` — In Progress
- `waiting_customer` — Waiting Customer
- `resolved` — Resolved
- `closed` — Closed

### Query filters (all optional, exact case-sensitive unless noted)

Existing filters (current behavior):
- `status`
- `priority`
- `category`
- `assignee` — case-insensitive contains match against `assignee_name`
- `requester` — case-insensitive contains match against `requester_name` or `requester_email`

Target filters/search/order/pagination:
- `search` or `q` — case-insensitive contains match across `title`, `description`, `requester_name`, `requester_email`, `assignee_name`.
- `ordering` — server side ordering with allowlist.
- `page` — page number, starts at 1.
- `page_size` — number of items per page, default 10, maximum 100.

All filters/search/order/page can be combined with AND semantics.

### Allowlist and priority mapping
- Allowed `ordering`: `created_at`, `-created_at`, `priority`, `-priority`, `title`, `-title`, `status`, `-status`, `updated_at`, `-updated_at`.
- `priority` is stored as string, but server must map it logically: low=1, medium=2, high=3, urgent=4.
- Invalid ordering value returns `400`.
- Invalid query syntax/unsupported value returns `400`.
- `invalid page` behavior: if `page` <= 0 returns `400`; if page beyond available range returns `404`.

### Endpoints (target)

- `GET /api/tickets/` — list tickets, paginated.
- `GET /api/tickets/{id}/` — retrieve a ticket.
- `POST /api/tickets/` — create a ticket from writeable fields.
- `PUT /api/tickets/{id}/` — full replace (all required writeable fields must be present).
- `PATCH /api/tickets/{id}/` — partial update allowed.
- `DELETE /api/tickets/{id}/` — delete (`204` no content).
- `GET /api/tickets/stats/` — aggregate counts per status (target addition).

### Current response (as-is)

```json
[
  {
    "id": 1,
    "title": "Printer not working",
    ...
  }
]
```

### Target paginated list response

```json
{
  "count": 120,
  "next": "http://127.0.0.1:8000/api/tickets/?page=2&page_size=10&ordering=-created_at",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Printer not working",
      "description": "Office printer shows paper jam but tray is empty.",
      "category": "printing",
      "priority": "medium",
      "status": "open",
      "requester_name": "Jane Doe",
      "requester_email": "jane@example.com",
      "assignee_name": "",
      "created_at": "2026-10-20T08:00:00Z",
      "updated_at": "2026-10-20T08:00:00Z"
    }
  ]
}
```

### Stats response (target)

```json
{
  "total": 50,
  "by_status": {
    "open": 10,
    "in_progress": 5,
    "waiting_customer": 3,
    "resolved": 20,
    "closed": 12
  }
}
```

### Example single ticket

```json
{
  "id": 1,
  "title": "Printer not working",
  "description": "Office printer shows paper jam but tray is empty.",
  "category": "printing",
  "priority": "medium",
  "status": "open",
  "requester_name": "Jane Doe",
  "requester_email": "jane@example.com",
  "assignee_name": "",
  "created_at": "2026-10-20T08:00:00Z",
  "updated_at": "2026-10-20T08:00:00Z"
}
```

### Create request example

```json
{
  "title": "Printer not working",
  "description": "Office printer shows paper jam but tray is empty.",
  "category": "printing",
  "priority": "medium",
  "status": "open",
  "requester_name": "Jane Doe",
  "requester_email": "jane@example.com",
  "assignee_name": ""
}
```

### Error format

Field errors `400 Bad Request`:

```json
{
  "title": ["This field is required."],
  "priority": ["\"urgent\" is not a valid choice."]
}
```

Validation errors may also include non-field error key `non_field_errors` when appropriate.

Invalid ordering `400 Bad Request`:

```json
{
  "ordering": ["Unsupported ordering field."]
}
```

Missing ticket `404 Not Found`:

```json
{
  "detail": "Not found."
}
```

Page out of range (valid number but beyond available pages):
- `404 Not Found`
- Body: `{ "detail": "Invalid page." }`

Invalid page parameter:
- `400 Bad Request`
- Body: `{ "detail": "Page number must be a positive integer." }`

### Field rules
- `title`, `description` required.
- `category`, `priority`, `status` optional; default `other`, `medium`, `open`.
- `priority` must be one of `low`, `medium`, `high`, `urgent`.
- `requester_email` may be empty string; if provided, must be valid email.
- `requester_name`, `assignee_name` may be empty strings.
- `PUT` must include all required writeable fields.
- `PATCH` may include any subset of writeable fields.
- `created_at`, `updated_at`, `id` must not be written by client (read-only).
- Default ordering for list: `-created_at`, tie-break by `-id` for stable pagination.

### Combined filter rules
- Filters `status`, `priority`, `category`, `assignee`, `requester`, `search` are combined with logical AND.
- Example:
  `GET /api/tickets/?status=open&priority=high&search=printer`

## API documentation
- `GET /api/schema/` — OpenAPI schema
- `GET /api/schema/swagger-ui/` — Swagger UI
- `GET /api/docs/` — Scalar API reference