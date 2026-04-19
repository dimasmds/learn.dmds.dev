# 01 — Product Design

## Learning Path

Path belajar disusun sebagai perjalanan bertahap menuju project akhir. Setiap unit menghasilkan output nyata yang bisa dilihat user.

```
Unit 1: Halaman Pertamaku (HTML)
  ├── Lesson 1: Apa Itu Web?
  ├── Lesson 2: Tag HTML Pertama
  ├── Lesson 3: Struktur Halaman
  ├── Lesson 4: Teks dan Heading
  ├── Lesson 5: Gambar dan Link
  ├── Lesson 6: Daftar dan Tabel
  └── Project: Bikin Halaman Profil Diri

Unit 2: Warnai Duniamu (CSS)
  ├── Lesson 1: Apa Itu CSS?
  ├── Lesson 2: Selektor dan Properti
  ├── Lesson 3: Warna dan Background
  ├── Lesson 4: Font dan Teks
  ├── Lesson 5: Box Model
  ├── Lesson 6: Flexbox
  ├── Lesson 7: Layout Responsif
  └── Project: Bikin Landing Page Kafe

Unit 3: Bawa Hidup (JavaScript)
  ├── Lesson 1: Apa Itu JavaScript?
  ├── Lesson 2: Variabel dan Tipe Data
  ├── Lesson 3: Fungsi
  ├── Lesson 4: Kondisi (if/else)
  ├── Lesson 5: Loop
  ├── Lesson 6: DOM Manipulation
  ├── Lesson 7: Event Handling
  ├── Lesson 8: Array dan Object
  ├── Lesson 9: Fetch API
  └── Project: Bikin Web App To-Do List
```

## Lesson Structure

Setiap lesson terdiri dari 5-8 step. Setiap step = 1 interaksi, memakan waktu ~20 detik. Total 1 lesson ≈ 5-10 menit.

### Jenis Step

| Step Type | Deskripsi | Contoh |
|-----------|-----------|--------|
| **Teori** | Penjelasan singkat konsep + ilustrasi visual | "Tag `<h1>` dipakai untuk heading utama..." |
| **Fill in the Blank** | Kode dengan bagian kosong, user isi | `<___>Halo Dunia</h1>` |
| **Multiple Choice** | Pilih kode yang benar dari 4 opsi | "Mana yang benar untuk bikin link?" |
| **Reorder** | Drag-drop code blocks ke urutan benar | Susun: DOCTYPE → html → head → body |
| **Spot the Bug** | Temukan dan perbaiki error | Tag tidak ditutup, salah semicolon |
| **Live Code** | Tulis kode dari nol di CodeMirror | "Buat tag `<p>` dengan teks apapun" |
| **Live Preview** | Split screen kode + hasil | HTML/CSS yang langsung ter-render |
| **Output Prediction** | Tebak output sebelum run | "Apa output `console.log(2 + 3)`?" |
| **Matching** | Cocokkan konsep dengan definisi | Pasangkan CSS property → fungsinya |

### Flow per Step

```
[Step dimulai]
    ↓
[User mengerjakan]
    ↓
[Submit jawaban]
    ↓
 Benar? ── Ya ──→ [Celebration animation + XP] ──→ [Step selanjutnya]
    │
    Tidak
    ↓
[Feedback hint spesifik] ──→ [Coba lagi / Skip dengan penjelasan]
```

## Gamifikasi

### Streaks
- Api harian yang menyala kalau user selesai minimal 1 lesson
- Streak counter di dashboard
- Streak freeze (1x gratis per minggu, bonus dari achievement)

### XP (Experience Points)
- Teori step: +5 XP
- Interaksi benar pertama kali: +10 XP
- Interaksi benar setelah salah: +5 XP
- Lesson selesai: +20 XP bonus
- Project selesai: +100 XP bonus

### Badges
- **Pemula HTML** — Selesaikan Unit 1
- **Stylist CSS** — Selesaikan Unit 2
- **Programmer JS** — Selesaikan Unit 3
- **Full Builder** — Selesaikan semua unit
- **Api 7 Hari** — 7 hari streak
- **Api 30 Hari** — 30 hari streak
- **Perfect Score** — 0 salah di 1 lesson
- **Night Owl** — Belajar lewat tengah malam
- **Speed Runner** — Selesai 1 lesson < 3 menit

### Progress Visualization
- Map perjalanan seperti Duolingo — visual path dengan node per lesson
- Unit yang sudah selesai di-highlight
- Progress bar per lesson (% step selesai)

## Onboarding Flow

1. Welcome screen — "Belajar Coding dari Nol"
2. Pilih motivasi — "Apa yang kamu mau bikin?" (Web, App, Game, etc.)
3. Preview interaksi — coba 3 step pertama TANPA daftar
4. Sign up — setelah hooked, minta daftar untuk simpan progress
5. Placement — mulai dari awal (MVP hanya 1 path)

## Content Authoring

Konten lesson disimpan sebagai JSON/TypeScript data structure:

```typescript
interface Step {
  id: string;
  type: 'theory' | 'fill-blank' | 'multiple-choice' | 'reorder' 
      | 'spot-bug' | 'live-code' | 'live-preview' 
      | 'output-prediction' | 'matching';
  instruction: string;
  content: StepContent; // varies by type
  solution: string | string[];
  hints: string[];
  xpReward: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  order: number;
  steps: Step[];
  project?: ProjectSpec;
}
```

Konten bisa di-author langsung di codebase (TypeScript files) untuk MVP. Untuk future, bisa dibuat CMS atau content editor.
