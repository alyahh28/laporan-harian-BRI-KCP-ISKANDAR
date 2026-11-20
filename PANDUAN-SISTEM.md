# Panduan Sistem — Aplikasi Laporan Harian RM BRI KC Iskandar

> Aplikasi web untuk pengelolaan **laporan harian Relationship Manager (RM)** di lingkungan BRI,
> mencakup laporan **RMFT** (Funding & Transaksi) dan **RM SME** (layanan untuk segmen SME),
> fitur pelacakan tugas **Tindak Lanjut**, sistem role (Pegawai/Admin), log aktivitas, dan sinkronisasi cloud Supabase.

---

## 1. Teknologi yang Digunakan

| Teknologi | Fungsi | Versi |
|---|---|---|
| **React** | Library UI utama | 19.2 |
| **Vite** | Build tool & dev server | 8.3 |
| **React Router DOM** | Routing & navigasi halaman | 7.18 |
| **Tailwind CSS 4** | Styling (utilitas Vite `@tailwindcss/vite` + custom CSS) | 4.3 |
| **Supabase** | Database, Auth, Realtime, RPC | supabase-js 2.117 |

Perintah penting:

```bash
npm run dev      # jalankan mode pengembangan
npm run build    # build produksi ke folder dist/
npm run preview  # pratinjau hasil build
npm run lint     # cek eslint
```

---

## 2. Struktur Folder

```
Laporan-Harian-RM-BRIKCPIskandar/
├── public/Img/                          # Aset gambar (logo BRI, maskot, background)
├── src/
│   ├── main.jsx                         # Entry point React + BrowserRouter + index.css
│   ├── App.jsx                          # Root: routing, guard auth, sync profil, logout
│   ├── index.css                        # Tailwind CSS v4 + gaya halaman auth, modal profil, & print PDF
│   ├── config/
│   │   ├── supabaseClient.js            # Inisialisasi koneksi Supabase (wajib via .env)
│   │   ├── rolesConfig.jsx              # Definisi role (Pegawai/Admin) + isAdminRole()
│   │   └── transactionOptions.js        # Konfigurasi pilihan transaksi terstruktur RMFT & RM SME
│   ├── services/
│   │   └── tindakLanjut.js              # Layanan CRUD, sinkronisasi, & hapus atomik tugas Tindak Lanjut
│   ├── components/
│   │   ├── TransactionForm.jsx          # State & orkestrasi form/laporan RMFT & RM SME
│   │   ├── reports/
│   │   │   ├── reportUtils.js           # Utilitas cache, validasi error, format WA, kompresi foto
│   │   │   ├── TransactionTypeSelect.jsx# Dropdown jenis transaksi terkelompok + helper hint
│   │   │   ├── ReportInputForm.jsx      # Formulir input nasabah, tautan tugas, & upload foto
│   │   │   ├── ReportListView.jsx       # Tampilan daftar kartu laporan, filter, & pencarian
│   │   │   ├── ReportDetailModal.jsx    # Modal detail nasabah & template cetak PDF
│   │   │   ├── ReportEditModal.jsx      # Modal ubah laporan dengan penanganan error server
│   │   │   └── PhotoLightbox.jsx        # Lightbox pratinjau foto dokumentasi
│   │   ├── Navbar.jsx                   # Header + pintasan Tindak Lanjut + dropdown profil
│   │   ├── ProfileModal.jsx             # Modal lihat/edit profil & ganti password
│   │   └── Icon.jsx                     # Kumpulan ikon SVG inline
│   └── pages/
│       ├── home.jsx                     # Router peran: AdminDashboard vs EmployeeDashboard
│       ├── auth/
│       │   ├── login.jsx                # Form login
│       │   ├── registrasi.jsx           # Form daftar akun baru
│       │   ├── localAuth.js             # Logika auth (Supabase + fallback lokal)
│       │   └── activityLog.js           # Pencatatan & pengambilan aktivitas
│       ├── dashboard/
│       │   ├── EmployeeDashboard.jsx    # Dashboard pegawai
│       │   └── AdminDashboard.jsx       # Dashboard admin (statistik + grafik + tugas aktif)
│       ├── admin/
│       │   ├── AdminLayout.jsx          # Sidebar console admin
│       │   └── EmployeeManagementPage.jsx # Kelola role pegawai
│       ├── tindaklanjut/
│       │   └── TindakLanjutPage.jsx     # Daftar tugas tindak lanjut aktif/selesai & riwayat audit
│       ├── activity/ActivityHistoryPage.jsx # Halaman riwayat aktivitas
│       ├── RMFT/index.jsx               # Pembungkus TransactionForm (formType=rmft)
│       └── RMKREDIT/index.jsx           # Pembungkus TransactionForm (formType=rmkredit)
├── supabase/
│   ├── role-access.sql                  # Skema keamanan RLS & trigger role
│   └── tindak-lanjut.sql                # Skema tabel tindak_lanjut, riwayat, RLS, & RPC hapus atomik
├── .env.example                         # Contoh template environment variable Supabase
└── .env                                 # VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY (diabaikan git)
```

---

## 3. Sistem Peran (Role & Hak Akses)

| Hak Akses | Pegawai | Admin |
|---|:---:|:---:|
| Membuat laporan RMFT / RM SME sendiri | ✅ | ✅ |
| Melihat laporan sendiri | ✅ | ✅ |
| Melihat **semua** laporan pegawai (`?scope=all`) | ❌ | ✅ |
| Edit laporan | Hanya miliknya | Semua laporan |
| Hapus laporan (dari menu laporan) | ❌ | Semua laporan |
| Mengelola tugas Tindak Lanjut (termasuk hapus tugas) | Hanya miliknya | Semua tugas |
| Dashboard statistik bulanan | ❌ | ✅ |
| Mengelola role pegawai (`/employees`) | ❌ | ✅ |
| Melihat log aktivitas semua user | Hanya miliknya | Semua |
| Logout dengan konfirmasi | Langsung | Ada modal konfirmasi |

- Role default saat mendaftar: **Pegawai** (`DEFAULT_ROLE` di `rolesConfig.jsx`).
- Perubahan role **hanya** bisa dilakukan Admin, baik di UI maupun di database
  (trigger `protect_profile_role` mencegah user menaikkan role sendiri).

---

## 4. Fitur Utama

### 4.1 Autentikasi & Profil
- Registrasi → `supabase.auth.signUp` + upsert baris `profiles`.
- Login → `supabase.auth.signInWithPassword` + pengambilan profil (nama, role, jabatan, foto).
- **Fallback offline**: jika server Supabase tidak terjangkau (network error),
  sistem memakai daftar user di `localStorage` dengan verifikasi password
  **PBKDF2-SHA256, 120.000 iterasi, salt acak 16 byte** (WebCrypto API).
- Sesi disimpan di `localStorage` (`bri-app-session-v1`) dengan **timeout 4 hari
  tanpa aktivitas**; setiap interaksi (klik/keyboard) memperbarui waktu aktif.
- Edit profil memperbarui nama, bidang kerja, foto terkompresi, dan kata sandi (email akun bersifat read-only agar tetap konsisten dengan Supabase Auth).

### 4.2 Laporan Harian RM (RMFT & RM SME)
Komponen `TransactionForm.jsx` dan sub-komponen di `src/components/reports/` melayani dua jenis laporan melalui konfigurasi `src/config/transactionOptions.js`:

| | RMFT | RM SME |
|---|---|---|
| Pilihan Transaksi / Layanan | **Jenis Tabungan & Simpanan:** Tabungan Perusahaan (Giro), Deposito, Tabungan Biasa, Simpanan<br>**Merchant:** Merchant - QRIS, Merchant - EDC<br>**Transaksi & Layanan:** Pembukaan rekening, Setoran, Tarikan, Transfer, Aktivasi layanan, Lainnya | Konsultasi kredit, Pengajuan kredit, **Analisa kredit** *(pengajuan dianalisa terlebih dahulu untuk menilai kesanggupan bayar)*, Follow up pengajuan, Pembayaran angsuran, **Restrak kredit** *(kredit dapat diperpanjang tenornya atau diperkecil plafon/angsurannya)*, Lainnya |

Fitur pada halaman laporan:
- **Input data nasabah**: nama, tipe nasabah, nomor identitas (No. Rekening/NIK), telepon (dengan normalisasi tautan WhatsApp `62`), alamat, jenis transaksi, status & keterangan tindak lanjut (`pending` / `done`), foto pendukung.
- **Tautan tugas Tindak Lanjut**: saat membuka form dari tombol *Lanjutkan Laporan*, tampil banner tugas tertaut beserta opsi *Lepas Tautan* atau *Reset*.
- **Upload foto**: dikompres otomatis via `<canvas>` sebelum disimpan (base64).
- **View mode reaktif**: `?view=reports` menampilkan kartu laporan, mode biasa menampilkan form.
- **Pencarian & filter**: berdasarkan kata kunci, tipe nasabah, status tindak lanjut, dan jenis laporan (`?scope=all`).
- **Detail, Cetak PDF, Edit, Hapus** per laporan (dengan validasi error server agar state lokal tidak menyimpang).
- Data tersinkron ke Supabase `laporan_rm` dengan cache lokal per user & jenis form.

### 4.3 Tindak Lanjut
- Laporan berstatus `Perlu Ditindaklanjuti` otomatis membuat atau memperbarui tugas di tabel `tindak_lanjut` dan mencatat jejak audit di `tindak_lanjut_riwayat`.
- Halaman `/tindak-lanjut` menampilkan tab **Aktif** dan **Riwayat (Selesai)**, filter penanggung jawab (khusus Admin) & jenis laporan, masking nomor rekening/NIK, tombol **Lanjutkan Laporan**, detail **Riwayat Tugas**, dan penghapusan atomik tugas beserta laporan terkait melalui RPC `delete_tindak_lanjut_with_reports`.

### 4.4 Dashboard
- **Pegawai**: kartu menu RMFT, RM SME, dan Tindak Lanjut (dengan badge jumlah tugas aktif) + feed aktivitas terbaru (realtime).
- **Admin**: banner pusat kendali, ringkasan total laporan RMFT, RM SME, tugas tindak lanjut aktif, serta **grafik batang laporan per bulan** dengan pemilih tahun.

### 4.5 Pengelolaan Pegawai (Admin) & Riwayat Aktivitas
- Halaman `/employees`: daftar profil dari `profiles` (paginasi), pencarian nama/email/role, dan pengubahan role Pegawai ⇄ Admin.
- Halaman `/activity`: log aktivitas lokal + cloud (`aktivitas_log`) dengan filter peran (Admin), kategori (`RMFT`, `RM SME`, `Sistem`), pencarian, dan paginasi.

---

## 5. Struktur Database & Keamanan (Supabase)

| Tabel | Kolom Utama | Kegunaan |
|---|---|---|
| `profiles` | `id (=auth.uid)`, name, email, **role**, job_title, photo_url, updated_at | Data user & penentu role |
| `laporan_rm` | id, user_id, user_name, form_type, full_name, customer_type, identity_number, phone, address, transaction_type, follow_up_status, follow_up, tindak_lanjut_id, photo_url, created_at | Isi laporan harian RMFT / RM SME |
| `tindak_lanjut` | id, user_id, user_name, form_type, customer_name, customer_identity, customer_type, phone, activity, status, note, source_report_id, last_report_id, last_report_at, closed_at, closed_by, created_at, updated_at | Tugas tindak lanjut per nasabah/laporan |
| `tindak_lanjut_riwayat` | id, tindak_lanjut_id, report_id, user_id, user_name, action, status_before, status_after, note, created_at | Jejak audit perubahan status tugas |
| `aktivitas_log` | id, user_id, user_name, action, detail, created_at | Log aktivitas seluruh fitur |

### Kebijakan RLS (`supabase/role-access.sql` & `supabase/tindak-lanjut.sql`)
- **profiles**: SELECT/UPDATE milik sendiri atau Admin; INSERT hanya diri sendiri.
- **laporan_rm**: SELECT/UPDATE/DELETE milik sendiri (`user_id = auth.uid()`) atau Admin (`current_user_is_admin()`); INSERT harus `user_id = auth.uid()`.
- **tindak_lanjut & tindak_lanjut_riwayat**: akses penuh terbatas pada pemilik tugas atau Admin, ditambah RPC `delete_tindak_lanjut_with_reports`.
- **aktivitas_log**: SELECT milik sendiri atau Admin; INSERT hanya untuk diri sendiri.
- **Trigger `protect_profile_role`**: non-admin tidak bisa mengubah `role` sendiri.

---

## 6. Pemetaan Rute (Routing)

| Rute | Halaman | Akses |
|---|---|---|
| `/` | Home → Dashboard sesuai role | Login |
| `/login` | AuthPage (Login/Registrasi) | Hanya tanpa sesi |
| `/rmft` | Form & laporan RMFT | Login |
| `/rmkredit` | Form & laporan RM SME | Login |
| `/rmft?view=reports` | Mode daftar laporan | Login |
| `/rmft?view=reports&scope=all` | Laporan gabungan semua pegawai | **Admin** |
| `/tindak-lanjut` | Daftar tugas & riwayat tindak lanjut | Login |
| `/employees` | Pengelolaan pegawai | **Admin** (redirect ke `/` jika bukan) |
| `/activity` | Riwayat aktivitas | Login |
| `*` | Redirect → `/` atau `/login` | — |

---

## 7. Catatan Operasional

1. **Foto disimpan sebagai base64 di kolom `photo_url`** — praktis tanpa konfigurasi bucket tambahan, tetapi untuk jangka panjang sebaiknya dipindahkan ke **Supabase Storage** agar ukuran tabel dan cache tetap ringan.
2. **User yang terdaftar saat offline** hanya tersimpan di `localStorage` dan perlu didaftarkan ulang saat koneksi Supabase kembali tersedia.
3. **Pastikan `.env` tidak di-commit ke Git** — jika `.env` sebelumnya sempat ter-track oleh Git, jalankan `git rm --cached .env` agar tetap tersimpan secara lokal namun tidak ikut masuk riwayat commit berikutnya.
4. **Jalankan ulang kedua script SQL** (`supabase/role-access.sql` dan `supabase/tindak-lanjut.sql`) di SQL Editor Supabase agar policy `laporan_rm_select_own_or_admin` aktif di database produksi.

---

## 8. Cara Pengembangan Singkat

1. Salin `.env.example` menjadi `.env` lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
2. Jalankan `supabase/role-access.sql` dan `supabase/tindak-lanjut.sql` di SQL Editor proyek Supabase Anda.
3. `npm install` lalu `npm run dev`.
4. Daftar lewat UI → role default `Pegawai`; jadikan salah satu `Admin` lewat SQL Editor untuk membuka fitur admin.
