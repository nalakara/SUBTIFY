# SUBTIFY — Asisten Bahan Pengganti Bumbu & Masakan Lokal

> **One-line description:** Asisten pencarian bahan pengganti (substitusi) bumbu dan bahan masakan lokal Indonesia/Asia Tenggara yang praktis, ramah pasar tradisional, dan dilengkapi kalkulator takaran resep interaktif.

🌐 **Live Demo**: https://subtify.vercel.app

---

## Overview

**SUBTIFY** adalah aplikasi web eksperimental yang dirancang untuk membantu juru masak rumahan, pembuat kue, dan pecinta kuliner menemukan alternatif bahan masakan saat bahan asli yang tertulis di resep asing atau resep khusus sulit didapat, mahal, tidak halal, atau terhalang pantangan diet.

Alih-alih sekadar menerjemahkan nama bahan secara harfiah (misal: *buttermilk* menjadi "susu mentega" yang membingungkan), aplikasi ini menggunakan Large Language Model (LLM) untuk memahami **fungsi kimiawi dan kuliner** suatu bahan (keasaman, lemak, emulsifikasi, kelembapan), lalu mencocokkannya dengan bahan yang lazim dijual di warung kelontong, tukang sayur, atau pasar tradisional Indonesia (seperti santan, jeruk nipis, kemiri, cuka putih, tapioka).

---

## Problem yang Ingin Diselesaikan

1. **Kelangkaan & Mahalnya Bahan Asing**: Resep internasional sering menyebut bahan seperti *mirin*, *buttermilk*, *crème fraîche*, *tarragon*, atau *molasses* yang jarang ada di warung lokal dan sangat mahal di supermarket impor.
2. **Terjemahan Mesin yang Kaku & Keliru**: Penerjemah konvensional sering menghasilkan padanan yang salah fungsi secara kuliner dan membingungkan pengguna dapur.
3. **Ketidakpastian Rasio Takaran**: Pengguna sering bingung berapa gram atau sendok bahan pengganti yang harus dipakai agar tekstur dan rasa masakan tidak rusak.
4. **Pantangan Diet & Kehalalan**: Kebutuhan untuk mengganti bahan masakan yang mengandung alkohol (mirin, rum, angciu), gelatin hewani non-halal, atau alergen (susu sapi, gluten).

---

## Target User

- **Home Cooks & Baking Enthusiasts**: Ibu rumah tangga atau pehobi masak yang sedang mempraktikkan resep internet dan kehabisan/tidak punya salah satu bumbu.
- **Pengguna dengan Kebutuhan Khusus**: Konsumen yang mencari alternatif Halal, bebas laktosa (*dairy-free*), bebas gluten, atau berbasis nabati (*plant-based*).
- **Masyarakat Urban & Daerah**: Pengguna yang berbelanja harian di warung lokal atau pasar basah, bukan di supermarket impor modern.

---

## Core Features (Fitur Utama)

1. **Pencarian Substitusi Berbasis AI**:
   - Analisis nama bahan dengan konteks masakan spesifik (misal: "untuk bolu chiffon" vs "untuk kuah gulai").
   - Penjelasan terpisah antara profil rasa (*flavor*) dan tekstur masakan (*texture*).
   - Panduan cara pakai dan kecocokan menu (*best for*).
2. **Kalkulator Rasio Takaran (Recipe Ratio Calculator)**:
   - Menghitung otomatis perbandingan bahan pengganti berdasarkan jumlah bahan resep asli.
   - Pilihan pengganda instan (0.5x, 1x, 2x) dan pilihan satuan (gram, ml, cup, sdm, sdt).
   - Tombol salin hasil hitungan ke papan klip.
3. **Filter Pantangan & Dapur (Pantry Filters)**:
   - Alternatif Halal (tanpa alkohol/mirin/angciu/gelatin non-halal).
   - Bebas Susu / Laktosa (*Dairy-Free*).
   - Bebas Gluten (*Gluten-Free*).
   - Berbasis Nabati / Vegan.
   - Pasar & Warung Lokal (prioritas bahan ekonomis ramah warung).
   - Rendah Gula.
4. **Pemindai Bahan dari Foto (Camera / Image Input)**:
   - Mengenali bahan mentah atau bumbu dapur melalui unggahan foto kamera menggunakan model multimodal.
5. **Dukungan Dua Bahasa (Bilingual: ID & EN)**:
   - Antarmuka lengkap dalam Bahasa Indonesia dan Bahasa Inggris.
   - Interpretasi kuliner ulang secara dinamis tanpa merusak takaran rasio.
6. **Penyimpanan Lokal (Favorites & Recent Searches)**:
   - Simpan kartu rekomendasi ke daftar favorit (*localStorage*).
   - Riwayat 10 pencarian terakhir untuk akses cepat tanpa panggilan AI ulang.

---

## Main User Workflow

1. **Membuka Aplikasi**: Pengguna disambut antarmuka lembar geser (*bottom sheet*) bergaya dapur hangat.
2. **Memasukkan Bahan**:
   - Pengguna mengetik nama bahan (contoh: *mirin* atau *heavy cream*), ATAU
   - Mengambil foto bahan yang ada di depannya.
3. **Menentukan Konteks & Filter (Opsional)**:
   - Memilih chip cepat (contoh: *Baking & Pastry*, *Savory & Stews*, *Alternatif Halal*).
   - Mengaktifkan filter diet tertentu.
4. **Melihat Hasil Rekomendasi**:
   - Muncul 1–3 kartu bahan alternatif lengkap dengan foto ilustrasi, analisis rasa, tekstur, dan rekomendasi masakan.
5. **Menyesuaikan Takaran Resep**:
   - Membuka kalkulator pada kartu substitusi, memasukkan takaran dari resep pengguna, dan melihat hasil konversi.
6. **Menyimpan / Menyalin**:
   - Menyimpan ke favorit atau menyalin teks takaran ke catatan masak.

---

## How the Application Works

1. **Frontend Client**: Berbasis React 19 + TypeScript yang dijalankan via bundler Vite 6.
2. **AI Reasoning**:
   - Model `gemini-3.8-flash` menerima prompt terstruktur dengan *system instruction* khusus kuliner Nusantara.
   - Menggunakan fitur `responseSchema` (JSON murni) untuk menghasilkan objek data yang konsisten (nama, rasa, tekstur, cara pakai, rasio).
3. **Generasi Gambar**:
   - Untuk setiap bahan pengganti yang disarankan, aplikasi memanggil model `imagen-3.0-generate-002` untuk membuat gambar makanan realistis.
4. **Analisis Gambar**:
   - Foto masakan diubah menjadi Base64 lalu dianalisis oleh `gemini-3.8-flash` untuk mendeteksi nama bahan kuliner.

---

## Technology Stack

- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.2
- **Bundler & Dev Server**: Vite 6.2.0
- **Styling**: Tailwind CSS (CDN runtime script dengan konfigurasi kustom)
- **Typography**: Google Fonts (*Plus Jakarta Sans* untuk UI/body, *Newsreader* untuk judul serif)
- **Icons**: Lucide React
- **AI SDK**: `@google/genai` (Google Gen AI SDK v1.12.0)
- **AI Models**:
  - `gemini-3.8-flash` (Teks, JSON terstruktur, Visi/Multimodal)
  - `imagen-3.0-generate-002` (Generasi foto bahan)

---

## Current Status

- **Status**: **Functional Prototype / Working Concept**
- Semua alur pencarian teks, filter pantry, kalkulator takaran, penyimpanan lokal, pemindaian foto, dan pengalihan bahasa bekerja secara nyata tanpa data tiruan (*no mock data*).
- Belum memiliki backend server terpisah (seluruh pemanggilan AI SDK dilakukan langsung dari peramban/browser).

---

## Known Limitations

1. **Eksposur API Key di Client**: Kunci `GEMINI_API_KEY` dimasukkan langsung ke bundle Vite melalui `vite.config.ts`, sehingga rentan terlihat di peramban jika di-deploy ke domain publik.
2. **Latensi Generasi Gambar**: Panggilan Imagen 3 dilakukan bersamaan (*concurrent*) untuk 1–3 bahan, yang dapat memakan waktu 3–8 detik tergantung beban server Google.
3. **Penyimpanan Terbatas**: Data favorit dan riwayat pencarian hanya tersimpan di `localStorage` peramban pengguna; belum ada sinkronisasi akun antar-perangkat.
4. **Tailwind via CDN**: Menggunakan skrip CDN `https://cdn.tailwindcss.com` di `index.html` dan bukan PostCSS/Tailwind v4 native build, yang kurang ideal untuk performa produksi skala besar.

---

## Important Notes for Future Developers

- **Jangan Merusak Skema JSON AI**: Logika kalkulator rasio sangat bergantung pada keutuhan objek `ratio` (`originalAmount`, `originalUnit`, `substituteAmount`, `substituteUnit`) yang dikembalikan oleh Gemini di `services/geminiService.ts`.
- **Pindahkan Panggilan AI ke Backend**: Jika aplikasi ini akan dipublikasikan ke production, hal nomor satu yang wajib dilakukan adalah membuat server proxy (Express, Fastify, atau Cloud Function) agar API key aman di sisi server.
- **Pertahankan Nuansa Kuliner**: Hindari mengembalikan prompt AI ke penerjemah umum. Nilai utama aplikasi ini terletak pada *system instruction* yang menuntut penalaran kuliner biokimiawi dan kosakata bumbu lokal Nusantara.

## Cara Menjalankan

```bash
npm install
cp .env.example .env   # isi GEMINI_API_KEY untuk pencarian substitusi AI
npm run dev
```

Buka `http://localhost:5173`.
---

## License

MIT License © 2026 Yudhan Sebastian
