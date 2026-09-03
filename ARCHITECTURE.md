# Architecture

Dokumen ini membedah arsitektur teknis aplikasi **SUBTIFY** berdasarkan inspeksi langsung terhadap struktur berkas, dependensi, dan logika kode sumber.

---

## Technology Stack

- **Runtime & Bundler**: Node.js dengan Vite 6.2.0 (ESM mode, `"type": "module"`)
- **Frontend Library**: React 19.1.1 + React DOM 19.1.1
- **Language**: TypeScript 5.8.2 (`strict: true`, target ES2020)
- **Styling**: Tailwind CSS via CDN script (`https://cdn.tailwindcss.com`) dengan konfigurasi inline di `index.html`
- **Typography Assets**: Google Fonts (*Plus Jakarta Sans* & *Newsreader*)
- **Icons**: `lucide-react` v1.39.0
- **AI SDK**: `@google/genai` v1.12.0
- **AI Models**: `gemini-3.8-flash` dan `imagen-3.0-generate-002`

---

## Project Structure

```
/
├── .gitignore                      # Konfigurasi pengecualian git
├── AGENTS.md                       # Instruksi sistem untuk AI coding agent
├── App.tsx                         # Komponen induk (State container & Sheet layout)
├── DESIGN.md                       # Panduan gaya visual & palet warna (Warm spice)
├── anti-slop/                      # Laporan audit UI anti-slop
├── bun.lock                        # Lockfile paket bun
├── components/                     # Direktori komponen UI terpisah
│   ├── ErrorMessage.tsx            # Alert pesan kesalahan ramah pengguna
│   ├── FavoritesDrawer.tsx         # Panel laci riwayat & favorit yang tersimpan
│   ├── LanguageSwitcher.tsx        # Toggle dua bahasa (ID / EN)
│   ├── LoadingSpinner.tsx          # Animasi indikator loading
│   ├── PantryFilterBar.tsx         # Kumpulan tombol toggle filter pantangan diet
│   ├── RatioCalculator.tsx         # Komponen interaktif kalkulator konversi takaran
│   ├── SubstitutionCard.tsx        # Kartu detail rekomendasi bahan pengganti
│   └── icons/                      # Komponen ikon SVG kustom lokal (sebagian legacy)
├── constants/
│   └── filters.ts                  # Definisi data statis filter diet & instruksi prompt AI
├── index.html                      # HTML entry point, Tailwind CDN, Google Fonts
├── index.tsx                       # Entry point React DOM (mount ke #root)
├── metadata.json                   # Metadata aplikasi Google AI Studio
├── package.json                    # Deklarasi dependensi dan skrip build
├── services/
│   └── geminiService.ts            # Modul integrasi Google Gen AI (Gemini & Imagen)
├── translations.ts                 # Kamus lokalisasi teks (ID & EN)
├── tsconfig.json                   # Konfigurasi compiler TypeScript
├── types.ts                        # Deklarasi tipe data & interface TypeScript
└── vite.config.ts                  # Konfigurasi bundler Vite dan injeksi API key
```

---

## Application Structure

Aplikasi ini merupakan **Client-Side Single-Page Application (SPA)** murni tanpa backend kustom (`server.ts` tidak ada). Seluruh siklus aplikasi dijalankan di peramban pengguna:

1. **Root Entry**: `index.tsx` me-mount `App.tsx` ke dalam elemen `#root`.
2. **Container Shell**: `App.tsx` menyusun kanvas latar belakang fotografi kuliner penuh (`100dvh`), bilah header atas, dan panel laci geser bawah (*sliding bottom sheet*).
3. **Komponen Presentasional & Interaktif**:
   - `PantryFilterBar`: Mengelola pemilihan filter pantangan.
   - `SubstitutionCard`: Menampilkan kartu bahan pengganti, gambar Imagen 3, analisis rasa, dan menyematkan `RatioCalculator`.
   - `FavoritesDrawer`: Menampilkan daftar bookmark dan pencarian terakhir dalam bentuk modal geser samping.
   - `LanguageSwitcher`: Tombol alih bahasa di header.

---

## Main Components

### 1. `App.tsx` (Central Orchestrator)
- Mengelola state global: bahan masakan, konteks resep, filter yang aktif, status loading (identifikasi gambar, pencarian, penerjemahan), daftar favorit, dan cache bahasa.
- Mengatur alur kamera/file upload (`FileReader` -> Base64).
- Mengatur interaksi lembar geser (*collapsed* / *expanded*).

### 2. `SubstitutionCard.tsx`
- Menampilkan rincian bahan: foto, label "Bagus untuk", analisis rasa, analisis tekstur, dan instruksi penyiapan.
- Menyediakan tombol aksi cepat: simpan favorit dan salin takaran.
- Merender anak komponen `RatioCalculator`.

### 3. `RatioCalculator.tsx`
- Mengambil data numerik awal (`originalAmount`, `substituteAmount`, satuan).
- Menyediakan tombol pengganda instan (0.5x, 1x, 2x) dan kolom masukan angka dinamis.
- Mengkalkulasi formula: `(inputAmount / originalAmount) * substituteAmount` secara *real-time*.

### 4. `FavoritesDrawer.tsx`
- Membagi tampilan menjadi dua tab: "Disimpan" (*Favorites*) dan "Riwayat" (*Recent Searches*).
- Memungkinkan pengguna memilih kembali bahan yang tersimpan untuk langsung dimuat ke layar utama tanpa meminta ulang ke AI.

### 5. `PantryFilterBar.tsx`
- Menampilkan 6 opsi filter diet berbentuk tombol ramah sentuhan dengan ikon representatif.

---

## Data Model

Definisi tipe data terpusat di `/types.ts`:

```typescript
export type Language = 'en' | 'id';

export type PantryFilterId = 
  | 'halal'
  | 'dairy_free'
  | 'gluten_free'
  | 'vegan'
  | 'budget_local'
  | 'low_sugar';

export interface SubstitutionRatio {
  originalAmount: number;
  originalUnit: string;
  substituteAmount: number;
  substituteUnit: string;
  prepTip?: string;
}

export interface Substitution {
  substituteName: string;
  reasoning: {
    flavor: string;
    texture: string;
  };
  howToUse: string;
  bestFor: string;
  imageUrl: string;
  ratio?: SubstitutionRatio;
  language?: Language;
}

export interface SavedFavoriteItem {
  id: string;
  originalIngredient: string;
  substitution: Substitution;
  savedAt: number;
  language: Language;
  context?: string;
  activeFilters?: PantryFilterId[];
}
```

---

## State Management

- **Mekanisme**: Menggunakan React built-in state hook (`useState`, `useCallback`, `useRef`, `useEffect`).
- **State Scope**:
  - `language`: Bahasa aktif ('id' atau 'en'), diinisialisasi dari `localStorage`.
  - `ingredient` & `context`: Teks masukan form.
  - `selectedFilters`: Array id filter yang aktif.
  - `substitutionsByLang`: Objek cache `{ id: Substitution[] | null, en: Substitution[] | null }` untuk mencegah panggilan AI berulang saat sekadar berganti bahasa.
  - `favorites` & `recentSearches`: Terhubung otomatis dengan `localStorage`.
  - `isLoading`, `isIdentifying`, `isTranslating`: Flag status asinkron untuk mengontrol feedback UI.
- **Evaluasi**: Sangat efisien untuk ukuran aplikasi prototipe. Tidak membutuhkan Redux atau Zustand karena pohon komponen dangkal (maksimal 2 tingkat kedalaman props).

---

## Data Flow

```
[User Input] (Teks Bahan / Foto Kamera)
      │
      ▼
[App.tsx] ─── Validasi & Susun Parameter Pencarian
      │
      ▼
[geminiService.ts]
      ├─► identifyIngredientFromImage() ──► Gemini 3.8 Flash (Visi) ──► Teks Bahan
      │
      ├─► findSubstitutions()
      │     ├─► Gemini 3.8 Flash (Structured JSON Schema) ──► Array Rekomendasi
      │     └─► Imagen 3 (Concurrent Prompts) ──► Base64 JPEG Images
      │
      └─► interpretSubstitutionsLanguage() ──► Gemini 3.8 Flash (Adaptasi Bahasa)
      │
      ▼
[State: substitutionsByLang]
      │
      ▼
[SubstitutionCard] & [RatioCalculator] (Render & Interaksi Pengguna)
      │
      ▼
[localStorage] (Opsional: Disimpan ke Favorit / Riwayat)
```

---

## Storage / Persistence

- **Metode**: Browser `localStorage` murni.
- **Kunci Penyimpanan**:
  - `subtify_favorites_v1`: Menyimpan array objek `SavedFavoriteItem` dalam bentuk string JSON.
  - `subtify_recent_searches_v1`: Menyimpan array string pencarian terbaru (dibatasi 10 entri).
  - `subtify_lang`: Menyimpan preferensi bahasa ('id' atau 'en').
- **Penanganan Error**: Dibungkus blok `try ... catch` untuk mencegah crash jika pengguna mengaktifkan mode penyamaran (*Incognito*) yang memblokir akses penyimpanan.

---

## External Services

- **Google Gen AI API Gateway**: `https://generativelanguage.googleapis.com` melalui library resmi `@google/genai`.
- **Unsplash Image CDN**: Mengambil satu gambar latar belakang statis resolusi tinggi (`https://images.unsplash.com/photo-1504674900247-0877df9cc836`).
- **Google Fonts CDN**: Memuat stylesheet font *Plus Jakarta Sans* dan *Newsreader*.
- **Tailwind CDN**: Memuat skrip runtime `https://cdn.tailwindcss.com`.

---

## AI Integration

Implementasi AI di `/services/geminiService.ts` memanfaatkan dua fitur mutakhir:

1. **Structured Outputs (Response Schema)**:
   - Menggunakan `Type.ARRAY` dan `Type.OBJECT` dengan daftar `required` fields yang ketat.
   - Menjamin bahwa AI tidak mengembalikan teks bebas, melainkan objek JSON yang langsung dapat diproses oleh kode TypeScript tanpa parsing string yang rentan gagal.
2. **System Instruction dengan Pembatasan Ketat**:
   - Menegaskan identitas pakar kuliner Nusantara.
   - Memberikan aturan tegas anti-terjemahan harfiah.
   - Menyesuaikan terminologi bumbu dan takaran pasar tradisional.
3. **Multimodal Reasoning**:
   - Mengirimkan data biner gambar langsung ke model tanpa perlu menyimpan file di server penampung terlebih dahulu.
4. **Eksekusi Asinkron Bersamaan (Parallel Processing)**:
   - Gambar untuk setiap kartu substitusi dipanggil menggunakan `Promise.all` agar waktu eksekusi generasi gambar berjalan paralel.

---

## Important Dependencies

| Paket | Versi | Peran |
|---|---|---|
| `react` & `react-dom` | `^19.1.1` | Antarmuka pengguna inti |
| `@google/genai` | `^1.12.0` | SDK resmi Google untuk Gemini & Imagen |
| `lucide-react` | `^1.39.0` | Ikonografi UI |
| `vite` | `^6.2.0` | Server dev dan bundler produksi |
| `typescript` | `~5.8.2` | Pengecekan tipe statis |

---

## Architectural Patterns

- **Modular Service Layer**: Seluruh logika komunikasi AI diisolasi dalam `services/geminiService.ts`, memisahkan urusan API dari komponen antarmuka.
- **Lifting State Up**: State utama dipegang oleh `App.tsx` dan disalurkan ke komponen anak melalui props.
- **Fail-Safe & Graceful Degradation**: Jika model Imagen 3 gagal atau kehabisan kuota, blok `catch` mengembalikan string kosong sehingga kartu tetap dapat muncul tanpa gambar tanpa membuat aplikasi macet.
- **Contextual Adaptation over Direct Translation**: Penerjemahan data dinamis tidak menggunakan kamus kata-per-kata, melainkan model AI yang mempertahankan fungsi kuliner bahan.

---

## Security Considerations

> [!CAUTION]
> **Temuan Kritis (Critical Finding)**:
> Pada konfigurasi `vite.config.ts`:
> ```typescript
> define: {
>   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
>   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
> }
> ```
> Nilai `GEMINI_API_KEY` dimasukkan secara langsung (*hardcoded into bundle*) ke dalam kode JavaScript yang dikirimkan ke peramban pengguna. Siapa pun yang membuka tab *Inspect Element -> Network / Sources* dapat membaca kunci API tersebut.

- **Mitigasi yang Diperlukan**: Wajib membungkus pemanggilan AI ke dalam server backend proxy (Express, Cloud Run, atau serverless functions) sebelum kode ini disebarkan ke publik.

---

## Current Technical Debt

1. **Tailwind via CDN**: Menggunakan skrip CDN di peramban membuat file HTML bergantung pada eksternal script dan memunculkan peringatan konsol bahwa skrip CDN tidak disarankan untuk production.
2. **Ketiadaan Server Proxy**: Belum ada abstraksi backend server untuk melindungi kredensial API.
3. **Komponen Ikon Duplikat**: Direktori `/components/icons/` berisi SVG lama yang tidak lagi digunakan karena sebagian besar ikon sudah beralih ke `lucide-react`.
4. **Penyimpanan Lokal Monolitik**: Riwayat dan favorit disimpan dalam satu string JSON tanpa validasi skema runtime (misal: menggunakan Zod).

---

## Scalability Considerations

- **Sisi Klien**: Aplikasi ini sangat ringan (*zero server load*) karena bersifat static client. Biaya hosting sangat rendah (dapat di-host di Cloudflare Pages, Vercel, atau GitHub Pages).
- **Sisi AI Quota & Biaya**: Pemanggilan Imagen 3 bersamaan untuk setiap kartu rekomendasi (1–3 gambar per pencarian) mengonsumsi kuota dan biaya API yang jauh lebih tinggi daripada panggilan teks biasa. Jika pengguna meningkat, biaya Imagen akan mendominasi.

---

## Maintainability Considerations

- Kode sangat modular dan mudah dipahami oleh pengembang baru.
- Penamaan tipe di `types.ts` dan fungsi di `geminiService.ts` sangat deskriptif dan konsisten.
- Skema terstruktur meminimalisasi kemungkinan *runtime crash* akibat format data yang tidak konsisten.

---

## Architecture Assessment

### What Was Actually Found
1. Arsitektur Single-Page Application (SPA) React 19 murni berbasis Vite.
2. Integrasi langsung ke SDK `@google/genai` dari peramban.
3. Penyimpanan data berbasis `localStorage`.
4. Skema terstruktur JSON schema di Gemini Flash.

### Interpretation
Aplikasi ini dibangun sebagai **prototipe eksperimental fungsional tingkat tinggi (*high-fidelity functional prototype*)** di Google AI Studio. Fokus utamanya adalah membuktikan konsep *culinary contextual intelligence* dan pengalaman pengguna lembar geser seluler, bukan arsitektur multi-tier enterprise.

### Assumptions
- Aplikasi ini sengaja dibuat tanpa backend untuk mempercepat proses uji coba ide dan kemudahan demonstrasi di lingkungan preview sandbox.
