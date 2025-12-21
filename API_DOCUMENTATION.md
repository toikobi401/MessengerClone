# 📡 API Documentation - Messenger Clone

Complete API documentation cho Messenger Clone Backend.

---

## 🔗 Base URL

```
http://localhost:5000/api
```

---

## 🔐 Authentication

Hầu hết các endpoints yêu cầu JWT token trong header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📚 Endpoints

### **1. Authentication Endpoints**

#### 🟢 POST `/api/auth/register`

Đăng ký user mới.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarImage": "",
      "isAvatarImageSet": false,
      "createdAt": "2024-12-21T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, username/email exists)
- `500` - Server error

---

#### 🟢 POST `/api/auth/login`

Đăng nhập user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarImage": "",
      "isAvatarImageSet": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Missing fields
- `401` - Invalid credentials
- `500` - Server error

---

#### 🟢 GET `/api/auth/allusers/:id`

Lấy danh sách tất cả users (contacts) ngoại trừ current user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path) - Current user ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "username": "user1",
      "email": "user1@example.com",
      "avatarImage": "https://...",
      "isAvatarImageSet": true
    },
    {
      "id": "uuid-2",
      "username": "user2",
      "email": "user2@example.com",
      "avatarImage": "",
      "isAvatarImageSet": false
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized (no token)
- `500` - Server error

---

#### 🟢 POST `/api/auth/setavatar/:id`

Cập nhật avatar cho user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path) - User ID

**Request Body:**
```json
{
  "image": "https://api.multiavatar.com/johndoe.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "isSet": true,
    "image": "https://api.multiavatar.com/johndoe.png"
  }
}
```

**Errors:**
- `400` - No image provided
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### **2. Message Endpoints**

#### 🟢 POST `/api/messages/addmsg`

Gửi message mới.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "from": "sender-user-id",
  "to": "receiver-user-id",
  "message": "Hello, how are you?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "id": "message-uuid",
    "message": "Hello, how are you?",
    "users": ["sender-id", "receiver-id"],
    "senderId": "sender-id",
    "createdAt": "2024-12-21T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing fields
- `401` - Unauthorized
- `500` - Server error

---

#### 🟢 POST `/api/messages/getmsg`

Lấy lịch sử chat giữa 2 users.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "from": "current-user-id",
  "to": "other-user-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-1",
      "message": "Hi there!",
      "fromSelf": true,
      "senderId": "current-user-id",
      "createdAt": "2024-12-21T10:00:00.000Z",
      "sender": {
        "id": "current-user-id",
        "username": "johndoe",
        "avatarImage": "https://..."
      }
    },
    {
      "id": "msg-2",
      "message": "Hello!",
      "fromSelf": false,
      "senderId": "other-user-id",
      "createdAt": "2024-12-21T10:01:00.000Z",
      "sender": {
        "id": "other-user-id",
        "username": "janedoe",
        "avatarImage": "https://..."
      }
    }
  ]
}
```

**Errors:**
- `400` - Missing fields
- `401` - Unauthorized
- `500` - Server error

---

### **3. Health Check**

#### 🟢 GET `/health`

Kiểm tra server status.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-21T10:00:00.000Z"
}
```

---

## 🔌 Socket.io Events

### **Client → Server Events**

#### `add-user`

Đăng ký user là online.

**Emit:**
```javascript
socket.emit('add-user', userId);
```

---

#### `send-msg`

Gửi message real-time.

**Emit:**
```javascript
socket.emit('send-msg', {
  to: 'receiver-user-id',
  from: 'sender-user-id',
  msg: 'Hello!'
});
```

---

#### `typing`

Thông báo đang typing.

**Emit:**
```javascript
socket.emit('typing', {
  to: 'receiver-user-id',
  from: 'sender-user-id',
  isTyping: true
});
```

---

### **Server → Client Events**

#### `msg-recieve`

Nhận message từ người khác.

**Listen:**
```javascript
socket.on('msg-recieve', (data) => {
  // data = { from: 'sender-id', message: 'Hello!' }
  console.log('New message:', data);
});
```

---

#### `online-users`

Nhận danh sách users online.

**Listen:**
```javascript
socket.on('online-users', (users) => {
  // users = ['user-id-1', 'user-id-2', ...]
  console.log('Online users:', users);
});
```

---

#### `user-typing`

Nhận thông báo user đang typing.

**Listen:**
```javascript
socket.on('user-typing', (data) => {
  // data = { from: 'user-id', isTyping: true }
  console.log('User typing:', data);
});
```

---

## 🔒 Error Response Format

Tất cả errors trả về format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (only in development)"
}
```

---

## 📋 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🧪 Testing với cURL

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"123456"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Get Users (with token):
```bash
curl -X GET http://localhost:5000/api/auth/allusers/<user-id> \
  -H "Authorization: Bearer <your-token>"
```

---

## 📝 Notes

1. **JWT Token** expires sau 7 ngày (có thể config trong `.env`)
2. **Password** được hash với bcrypt (10 rounds)
3. **Messages** được lưu persistent trong MySQL
4. **Socket.io** tự động reconnect khi mất kết nối

---

## 🔗 Related Documentation

- [Installation Guide](./INSTALLATION.md)
- [Main README](./README.md)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Happy Coding! 🚀**
