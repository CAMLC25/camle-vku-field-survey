# VKU Field Survey — Backend REST API Specification

Base URL: `http://localhost:3001` (or configured server endpoint)

---

## 1. Health Check

### `GET /api/health`
Checks server status and readiness.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "VKU Field Survey Backend",
  "timestamp": "2026-09-14T00:45:00.000Z"
}
```

---

## 2. List Synchronized Surveys

### `GET /api/surveys`
Returns all inspections that have been synchronized with the cloud backend.

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "e7b0a8a1-7c98-4235-a134-8c8872b7a44f",
      "building": "Building K",
      "floor": "2nd Floor",
      "room": "K.204",
      "category": "Projector",
      "condition": 2,
      "defectNotes": "Bulb lumen degraded, intermittent HDMI signal loss",
      "photoUrl": "/uploads/photo-1789321874086-402243482.jpg",
      "createdAt": "2026-09-14T00:30:12.112Z",
      "updatedAt": "2026-09-14T00:30:12.112Z",
      "serverSyncedAt": "2026-09-14T00:32:05.450Z"
    }
  ]
}
```

---

## 3. Create / Synchronize Survey

### `POST /api/surveys`
Accepts a survey record along with an optional multipart image file.

**Content-Type**: `multipart/form-data`

#### Form Fields:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUIDv4) | **Yes** | Client-generated UUID used as idempotency key |
| `building` | `string` | **Yes** | Campus building name (e.g., `Building K`) |
| `floor` | `string` | **Yes** | Floor name/number (e.g., `2nd Floor`) |
| `room` | `string` | **Yes** | Room code (e.g., `K.204`) |
| `category` | `string` | **Yes** | Equipment category (`Hardware`, `Projector`, `AC`, `Electrical`, `Furniture`) |
| `condition`| `number` (1-5) | **Yes** | Condition rating from 1 (Critical) to 5 (Excellent) |
| `defectNotes`| `string` | No | Inspection notes or description of defect |
| `createdAt`| `string` (ISO 8601)| **Yes** | Timestamp when the survey was recorded offline |
| `updatedAt`| `string` (ISO 8601)| **Yes** | Timestamp of last modification |
| `photo` | `File / Blob` | No | Compressed JPEG image file |

#### Responses:

**Success (First submission) — `201 Created`**:
```json
{
  "success": true,
  "id": "e7b0a8a1-7c98-4235-a134-8c8872b7a44f",
  "message": "Survey synced successfully",
  "data": { ... }
}
```

**Idempotent Duplicate Submission — `200 OK`**:
```json
{
  "success": true,
  "id": "e7b0a8a1-7c98-4235-a134-8c8872b7a44f",
  "message": "Survey already exists on server (idempotent)",
  "data": { ... }
}
```

**Validation Error — `400 Bad Request`**:
```json
{
  "success": false,
  "error": "Missing required survey fields: id, building, floor, room, category, condition"
}
```

---

## 4. Idempotency Implementation
Because field networks frequently fail during TCP close or HTTP ACK reception, the mobile client may send duplicate POST requests for the same survey. 
The backend server inspects the incoming `id` parameter:
- If a record with that `id` already exists, the server immediately returns `200 OK` without duplicating database entries or overwriting previous images.
- This satisfies RFC 7231 idempotency requirements and prevents data corruption.
