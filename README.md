# Sistem Pengaduan Layanan Publik

[![Go Version](https://img.shields.io/badge/Go-1.24-blue.svg)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplikasi web berbasis Clean Architecture (Go dan React) untuk mengelola laporan dan pengaduan layanan publik secara transparan, aman, dan terintegrasi antara masyarakat dan instansi administrator.

---

## Arsitektur Sistem

Proyek ini dirancang menggunakan Clean Layered Architecture dengan prinsip Separation of Concerns dan Dependency Injection:

```
[ HTTP Router & Middlewares ] (Gin, Slog, Rate Limiter, Security Headers)
            │
            ▼
   [ Handler Layer ] (HTTP Request Parsing & Response Serializer)
            │ (Dependency Injection via Constructor)
            ▼
   [ Service Layer ] (Business Logic, Validation, Password Recovery)
            │ (Interface-based Dependency)
            ▼
 [ Repository Layer ] (Database Abstraction & Queries)
            │
            ▼
[ Relational DB / Storage ] (MySQL / SQLite in-memory for testing)
```

---

## Fitur Utama

### Pengguna (Masyarakat)
- **Autentikasi & Registrasi:** Registrasi akun baru, login JWT, dan pemulihan kata sandi (Forgot & Reset Password).
- **Buat Pengaduan:** Form pembuatan laporan lengkap dengan upload foto bukti, pemilihan kategori, dan validasi berkas.
- **Dashboard Interaktif:** Ringkasan statistik status pengaduan (Total, Menunggu, Diproses, Selesai).
- **Tracking Status:** Pelacakan status pengaduan real-time dan riwayat tanggapan resmi dari petugas.
- **Manajemen Profil:** Pembaruan nama, nomor telepon, dan pergantian password.

### Administrator
- **Dashboard Statistik:** Agregasi jumlah laporan, user aktif, serta rincian pengaduan per kategori.
- **Manajemen Pengaduan:** Filter status, pencarian instan dengan Search Debounce (300ms), dan paginasi terpusat.
- **Tindak Lanjut & Tanggapan:** Pembaruan status alur (Pending -> Processing -> Completed) dan pengiriman tanggapan resmi ke pelapor.
- **Kelola Kategori:** CRUD kategori layanan pengaduan.
- **Ekspor Laporan PDF:** Rekapitulasi laporan pengaduan ke format PDF lengkap dengan sanitasi teks multibyte.

---

## Keamanan & Observabilitas

- **IP Rate Limiting:** Pembatasan trafik global (100 req/menit) dan endpoint login/auth (5 req/menit) untuk mencegah brute-force.
- **OWASP Security Headers:** Penerapan header keamanan (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy).
- **CORS Protection:** Pembatasan domain asal (Origin) yang diizinkan melalui konfigurasi ALLOWED_ORIGIN.
- **Password Hashing:** Enkripsi password menggunakan bcrypt.
- **Structured Logging (log/slog):** Pencatatan log terstruktur JSON dengan pencatatan latensi, IP, method, status code, dan penelusuran X-Request-ID.
- **Health & Readiness Probes:** Endpoint /health (liveness) dan /ready (readiness dengan verifikasi konektivitas database).
- **Graceful Shutdown:** Pembersihan koneksi database dan penuntasan request aktif sebelum server berhenti.
- **Frontend Error Boundary:** Penanganan runtime render error tanpa merusak aplikasi.

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| **Backend Language** | Go 1.24+ |
| **HTTP Framework** | Gin Web Framework |
| **ORM & Database** | GORM (MySQL 8.0 / SQLite in-memory test) |
| **Authentication** | JWT (JSON Web Tokens) & Bcrypt |
| **Structured Logger** | Go Standard Library log/slog |
| **Frontend Framework** | React 18 & Vite |
| **Styling** | Tailwind CSS & React Icons |
| **Routing & Client** | React Router v6 & Axios |
| **Containerization** | Docker & Docker Compose (Multi-stage build) |

---

## Struktur Proyek

```
Sistem-Pengaduan-Layanan-Publik/
├── backend/                 # Backend Go Application
│   ├── cmd/                 # Application Entry Point (main.go)
│   ├── internal/
│   │   ├── config/          # Environment & Config Loader
│   │   ├── database/        # Database Connection Pool
│   │   ├── handlers/        # HTTP Handlers (Dependency Injected)
│   │   ├── middleware/      # Auth, CORS, Slog Logger, Rate Limiter, Security
│   │   ├── models/          # GORM Entities & Request/Response DTOs
│   │   ├── repository/      # Repository Layer (Data Access Interfaces & Impl)
│   │   ├── service/         # Service Layer (Business Logic Interfaces & Impl)
│   │   ├── testutil/        # In-memory Test DB & Model Fixture Helpers
│   │   └── utils/           # JWT, Pagination, Email, PDF Exporter
│   ├── uploads/             # Direktori berkas unggahan
│   ├── Dockerfile           # Multi-stage Go Dockerfile
│   └── go.mod
├── frontend/                # Frontend React Application
│   ├── src/
│   │   ├── components/      # ErrorBoundary, Layout, LoadingSpinner, Navbar
│   │   ├── context/         # AuthContext & State Management
│   │   ├── hooks/           # useComplaints, useCategories, useDebounce
│   │   ├── pages/           # Dashboard, ComplaintDetail, ForgotPassword, NotFound
│   │   └── utils/           # Axios Client (/api/v1)
│   ├── nginx.conf           # Nginx configuration untuk Container
│   ├── Dockerfile           # Multi-stage React + Nginx Dockerfile
│   └── package.json
├── database/                # SQL Migrations & Database Setup
├── docker-compose.yml       # Local Development Container Stack
├── Makefile                 # Developer Automation Commands
└── README.md
```

---

## Panduan Menjalankan Aplikasi Lokal

Anda dapat menjalankan aplikasi di lingkungan lokal dengan salah satu opsi berikut:

### Opsi 1: Menggunakan Docker Compose (Direkomendasikan)
Menjalankan seluruh ekosistem (MySQL 8.0, Backend Go, dan Frontend Nginx) dengan satu perintah:

```bash
# Build dan jalankan seluruh container di background
docker-compose up -d --build

# Untuk melihat logs aktivitas container
docker-compose logs -f

# Untuk menghentikan container
docker-compose down
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Probe: http://localhost:8080/health

---

### Opsi 2: Menggunakan Makefile (Developer Tooling)
Jika Anda memiliki make terpasang di sistem:

```bash
# Jalankan seluruh unit & integration tests backend
make test

# Build binary backend dan bundle frontend
make build

# Jalankan docker compose lokal
make docker-up

# Hentikan docker compose lokal
make docker-down
```

---

### Opsi 3: Menjalankan Secara Manual

#### 1. Setup Database MySQL
Pastikan MySQL service aktif di komputer Anda:
```bash
mysql -u root -p < database/setup.sql
```

#### 2. Menjalankan Backend
```bash
cd backend
cp .env.example .env
# Sesuaikan isi .env (DB_USER, DB_PASSWORD, JWT_SECRET, dll)

go run cmd/main.go
```
Backend berjalan di http://localhost:8080.

#### 3. Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di http://localhost:3000.

---

## Katalog Endpoint REST API (/api/v1)

### Autentikasi
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | /api/v1/auth/register | Mendaftarkan akun user baru | Publik |
| POST | /api/v1/auth/login | Login user atau admin (Return JWT) | Publik |
| POST | /api/v1/auth/forgot-password | Permintaan token reset password | Publik |
| POST | /api/v1/auth/reset-password | Atur ulang password baru via token | Publik |
| GET | /api/v1/auth/me | Mengambil profil user yang sedang login | Authenticated |
| PUT | /api/v1/profile | Memperbarui informasi profil | Authenticated |
| PUT | /api/v1/profile/password | Mengganti kata sandi | Authenticated |

### Pengaduan (User)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | /api/v1/categories | Mengambil daftar kategori pengaduan | Authenticated |
| POST | /api/v1/complaints | Membuat pengaduan baru (+ upload foto) | Authenticated |
| GET | /api/v1/complaints | Mengambil daftar pengaduan saya (Paginated) | Authenticated |
| GET | /api/v1/complaints/:id | Mengambil detail riwayat pengaduan | Authenticated |

### Manajemen Administrator
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | /api/v1/admin/statistics | Mengambil data statistik dashboard admin | Admin |
| GET | /api/v1/admin/complaints | Mengambil semua pengaduan (Filter & Search) | Admin |
| GET | /api/v1/admin/complaints/:id | Mengambil detail pengaduan untuk admin | Admin |
| PUT | /api/v1/admin/complaints/:id/status | Mengubah status pengaduan | Admin |
| POST | /api/v1/admin/complaints/:id/response | Memberikan tanggapan resmi admin | Admin |
| GET | /api/v1/admin/categories | Mengambil seluruh kategori (Admin) | Admin |
| POST | /api/v1/admin/categories | Membuat kategori pengaduan baru | Admin |
| PUT | /api/v1/admin/categories/:id | Memperbarui nama/deskripsi kategori | Admin |
| DELETE | /api/v1/admin/categories/:id | Menghapus kategori pengaduan | Admin |
| GET | /api/v1/admin/export/complaints/pdf | Ekspor rekap pengaduan ke PDF | Admin |

### Observabilitas & Health Checks
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | /health | Liveness probe (Status HTTP Server) | Publik |
| GET | /ready | Readiness probe (Verifikasi koneksi database) | Publik |

---

## Pengujian (Testing Suite)

Proyek ini mencakup pengujian komprehensif dengan 3 metode:
1. White-Box Testing: Unit testing internal logic model, JWT claim extraction, service methods, dan middleware.
2. Black-Box Testing: Integration tests memverifikasi HTTP response envelope, status codes, dan error payloads.
3. Grey-Box Testing: Pengujian integrasi in-memory SQLite database (internal/testutil) untuk memastikan relasi tabel dan constraint query.

```bash
# Menjalankan seluruh test suite backend dengan code coverage
cd backend
go test -v -cover ./...

# Menjalankan build bundle frontend
cd frontend
npm run build
```

---

## Akun Demo (Development Mode)

| Role | Email | Password |
|---|---|---|
| Administrator | admin@example.com | password123 |
| Masyarakat / User | john@example.com | password123 |

---

## Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat file LICENSE untuk informasi lebih lanjut.
