/**
 * Seed script for learning content (units, lessons, steps)
 * Run with: npx tsx scripts/seed/seed-learning.ts
 *
 * Idempotent — uses ON CONFLICT DO NOTHING
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface SeedUnit {
  id: string;
  title: string;
  description: string;
  slug: string;
  order_num: number;
}

interface SeedLesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  slug: string;
  order_num: number;
  is_project: boolean;
}

interface SeedStep {
  id: string;
  lesson_id: string;
  type: string;
  order_num: number;
  instruction: string;
  content: object;
  solution: object;
  hints: string[];
  xp_reward: number;
}

// ── Units ──────────────────────────────────────────────────────
const units: SeedUnit[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'HTML Dasar',
    description: 'Pelajari fondasi HTML — tag, elemen, atribut, dan struktur halaman web.',
    slug: 'html-dasar',
    order_num: 1,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'CSS Dasar',
    description: 'Kuasai CSS dasar — selektor, properti, box model, dan layout.',
    slug: 'css-dasar',
    order_num: 2,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    title: 'JavaScript Dasar',
    description: 'Mulai programming dengan JavaScript — variabel, tipe data, dan logika dasar.',
    slug: 'javascript-dasar',
    order_num: 3,
  },
];

// ── Lessons ────────────────────────────────────────────────────
const lessons: SeedLesson[] = [
  // HTML Unit
  {
    id: '00000000-0000-0000-0000-000000000101',
    unit_id: '00000000-0000-0000-0000-000000000001',
    title: 'Pengenalan HTML',
    description: 'Apa itu HTML dan mengapa ia penting untuk web?',
    slug: 'pengenalan-html',
    order_num: 1,
    is_project: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    unit_id: '00000000-0000-0000-0000-000000000001',
    title: 'Tag dan Elemen HTML',
    description: 'Belajar menggunakan tag HTML untuk membuat struktur konten.',
    slug: 'tag-dan-elemen-html',
    order_num: 2,
    is_project: false,
  },
  // CSS Unit
  {
    id: '00000000-0000-0000-0000-000000000201',
    unit_id: '00000000-0000-0000-0000-000000000002',
    title: 'Pengenalan CSS',
    description: 'Mengenal CSS dan cara menghubungkannya dengan HTML.',
    slug: 'pengenalan-css',
    order_num: 1,
    is_project: false,
  },
  // JS Unit
  {
    id: '00000000-0000-0000-0000-000000000301',
    unit_id: '00000000-0000-0000-0000-000000000003',
    title: 'Pengenalan JavaScript',
    description: 'Apa itu JavaScript dan bagaimana ia membuat web interaktif?',
    slug: 'pengenalan-javascript',
    order_num: 1,
    is_project: false,
  },
];

// ── Steps ──────────────────────────────────────────────────────
const steps: SeedStep[] = [
  // === Lesson: Pengenalan HTML ===
  {
    id: '00000000-0000-0000-0000-000000001001',
    lesson_id: '00000000-0000-0000-0000-000000000101',
    type: 'theory',
    order_num: 1,
    instruction: 'HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web. Setiap halaman web yang kamu lihat dibangun dengan HTML.',
    content: {
      body: '# Apa itu HTML?\n\nHTML adalah singkatan dari **HyperText Markup Language**. Ini bukan bahasa pemrograman, melainkan bahasa *markup* yang digunakan untuk menyusun struktur konten di halaman web.\n\n## Fungsi HTML\n\n- Menentukan struktur halaman\n- Mendefinisikan heading, paragraf, list\n- Menyematkan gambar, link, dan media\n- Membuat form input',
    },
    solution: {},
    hints: [],
    xp_reward: 5,
  },
  {
    id: '00000000-0000-0000-0000-000000001002',
    lesson_id: '00000000-0000-0000-0000-000000000101',
    type: 'fill-blank',
    order_num: 2,
    instruction: 'Isi bagian yang kosong untuk membuat struktur HTML yang benar.',
    content: {
      template: '<___>\n  <head>\n    <title>Halaman Pertama</title>\n  </head>\n  <___>\n    <h1>Hello World</h1>\n  </___>\n</___>',
      blanks: [
        { id: 'b1', answer: 'html' },
        { id: 'b2', answer: 'body' },
        { id: 'b3', answer: 'body' },
        { id: 'b4', answer: 'html' },
      ],
    },
    solution: { blanks: { b1: 'html', b2: 'body', b3: 'body', b4: 'html' } },
    hints: ['Tag utama yang membungkus seluruh halaman', 'Tag untuk konten yang terlihat di browser'],
    xp_reward: 10,
  },
  {
    id: '00000000-0000-0000-0000-000000001003',
    lesson_id: '00000000-0000-0000-0000-000000000101',
    type: 'multiple-choice',
    order_num: 3,
    instruction: 'Apa kepanjangan dari HTML?',
    content: {
      question: 'Apa kepanjangan dari HTML?',
      options: [
        { id: 'a', text: 'Hyper Trainer Marking Language' },
        { id: 'b', text: 'HyperText Markup Language' },
        { id: 'c', text: 'HyperText Marketing Language' },
        { id: 'd', text: 'High Tech Modern Language' },
      ],
    },
    solution: { answer: 'b' },
    hints: ['Berhubungan dengan teks dan markup'],
    xp_reward: 5,
  },

  // === Lesson: Tag dan Elemen HTML ===
  {
    id: '00000000-0000-0000-0000-000000001004',
    lesson_id: '00000000-0000-0000-0000-000000000102',
    type: 'theory',
    order_num: 1,
    instruction: 'Tag HTML adalah "label" yang memberi tahu browser bagaimana menampilkan konten. Tag ditulis dengan tanda kurung sudut < >.',
    content: {
      body: '# Tag HTML\n\nTag HTML membungkus konten dan memberinya makna.\n\n## Struktur Tag\n```\n<nama-tag> konten </nama-tag>\n```\n\n## Tag yang Sering Dipakai\n- `<h1>` sampai `<h6>` — heading\n- `<p>` — paragraf\n- `<a>` — link\n- `<img>` — gambar\n- `<div>` — container',
    },
    solution: {},
    hints: [],
    xp_reward: 5,
  },
  {
    id: '00000000-0000-0000-0000-000000001005',
    lesson_id: '00000000-0000-0000-0000-000000000102',
    type: 'live-code',
    order_num: 2,
    instruction: 'Buat heading h1 dengan teks "Selamat Datang" dan sebuah paragraf di bawahnya.',
    content: {
      language: 'html',
      initialCode: '<!DOCTYPE html>\n<html>\n<body>\n  <!-- Buat heading h1 di sini -->\n  \n  <!-- Buat paragraf di sini -->\n  \n</body>\n</html>',
    },
    solution: {
      code: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Selamat Datang</h1>\n  <p>Ini paragraf pertama saya.</p>\n</body>\n</html>',
    },
    hints: ['Gunakan <h1> untuk heading', 'Gunakan <p> untuk paragraf'],
    xp_reward: 15,
  },

  // === Lesson: Pengenalan CSS ===
  {
    id: '00000000-0000-0000-0000-000000002001',
    lesson_id: '00000000-0000-0000-0000-000000000201',
    type: 'theory',
    order_num: 1,
    instruction: 'CSS (Cascading Style Sheets) digunakan untuk mengatur tampilan visual halaman web — warna, font, layout, dan lainnya.',
    content: {
      body: '# Apa itu CSS?\n\nCSS adalah bahasa yang mengatur **tampilan** elemen HTML.\n\n## Cara Menulis CSS\n```css\nselector {\n  property: value;\n}\n```\n\n## Contoh\n```css\nh1 {\n  color: blue;\n  font-size: 24px;\n}\n```',
    },
    solution: {},
    hints: [],
    xp_reward: 5,
  },
  {
    id: '00000000-0000-0000-0000-000000002002',
    lesson_id: '00000000-0000-0000-0000-000000000201',
    type: 'live-preview',
    order_num: 2,
    instruction: 'Ubah warna teks heading menjadi biru menggunakan CSS.',
    content: {
      language: 'html',
      initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    /* Tulis CSS di sini */\n    \n  </style>\n</head>\n<body>\n  <h1>Hello CSS!</h1>\n</body>\n</html>',
      previewMode: 'html',
    },
    solution: {
      code: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    h1 {\n      color: blue;\n    }\n  </style>\n</head>\n<body>\n  <h1>Hello CSS!</h1>\n</body>\n</html>',
    },
    hints: ['Target elemen h1 sebagai selector', 'Gunakan property color'],
    xp_reward: 15,
  },

  // === Lesson: Pengenalan JavaScript ===
  {
    id: '00000000-0000-0000-0000-000000003001',
    lesson_id: '00000000-0000-0000-0000-000000000301',
    type: 'theory',
    order_num: 1,
    instruction: 'JavaScript membuat halaman web menjadi interaktif. Dengan JS, kamu bisa merespons klik, mengubah konten, dan banyak lagi.',
    content: {
      body: '# Apa itu JavaScript?\n\nJavaScript adalah bahasa pemrograman yang berjalan di browser. Bersama HTML dan CSS, ketiganya membentuk fondasi web.\n\n## HTML + CSS + JS\n- **HTML** → Struktur\n- **CSS** → Tampilan\n- **JavaScript** → Perilaku/Interaktivitas',
    },
    solution: {},
    hints: [],
    xp_reward: 5,
  },
  {
    id: '00000000-0000-0000-0000-000000003002',
    lesson_id: '00000000-0000-0000-0000-000000000301',
    type: 'output-prediction',
    order_num: 2,
    instruction: 'Apa output dari kode JavaScript berikut?',
    content: {
      code: 'let nama = "Budi";\nconsole.log("Halo, " + nama + "!");',
      language: 'javascript',
    },
    solution: { output: 'Halo, Budi!' },
    hints: ['Variabel nama berisi string "Budi"', 'Operator + menggabungkan string'],
    xp_reward: 10,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed units
    for (const u of units) {
      await client.query(
        `INSERT INTO units (id, title, description, slug, order_num)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.title, u.description, u.slug, u.order_num],
      );
    }
    console.log(`✅ Seeded ${units.length} units`);

    // Seed lessons
    for (const l of lessons) {
      await client.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [l.id, l.unit_id, l.title, l.description, l.slug, l.order_num, l.is_project],
      );
    }
    console.log(`✅ Seeded ${lessons.length} lessons`);

    // Seed steps
    for (const s of steps) {
      await client.query(
        `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.lesson_id, s.type, s.order_num, s.instruction, JSON.stringify(s.content), JSON.stringify(s.solution), JSON.stringify(s.hints), s.xp_reward],
      );
    }
    console.log(`✅ Seeded ${steps.length} steps`);

    await client.query('COMMIT');
    console.log('\n🎉 Learning content seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
