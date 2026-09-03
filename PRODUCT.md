# Product

Dokumentasi spesifikasi produk ini disusun berdasarkan hasil inspeksi aktual terhadap source code aplikasi **SUBTIFY**.

---

## Product Overview

- **Status**: Implemented
- **Deskripsi**: SUBTIFY adalah asisten digital berbasis kecerdasan buatan (AI) yang merekomendasikan bahan pengganti (substitusi) bumbu dan bahan masakan lokal dengan takaran terukur dan profil rasa yang kontekstual.
- **Tujuan Utama**: Memudahkan siapa saja memasak resep apa pun (termasuk resep barat/internasional) dengan memanfaatkan bahan-bahan yang mudah ditemukan di pasar tradisional, warung, atau supermarket lokal di Indonesia.

---

## Problem Statement

1. **Aksesibilitas Bahan (Pantry Gap)**: Banyak resep modern menggunakan bahan impor atau bahan khusus (seperti buttermilk, mirin, mascarpone, sour cream, wine) yang sulit dijangkau di luar kota besar atau berharga mahal. *(Implemented problem focus)*
2. **Kekeliruan Padanan Harfiah (Culinary Mistranslation)**: Penerjemahan langsung tanpa pemahaman biokimia memasak menyebabkan masakan gagal (misal: mengganti buttermilk dengan mentega biasa). *(Implemented problem focus)*
3. **Keraguan Takaran & Proporsi (Ratio Guesswork)**: Pengguna tidak mengetahui apakah bahan pengganti perlu dicairkan, ditambah asam, atau dikurangi takarannya. *(Implemented problem focus)*
4. **Pantangan Makanan & Kehalalan (Dietary & Halal Constraints)**: Masakan tertentu membutuhkan jaminan tanpa alkohol, tanpa produk turunan hewani, atau bebas laktosa. *(Implemented problem focus)*

---

## Target Users

1. **Juru Masak Rumahan & Pegiat Baking** *(Inferred from use cases & chips)*: Orang yang aktif mencoba resep baru tetapi memiliki keterbatasan persediaan bahan di dapur.
2. **Konsumen Muslim / Halal Conscious** *(Implemented via filter 'halal')*: Membutuhkan alternatif pengganti bumbu masakan Jepang/Cina/Barat yang mengandung mirin, sake, angciu, rum, atau gelatin babi.
3. **Pengguna dengan Pembatasan Diet** *(Implemented via filters)*: Individu dengan intoleransi laktosa (*dairy-free*), alergi gandum (*gluten-free*), atau gaya hidup nabati (*vegan*).
4. **Pemburu Belanja Hemat / Warung Lokal** *(Implemented via filter 'budget_local')*: Pengguna yang mengutamakan bahan yang dapat dibeli di tukang sayur keliling atau warung kelontong sekitar.

---

## User Needs

- **Need 1: Solusi Cepat Saat Memasak**: Mengetahui pengganti bahan saat wajan sudah di atas kompor atau adonan kue sedang disiapkan. *(Implemented)*
- **Need 2: Takaran yang Jelas & Dapat Dihitung**: Mengetahui berapa sendok makan atau mililiter bahan pengganti yang dibutuhkan sesuai takaran resep yang sedang dibuat. *(Implemented)*
- **Need 3: Penjelasan Rasa & Tekstur**: Memahami apa konsekuensi dari pergantian bahan terhadap rasa akhir makanan. *(Implemented)*
- **Need 4: Referensi Visual**: Mengetahui rupa fisik dari bahan pengganti yang disarankan. *(Implemented)*
- **Need 5: Akses Cepat Riwayat & Catatan**: Tidak perlu mengetik ulang bahan yang sering dicari. *(Implemented)*

---

## Core Use Cases

### 1. Mencari Bahan Pengganti via Teks
- **Status**: Implemented
- **Deskripsi**: Pengguna mengetik nama bahan (contoh: "tarragon" atau "heavy cream"), memilih konteks ("untuk saus steak"), lalu sistem mengembalikan 1–3 opsi bahan lokal dengan rincian rasa, tekstur, cara pakai, dan takaran.

### 2. Mengidentifikasi Bahan via Foto Kamera
- **Status**: Implemented
- **Deskripsi**: Pengguna mengunggah foto bumbu mentah atau potongan daun/rempah. Model multimodal mengidentifikasi nama bahan dan otomatis mengisi kolom pencarian.

### 3. Menghitung Proporsi Resep (Kalkulator Rasio)
- **Status**: Implemented
- **Deskripsi**: Pada kartu rekomendasi, pengguna memasukkan angka takaran dari resep mereka (misal: "250 ml") dan kalkulator menghitung jumlah bahan pengganti yang setara beserta tips penyiapannya.

### 4. Menyimpan & Mengelola Bahan Pengganti Favorit
- **Status**: Implemented
- **Deskripsi**: Pengguna menekan ikon bookmark pada kartu rekomendasi untuk menyimpannya ke panel laci (*drawer*) favorit yang tersimpan di penyimpanan lokal.

### 5. Mengganti Bahasa Tanpa Kehilangan Makna Kuliner
- **Status**: Implemented
- **Deskripsi**: Pengguna beralih antara Bahasa Indonesia dan Bahasa Inggris; kartu yang sedang aktif di-interpretasikan ulang secara kontekstual oleh AI.

---

## User Workflows

```
[Mulai]
   │
   ├─► Input Teks Bahan (atau Ambil Foto Bahan via Kamera)
   │
   ├─► Pilih Chip Konteks Resep (misal: Baking, Savory, Halal) [Opsional]
   │
   ├─► Aktifkan Filter Pantry (Halal, Bebas Susu, dsb.) [Opsional]
   │
   ├─► Tekan "Cari Alternatif"
   │      │
   │      ▼
   │   Loading State (Indikator animasi ramah dapur)
   │      │
   │      ▼
   ├─► Tampil 1–3 Kartu Rekomendasi:
   │      ├─ Foto Bahan Hasil AI (Imagen 3)
   │      ├─ Karakter Rasa & Tekstur
   │      ├─ Cara Pakai & Menu yang Cocok
   │      └─ Kalkulator Rasio Takaran (Input takaran -> Output takaran)
   │
   ├─► Tindakan Lanjutan:
   │      ├─ Salin Catatan Takaran
   │      ├─ Simpan ke Favorit
   │      └─ Cari Bahan Baru / Buka Riwayat Pencarian
   │
[Selesai]
```

---

## Functional Requirements

| Fitur | Status | Keterangan Aktual |
|---|---|---|
| Input Teks Bahan | **Implemented** | Validasi minimal 1 karakter non-spasi, ada placeholder contoh |
| Konteks Masakan | **Implemented** | Input teks bebas + 4 pilihan chip cepat (*Quick Context Chips*) |
| Filter Pantangan (6 filter) | **Implemented** | Toggle multi-select: Halal, Bebas Susu, Bebas Gluten, Vegan, Pasar Lokal, Rendah Gula |
| Deteksi Gambar Multimodal | **Implemented** | Input file gambar (kamera/galeri), diproses via FileReader Base64 ke Gemini Flash |
| Generasi Gambar Bahan | **Implemented** | Panggilan Imagen 3 per kartu rekomendasi; fallback string kosong jika kuota habis |
| Kalkulator Rasio Terstruktur | **Implemented** | Mengambil data `ratio` terstruktur dari respon Gemini; mendukung scaling presisi |
| Salin ke Clipboard | **Implemented** | Menyalin nama bahan dan rasio takaran |
| Bookmark / Favorit | **Implemented** | Tambah/hapus favorit, simpan ke `localStorage` |
| Riwayat Pencarian Terakhir | **Implemented** | Menyimpan hingga 10 kata kunci pencarian terakhir di `localStorage` |
| Beralih Bahasa (ID / EN) | **Implemented** | Mengubah teks antarmuka sekaligus memanggil fungsi interpretasi ulang pada data hasil |
| Reset & Cari Ulang | **Implemented** | Mengosongkan form dan mengembalikan fokus input teks |

---

## Business Rules

1. **Bukan Terjemahan Harfiah**: Prompt sistem secara mutlak melarang penerjemahan kata-demi-kata (misal: "buttermilk" dilarang diterjemahkan menjadi "susu mentega").
2. **Prioritas Bahan Pasar & Warung Tradisional**: AI diinstruksikan mengutamakan bahan yang lazim ditemukan di pasar basah atau warung kelontong Indonesia (santan, kelapa parut, jeruk nipis, tapioka, cuka putih).
3. **Kepatuhan Mutlak Filter Pantangan**: Jika filter `halal` aktif, AI dilarang keras merekomendasikan bahan berbahan dasar arak masak, sake, mirin beralkohol, rum, atau gelatin babi.
4. **Wajib Memiliki Data Rasio Numerik**: Setiap bahan pengganti wajib mengembalikan rasio numerik awal (misal: `originalAmount: 1`, `substituteAmount: 1`) agar kalkulator takaran dapat berfungsi.
5. **Batas Riwayat Pencarian**: Riwayat pencarian dibatasi maksimal 10 entri unik terbaru.

---

## Data / Entities

1. **Entity `Substitution`** *(Implemented)*:
   - `substituteName`: string
   - `reasoning`: { `flavor`: string, `texture`: string }
   - `howToUse`: string
   - `bestFor`: string
   - `imageUrl`: string (Base64 JPEG dari Imagen 3)
   - `ratio`: { `originalAmount`: number, `originalUnit`: string, `substituteAmount`: number, `substituteUnit`: string, `prepTip`?: string }
   - `language`: 'en' | 'id'
2. **Entity `SavedFavoriteItem`** *(Implemented)*:
   - `id`: string (timestamp + random string)
   - `originalIngredient`: string
   - `substitution`: Substitution
   - `savedAt`: number (epoch ms)
   - `language`: 'en' | 'id'
   - `context`?: string
   - `activeFilters`?: PantryFilterId[]
3. **Entity `PantryFilter`** *(Implemented)*:
   - `id`: string ('halal' | 'dairy_free' | 'gluten_free' | 'vegan' | 'budget_local' | 'low_sugar')
   - `labelId` / `labelEn`: string
   - `icon`: string
   - `promptInstructionId` / `promptInstructionEn`: string

---

## AI Capabilities

1. **Penalaran Kuliner & Substitusi Terstruktur**:
   - Model: `gemini-3.8-flash`
   - Output: JSON Array terstruktur dengan strict response schema
2. **Pengenalan Bahan Berbasis Gambar (Multimodal Vision)**:
   - Model: `gemini-3.8-flash`
   - Input: Base64 data URI (PNG/JPEG/WebP) + teks prompt
3. **Pembangkitan Visual Makanan Realistis**:
   - Model: `imagen-3.0-generate-002`
   - Output: Gambar 16:9 beresolusi terstandar
4. **Interpretasi Ulang Kontekstual Antar-Bahasa**:
   - Model: `gemini-3.8-flash`
   - Menerjemahkan istilah rasa dan tekstur masakan agar alami di telinga orang Indonesia atau penutur bahasa Inggris tanpa merusak rasio matematis

---

## Integrations

- **Google Gen AI API (`@google/genai`)**: **Implemented**. Terkoneksi langsung dari browser melalui environment variable `GEMINI_API_KEY`.
- **Database Cloud (Firestore / Cloud SQL)**: **Planned / Not Implemented**. Belum ada integrasi database cloud; hanya menggunakan penyimpanan browser lokal.
- **Autentikasi Pengguna (Firebase Auth / OAuth)**: **Out of Scope**. Tidak ada login akun.

---

## UX Principles

1. **Warm Kitchen Canvas**: Nuansa warna terakota dan putih hangat (`#C25E2E`, `#FAF8F5`) yang mencerminkan suasana dapur rempah yang ramah, bukan aplikasi teknologi dingin.
2. **Bottom-Sheet Ergonomics**: Tata letak lembar geser bawah (*sliding bottom sheet*) di atas latar belakang fotografi kuliner, nyaman digunakan dengan satu tangan pada layar ponsel.
3. **Anti-Slop Boundaries**: Sudut rounded yang tegas dan wajar (`rounded-md` 6px, bukan pil gelembung 24px+), tipografi berjenjang jelas (kontras antara judul serif *Newsreader* dan teks badan *Plus Jakarta Sans*), serta tombol dengan teks satu baris tanpa wrapping.
4. **Direct Culinary Action**: Hasil pencarian langsung memberikan takaran dan tombol kalkulator yang interaktif, bukan sekadar artikel bacaan panjang.

---

## Current Scope

- Aplikasi web satu halaman (*Single-Page Application*).
- Pencarian bahan pengganti berbasis teks dan foto.
- Filter pantangan diet & warung lokal.
- Kalkulator takaran porsi resep.
- Bookmark favorit dan riwayat pencarian berbasis *localStorage*.
- Pemilihan bahasa (ID / EN).

---

## Out of Scope

- Pembelian bahan belanja online / integrasi e-commerce (misal: Tokopedia, Sayurbox).
- Fitur manajemen resep lengkap (langkah memasak lengkap, timer memasak).
- Forum sosial atau komunitas berbagi tips antar pengguna.
- Akun login dan sinkronisasi multi-perangkat.

---

## Known Limitations

- Panggilan API langsung dari peramban membuat `API_KEY` berpotensi terekspos.
- Jika sambungan internet lambat, waktu tunggu Imagen 3 dapat memperpanjang loading hingga beberapa detik.
- Pengenalan gambar bergantung pada ketajaman foto bumbu mentah; jika bumbu sudah tercampur dalam masakan matang, deteksi menjadi kurang akurat.

---

## Future Opportunities

- **Penyimpanan Cloud**: Sinkronisasi resep favorit antar perangkat menggunakan Firebase Firestore.
- **Integrasi Keranjang Belanja**: Tautan langsung ke toko kelontong atau marketplace online untuk membeli bahan substitusi yang disarankan.
- **Katalog Bumbu Offline**: Cache database lokal untuk bahan-bahan umum agar dapat dibuka tanpa kuota internet saat berada di pasar tradisional.
