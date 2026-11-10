# Smart Admin Muaythai — Team Oweee (PORPROV XIV KALBAR)

Aplikasi Web Full-Stack Database & Administrasi Atlet Muaythai (Kategori Tarung) untuk Porprov XIV Kalimantan Barat — **Team Oweee**.

Dibangun menggunakan **Next.js (App Router)**, **TypeScript**, dan **Tailwind CSS**, dioptimalkan untuk tampilan smartphone (**iPhone & Android**) serta desktop/laptop, dan siap di-hosting langsung di **Vercel**.

---

## 🌟 Fitur Utama

1. **Akses Mobile-First (iPhone & Android)**:
   - Tampilan **Fighter Cards** dengan tombol sentuh berukuran minimal 44px (ramah jempol).
   - **Floating Bottom Action Bar** untuk akses cepat di ponsel.
   - Dukungan **PWA (*Add to Home Screen*)** dengan logo resmi Team Oweee.
2. **Sistem Login 1 Pengguna (Single-User)**:
   - **Username**: `teamowee`
   - **Password**: `12345678`
   - Cookie session HTTP-Only terenkripsi dengan proteksi middleware Next.js.
3. **Database 68 Atlet Lengkap**:
   - 68 atlet resmi terdaftar (52 Putra, 16 Putri, 8 Kontingen aktif).
   - Sinkronisasi instan saat ubah kelas berat, kontingen, gender, atau status.
4. **Tampilan Tabel Format Book1**:
   - Tabel komparatif berdampingan (*side-by-side*) Putra (`#2E75B6`) dan Putri (`#C0504D`) dengan header Navy (`#1F3864`).
5. **Matriks Sebaran Kontingen**:
   - Pivot table 11 kelas vs kontingen aktif Kalbar.
6. **Export Excel 4-Sheet Identik 100%**:
   - Menggunakan pustaka `xlsx-js-style` untuk menghasilkan file Excel Book1 dengan format, warna cell, border, dan rumus (`INDEX/MATCH`, `COUNTIFS`, `SUM`).

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori
cd AdminMuayApp

# 2. Install dependensi (jika belum)
npm install

# 3. Jalankan server dev
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Kredensial Login:
- **Username**: `teamowee`
- **Password**: `12345678`

---

## ☁️ Panduan Deploy ke Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login ke akun Vercel Anda.
2. Klik **"Add New Project"**.
3. Hubungkan ke repositori GitHub: [**riantonyc/Team_OweeAdmin**](https://github.com/riantonyc/Team_OweeAdmin.git).
4. Masukkan **Environment Variables**:
   - `ADMIN_USERNAME`: `teamowee`
   - `ADMIN_PASSWORD`: `12345678`
   - `SESSION_SECRET`: `team_oweee_muaythai_secret_jwt_key_2026_super_secure_hash`
   - `DATABASE_URL`: *(Opsional, masukkan URL PostgreSQL Supabase/Neon jika menggunakan database cloud)*
5. Klik tombol **Deploy**!
   Aplikasi Anda akan live dalam waktu 1-2 menit.

---

## 📂 Struktur Proyek

```
AdminMuayApp/
├── public/
│   ├── logo.jpg              # Logo resmi Team Oweee (hiu)
│   └── manifest.json         # PWA Manifest untuk iPhone & Android
├── src/
│   ├── app/
│   │   ├── api/              # Endpoint API Auth & CRUD Atlet
│   │   ├── login/            # Halaman login resmi Team Oweee
│   │   ├── layout.tsx        # Root layout + Fonts + Toast Provider
│   │   └── page.tsx          # Dashboard Admin utama
│   ├── components/           # Komponen UI responsif & modal dialog
│   ├── lib/                  # Data store, 68 atlet seed, Excel export, Auth
│   └── middleware.ts         # Proteksi route dashboard
├── vercel.json               # Konfigurasi Vercel deployment
└── README.md
```

