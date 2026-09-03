# Product Review

Evaluasi objektif dan menyeluruh terhadap kondisi aplikasi **SUBTIFY** saat ini.

---

## Current Maturity

**Pilihan**: **Functional Prototype**

### Alasan:
1. **Bukan Sekadar Mockup**: Aplikasi ini bukan sekadar purwarupa visual pasif. Seluruh fungsionalitas inti (pencarian bahan, deteksi foto kamera, kalkulasi takaran, filter pantangan, bookmark favorit, dan alih bahasa dinamis) bekerja secara nyata dan menghasilkan keluaran yang bermakna menggunakan model AI terkini.
2. **Belum Memenuhi Syarat Production / MVP Publik**:
   - Kunci API (`GEMINI_API_KEY`) masih bocor ke sisi klien browser via konfigurasi build Vite.
   - Styling masih bergantung pada skrip CDN runtime eksternal.
   - Belum memiliki manajemen akun, backend proxy, atau persistensi data di awan (*cloud*).
3. **Kategori yang Tepat**: Berada di titik ideal sebuah *Functional Prototype* berkualitas tinggi: konsep teruji, interaksi matang, namun fondasi infrastrukturnya masih perlu disesuaikan sebelum diluncurkan ke khalayak luas.

---

## What Works Well

1. **Kualitas Prompt & Penalaran Kuliner**: *System instruction* yang diterapkan pada `gemini-3.8-flash` sangat efektif. AI tidak melakukan terjemahan kaku, melainkan mengusulkan alternatif yang masuk akal di dapur Indonesia (seperti kombinasi santan + jeruk nipis untuk buttermilk, atau cuka putih + gula aren untuk pengganti bumbu tertentu).
2. **Kalkulator Rasio Takaran yang Nyata**: Logika konversi takaran di `RatioCalculator.tsx` sangat praktis. Pembuat kue atau juru masak tidak perlu menghitung manual di kalkulator terpisah; mereka dapat langsung mengubah takaran resep dan menyalin hasilnya.
3. **Desain Visual yang Hangat & Bebas "AI Slop"**: Palet warna *warm spice* (`#C25E2E`, `#FAF8F5`, `#1C1917`), tipografi serif *Newsreader* yang dipadukan dengan *Plus Jakarta Sans*, serta sudut lengkung yang tegas dan proporsional memberikan kesan produk kuliner profesional dan bersahabat.
4. **Respon Skema Data yang Konsisten**: Penggunaan `responseSchema` memastikan komponen UI tidak pernah rusak akibat kegagalan parsing format Markdown atau teks liar dari LLM.
5. **Dua Bahasa yang Adaptif**: Peralihan antara Bahasa Indonesia dan Bahasa Inggris tidak merusak data rasio, melainkan mengadaptasikan istilah rasa dan tekstur masakan secara kontekstual.

---

## What Is Valuable

1. **Penyelesaian Masalah Nyata (High Real-World Utility)**: Masalah "bahan resep tidak ada di warung dekat rumah" adalah friksi harian jutaan orang yang memasak. Nilai produk ini sangat jelas dan langsung terasa.
2. **Fitur "Alternatif Halal"**: Mengganti bumbu masakan Jepang/Cina beralkohol (mirin, shaoxing wine, angciu) dengan bahan halal lokal adalah kebutuhan besar yang jarang diakomodasi oleh aplikasi resep barat.
3. **Pemisahan Rasa vs. Tekstur**: Mendidik pengguna tentang *mengapa* bahan tersebut cocok (misal: "rasanya gurih legit mirip, tetapi teksturnya sedikit lebih cair sehingga perlu dikurangi airnya").

---

## UX Issues

1. **Waktu Tunggu Generasi Gambar yang Cukup Lama**: Pemanggilan Imagen 3 memakan waktu 3–6 detik. Walaupun ada indikator loading, pengguna yang terburu-buru di dapur mungkin merasa jeda ini terlalu lama.
2. **Ketergantungan pada Gambar Latar Belakang Berat**: Foto latar belakang Unsplash berukuran cukup besar dan dapat memperlambat rendering awal (*First Contentful Paint*) jika koneksi seluler di dapur tidak stabil.
3. **Penutupan Lembar Bawah di Layar Ponsel Kecil**: Saat keyboard virtual ponsel muncul saat mengetik konteks resep, posisi lembar geser terkadang terdesak ke atas dan menutupi sebagian tombol utama.

---

## Product Issues

1. **Kurangnya Rekomendasi Instan (Zero-State Empty Space)**: Saat pertama kali membuka aplikasi, pengguna harus mengetik sendiri. Belum ada daftar rekomendasi instan untuk bahan-bahan yang paling sering dicari (misal: "Populer dicari: Buttermilk, Mirin, Mascarpone, Heavy Cream, Oregano").
2. **Tidak Ada Indikator Tingkat Kemudahan Beli**: Aplikasi belum memberikan label apakah bahan pengganti bisa dibeli di "Warung Kelontong" vs "Supermarket Biasa".
3. **Ketergantungan Kuota Imagen**: Jika kuota Imagen 3 habis atau model mengalami rate-limit, kartu muncul tanpa gambar (walaupun teks tetap berfungsi dengan baik).

---

## Technical Issues

1. **Kebocoran Kunci API di Klien**: Variabel `process.env.API_KEY` diinjeksikan langsung ke dalam bundle JS frontend oleh Vite. Ini adalah celah keamanan paling krusial.
2. **Tailwind via Browser CDN**: `https://cdn.tailwindcss.com` tidak boleh digunakan untuk build produksi karena memperlambat rendering dan meningkatkan ukuran download halaman.
3. **Penyimpanan Browser Rawan Terhapus**: Jika pengguna membersihkan cache browser atau ganti browser di ponsel, seluruh daftar resep favorit yang tersimpan akan hilang.

---

## Technical Debt

- Direktori `/components/icons/` memuat 6 komponen SVG lama yang sudah digantikan fungsinya oleh `lucide-react`. Direktori ini perlu dibersihkan (*dead code*).
- Belum ada skrip pengujian otomatis (*unit tests* atau *integration tests*) untuk kalkulasi rasio takaran.
- Belum ada skema validasi runtime (misal: Zod) saat membaca data dari `localStorage`.

---

## Missing Functionality

- **Backend Proxy API**: Endpoint `/api/substitutions` untuk menyembunyikan komunikasi Gemini SDK dari browser.
- **Katalog Cepat (Curated Presets)**: Tombol pintas untuk 10 bahan substitusi paling legendaris tanpa perlu memanggil AI setiap saat.
- **Mode Berbagi (Share / Export)**: Tombol untuk membagikan kartu substitusi ke WhatsApp sebagai teks ringkas ramah belanja.

---

## Risks

1. **Risiko Biaya API (Cost Spike)**: Model Imagen 3 memiliki biaya per panggilan yang jauh lebih tinggi daripada Gemini Flash. Setiap kali pengguna mencari 1 bahan, sistem membangkitkan 1–3 gambar baru.
2. **Risiko Halusinasi Kuliner pada Bahan Kimia Khusus**: Meskipun sudah dibatasi oleh instruksi sistem, pada bahan-bahan fermentasi khusus (seperti ragi liar atau enzim tertentu), AI berpotensi memberikan substitusi yang tidak dapat mengembang jika proporsinya salah.

---

## What Should Be Preserved

1. **Prompt System & Schema**: Konfigurasi prompt di `geminiService.ts` adalah aset paling berharga dari proyek ini. Struktur penjelas rasa, tekstur, cara pakai, dan objek rasio harus dipertahankan 100%.
2. **Komponen `RatioCalculator.tsx`**: Fitur ini membedakan SUBTIFY dari sekadar chatbot teks biasa.
3. **Identitas Visual Warm Spice & Sheet UX**: Estetika warna kayu manis, tipografi Newsreader/Jakarta Sans, dan pola lembar bawah terbukti sangat ergonomis.
4. **Filter Pantangan (Halal, Bebas Susu, dsb.)**: Fitur diferensiasi utama yang sangat relevan untuk pasar lokal.

---

## What Should Be Changed

1. **Arsitektur API**: Pindahkan `@google/genai` ke backend server (Node.js/Express atau serverless function) dan hanya kirimkan data JSON murni ke client.
2. **Optimasi Gambar**: Ganti pembangkitan gambar *on-the-fly* Imagen 3 dengan sistem pencarian gambar berbasis Unsplash API, ikon kuliner terkurasi, atau sediakan opsi toggle (hanya teks vs teks + gambar) untuk menghemat biaya dan memangkas latensi.
3. **Build Styling**: Ganti Tailwind CDN dengan Tailwind CSS build pipeline standar.

---

## What Should NOT Be Over-Engineered

- **Jangan Membangun Sistem Resep Penuh**: Jangan mengubah aplikasi ini menjadi aplikasi media sosial resep lengkap dengan timeline, komentar, rating bintang, dan video tutorial. Fokusnya harus tetap tajam: **alat bantu bumbu pengganti saat memasak**.
- **Jangan Memasang Database Relasional Kompleks**: Untuk fase awal, Firebase Firestore atau penyimpanan lokal yang disinkronkan sudah lebih dari cukup; tidak perlu kluster PostgreSQL/Cloud SQL yang membebani biaya server.

---

## Recommended Direction

### Pilihan Rekomendasi Utama: **EVOLVE (Kembangkan Lebih Lanjut)**

### Alasan Objektif:
Aplikasi ini memiliki **Product-Problem Fit** yang sangat kuat dan nyata. Ide produknya bukan sekadar eksperimen main-main, dan implementasi antarmuka serta logikanya saat ini sudah 85% solid.

Memilih *ARCHIVE* adalah pemborosan karena produk ini memiliki daya guna nyata. Memilih *REBUILD IN ANTIGRAVITY* dari nol juga tidak efisien karena struktur antarmuka, pemisahan komponen, dan prompt kuliner yang sudah ada di sini sudah dieksekusi dengan sangat rapi dan bebas *slop*.

Langkah paling tepat adalah **EVOLVE**:
1. Buat layer backend ringan (Express/Node.js) untuk memindahkan panggilan `@google/genai` dari client ke server.
2. Ganti skrip Tailwind CDN ke build lokal.
3. Tambahkan 8–10 preset bahan populer di halaman depan untuk pencarian instan.
4. Pindahkan repository ini ke GitHub dan pasang di domain publik sebagai produk portfolio atau micro-SaaS yang siap digunakan oleh ribuan juru masak rumahan.
