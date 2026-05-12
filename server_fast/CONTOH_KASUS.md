# 📊 CONTOH KASUS: CRUD STOK DARAH

## 📝 Skenario

Kita akan buat endpoint untuk **CRUD (Create, Read, Update, Delete) Stok Darah**:

| Method | Endpoint | Arti |
|--------|----------|------|
| GET | `/stok` | Lihat semua stok darah |
| GET | `/stok/:id` | Lihat stok darah tertentu |
| POST | `/stok` | Tambah stok darah |
| PUT | `/stok/:id` | Update stok darah |
| DELETE | `/stok/:id` | Hapus stok darah |

---

## 🎯 Contoh 1: GET - Lihat Semua Stok

### Express:
```javascript
// routes/stok_darah.js
router.get('/', async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM stok_darah';
    const rows = await query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});
```

### Fastify:
```javascript
// routes/stok.js
fastify.get('/', async (request, reply) => {
  const sql = 'SELECT * FROM stok_darah';
  const rows = await query(sql);
  return { success: true, data: rows };
});
```

**Bedanya:** 
- Express: `res.json()` 
- Fastify: `return {}`

---

## 🎯 Contoh 2: POST - Tambah Stok (dengan Validasi)

### Express (validasi manual):
```javascript
const Joi = require('joi');

const schema = Joi.object({
  golda: Joi.string().required(),
  resus: Joi.string().required(),
  jumlah: Joi.number().min(0).required()
});

router.post('/', async (req, res, next) => {
  try {
    // ❌ Validasi manual
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    const { golda, resus, jumlah } = req.body;
    
    const sql = `INSERT INTO stok_darah (golda, resus, jumlah) VALUES (?, ?, ?)`;
    await query(sql, [golda, resus, jumlah]);
    
    res.json({ success: true, message: 'Stok ditambahkan' });
  } catch (err) {
    next(err);
  }
});
```

### Fastify (validasi otomatis):
```javascript
// ✅ Schema langsung di route!
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

fastify.post('/', {
  schema: createSchema  // ✅ AUTO VALIDASI!
}, async (request, reply) => {
  const { golda, resus, jumlah } = request.body;
  
  // Tidak perlu if/else validasi!
  // Kalau error, Fastify yang tangani
  
  const sql = `INSERT INTO stok_darah (golda, resus, jumlah) VALUES (?, ?, ?)`;
  await query(sql, [golda, resus, jumlah]);
  
  reply.code(201);
  return { success: true, message: 'Stok ditambahkan' };
});
```

---

## 🎯 Contoh 3: PUT - Update Stok (dengan Error Handling)

### Express:
```javascript
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jumlah } = req.body;
    
    if (!jumlah || jumlah < 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah harus diisi dan minimal 0'
      });
    }
    
    const sql = 'UPDATE stok_darah SET jumlah = ? WHERE id = ?';
    await query(sql, [jumlah, id]);
    
    res.json({ success: true, message: 'Stok diupdate' });
  } catch (err) {
    next(err);
  }
});
```

### Fastify:
```javascript
const updateSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' }
    }
  },
  body: {
    type: 'object',
    required: ['jumlah'],
    properties: {
      jumlah: { type: 'number', minimum: 0 }
    }
  }
};

fastify.put('/:id', {
  schema: updateSchema  // ✅ Params & Body sekaligus divalidasi!
}, async (request, reply) => {
  const { id } = request.params;
  const { jumlah } = request.body;
  
  // Tidak perlu if/else validasi!
  
  const sql = 'UPDATE stok_darah SET jumlah = ? WHERE id = ?';
  await query(sql, [jumlah, id]);
  
  return { success: true, message: 'Stok diupdate' };
});
```

---

## 🎯 Contoh 4: DELETE - Hapus Stok (Protected)

### Express:
```javascript
// Middleware protection
const authenticate = require('../middleware/auth');

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM stok_darah WHERE id = ?';
    await query(sql, [id]);
    
    res.json({ success: true, message: 'Stok dihapus' });
  } catch (err) {
    next(err);
  }
});
```

### Fastify:
```javascript
// ✅ PreHandler untuk proteksi
fastify.delete('/:id', {
  preHandler: [fastify.authenticate]  // ✅ Lebih Clean!
}, async (request, reply) => {
  const { id } = request.params;
  
  const sql = 'DELETE FROM stok_darah WHERE id = ?';
  await query(sql, [id]);
  
  return { success: true, message: 'Stok dihapus' };
});
```

---

## 📊 RINGKASAN PERBANDINGAN

| Fitur | Express | Fastify |
|-------|---------|---------|
| **Get Data** | `res.json({})` | `return {}` |
| **Post Data** | Validasi manual dengan Joi | Schema otomatis |
| **Update** | Validasi manual | Schema params + body |
| **Delete** | Middleware terpisah | `preHandler` langsung |
| **Error Handling** | `next(err)` | Auto dari schema |
| **Code Lines** | Lebih banyak | Lebih sedikit |

---

## 🏆 Kapan Fastify Lebih Baik?

| Skenario | Pakai |
|----------|-------|
| Validasi input banyak | **Fastify** - schema otomatis |
| Request sangat banyak | **Fastify** - lebih cepat |
| Rapid development | **Fastify** - code lebih sedikit |
| Tim baru belajar | **Express** - ecosystem besar |

---

## 💡 Mengapa Fastify Lebih Ringkas?

```javascript
// EXPRESS: 2x Code
// 1. Buat schema
const schema = Joi.object({...});
// 2. Validasi manual
const { error } = schema.validate(req.body);
if (error) return res.status(400).json({error});

// FASTIFY: 1x Code
// Sekaligus!
fastify.post('/', {
  schema: { body: schema } // Validasi + route sekaligus
}, handler);
```

---

## 📌 Kesimpulan

**Project Anda:** Karena sudah besar dan semua route sudah jalan, tidak perlu migrasi ke Fastify.

**Project Baru:** Kalau bikin project baru yang butuh kecepatan tinggi, Fastify pilihan bagus!

---

