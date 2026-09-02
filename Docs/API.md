# API Reference

All endpoints are under `/api/`. Protected routes require a valid JWT session cookie.

## Auth

### POST /api/register

Create a new account.

**Request:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully.",
  "userId": "abc123"
}
```

**Errors:**
- `400` — Validation failed (short password, invalid email, passwords don't match)
- `409` — Email already exists
- `500` — Server error

---

## Expenses

### GET /api/expenses

List expenses with filters and pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | — | Filter by description (case-insensitive) |
| category | string | — | Filter by category name |
| startDate | string | — | Filter from date (YYYY-MM-DD) |
| endDate | string | — | Filter to date (YYYY-MM-DD) |
| sortBy | string | `date` | Sort field: `date` or `amount` |
| sortOrder | string | `desc` | Sort direction: `asc` or `desc` |
| page | number | `1` | Page number |
| limit | number | `20` | Results per page (max 100) |

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "...",
      "userId": "...",
      "amount": 450,
      "description": "Swiggy Food Order",
      "category": "Food",
      "date": "2026-08-01T00:00:00.000Z",
      "source": "manual",
      "createdAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### POST /api/expenses

Create a new expense.

**Request:**
```json
{
  "amount": 450,
  "description": "Swiggy Food Order",
  "category": "Food",
  "date": "2026-08-01",
  "notes": "Lunch with team"
}
```

**Response (201):** Returns the created expense object.

### GET /api/expenses/[id]

Get a single expense by ID. Returns 404 if not found or not owned by the user.

### PUT /api/expenses/[id]

Update an expense. All fields are optional (partial update).

**Request:**
```json
{
  "amount": 500,
  "notes": "Updated notes"
}
```

### DELETE /api/expenses/[id]

Delete an expense. Returns `200` on success.

---

## Categories

### GET /api/categories

List all categories for the authenticated user.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "...",
      "name": "Food",
      "color": "#F59E0B",
      "icon": "UtensilsCrossed",
      "isDefault": true
    }
  ]
}
```

### POST /api/categories

Create a custom category.

**Request:**
```json
{
  "name": "Pets",
  "color": "#A855F7",
  "icon": "Dog"
}
```

### DELETE /api/categories/[id]

Delete a custom category. Default categories cannot be deleted (`400`).

---

## Analytics

### GET /api/analytics

**Query Parameters:**
| Type | Description |
|------|-------------|
| `overview` | Default. Returns stats, comparison, categories, daily data |
| `monthly` | Monthly totals for last 6 months |
| `categories` | Category breakdown for a month |
| `daily` | Daily totals for N days |
| `comparison` | Current vs previous month |
| `insights` | AI-like spending insights |

---

## Settings

### GET /api/settings

Get the authenticated user's profile.

### PATCH /api/settings

Update profile or password.

**Type: profile**
```json
{
  "type": "profile",
  "name": "John Doe",
  "currency": "USD"
}
```

**Type: password**
```json
{
  "type": "password",
  "currentPassword": "oldpass",
  "newPassword": "newpass123",
  "confirmNewPassword": "newpass123"
}
```

### DELETE /api/settings

Delete the user account and all related data.

---

## Import

### POST /api/import/upload

Upload a CSV file for parsing. Send as `multipart/form-data` with field name `file`.

**Response (200):**
```json
{
  "transactions": [
    {
      "date": "2026-08-01",
      "description": "Swiggy Food Order",
      "amount": 450,
      "category": "Food",
      "isDuplicate": false,
      "selected": true
    }
  ],
  "count": 15,
  "errors": [],
  "detectedColumns": {
    "date": "Date",
    "description": "Description",
    "amount": "Debit"
  }
}
```

### POST /api/import/confirm

Confirm and import selected transactions.

**Request:**
```json
{
  "fileName": "statement.csv",
  "transactions": [
    {
      "date": "2026-08-01",
      "description": "Swiggy Food Order",
      "amount": 450,
      "category": "Food",
      "selected": true
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Successfully imported 15 transactions.",
  "statementId": "...",
  "count": 15
}
```
