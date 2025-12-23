# 💬 Messenger Clone - Real-time Chat Application

A production-ready messenger clone built with **React**, **Node.js**, **Express**, **Socket.io**, and **MySQL**. Features real-time messaging, user authentication, and a modern UI with Tailwind CSS.

---

## 🚀 Features

- ✅ **Real-time Messaging** - Instant message delivery with Socket.io
- ✅ **User Authentication** - Secure JWT-based auth with bcrypt password hashing
- ✅ **Email OTP Verification** - 2-step registration with email verification
- ✅ **Two-Factor Authentication (2FA)** - Login security with OTP codes
- ✅ **Google OAuth** - Sign in with Google account
- ✅ **Profile Management** - Edit username, avatar, and password
- ✅ **Avatar Upload** - Cloudinary integration for profile pictures
- ✅ **Online Status** - See who's online in real-time
- ✅ **Message History** - Persistent message storage with MySQL
- ✅ **Media Upload** - Send images, videos, and files in chat
- ✅ **Message Editing** - Edit sent messages
- ✅ **Friend System** - Send/accept friend requests
- ✅ **Modern UI** - Beautiful dark theme with Tailwind CSS and glassmorphism
- ✅ **Emoji Support** - Emoji picker for expressive messaging
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Clean Architecture** - Organized monorepo structure

---

## 🛠️ Tech Stack

### **Frontend**
- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- Socket.io-client
- Axios
- React Router DOM
- Lucide React (Icons)
- Emoji Picker React

### **Backend**
- Node.js
- Express
- Sequelize ORM
- MySQL2
- Socket.io
- JWT (Authentication)
- Bcryptjs (Password Hashing)
- Nodemailer (Email OTP)
- Multer + Cloudinary (File Upload)
- Passport.js (Google OAuth)
- CORS

---

## 📁 Project Structure

```
MessengerClone/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand store
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Installation & Setup

### **Quick Start** ⚡
```bash
# 1. Clone repository
git clone https://github.com/yourusername/MessengerClone.git
cd MessengerClone

# 2. Install all dependencies
npm run install:all

# 3. Setup .env files (see below)

# 4. Create MySQL database
mysql -u root -p
CREATE DATABASE messenger_clone;
exit;

# 5. Run both servers
npm run dev
```

### **📚 Detailed Installation Guides**

Choose your preferred guide:

- 🚀 **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes
- 📦 **[Full Installation Guide](./INSTALLATION.md)** - Step-by-step with troubleshooting
- 🎮 **[Scripts Guide](./SCRIPTS_GUIDE.md)** - All available npm scripts explained
- ✅ **[Setup Checklist](./CHECKLIST.md)** - Verify your installation

### **Environment Variables**

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=messenger_clone
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# Cloudinary (Required for Media & Avatar Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email/SMTP (OTP System - Choose one)
# Option 1: Mailtrap (Development)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password

# Option 2: Gmail (Production)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔌 API Documentation

For complete API documentation with request/response examples, see:

📡 **[API Documentation](./API_DOCUMENTATION.md)**

### **Quick API Reference**

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/allusers/:id` - Get all users (contacts)
- `POST /api/auth/setavatar/:id` - Set user avatar

**Messages:**
- `POST /api/messages/addmsg` - Send a message
- `POST /api/messages/getmsg` - Get chat history between two users

**Socket.io Events:**
- Client → Server: `add-user`, `send-msg`, `typing`
- Server → Client: `msg-recieve`, `online-users`, `user-typing`

---

## 🔐 Database Schema

### **Users Table**
```
id: UUID (Primary Key)
username: String (Unique)
email: String (Unique)
password: String (Hashed)
avatarImage: String
isAvatarImageSet: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### **Messages Table**
```
id: UUID (Primary Key)
message: Text
users: JSON Array [senderId, receiverId]
senderId: UUID (Foreign Key → Users)
createdAt: DateTime
```

---

## 🌐 Socket.io Events

### **Client → Server**
- `add-user` - Register user online
- `send-msg` - Send message to recipient
- `typing` - Notify typing status

### **Server → Client**
- `msg-recieve` - Receive incoming message
- `online-users` - Update online users list
- `user-typing` - Receive typing indicator

---

## 🎨 UI Features

### **Login/Register Pages**
- Glassmorphism design
- Form validation
- Error handling
- Smooth animations

### **Chat Interface**
- Contacts sidebar with online indicators
- Welcome screen for new users
- Message bubbles (sender/receiver differentiation)
- Emoji picker
- Auto-scroll to latest message
- Typing indicators
- Timestamp display

---

## 🚀 Production Deployment

### **Backend Deployment (Heroku/Railway/Render)**

1. Set environment variables
2. Update CORS settings
3. Use production database
4. Deploy:
```bash
npm run start
```

### **Frontend Deployment (Vercel/Netlify)**

1. Update `.env` with production API URL
2. Build the project:
```bash
npm run build
```
3. Deploy the `dist/` folder

---

## 📝 Future Enhancements

- [ ] Group chat functionality
- [ ] File/image sharing
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] Read receipts
- [ ] User profiles with bio
- [ ] Dark/Light mode toggle
- [ ] Message search
- [ ] Push notifications

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ by [Your Name]

---

## 🙏 Acknowledgments

- Socket.io documentation
- React documentation
- Tailwind CSS
- Lucide React Icons
- Emoji Picker React

---

## 📞 Support

For support, email your.email@example.com or open an issue in the repository.