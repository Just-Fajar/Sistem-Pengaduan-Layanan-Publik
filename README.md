# Sistem Pengaduan Layanan Publik

Aplikasi web untuk mengelola pengaduan layanan publik dengan sistem yang terintegrasi antara masyarakat dan administrator.

## 🎯 Features

### 👤 User Features
- 🔐 Login & Register
- 📝 Buat pengaduan dengan upload foto
- 📊 Dashboard dengan statistik pengaduan
- 🔍 Tracking status pengaduan real-time
- 📜 Riwayat pengaduan lengkap
- 💬 Lihat tanggapan dari admin

### 🧑‍💼 Admin Features
- 📈 Dashboard dengan statistik lengkap
- 🗂️ Kelola semua pengaduan
- 🔎 Filter & search pengaduan
- ✅ Update status (Menunggu → Diproses → Selesai)
- 💬 Beri tanggapan ke pengaduan
- 👥 Lihat informasi pelapor

## 🔧 Tech Stack

### Backend
- **Language**: Go 1.23+
- **Framework**: Gin
- **Database**: MySQL 8.0+
- **ORM**: GORM
- **Auth**: JWT (JSON Web Token)
- **Validation**: Go Validator
- **Password**: Bcrypt

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Toastify

## 📁 Project Structure

```
Sistem-Pengaduan-Layanan-Publik/
├── backend/                 # Backend Go application
│   ├── cmd/                # Entry point
│   ├── internal/           # Internal packages
│   │   ├── config/        # Configuration
│   │   ├── database/      # Database connection
│   │   ├── handlers/      # Request handlers
│   │   ├── middleware/    # Middleware functions
│   │   ├── models/        # Data models
│   │   ├── routes/        # Route definitions
│   │   └── utils/         # Utility functions
│   ├── uploads/           # Uploaded files
│   └── go.mod
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx
│   └── package.json
└── database/               # Database files
    ├── migrations/        # SQL migration files
    ├── setup.sql          # Database setup script
    └── seed.sql           # Seed data
```

## 🚀 Getting Started

### Prerequisites
- Go 1.23 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher

### 1. Database Setup

```bash
# Login ke MySQL
mysql -u root -p

# Buat database dan run migrations
source database/setup.sql

# (Optional) Insert test data
source database/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, dll

# Install dependencies
go mod download

# Run backend
go run cmd/main.go
```

Backend akan berjalan di **http://localhost:8080**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register user baru
POST   /api/auth/login         - Login user/admin
GET    /api/auth/me            - Get current user
```

### Categories
```
GET    /api/categories         - Get all categories
```

### User - Complaints
```
POST   /api/complaints         - Create complaint (+ photo)
GET    /api/complaints         - Get user's complaints
GET    /api/complaints/:id     - Get complaint detail
```

### Admin - Management
```
GET    /api/admin/statistics           - Dashboard statistics
GET    /api/admin/complaints           - Get all complaints
GET    /api/admin/complaints/:id       - Get complaint detail
PUT    /api/admin/complaints/:id/status - Update status
POST   /api/admin/complaints/:id/response - Add response
```

## 🔐 Default Credentials

### Admin Account
```
Email: admin@example.com
Password: password123
```

### User Account
```
Email: john@example.com
Password: password123
```

## 🗄️ Database Schema

### Tables
1. **users** - User & admin accounts
2. **categories** - Complaint categories
3. **complaints** - User complaints
4. **responses** - Admin responses

### Status Flow
```
pending → processing → completed
```

## 🎨 Screenshots

### User Dashboard
- Statistik pengaduan (Total, Menunggu, Diproses, Selesai)
- Daftar pengaduan terbaru
- Quick actions

### Admin Dashboard
- Statistik lengkap sistem
- Performance metrics
- Quick access to pending complaints

## 🔒 Security Features

- ✅ Password hashing dengan Bcrypt
- ✅ JWT authentication
- ✅ Role-based access control (User/Admin)
- ✅ File upload validation (type & size)
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ Protected routes

## 🧪 Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm run test
```

## 📦 Build for Production

### Backend
```bash
cd backend
go build -o pengaduan-api cmd/main.go
```

### Frontend
```bash
cd frontend
npm run build
```

## 🐳 Docker (Optional)

Coming soon...

## 📄 License

MIT License

## 👥 Contributors

- Your Name

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

---

**Made with ❤️ for Public Service**
