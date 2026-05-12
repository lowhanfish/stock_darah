# 📚 PEMBELAJARAN: PERBANDINGAN EXPRESS vs FASTIFY

## 🎉 Selamat! Login Berhasil!

Nah, sekarang kita akan belajar apa saja yang berbeda antara Express dan Fastify agar login bisa berhasil.

---

## 🔍 KODE PERBANDINGAN

### 1. SETUP SERVER

```javascript
// EXPRESS.JS
const express = require('express');
const app = express();
app.use(express.json());  // WAJIB: parsing JSON body

// FASTIFY (beda!)
const fastify = require('fastify')({ logger: true });
// ✅ TIDAK WAJIB: Fastify otomatis parsing JSON!
```

**Perbedaan:**
- Express butuh `express.json()` middleware untuk parsing body
- Fastify otomatis parsing JSON tanpa middleware tambahan

---

### 2. ROUTING (RUTE)

```javascript
// EXPRESS
const auth = require('./auth');
app.use('/auth', auth);

// FASTIFY (beda!)
// Langsung definisikan route di file utama
fastify.get('/auth', async (request, reply) => {
  return { message: 'kiken-login' };
});

fastify.post('/auth/login', async (request, reply) => {
  // login logic
});
```

**Perbedaan:**
- Express: bisa pisahkan route ke file lain dengan `router`
- Fastify: bisa juga pisahkan, tapi lebih sederhana

---

### 3. DATABASE CONNECTION

```javascript
// EXPRESS - SAMA PERSIS!
var db = require('./db/MySql/umum');

// FASTIFY - SAMA PERSIS!
const mysql = require('mysql');
const db = mysql.createPool({...});
```

**Tidak ada perbedaan** - Cara koneksi database sama!

---

### 4. VALIDASI INPUT

```javascript
// EXPRESS - gunakan Joi (第三方)
const Joi = require('joi');
const schema = Joi.object().keys({
  username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
  password: Joi.string().min(6).required(),
});

router.post('/login', async (req, res, next) => {
  const { error } = schema.validate(req.body);  // Validasi manual
  // ...
});

// FASTIFY - bisa tetap gunakan Joi (sama seperti Express)
// ATAU gunakan JSON Schema (built-in!)
const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 13 },
      password: { type: 'string', minLength: 6 }
    }
  }
};

fastify.post('/auth/login', {
  schema: loginSchema  // ✅ VALIDASI OTOMATIS!
}, async (request, reply) => {
  // Validasi otomatis, tidak perlu manual!
});
```

**Keunggulan Fastify:**
- ✅ JSON Schema validation **built-in**
- ✅ Tidak perlu第三方 library untuk validasi dasar
- ✅ Lebih cepat karena schema di-compile

---

### 5. JWT (AUTHENTICATION)

```javascript
// EXPRESS -第三方 package
const jwt = require('jsonwebtoken');
const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '24h' });

// FASTIFY - ada plugin resmi @fastify/jwt
fastify.register(require('@fastify/jwt'), { 
  secret: 'secret' 
});

// Generate token (cara Fastify)
const token = fastify.sign(payload, { expiresIn: '24h' });

// Verify token
fastify.jwt.verify(token);
```

**Perbedaan:**
- Express: butuh第三方 `jsonwebtoken`
- Fastify: plugin resmi `@fastify/jwt`

---

### 6. ERROR HANDLING

```javascript
// EXPRESS
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// FASTIFY
fastify.setErrorHandler((error, request, reply) => {
  reply.code(500).send({ message: error.message });
});
```

---

### 7. REQUEST OBJECT

```javascript
// EXPRESS
app.post('/login', (req, res) => {
  const body = req.body;        // JSON body
  const params = req.params;    // URL params
  const query = req.query;      // Query string
  const headers = req.headers;   // Headers
});

// FASTIFY (nama parameter berbeda)
fastify.post('/login', async (request, reply) => {
  const body = request.body;        // JSON body
  const params = request.params;    // URL params
  const query = request.query;      // Query string
  const headers = request.headers;   // Headers
  
  return reply.send({ hasil: 'OK' }); // reply.send() atau return
});
```

---

### 8. RESPONSE

```javascript
// EXPRESS
res.json({ message: 'OK' });
res.status(200).json({ message: 'OK' });

// FASTIFY
return { message: 'OK' };
// ATAU
reply.send({ message: 'OK' });
reply.code(201).send({ message: 'Created' });
```

---

## 📊 RINGKASAN PERBEDAAN

| Aspek | Express.js | Fastify |
|-------|------------|---------|
| **Parsing JSON** | Perlu `express.json()` | Otomatis |
| **Validasi** |第三方 (Joi/Yup) | Built-in JSON Schema |
| **Logger** |第三方 (morgan) | Built-in (Pino) |
| **JWT** |第三方 (jsonwebtoken) | @fastify/jwt |
| **Request Object** | `req` | `request` |
| **Response** | `res.json()` | `return {}` atau `reply.send()` |
| **Error Handler** | `app.use((err, req, res, next)=>{})` | `fastify.setErrorHandler()` |
| **Performance** | Baik | Lebih cepat 20%+ |
| **Schema Validation** | Tidak ada | Built-in |

---

## ✅ YANG TETAP SAMA

1. **Database MySQL** - Koneksi dan query sama
2. **bcrypt** - Untuk password hashing sama
3. **Socket.IO** - Cara penggunaan sama
4. **Static files** - Hampir sama
5. **CORS** - Perlu plugin sama (cors/@fastify-cors)

---

## 🎯 KESIMPULAN

Fastify dan Express bisa melakukan hal yang sama, bedanya:

1. **Fastify lebih ringkas** - Tidak perlu banyak middleware
2. **Fastify lebih cepat** - Schema compilation
3. **Fastify lebih aman** - Built-in security features
4. **Learning curve** - Fastify butuh belajar JSON Schema

Tapi untuk project yang sudah ada seperti ini, **keduanya bisa digunakan** dengan hasil yang sama!

