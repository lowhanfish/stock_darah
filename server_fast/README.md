# 🚀 Server Fastify - Perbandingan dengan Express.js

Project ini dibuat untuk **belajar Fastify** dengan menunjukkan perbedaan kode dibanding Express.js.

## 📁 Struktur Folder

```
server_fast/
├── index.js          # Main server (Full dengan komentar perbandingan)
├── package.json      # Dependencies
├── .env.example      # Environment variables template
└── README.md         # Dokumentasi ini
```

## 🔧 Install Dependencies

```bash
cd server_fast
npm install
```

## ▶️ Run Server

```bash
npm start
# atau untuk development dengan auto-reload
npm run dev
```

Server akan berjalan di `http://localhost:5089`

## 📖 Rute yang Tersedia

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/` | Root - Basic route |
| GET | `/user/:id` | Route dengan parameter |
| GET | `/search?q=test&page=1` | Query parameters |
| POST | `/login` | POST request dengan body |
| POST | `/register` | Validasi otomatis JSON Schema |
| GET | `/protected` | Protected route (butuh JWT) |
| GET | `/uploads/*` | Static files |

## 🔍 Test dengan cURL

```bash
# Test root
curl http://localhost:5089/

# Test parameter
curl http://localhost:5089/user/123

# Test query
curl "http://localhost:5089/search?q=blood&page=2"

# Test POST login
curl -X POST http://localhost:5089/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123"}'

# Test register (validasi otomatis)
curl -X POST http://localhost:5089/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'

# Test register GAGAL (validasi error)
curl -X POST http://localhost:5089/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jo","email":"invalid","password":"123"}'

# Test protected route (perlu token)
# Pertama login untuk dapat token, lalu:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5089/protected
```

## 📊 Perbandingan Utama

### 1. Setup Server
```javascript
// Express
const express = require('express');
const app = express();

// Fastify
const fastify = require('fastify')({ logger: true });
```

### 2. Route Dasar
```javascript
// Express
app.get('/rute', (req, res) => {
  res.json({ pesan: 'Halo' });
});

// Fastify
fastify.get('/rute', async (request, reply) => {
  return { pesan: 'Halo' };
});
```

### 3. Middleware
```javascript
// Express
app.use(cors());
app.use(express.json());

// Fastify (menggunakan plugin)
fastify.register(require('@fastify/cors'), { origin: true });
```

### 4. Validasi
```javascript
// Express - perlu第三方 (Joi, Yup)
app.post('/user', validateUser, handler);

// Fastify - built-in JSON Schema
fastify.post('/user', {
  schema: { body: userSchema }
}, handler);
```

### 5. Error Handling
```javascript
// Express
app.use((err, req, res, next) => {...});

// Fastify
fastify.setErrorHandler((error, request, reply) => {...});
```

## ✅ Keunggulan Fastify

1. **Performa** - 20%+ lebih cepat dari Express
2. **Validasi Built-in** - Tidak perlu library tambahan
3. **Logger Built-in** - Tidak perlu morgan
4. **TypeScript Support** - Sudah natively supported
5. **Schema Validation** - Compile-time optimization

## ❌ Kekurangan Fastify

1. **Ekosistem Lebih Kecil** - fewer packages dibanding Express
2. **Learning Curve** - Perlu belajar schema-based approach
3. **Plugin Ecosystem** - Tidak sebanyak Express middleware

## 📚 Referensi

- [Fastify Official Docs](https://www.fastify.io/)
- [Fastify Schema](https://fastify.dev/docs/latest/Reference/Schema/)
- [Fastify JWT](https://github.com/fastify/fastify-jwt)

