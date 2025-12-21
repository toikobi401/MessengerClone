# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy Messenger Clone trong 5 phút!

---

## 🎯 Prerequisites

Đảm bảo bạn đã cài đặt:
- ✅ Node.js (v18+)
- ✅ MySQL (v8+)
- ✅ npm

---

## 🚀 Cài đặt nhanh

### **1. Clone & Setup Database**

```bash
# Clone repo
git clone https://github.com/yourusername/MessengerClone.git
cd MessengerClone

# Tạo database MySQL
mysql -u root -p
CREATE DATABASE messenger_clone;
exit;
```

---

### **2. Backend Setup**

```bash
cd server
npm install

# Tạo .env file
echo "PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=messenger_clone
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=messenger_secret_2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173" > .env

# Chạy server
npm run dev
```

✅ Server running on http://localhost:5000

---

### **3. Frontend Setup**

Mở terminal mới:

```bash
cd client
npm install

# Tạo .env file
echo "VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000" > .env

# Chạy client
npm run dev
```

✅ Client running on http://localhost:5173

---

## 🎮 Sử dụng

1. Mở http://localhost:5173
2. **Register** 2 accounts:
   - User 1: `user1@test.com` / `123456`
   - User 2: `user2@test.com` / `123456`
3. **Login** với User 1
4. **Chat** với User 2!

---

## 🐛 Lỗi thường gặp?

### MySQL không kết nối được:
```bash
# Kiểm tra MySQL đang chạy
net start MySQL80  # Windows
sudo service mysql start  # Linux/Mac
```

### Port đã được sử dụng:
```bash
# Kill process on port 5000
netstat -ano | findstr :5000  # Windows
lsof -ti:5000 | xargs kill -9  # Mac/Linux
```

---

## 📚 Tài liệu chi tiết

- 📖 [Full README](./README.md)
- 📦 [Installation Guide](./INSTALLATION.md)
- 📡 [API Documentation](./API_DOCUMENTATION.md)

---

## ✨ Features

- ⚡ Real-time messaging
- 🟢 Online status
- 💬 Message history
- 😊 Emoji support
- 🎨 Modern UI

---

**Enjoy your Messenger Clone! 🎉**
