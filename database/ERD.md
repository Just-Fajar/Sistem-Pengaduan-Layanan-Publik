# Entity Relationship Diagram (ERD)
# Sistem Pengaduan Layanan Publik

## Entities & Relationships

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (unique)  │
│ password        │
│ phone           │
│ role            │ ← enum: 'user', 'admin'
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N (One user has many complaints)
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│  COMPLAINTS     │ N:1     │   CATEGORIES    │
├─────────────────┤◄────────├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │         │ name            │
│ category_id(FK) │─────────│ description     │
│ title           │         │ created_at      │
│ description     │         │ updated_at      │
│ photo_url       │         └─────────────────┘
│ status          │ ← enum: 'pending', 'processing', 'completed'
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N (One complaint has many responses)
         │
         ▼
┌─────────────────┐
│   RESPONSES     │
├─────────────────┤
│ id (PK)         │
│ complaint_id(FK)│
│ admin_id (FK)   │ ← references users(id)
│ response_text   │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Relationships Summary

1. **users → complaints** (1:N)
   - One user can create many complaints

2. **categories → complaints** (1:N)
   - One category can have many complaints

3. **complaints → responses** (1:N)
   - One complaint can have many responses from admin

4. **users → responses** (1:N)
   - One admin can create many responses

## Business Rules

1. User harus login untuk membuat pengaduan
2. Setiap pengaduan wajib memiliki kategori
3. Status default pengaduan: 'pending'
4. Hanya admin yang bisa update status dan memberi tanggapan
5. User bisa upload maksimal 1 foto per pengaduan
6. Admin dapat memberi multiple responses per complaint
