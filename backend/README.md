# Backend - Sistem Pengaduan Layanan Publik

Backend API built with Go (Gin framework) for Public Service Complaint System.

## 🔧 Tech Stack

- **Framework**: Gin
- **ORM**: GORM
- **Database**: MySQL
- **Auth**: JWT
- **Language**: Go 1.23+

## 📁 Project Structure

```
backend/
├── cmd/
│   └── main.go              # Application entry point
├── internal/
│   ├── config/              # Configuration management
│   │   └── config.go
│   ├── database/            # Database connection
│   │   └── database.go
│   ├── models/              # Data models
│   │   ├── user.go
│   │   ├── category.go
│   │   ├── complaint.go
│   │   └── response.go
│   ├── handlers/            # Request handlers
│   │   ├── auth.go
│   │   ├── complaint.go
│   │   └── admin.go
│   ├── middleware/          # Middleware functions
│   │   ├── auth.go
│   │   ├── upload.go
│   │   ├── logger.go
│   │   └── cors.go
│   ├── routes/              # Route definitions
│   │   └── routes.go
│   └── utils/               # Utility functions
│       ├── jwt.go
│       └── response.go
├── uploads/                 # Uploaded files directory
├── .env                     # Environment variables
├── .env.example             # Example environment file
├── go.mod                   # Go dependencies
└── go.sum
```

## 🚀 Getting Started

### Prerequisites

- Go 1.23 or higher
- MySQL 8.0+

### Installation

1. Clone the repository
2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pengaduan_db

JWT_SECRET=your-super-secret-key
PORT=8080
```

4. Install dependencies:
```bash
go mod download
```

5. Setup database (run SQL scripts in `database/` folder):
```bash
mysql -u root -p < ../database/setup.sql
mysql -u root -p < ../database/seed.sql  # Optional: test data
```

6. Run the application:
```bash
go run cmd/main.go
```

Server will start on http://localhost:8080

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin
- `GET /api/auth/me` - Get current user profile

### Categories
- `GET /api/categories` - Get all categories

### Complaints (User)
- `POST /api/complaints` - Create complaint (with photo upload)
- `GET /api/complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get complaint detail

### Admin
- `GET /api/admin/statistics` - Dashboard statistics
- `GET /api/admin/complaints` - Get all complaints (with filters)
- `GET /api/admin/complaints/:id` - Get complaint detail
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `POST /api/admin/complaints/:id/response` - Add response to complaint

### Utilities
- `GET /health` - Health check
- `GET /uploads/:filename` - Access uploaded files

## 🔒 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request Examples

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "081234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Complaint
```bash
curl -X POST http://localhost:8080/api/complaints \
  -H "Authorization: Bearer <token>" \
  -F "category_id=1" \
  -F "title=Jalan Berlubang" \
  -F "description=Jalan rusak di depan kantor" \
  -F "photo=@/path/to/image.jpg"
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (User/Admin)
- File upload validation
- CORS configuration
- Input validation

## 📦 Dependencies

- `github.com/gin-gonic/gin` - Web framework
- `gorm.io/gorm` - ORM
- `gorm.io/driver/mysql` - MySQL driver
- `github.com/golang-jwt/jwt/v5` - JWT
- `golang.org/x/crypto` - Password hashing
- `github.com/joho/godotenv` - Environment variables

## 🔧 Development

```bash
# Run with hot reload (install air first: go install github.com/cosmtrek/air@latest)
air

# Run tests
go test ./...

# Build
go build -o backend cmd/main.go
```

## 📄 License

MIT
