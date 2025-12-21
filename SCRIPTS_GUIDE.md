# 🎮 Development Scripts Guide

Hướng dẫn sử dụng các scripts có sẵn trong project.

---

## 📦 Root Level Scripts

Từ thư mục root `MessengerClone/`, bạn có thể chạy:

### **Install all dependencies**
```bash
npm run install:all
```
Cài đặt dependencies cho cả client và server cùng lúc.

---

### **Run both servers concurrently** ⭐ RECOMMENDED
```bash
npm run dev
```
Chạy cả Backend (port 5000) và Frontend (port 5173) cùng lúc trong một terminal.

**Output:**
```
[server] ✅ Server is running on port 5000
[client] ➜  Local:   http://localhost:5173/
```

---

### **Run server only**
```bash
npm run dev:server
```
Chỉ chạy Backend development server.

---

### **Run client only**
```bash
npm run dev:client
```
Chỉ chạy Frontend development server.

---

### **Build for production**
```bash
npm run build
```
Build Frontend cho production (output trong `client/dist/`).

---

### **Start production server**
```bash
npm start
```
Chạy Backend trong production mode.

---

## 🖥️ Server (Backend) Scripts

Từ thư mục `server/`:

### **Development mode** (với auto-reload)
```bash
npm run dev
```
Sử dụng nodemon, tự động restart khi có thay đổi.

---

### **Production mode**
```bash
npm start
```
Chạy server production không auto-reload.

---

### **Install dependencies**
```bash
npm install
```

---

## 💻 Client (Frontend) Scripts

Từ thư mục `client/`:

### **Development mode**
```bash
npm run dev
```
Chạy Vite dev server với HMR (Hot Module Replacement).

---

### **Build for production**
```bash
npm run build
```
Tạo optimized production build trong `dist/`.

---

### **Preview production build**
```bash
npm run preview
```
Preview production build locally.

---

### **Lint code**
```bash
npm run lint
```
Kiểm tra code với ESLint.

---

### **Install dependencies**
```bash
npm install
```

---

## 🔄 Workflows Thông Dụng

### **Workflow 1: Bắt đầu development**

```bash
# Lần đầu tiên
npm run install:all

# Setup .env files
cd server && cp .env.example .env
cd ../client && cp .env.example .env

# Chỉnh sửa .env files với thông tin của bạn

# Tạo database
mysql -u root -p
CREATE DATABASE messenger_clone;
exit;

# Chạy app
npm run dev
```

---

### **Workflow 2: Development hàng ngày**

```bash
# Từ root
npm run dev

# Hoặc chạy riêng lẻ (2 terminals):
# Terminal 1
npm run dev:server

# Terminal 2  
npm run dev:client
```

---

### **Workflow 3: Testing changes**

```bash
# Server changes
cd server
npm run dev

# Frontend changes
cd client
npm run dev
```

---

### **Workflow 4: Build và deploy**

```bash
# Build frontend
npm run build

# Test production build
cd client
npm run preview

# Start backend production
npm start
```

---

## 🛠️ Troubleshooting Scripts

### **Clean install**
```bash
# Root
rm -rf node_modules package-lock.json

# Server
cd server
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
```

---

### **Clear build cache**
```bash
cd client
rm -rf dist node_modules/.vite
npm run build
```

---

### **Kill ports**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## 📊 Script Comparison

| Script | Location | Purpose | Hot Reload | Production |
|--------|----------|---------|------------|------------|
| `npm run dev` | Root | Both servers | ✅ | ❌ |
| `npm run dev:server` | Root | Backend only | ✅ | ❌ |
| `npm run dev:client` | Root | Frontend only | ✅ | ❌ |
| `npm start` | Root/Server | Backend prod | ❌ | ✅ |
| `npm run build` | Root/Client | Build frontend | - | ✅ |

---

## 💡 Pro Tips

### **Tip 1: Use concurrently for full-stack dev**
```bash
npm run dev
```
Một terminal duy nhất cho cả Backend + Frontend!

---

### **Tip 2: Watch logs carefully**
Server logs quan trọng:
- ✅ Database connection
- ✅ Models synchronized
- ✅ Socket.io initialized
- 🚀 Server running message

---

### **Tip 3: Use environment variables**
Đổi ports nếu bị conflict:
```env
# server/.env
PORT=5001

# client/.env
VITE_API_URL=http://localhost:5001
```

---

### **Tip 4: Auto-format on save**
VSCode settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## 📝 Custom Scripts

Bạn có thể thêm custom scripts trong `package.json`:

### **Example: Database reset**
```json
{
  "scripts": {
    "db:reset": "cd server && node scripts/resetDatabase.js"
  }
}
```

### **Example: Test script**
```json
{
  "scripts": {
    "test": "cd server && npm test && cd ../client && npm test"
  }
}
```

---

## 🚀 CI/CD Scripts

Cho GitHub Actions hoặc deployment:

```yaml
# .github/workflows/deploy.yml
- name: Install dependencies
  run: npm run install:all

- name: Build
  run: npm run build

- name: Start server
  run: npm start
```

---

## 📖 Further Reading

- [NPM Scripts Documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [Concurrently Documentation](https://www.npmjs.com/package/concurrently)
- [Vite CLI](https://vitejs.dev/guide/cli.html)
- [Nodemon](https://nodemon.io/)

---

**Happy Scripting! 🎯**
