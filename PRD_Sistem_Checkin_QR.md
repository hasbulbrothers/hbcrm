
# PRD: Sistem Check-In Seminar Berasaskan QR (Day 1 & Day 2)

## 1. Ringkasan Produk
Sistem ini membolehkan peserta seminar melakukan **check-in melalui QR code** di lokasi event.
Peserta scan QR → masukkan **nama atau no telefon** → sistem padankan data peserta → klik **Hadir** (pilih bilangan orang) → keluar **page Tahniah** yang memaparkan **jenis tiket** dan **bilangan hadir** untuk memudahkan tuntutan workbook di meja pendaftaran.

Admin mempunyai dashboard untuk melihat statistik kehadiran mengikut **hari**, **niche**, **negeri**, dan **total sales**.

---

## 2. Objektif
### Objektif Utama
- Mempercepat proses check-in di lokasi seminar
- Mengurangkan kesilapan manual di kaunter
- Memberi paparan data kehadiran secara live (Day 1 & Day 2)

### KPI Kejayaan
- Masa check-in < 60 saat / peserta
- >95% check-in tanpa bantuan kaunter
- Data kehadiran Day 1 & Day 2 lengkap dan boleh diaudit

---

## 3. Skop Sistem
### Dalam Skop
- Import data peserta menggunakan CSV ke Supabase
- QR check-in flow (Day 1 & Day 2)
- Admin login & dashboard
- Report kehadiran ikut niche, negeri dan total sales

### Luar Skop (Fasa 1)
- Payment gateway
- Sistem pendaftaran online penuh
- Offline mode

---

## 4. Tech Stack
- Framework: Next.js (App Router)
- Frontend: React
- UI: shadcn/ui + TailwindCSS
- Backend: Supabase (PostgreSQL)
- Auth Admin: NextAuth (Google Login)

---

## 5. Pengguna Sistem
### Peserta
- Scan QR
- Masukkan nama / no telefon
- Confirm hadir & bilangan orang
- Paparan “Tahniah” untuk claim workbook

### Admin
- Login admin
- Lihat dashboard & laporan kehadiran
- Semak data peserta & check-in

---

## 6. Sumber Data (CSV Import)

### CSV Required Fields
- event_code
- name
- phone
- ticket_type

### CSV Recommended Fields (untuk dashboard)
- niche
- state
- total_sales

---

## 7. User Flow

### 7.1 Check-In Peserta
1. Peserta scan QR  
   `/checkin?event=gyb-jan26&day=1` atau `day=2`

2. Page Check-in  
   - Input: Nama atau No Telefon
   - CTA: Cari

3. Jika data dijumpai  
   - Papar nama & jenis tiket
   - Pilih bilangan hadir
   - Klik **Hadir**

4. Sistem simpan rekod check-in

5. Page Tahniah  
   - Nama
   - Jenis tiket
   - Bilangan hadir
   - Hari (Day 1 / Day 2)
   - Arahan claim workbook

---

## 8. Keperluan Fungsional

### Peserta
- Boleh check-in Day 1 & Day 2
- Hanya boleh check-in sekali setiap hari
- Boleh pilih bilangan hadir

### Admin Dashboard
- Total hadir Day 1
- Total hadir Day 2
- Breakdown ikut niche
- Breakdown ikut negeri
- Total sales (peserta hadir)

---

## 9. Data Model (Supabase)

### Table: participants
- id (uuid)
- event_code
- name
- phone
- ticket_type
- niche
- state
- total_sales
- created_at

### Table: checkins
- id (uuid)
- event_code
- day (1 / 2)
- participant_id
- attend_count
- status (CONFIRMED)
- created_at
- confirmed_at

Constraint:
- Unique: event_code + day + participant_id

---

## 10. UI / UX Requirement
- Mobile-first design
- Large CTA buttons
- Minimal input (1 field sahaja)
- Clear error & success state

---

## 11. Business Rules
- Seorang peserta hanya boleh check-in sekali setiap hari
- Phone number perlu dinormalisasi
- Jika nama sama, paparkan senarai pilihan

---

## 12. Reporting
- Total hadir Day 1 / Day 2
- Kehadiran ikut niche
- Kehadiran ikut negeri
- Jumlah total sales peserta hadir

---

## 13. Acceptance Criteria
- QR check-in berfungsi untuk Day 1 & Day 2
- Padanan peserta berjaya berdasarkan nama / telefon
- Page Tahniah paparkan info lengkap untuk claim workbook
- Admin boleh lihat dashboard & data kehadiran

---

## 14. Milestone
### Fasa 1 (MVP)
- Schema Supabase
- Check-in flow lengkap
- Admin login & dashboard asas

### Fasa 1.1
- Breakdown niche & negeri
- Total sales aggregation
- Export CSV

---

Dokumen ini berfungsi sebagai rujukan rasmi (PRD) untuk pembangunan sistem check-in seminar berasaskan QR.
