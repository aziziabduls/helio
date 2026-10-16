# helio Events Backend (Luma Clone)

Backend REST API untuk aplikasi helio Events (Luma Clone) yang dibangun menggunakan **Express.js**, **TypeScript**, **Prisma ORM**, dan **PostgreSQL**.

---

## 📋 Daftar Isi

1. [Persyaratan Sistem (Prerequisites)](#-persyaratan-sistem-prerequisites)
2. [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
3. [Cara Menjalankan Backend](#-cara-menjalankan-backend)
4. [Cara Connect ke DBeaver](#-cara-connect-ke-dbeaver)
5. [Daftar NPM Scripts](#-daftar-npm-scripts)
6. [Struktur Database & Schema](#-struktur-database--schema)
7. [Troubleshooting](#-troubleshooting)

---

## 🛠 Persyaratan Sistem (Prerequisites)

Sebelum menjalankan backend, pastikan perangkat Anda telah terinstall:

- **Node.js**: versi `18.x` atau `20.x` ke atas
- **npm**: versi `9.x` ke atas
- **PostgreSQL**: versi `14` / `15` / `16` (berjalan pada port default `5432`)
- **DBeaver**: Community Edition ([Download DBeaver](https://dbeaver.io/download/)) untuk melihat dan mengelola database via GUI

---

## ⚙️ Konfigurasi Environment (`.env`)

Duplikat file template `.env.example` menjadi `.env` di dalam folder `backend`:

```bash
cp .env.example .env
```

Isi default konfigurasi `.env`:

```env
PORT=4450
DATABASE_URL="postgresql://a@localhost:5432/luma_db?schema=public"
CORS_ORIGIN="http://localhost:3350"
JWT_SECRET="helio_super_secret_jwt_key_2026_dev"
JWT_EXPIRES_IN="7d"
```

### Penjelasan Variabel:
- **`PORT`**: Port server backend berjalan (default: `4450`).
- **`DATABASE_URL`**: Format connection string PostgreSQL:
  ```text
  postgresql://<username>:<password>@<host>:<port>/<nama_database>?schema=public
  ```
  > **Catatan**: Jika user PostgreSQL Anda memakai password, sesuaikan misalnya:  
  > `postgresql://postgres:password123@localhost:5432/luma_db?schema=public`
- **`CORS_ORIGIN`**: URL frontend Next.js yang diizinkan mengakses API (default: `http://localhost:3350`).
- **`JWT_SECRET`**: Kunci rahasia untuk tanda tangan token JWT autentikasi.
- **`JWT_EXPIRES_IN`**: Masa berlaku token (default: `7d`).

---

## 🚀 Cara Menjalankan Backend

### 1. Install Dependencies
Buka terminal dan arahkan ke direktori `backend`:
```bash
cd backend
npm install
```

### 2. Pastikan PostgreSQL Berjalan dan Database Tersedia
Pastikan service PostgreSQL di macOS / Linux / Windows sedang berjalan:
```bash
# macOS (Homebrew):
brew services start postgresql@16

# Atau cek status:
brew services list
```

Jika database `luma_db` belum dibuat, buat database terlebih dahulu:
```bash
createdb luma_db
```
*(Atau via `psql -U <user> -c "CREATE DATABASE luma_db;"`)*

### 3. Generate Prisma Client & Push Schema
Generate Prisma client dan sinkronkan schema ke PostgreSQL:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema ke database (membuat semua tabel secara otomatis)
npm run prisma:push
```

### 4. Seed Data Awal (Opsional)
Untuk mengisi database dengan dummy data event, calendar, dan user:
```bash
npm run prisma:seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```

Server akan aktif di:
👉 **`http://localhost:4450`**

Cek status backend melalui endpoint health check di browser atau terminal:
```bash
curl http://localhost:4450/api/health
```
Respons yang diharapkan:
```json
{
  "success": true,
  "message": "helio Events backend is operational",
  "data": {
    "status": "ok",
    "service": "helio-events-backend",
    "database": "postgresql"
  }
}
```

---

## 🦫 Cara Connect ke DBeaver

DBeaver mempermudah Anda untuk melihat tabel, relasi, data event, tiket, dan menjalankan SQL query secara visual.

### Langkah-langkah:

1. **Buka Aplikasi DBeaver**.
2. **Buat Koneksi Baru**:
   - Klik menu **Database** -> **New Database Connection** (atau klik ikon steker bertanda plus `+` di toolbar kiri atas).
3. **Pilih Database Type**:
   - Pilih **PostgreSQL** dari daftar driver, lalu klik **Next >**.
4. **Isi Pengaturan Koneksi (Main Settings)**:
   - **Host**: `localhost` (atau `127.0.0.1`)
   - **Port**: `5432`
   - **Database**: `luma_db`
   - **Authentication**: `Database Native`
   - **Username**: `a` *(sesuaikan dengan user PostgreSQL di laptop Anda, misalnya `postgres` atau username Mac Anda)*
   - **Password**: *(kosongkan jika tanpa password, atau masukkan password PostgreSQL Anda)*
5. **Test Connection**:
   - Klik tombol **Test Connection ...** di bagian kiri bawah jendela.
   - *Jika DBeaver meminta untuk mendownload driver PostgreSQL JDBC, klik tombol **Download**.*
   - Jika berhasil, akan muncul popup dialog:
     ```text
     Connected
     Server: PostgreSQL 16.x (atau versi Anda)
     Driver: PostgreSQL JDBC Driver
     ```
6. **Simpan Koneksi**:
   - Klik **Finish**.
7. **Melihat Tabel & Data**:
   - Di panel kiri (**Database Navigator**), expand:
     `luma_db` ➔ `Databases` ➔ `luma_db` ➔ `Schemas` ➔ `public` ➔ `Tables`
   - Anda akan melihat seluruh tabel Prisma:
     - `User`
     - `Event`
     - `Calendar`
     - `Registration`
     - `Ticket`
     - `EventTicketTier`
     - `MerchandiseItem`
     - `EventHost`
     - `EventGuest`
   - Klik dua kali pada tabel mana saja (misalnya `Event` atau `User`), lalu pilih tab **Data** untuk melihat baris data secara langsung.

---

## 📜 Daftar NPM Scripts

| Script | Perintah | Fungsi |
| :--- | :--- | :--- |
| **`npm run dev`** | `ts-node-dev ...` | Menjalankan backend dalam mode development dengan auto-reload (hot reload). |
| **`npm run build`** | `tsc` | Mengompilasi kode TypeScript ke folder `dist/`. |
| **`npm run start`** | `node dist/index.js` | Menjalankan server hasil build production. |
| **`npm run prisma:generate`** | `prisma generate` | Men-generate TypeScript types & Prisma Client terbaru. |
| **`npm run prisma:push`** | `prisma db push` | Menyinkronkan perubahan `prisma/schema.prisma` langsung ke database. |
| **`npm run prisma:seed`** | `ts-node prisma/seed.ts` | Mengisi data contoh (users, calendars, events, tickets). |

---

## 🗄 Struktur Database & Schema

Relasi model utama di file `prisma/schema.prisma`:

- **User**: Pengguna / host / attendee akun.
- **Calendar**: Kalender komunitas (misal: AGI House, Tech Jakarta, dsb.) tempat event bernaung.
- **Event**: Informasi event (judul, tanggal mulai/selesai, timezone, lokasi/virtual link, cover, kapasitas, kategori, dsb.).
- **EventTicketTier**: Tiket berbayar / gratis dengan berbagai tipe (Standard, VIP, dsb.) dan kuota.
- **MerchandiseItem**: Add-on merchandise event (kaos, hoodie, topi, dsb.) lengkap dengan gambar dan harga.
- **Registration**: Pendaftaran peserta ke event beserta status approval (`APPROVED`, `PENDING`).
- **Ticket**: Tiket digital peserta lengkap dengan kode unik QR Code.

---

## ❓ Troubleshooting

### 1. `database "luma_db" does not exist`
Jalankan perintah ini di terminal:
```bash
createdb luma_db
```
Atau di psql:
```sql
CREATE DATABASE luma_db;
```

### 2. `Connection refused at localhost:5432`
PostgreSQL belum berjalan di background. Jalankan:
```bash
brew services restart postgresql@16
```
Atau jika menggunakan Docker:
```bash
docker run --name postgres-luma -e POSTGRES_DB=luma_db -e POSTGRES_USER=a -p 5432:5432 -d postgres:16
```

### 3. `Password authentication failed for user`
Periksa username dan password di string `DATABASE_URL` pada `.env` dan di DBeaver connection settings. Pastikan user tersebut memiliki izin akses ke database `luma_db`.

### 4. `Port 4450 already in use`
Jika port 4450 sedang digunakan oleh proses lain:
```bash
# Cek PID proses yang memakai port 4450
lsof -i :4450

# Hentikan proses jika diperlukan
kill -9 <PID>
```
Atau ubah nilai `PORT=...` di file `.env`.
