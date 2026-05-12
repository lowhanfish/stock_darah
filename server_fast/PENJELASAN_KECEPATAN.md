# 🤔 APA ITU "KECEPATAN TINGGI"? 

## Penjelasan untuk Pemula

---

## 🏃 Apa Itu Kecepatan Server?

**Bayangkan seperti ini:**

| analogy | Arti |
|---------|------|
| 🏪 Toko dengan 1 pelayan | Server biasa |
| 🏪 Toko dengan 10 pelayan | Server cepat |
| 🚀 Toko dengan kasir otomatis | Fastify |

**Dalam dunia IT:**

"Kecepatan tinggi" = **Bisa menangani banyak request dalam waktu singkat**

---

## 📊 Analogi Nyata

### Situasi: Aplikasi Login Stok Darah

**Pagi hari (100 orang login bersamaan):**

| Server | Hasil |
|--------|-------|
| Express | Semua kebagian, tapi agak lama |
| Fastify | Semua kebagian, cepat |

**Sore hari (1000 orang login bersamaan):**

| Server | Hasil |
|--------|-------|
| Express | Antrian panjang, lambat |
| Fastify | Tetap lancar! |

---

## 🔢 Angka Konkret

### Benchmark (Tes Kecepatan):

```
Request per detik yang bisa ditangani:

Express:  ~15,000 req/detik
Fastify: ~40,000 req/detik

Lebih cepat 2-3x!
```

### Jadi Kalau:

| Jumlah User | Rekomendasi |
|-------------|-------------|
| < 1000 | Express sudah cukup |
| 1000 - 10,000 | Fastify lebih baik |
| > 10,000 | Fastify wajib! |

---

# 📝 PENJELASAN KODE BARIS PER BARIS

## Studi Kasus: POST /stok (Tambah Stok Darah)

---

## 🎯 Kode yang Akan Dijelaskan

```javascript
// ==================== EXPRESS ====================

// 1. Import Joi untuk validasi
const Joi = require('joi');

// 2. Buat schema (aturan) untuk data yang masuk
const schema = Joi.object({
  golda: Joi.string().required(),           // golda WAJIB ada, string
  resus: Joi.string().required(),           // resus WAJIB ada, string  
  jumlah: Joi.number().min(0).required()    // jumlah WAJIB ada, minimal 0
});

// 3. Route POST untuk tambah stok
router.post('/', async (req, res, next) => {
  try {
    // 4. Ambil data dari request body
    const { golda, resus, jumlah } = req.body;

    // 5. ❌ VALIDASI MANUAL - Cek satu-satu
    const { error } = schema.validate(req.body);
    if (error) {
      // Kalau ada error, kembalikan error
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    // 6. Buat query SQL untuk insert data
    const sql = `INSERT INTO stok_darah (golda, resus, jumlah) VALUES (?, ?, ?)`;
    
    // 7. Eksekusi query ke database
    await query(sql, [golda, resus, jumlah]);

    // 8. Berhasil! Kembalikan response
    res.json({ success: true, message: 'Stok ditambahkan' });
    
  } catch (err) {
    // 9. Kalau ada error, lempar ke error handler
    next(err);
  }
});
```

---

## 📍 Penjelasan Per Baris (Express)

### Baris 1-5: Import dan Schema
```javascript
const Joi = require('joi');
```
→ Mengambil alat Joi (seperti mengambil alat ukur)

```javascript
const schema = Joi.object({...});
```
→ Membuat aturan permainan:
- golda: WAJIB ada, harus string
- resus: WAJIB ada, harus string
- jumlah: WAJIB ada, harus angka, minimal 0

---

### Baris 7-9: Route Definition
```javascript
router.post('/', async (req, res, next) => {...})
```
→ "Kalau ada yang POST ke /stok, jalankan fungsi ini"
- `router.post` = method POST
- `/` = endpoint (nanti jadi /stok)
- `async` = fungsi asynchronous (bisa tunggu database)
- `req` = request (data yang masuk)
- `res` = response (data yang dikembalikan)
- `next` = lanjut ke handler lain kalau ada error

---

### Baris 11: Ambil Data
```javascript
const { golda, resus, jumlah } = req.body;
```
→ Mengambil data dari request:
- Request dari frontend: `{ "golda": "A", "resus": "+", "jumlah": 10 }`
- Di pecah jadi 3 variabel

---

### Baris 13-19: Validasi Manual
```javascript
const { error } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ 
    success: false, 
    message: error.message 
  });
}
```

**Logika:**
```
1. Validasi data dengan schema
2. Kalau ada error (error = true)
   → Kembalikan response error ke client
3. Lanjut kalau tidak ada error
```

---

### Baris 21-22: SQL Query
```javascript
const sql = `INSERT INTO stok_darah (golda, resus, jumlah) VALUES (?, ?, ?)`;
```
→ "Mau insert data ke tabel stok_darah, kolom: golda, resus, jumlah"

`?` = placeholder (nanti diisi sama data asli)

---

### Baris 24: Eksekusi Query
```javascript
await query(sql, [golda, resus, jumlah]);
```

**Arti:**
- `await` = tunggu sampai selesai (karena ini async)
- `query(sql, [data])` = jalankan query ke database

---

### Baris 27: Response Sukses
```javascript
res.json({ success: true, message: 'Stok ditambahkan' });
```

→ Kirim balik ke frontend:
```json
{ "success": true, "message": "Stok ditambahkan" }
```

---

## 🚀 Sekarang versi FASTIFY

```javascript
// ==================== FASTIFY ====================

// 1. Langsung buat schema DI ROUTE!
const createSchema = {
  body: {
    type: 'object',
    required: ['golda', 'resus', 'jumlah'],
    properties: {
      golda: { type: 'string' },
      resus: { type: 'string' },
      jumlah: { type: 'number', minimum: 0 }
    }
  }
};

// 2. Route POST dengan schema
fastify.post('/', {
  schema: createSchema  // ✅ SCHEMA LANGSUNG DISINI!
}, async (request, reply) => {
  
  // 3. Ambil data (sama seperti Express)
  const { golda, resus, jumlah } = request.body;

  // 4. ❌ TIDAK PERLU VALIDASI MANUAL!
  //    Fastify sudah otomatis validasi!
  //    Kalau error, tidak akan masuk ke sini!

  // 5. SQL Query (sama seperti Express)
  const sql = `INSERT INTO stok_darah (golda, resus, jumlah) VALUES (?, ?, ?)`;
  await query(sql, [golda, resus, jumlah]);

  // 6. Response (bedanya: bisa langsung return!)
  reply.code(201);  // 201 = Created
  return { success: true, message: 'Stok ditambahkan' };
});
```

---

## 📍 Penjelasan Per Baris (Fastify)

### Baris 2-12: Schema
```javascript
const createSchema = {
  body: {                           // Data yang masuk
    type: 'object',                // Harus object
    required: ['golda', 'resus', 'jumlah'],  // Wajib ada
    properties: {                  // Detail setiap field
      golda: { type: 'string' },
      resus: { type: 'string' },
      jumlah: { type: 'number', minimum: 0 }
    }
  }
};
```

**Bedanya sama Express:**
- Express: Schema dibuat di luar, validasi manual
- Fastify: Schema langsung di route, validasi otomatis!

---

### Baris 15: Attach Schema ke Route
```javascript
fastify.post('/', {
  schema: createSchema  // ✅ Disini!
}, handler);
```

→ "Ketika POST ke /, gunakan schema ini untuk validasi"

---

### Baris 19: Ambil Data
```javascript
const { golda, resus, jumlah } = request.body;
```

**Bedanya:**
- Express: `req.body`
- Fastify: `request.body`

---

### Baris 22-23: Tidak Ada Validasi Manual!
```javascript
// const { error } = schema.validate(req.body);
// if (error) { ... }

// ❌ TIDAK ADA!
// Karena Fastify sudah validasi otomatis!
// Kalau ada error, request tidak masuk ke handler ini!
```

---

### Baris 28-29: Response
```javascript
reply.code(201);
return { success: true, message: 'Stok ditambahkan' };
```

**Bedanya:**
- Express: `res.json({})`
- Fastify: `return {}` atau `reply.send({})`

---

## 🔄 Perbandingan Alur

### Express:
```
Request masuk
    ↓
Validasi manual (kita yang buat if/else)
    ↓
Cek error? → Ya → Return error
    ↓ Tidak
Query database
    ↓
Response
```

### Fastify:
```
Request masuk
    ↓
✅ Fastify validasi OTOMATIS
    ↓
Error? → Ya → Fastify return error sendiri
    ↓ Tidak
Query database
    ↓
Response
```

---

## 📊 Summary

| Aspek | Express | Fastify |
|-------|---------|---------|
| Validasi | Manual (kita tulis if/else) | Otomatis (schema) |
| Error handling | Manual | Otomatis |
| Response | `res.json()` | `return {}` |
| Request | `req.body` | `request.body` |
| Code lines | Lebih banyak | Lebih sedikit |
| Kecepatan | Baik | Lebih cepat |

---

## 🎓 Latihan!

Coba Anda pahami alur ini:

1. **Frontend kirim:** `{ "golda": "A", "resus": "+", "jumlah": 5 }`
2. **Server terima** → Fastify cek schema
3. **Kalau golda kosong** → Fastify otomatis return error
4. **Kalau valid** → Eksekusi query ke database
5. **Database insert** → Berhasil
6. **Kirim response:** `{ "success": true, "message": "Stok ditambahkan" }`

---

## 🤔 Kapan Perlu Validasi Otomatis?

| Kasus | Rekomendasi |
|-------|-------------|
| Data sederhana | Validasi manual sudah cukup |
| Data kompleks (banyak rule) | **Fastify schema** lebih baik |
| Mau cepat development | **Fastify** lebih cepat |

---

Sekarang sudah paham kan? Coba lanjut ke materi berikutnya atau ada yang ingin ditanyakan?
