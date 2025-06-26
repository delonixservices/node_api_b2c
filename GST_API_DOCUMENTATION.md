# GST Details API Documentation

This document describes the GST (Goods and Services Tax) details API endpoints for managing GST information.

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Create GST Details
**POST** `/gst-details`

Creates a new GST detail record.

#### Request Body
```json
{
  "gstnumber": "22AAAAA0000A1Z5",
  "name": "Company Name",
  "email": "company@example.com",
  "address": "123 Business Street",
  "city": "Mumbai",
  "pincode": "400001",
  "state": "Maharashtra",
  "mobile": "9876543210"
}
```

#### Validation Rules
- **GST Number**: Must be a valid 15-character GST number format (2 digits + 5 letters + 4 digits + 1 letter + 1 digit + 'Z' + 1 digit/letter)
- **Email**: Must be a valid email format
- **Mobile**: Must be exactly 10 digits
- **Pincode**: Must be exactly 6 digits
- All fields are required

#### Response
```json
{
  "success": 1,
  "message": "GST details saved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "gstnumber": "22AAAAA0000A1Z5",
    "name": "Company Name",
    "email": "company@example.com",
    "address": "123 Business Street",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "mobile": "9876543210",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z"
  }
}
```

### 2. Get GST Details
**GET** `/gst-details/:gstnumber`

Retrieves GST details by GST number.

#### Parameters
- `gstnumber` (path parameter): The GST number to search for

#### Response
```json
{
  "success": 1,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "gstnumber": "22AAAAA0000A1Z5",
    "name": "Company Name",
    "email": "company@example.com",
    "address": "123 Business Street",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "mobile": "9876543210",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z"
  }
}
```

#### Error Response (404)
```json
{
  "success": 0,
  "message": "GST details not found"
}
```

### 3. Update GST Details
**PUT** `/gst-details/:gstnumber`

Updates existing GST details.

#### Parameters
- `gstnumber` (path parameter): The GST number to update

#### Request Body
```json
{
  "name": "Updated Company Name",
  "email": "updated@example.com",
  "address": "456 New Business Street",
  "city": "Delhi",
  "pincode": "110001",
  "state": "Delhi",
  "mobile": "9876543211"
}
```

#### Response
```json
{
  "success": 1,
  "message": "GST details updated successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "gstnumber": "22AAAAA0000A1Z5",
    "name": "Updated Company Name",
    "email": "updated@example.com",
    "address": "456 New Business Street",
    "city": "Delhi",
    "pincode": "110001",
    "state": "Delhi",
    "mobile": "9876543211",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T11:00:00.000Z"
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request**: Validation errors (invalid format, missing fields)
- **404 Not Found**: GST details not found
- **409 Conflict**: GST number already exists
- **500 Internal Server Error**: Server errors

## Example Usage

### Using cURL

#### Create GST Details
```bash
curl -X POST http://localhost:3000/api/gst-details \
  -H "Content-Type: application/json" \
  -d '{
    "gstnumber": "22AAAAA0000A1Z5",
    "name": "Test Company",
    "email": "test@company.com",
    "address": "123 Test Street",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "mobile": "9876543210"
  }'
```

#### Get GST Details
```bash
curl -X GET http://localhost:3000/api/gst-details/22AAAAA0000A1Z5
```

#### Update GST Details
```bash
curl -X PUT http://localhost:3000/api/gst-details/22AAAAA0000A1Z5 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Company",
    "email": "updated@company.com"
  }'
```

## Database Schema

The GST details are stored in the `gstDetails` collection with the following schema:

```javascript
{
  gstnumber: String (required, unique),
  name: String (required),
  email: String (required),
  address: String (required),
  city: String (required),
  pincode: String (required),
  state: String (required),
  mobile: String (required),
  created_at: Date,
  updated_at: Date
}
``` 