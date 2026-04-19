# 05 — Interactivity Engine

## Overview

Interaktivitas adalah core feature learn.dmds.dev. Setiap step dalam lesson menggunakan salah satu dari 8 tipe interaksi. Semua interaksi berjalan di browser — tidak perlu backend execution.

## Code Editor: CodeMirror 6

### Kenapa CodeMirror 6?

- Ringan (~300KB vs Monaco ~2MB)
- Mobile-friendly (touch input, virtual keyboard)
- Modular — hanya load yang dibutuhkan
- Performa tinggi untuk real-time preview
- TypeScript support native

### Setup

```typescript
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
```

### Integrasi sebagai React Component

```typescript
// features/lesson-player/components/CodeMirrorEditor.tsx
interface CodeMirrorEditorProps {
  initialCode: string;
  language: 'html' | 'css' | 'javascript';
  onChange?: (value: string) => void;
  readOnly?: boolean;
  highlightLines?: number[];  // untuk spot-the-bug
}
```

## 8 Tipe Interaksi

### 1. Theory Step
```
┌─────────────────────────────────┐
│  💡 Tag <h1> untuk Heading      │
│                                 │
│  Heading dipakai untuk judul    │
│  di halaman web. Ada 6 level:   │
│                                 │
│  <h1> Heading 1 (terbesar)     │
│  <h2> Heading 2                │
│  ...                            │
│  <h6> Heading 6 (terkecil)     │
│                                 │
│  ┌─────────────────────────┐    │
│  │  [Visual ilustrasi]     │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Lanjut → ]              │
└─────────────────────────────────┘
```

**Implementasi:** Static content dengan rich formatting. Tombol "Lanjut" untuk ke step berikutnya. XP: +5

### 2. Fill in the Blank
```
┌─────────────────────────────────┐
│  Lengkapi kode agar menghasil-  │
│  kan heading "Halo Dunia"       │
│                                 │
│  ┌─────────────────────────┐    │
│  │ <[___]_>Halo Dunia</h1>│    │
│  └─────────────────────────┘    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- CodeMirror dalam mode readOnly
- Bagian kosong diganti dengan input field inline
- Validasi: exact match (case-insensitive untuk tag)

**Data Structure:**
```typescript
{
  type: 'fill-blank',
  code: '<{blank}>Halo Dunia</h1>',
  solution: ['h1'],
  hints: ['Tag heading dimulai dengan huruf h']
}
```

### 3. Multiple Choice Code
```
┌─────────────────────────────────┐
│  Mana yang benar untuk membuat   │
│  link ke Google?                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │ A. <link href="...">    │    │
│  │ B. <a href="...">Google │    │ ← correct
│  │ C. <url>Google</url>    │    │
│  │ D. <href="...">Google   │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- Tampilkan 4 opsi sebagai card/button
- Select salah satu, submit
- Visual feedback benar/salah

### 4. Reorder Code Blocks
```
┌─────────────────────────────────┐
│  Susun kode menjadi halaman     │
│  HTML yang benar                │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ☰ <body>               │    │ ← drag handle
│  │ ☰ <!DOCTYPE html>      │    │
│  │ ☰ <html>               │    │
│  │ ☰ </body>              │    │
│  │ ☰ <head>...</head>     │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Cek Urutan ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- Drag-and-drop list (gunakan @dnd-kit/core — lightweight)
- Setiap block adalah 1 baris/potongan kode
- Validasi: urutan array harus sama dengan solution

### 5. Spot the Bug
```
┌─────────────────────────────────┐
│  Kode ini ada error. Temukan    │
│  dan perbaiki!                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 1│ <h1>Selamat Datang  │    │ ← line 1 buggy (missing closing tag)
│  │ 2│ <p>Halo semua</p>   │    │
│  │ 3│ <h2>Menu</h2>       │    │
│  └─────────────────────────┘    │
│                                 │
│  Click baris yang error,        │
│  lalu ketik perbaikan:          │
│  ┌─────────────────────────┐    │
│  │ <h1>Selamat Datang</h1>│    │
│  └─────────────────────────┘    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- CodeMirror dengan line numbers
- Click line number untuk select baris yang bermasalah
- Setelah select, muncul input untuk perbaikan
- Highlight line yang dipilih dengan warna berbeda

### 6. Live Code Editor
```
┌─────────────────────────────────┐
│  Buat tag <p> dengan teks       │
│  "Belajar coding itu seru!"     │
│                                 │
│  ┌─────────────────────────┐    │
│  │                     │    │    │ ← CodeMirror
│  │                     │    │    │
│  │                     │    │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Jalankan Kode ]         │
│                                 │
│  Output:                        │
│  ┌─────────────────────────┐    │
│  │ Belajar coding itu seru!│    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Implementasi:**
- CodeMirror full editable
- Untuk JavaScript: eval dalam sandbox (Function constructor, bukan eval langsung)
- Untuk HTML: render ke iframe sandboxed
- Validasi: output matching atau code pattern matching

**JavaScript Execution Sandbox:**
```typescript
function executeJavaScript(code: string): string {
  // Capture console.log output
  const logs: string[] = [];
  const sandbox = new Function('console', code);
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    // ... other console methods
  };
  sandbox(mockConsole);
  return logs.join('\n');
}
```

### 7. Live Preview (HTML/CSS)
```
┌─────────────────────────────────┐
│  Ubah warna teks menjadi biru   │
│                                 │
│  ┌──────────┬──────────────┐    │
│  │  Kode    │   Preview    │    │
│  │          │              │    │
│  │ h1 {     │  ┌────────┐ │    │
│  │  color:  │  │Halo!   │ │    │ ← live rendered
│  │   blue;  │  │(biru)  │ │    │
│  │ }        │  └────────┘ │    │
│  │          │              │    │
│  └──────────┴──────────────┘    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- Split screen: kiri CodeMirror, kanan iframe preview
- Auto-refresh preview setiap perubahan kode (debounced 300ms)
- iframe dengan sandbox attribute (no scripts, same-origin)
- HTML preview: render langsung
- CSS preview: inject CSS ke HTML template

```typescript
function renderHTMLPreview(html: string, css: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${css}</style></head>
    <body>${html}</body>
    </html>
  `;
}
```

### 8. Output Prediction
```
┌─────────────────────────────────┐
│  Tebak output dari kode ini:    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ let nama = "Budi";     │    │
│  │ let umur = 10;         │    │
│  │ console.log(nama);     │    │
│  │ console.log(umur + 5); │    │
│  └─────────────────────────┘    │
│                                 │
│  Jawaban:                       │
│  ┌─────────────────────────┐    │
│  │ Budi                    │    │ ← user input
│  │ 15                      │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- Kode ditampilkan (tidak editable)
- User tulis output di textarea
- Validasi: string matching (trim + case-insensitive)

### 9. Matching
```
┌─────────────────────────────────┐
│  Cocokkan properti CSS dengan   │
│  fungsinya                     │
│                                 │
│  color     ──── Warna teks     │
│  font-size ──── Ukuran huruf   │
│  margin    ──── Jarak luar     │
│  padding   ──── Jarak dalam    │
│                                 │
│       [ Cek Jawaban ]           │
└─────────────────────────────────┘
```

**Implementasi:**
- Dua kolom: kiri concept, kanan definition
- Draw line / select dropdown untuk connect
- Validasi: semua pasangan harus benar

## Validation Engine

Setiap tipe interaksi punya validator sendiri:

```typescript
// lib/applications/services/StepValidator.ts
interface StepValidator {
  validate(step: Step, userAnswer: UserAnswer): ValidationResult;
}

interface ValidationResult {
  correct: boolean;
  feedback?: string;      // Jika salah, beri hint spesifik
  expectedOutput?: string; // Jika perlu menunjukkan jawaban benar
}
```

### Validation Strategies

| Tipe | Strategi Validasi |
|------|------------------|
| theory | Selalu correct (hanya lanjut) |
| fill-blank | Exact match, case-insensitive untuk tag |
| multiple-choice | Index comparison |
| reorder | Array deep equality |
| spot-bug | Line identification + fix validation |
| live-code | Pattern matching (regex) atau output matching |
| live-preview | CSS property value check atau visual diff |
| output-prediction | String comparison (trimmed) |
| matching | All pairs correct |

**Penting:** Validasi berjalan di **client-side** untuk MVP. Ini menghindari kebutuhan server-side code execution. Untuk keamanan anti-cheat, bisa ditambahkan server-side validation di future.

## Feedback System

Setiap percobaan memberikan feedback:

```
SALAH (Pertama):
┌─────────────────────────────────┐
│  ❌ Belum tepat                  │
│                                 │
│  Hint: Tag heading dimulai      │
│  dengan huruf 'h' diikuti      │
│  angka level                    │
│                                 │
│       [ Coba Lagi ]             │
└─────────────────────────────────┘

SALAH (Kedua):
┌─────────────────────────────────┐
│  ❌ Jawaban yang benar:          │
│                                 │
│  <h1>Halo Dunia</h1>           │
│                                 │
│  Penjelasan: Tag <h1> dipakai   │
│  untuk heading level 1...       │
│                                 │
│       [ Lanjut → ]              │
└─────────────────────────────────┘

BENAR:
┌─────────────────────────────────┐
│  ✅ Benar! +10 XP               │
│                                 │
│  🎉 [Celebration animation]     │
│                                 │
│       [ Lanjut → ]              │
└─────────────────────────────────┘
```

## Dependencies

```json
{
  "@codemirror/lang-html": "^6.x",
  "@codemirror/lang-css": "^6.x",
  "@codemirror/lang-javascript": "^6.x",
  "@codemirror/theme-one-dark": "^6.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x"
}
```
