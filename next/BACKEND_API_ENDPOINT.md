# Backend API Endpoint: Update User

## Endpoint Details

**Route:** `PUT /admin/users`  
**Authentication:** Required (Admin token)  
**Middleware:** `isAdmin`  

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

### Request Body
```json
{
  "_id": "string (required)",
  "name": "string (required)",
  "last_name": "string (optional)",
  "mobile": "string (required)",
  "email": "string (required)",
  "verified": "boolean (required)"
}
```

## Response Format

### Success Response (200)
```json
{
  "status": 200,
  "message": "User updated successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "last_name": "string",
    "mobile": "string",
    "email": "string",
    "verified": "boolean",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  }
}
```

### Error Response (400/401/404/500)
```json
{
  "status": 400,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

## Backend Implementation Example

Here's an example of how the `updateUser` function should be implemented in your backend:

```javascript
// Example implementation (Node.js/Express with MongoDB)
const updateUser = async (req, res) => {
  try {
    const { _id, name, last_name, mobile, email, verified } = req.body;
    
    // Validate required fields
    if (!_id || !name || !mobile || !email) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: _id, name, mobile, email"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid email format"
      });
    }

    // Check if user exists
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found"
      });
    }

    // Check if email is already taken by another user
    const emailExists = await User.findOne({ 
      email, 
      _id: { $ne: _id } 
    });
    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        last_name,
        mobile,
        email,
        verified,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Route definition
router.put('/users', isAdmin, updateUser);
```

## Frontend Integration

The frontend has been updated to include:

1. **Edit Modal**: A modal form for editing user information
2. **API Utility**: `updateUser` function in `/src/utils/adminApi.ts`
3. **User Interface**: Edit button in the users table
4. **Error Handling**: Proper error handling and user feedback

## Security Considerations

1. **Authentication**: Ensure only authenticated admins can access this endpoint
2. **Authorization**: Verify the admin has permission to update users
3. **Input Validation**: Validate all input fields on the backend
4. **Email Uniqueness**: Ensure email addresses remain unique across users
5. **Data Sanitization**: Sanitize input data to prevent injection attacks

## Testing

Test the endpoint with:

```bash
curl -X PUT http://localhost:3334/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "_id": "user_id_here",
    "name": "John",
    "last_name": "Doe",
    "mobile": "1234567890",
    "email": "john.doe@example.com",
    "verified": true
  }'
```

## Notes

- The frontend expects the API to be available at `${process.env.NEXT_PUBLIC_API_PATH}/admin/users`
- The endpoint should handle both partial and full updates
- Consider implementing audit logging for user updates
- Ensure proper error messages are returned for debugging 