# 🎓 PELATIHAN FASTIFY: DARI NOL SAMPAI LOGIN

## 👨‍🏫 Saya adalah Mentor Anda!

Halo! Tenang aja, saya akan jelaskan pelan-pelan seperti teachesahabat baik. 

**Target:** Sampai Anda bisa login dan paham alur kerja Fastify.

---

# 📚 BAB 1: PENGENALAN

## 🤖 Apa Itu Server?

**Analogi:** 
Bayangkan server seperti **pelayan restoran**:
- Pelanggan (browser/frontend) masuk
- Pelanggan pesan makanan (request)
- Pelayan(Pelayan) membawa pesanan ke dapur (server)
- Dapurolah pesanan (processing)
- Pelayan membawa makanan ke pelanggan (response)

```
📱 Browser (Frontend)
      │
      │ "Saya mau login"
      ▼
🖥️  Server (Backend)
      │
      │ "Oke, cek username & password"
      ▼
🗄️  Database
      │
      │ "Ada, password benar!"
      ▼
🖥️  Server
      │
      │ "Silakan masuk! (token)"
      ▼
📱 Browser
```

---

## 🆚 Express vs Fastify

Keduanya sama-sama **pelayan restoran**, bedanya:

| Express | Fastify |
|---------|---------|
| Pelayan yang sudah senior, banyak pengalaman | Pelayan muda tapi sangat cepat |
| Alat-alat tradisional | Alat-alat modern |
| Harus手动/setup banyak | Sudah bawa alat canggih |

**Simplenya:** Mereka sama-sama melayani request, tapi Fastify lebih cepat!

---

# 📚 BAB 2: PERSIAPAN (SETUP)

## 🔧 Apa yang Dibutuhkan?

Sebelum buat server, kita butuh:

1. **Node.js** - Lingkungan untuk jalankan JavaScript
2. **npm** - Tempat download library (seperti App Store untuk code)
3. **package.json** -文件 daftar kebutuhan项目

## 📦 package.json

**Analogi:** 
Bayangkan package.json seperti **daftar belanja** sebelum ke supermarket:

```json
{
  "name": "restoran-saya",
  "dependencies": {
    "fastify": "👉 Rice cooker",
    "@fastify/cors": "👉 Meja",
    "@fastify/jwt": "👉 Kasir",
    "mysql": "👉 Kulkas",
    "bcryptjs": "👉 Blender"
  }
}
```

---

# 📚 BAB 3: KODE PERTAMA - SETUP SERVER

## 🎯 Tujuan: Nyalakan Server

### Express (Cara Lama):
```javascript
// 1. Import Express
const express = require('express');

// 2. Buat aplikasi
const app = express();

// 3. Nyalakan server di port 3000
app.listen(3000, () => {
  console.log('Server jalan di port 3000');
});
```

### Fastify (Cara Baru):
```javascript
// 1. Import Fastify
const fastify = require('fastify')({ logger: true });

// 2. Langsung bisa! Tidak perlu .listen() dulu
//    Fastify sudah otomatis siap menerima request

// 3. Nyalakan server di port 3000
fastify.listen(3000, () => {
  console.log('Server jalan di port 3000');
});
```

**Bedanya:**
- Express: perlu `express()` lalu `app.listen()`
- Fastify: langsung `fastify()` lalu `fastify.listen()`

**Plus: `{ logger: true }` artinya Fastify otomatis mencatat semua request ke console!**

---

# 📚 BAB 4: ROUTE PERTAMA

## 🛤️ Apa Itu Route?

**Analogi:**
Route seperti **menu restoran**:

| Route | Arti |
|-------|------|
| `/` | Halaman utama (home) |
| `/menu` | Halaman menu |
| `/login` | Halaman login |
| `/order` | Proses pemesanan |

## 🎯 Coba Bikin Route Sederhana

### Express:
```javascript
const express = require('express');
const app = express();

// Route GET ke "/"
app.get('/', (req, res) => {
  res.send('Halo selamat datang!');
});

// Route GET ke "/menu"
app.get('/menu', (req, res) => {
  res.json({ menu: ['nasi goreng', 'mie goreng'] });
});
```

### Fastify:
```javascript
const fastify = require('fastify')({ logger: true });

// Route GET ke "/"
fastify.get('/', async (request, reply) => {
  return 'Halo selamat datang!';
});

// Route GET ke "/menu"
fastify.get('/menu', async (request, reply) => {
  return { menu: ['nasi goreng', 'mie goreng'] };
});
```

**Bedanya:**
| Express | Fastify |
|---------|---------|
| `req` (request) | `request` |
| `res` (response) | `reply` |
| `res.send()` atau `res.json()` | `return {}` atau `reply.send()` |
| Callback: `(req, res, next)` | Async: `async (request, reply)` |

---

# 📚 BAB 5: DATABASE CONNECTION

## 🗄️ Apa Itu Database?

**Analogi:**
Database seperti **buku tamu restoran**:
- Menyimpan semua data pelanggan
- Siapa saja yang sudah pernah makan
- Menu apa yang dipesan

## 🔌 Sambungke Database (MySQL)

### Express:
```javascript
var mysql = require('mysql');

var db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'restoran_db'
});

module.exports = db;
```

### Fastify:
```javascript
const mysql = require('mysql');

const db = mysql.createPool({
  host: process.env.HOST_DB_MYSQL || 'localhost',
  user: process.env.USER_DB_MYSQL || 'root',
  password: process.env.PASS_DB_MYSQL || '',
  database: process.env.MAIN_DB_MYSQL || 'restoran_db'
});

// Helper untuk Promise (async/await)
const util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports = { db, query };
```

**SAMA!Tidak ada perbedaan** - cara sambungke database sama!

---

# 📚 BAB 6: MIDDLEWARE - CORS

## 🚧 Apa Itu Middleware?

**Analogi:**
Middleware seperti **security scanner di mall**:
- Semua orang harus lewat scanner
- Scanner bisa menolak/izinkan masuk
- Setiap request harus melewati middleware

## 🛡️ CORS - Izinkan Akses

**Masalah:** Browser blokir request dari domain berbeda

**Solusi:** Pakai CORS

### Express:
```javascript
const cors = require('cors');
app.use(cors({ origin: '*' }));
```

### Fastify:
```javascript
// Cara 1: Langsung
fastify.register(require('@fastify/cors'), { origin: true });

// Cara 2: Buat file terpisah (lebih rapi)
const fp = require('fastify-plugin');

async function corsPlugin(fastify, options) {
  fastify.register(require('@fastify/cors'), { origin: true });
}
module.exports = corsPlugin;
```

---

# 📚 BAB 7: JWT - Authentication

## 🔑 Apa Itu JWT?

**Analogi:**
JWT seperti **kartu identitas pelanggan**:
- Setelah login, dapat kartu ID
- Kartunya bisa digunakan kembali
- Expired setelah 24 jam

## 🎫 Cara Pakai JWT

### Express:
```javascript
const jwt = require('jsonwebtoken');

// Buat token
const token = jwt.sign(payload, 'secret-key', { expiresIn: '24h' });

// Verifikasi token
const decoded = jwt.verify(token, 'secret-key');
```

### Fastify:
```javascript
// Register plugin JWT
fastify.register(require('@fastify/jwt'), {
  secret: 'secret-key'
});

// Buat token
const token = fastify.jwt.sign(payload, { expiresIn: '24h' });

// Verifikasi (middleware)
fastify.get('/protected', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  return { message: 'Halo会员!' };
});
```

**Keunggulan Fastify:**
- ✅ JWT sudah built-in dengan plugin
- ✅ Tidak perlu import manual `jsonwebtoken`

---

# 📚 BAB 8: VALIDASI INPUT

## ✅ Mengapa Validasi Diperlukan?

**Analogi:**
Validasi seperti **cek pesanan**:
- Pelanggan tidak boleh pesan makanan yang tidak ada di menu
- Tidak boleh kosong
- Password minimal 6 karakter

## 🔍 Validasi dengan Joi

### Express:
```javascript
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().min(3).max(13).required(),
  password: Joi.string().min(6).required()
});

// Validasi manual
router.post('/login', async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // lanjut...
});
```

### Fastify:
```javascript
const Joi = require('joi');

// Buat schema
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(13).required(),
  password: Joi.string().min(6).required()
});

// Terapkan schema
fastify.post('/login', {
  schema: { body: loginSchema } // ✅ AUTO VALIDASI!
}, async (request, reply) => {
  // Tidak perlu validasi manual!
  // Kalau error, Fastify yang tangani
  const { username, password } = request.body;
  // lanjut...
});
```

**Bedanya:**
- Express: harus validasi manual dengan if/else
- Fastify: cukup tambah `schema: { body: ... }`, otomatis!

---

# 📚 BAB 9: LOGIN LENGKAP - REKAPITULASI

## 🎯 Yuk, Gabung Semua!

Sekarang kita sudah punya semua komponen. Mari kita lihat alur lengkap login:

### 📊 Alur Login:

```
1. 📱 Frontend kirim: { username, password }
       │
       ▼
2. 🖥️  Server (Fastify) terima request
       │
       ▼
3. ✅ Validasi input (auto dengan schema)
       │
       │──❌ Kalau error ──→ Balikin error ke frontend
       │
       ▼
4. 🔍 Cek database: "Username ada ga?"
       │
       │──❌ Kalau tidak ada ──→ "Username salah"
       │
       ▼
5. 🔐 Cek password: "Password cocok ga?"
       │
       │──❌ Kalau tidak cocok ──→ "Password salah"
       │
       ▼
6. 🎫 Buat JWT token
       │
       ▼
7. ✅ Balikin { success: true, token, profile }
```

### Kode Lengkap (Fastify):

```javascript
const fastify = require('fastify')({ logger: true });

// Plugins
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/jwt'), { secret: 'secret' });

// Database
const { query } = require('./src/db');

// Route Login
fastify.post('/auth/login', async (request, reply) => {
  const { username, password } = request.body;
  
  // 1. Cek database
  const users = await query(
    'SELECT * FROM users WHERE username = ?', 
    [username]
  );
  
  if (users.length === 0) {
    reply.code(422);
    return { success: false, message: 'Username salah' };
  }
  
  // 2. Cek password
  const bcrypt = require('bcryptjs');
  const match = await bcrypt.compare(password, users[0].password);
  
  if (!match) {
    reply.code(422);
    return { success: false, message: 'Password salah' };
  }
  
  // 3. Buat token
  const token = fastify.jwt.sign(
    { username: users[0].username },
    { expiresIn: '24h' }
  );
  
  return { success: true, token };
});

// Jalankan server
fastify.listen(5090);
```

---

# 📚 BAB 10: STRUKTUR FOLDER

## 📂 Organisasi File

Supaya rapih, kita pisahkan file sesuai fungsi:

### Express (asli):
```
server/
├── index.js              ← Setup server
├── auth/
│   └── index.js         ← Route auth/login
├── db/
│   └── MySql/
│       └── umum.js      ← Koneksi DB
└── package.json
```

### Fastify (kita):
```
server_fast/
├── index.js              ← Setup server + import routes
├── src/
│   ├── db/
│   │   └── index.js     ← Koneksi MySQL
│   ├── plugins/
│   │   ├── cors.js      ← Plugin CORS
│   │   └── jwt.js       ← Plugin JWT
│   └── routes/
│       ├── auth.js      ← Route: POST /auth/login
│       └── users.js     ← Route: GET /api/users
├── uploads/             ← File static
└── .env                ← Konfigurasi
```

---

# 📚 BAB 11: INSTALASI DAN CARA JALANKAN

## 🖥️ Persiapan Awal

Sebelum menjalankan server, pastikan Anda sudah install:

1. **Node.js** - Buka terminal, ketik:
   ```bash
   node --version
   ```
   Kalau muncul angka (misal: v18.19.0), berarti sudah terinstall!

2. **npm** (biasanya自动terinstall sama Node.js):
   ```bash
   npm --version
   ```

---

## 📥 Step 1: Clone/Download Project

Jika dapat project dari GitHub:

```bash
# Clone repo
git clone https://github.com/username/project.git

# Masuk ke folder
cd server_fast
```

---

## 📦 Step 2: Install Dependencies

**Analogi:**
Ini seperti belanja bahan makanan sebelum masak:

```bash
npm install
```

**Apa yang terjadi?**
- npm membaca `package.json`
- Mendownload semua library yang dibutuhkan
- Tergantung kecepatan internet, bisa 1-5 menit

**Hasil:**
- Folder `node_modules/` muncul (isi: semua library)
- File `package-lock.json` muncul (cache)

---

## ⚙️ Step 3: Setup Environment Variables

Buat file `.env` dengan isi:

```bash
# Copy contoh .env
cp .env.example .env
```

Edit `.env` sesuai konfigurasi Anda:

```env
# Database
HOST_DB_MYSQL=localhost
USER_DB_MYSQL=root
PASS_DB_MYSQL=
MAIN_DB_MYSQL=stokdarah_konut

# JWT
TOKEN_SECRET=rahasia-banget-123

# Server
PORT=5090
```

---

## ▶️ Step 4: Jalankan Server

### Cara 1: Mode Normal
```bash
npm start
```

### Cara 2: Mode Development (Auto-reload)
```bash
npm run dev
```

**Bedanya:**
- `npm start` - Jalan terus, harus manual restart kalau ada perubahan
- `npm run dev` - Auto-restart kalau file diubah (pakai `--watch`)

---

## 🧪 Step 5: Test Server

### Test 1: Cek Server Hidup
```bash
curl http://localhost:5090/
```

**Harus muncul:**
```json
{
  "message": "🦄🌈✨ Hello dari Fastify! 🌈✨🦄"
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:5090/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"passwordanda"}'
```

**Harus muncul:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "profile": {...}
}
```

### Test 3: Check Auth
```bash
curl -H "Authorization: Bearer TOKEN_ANDA" \
  http://localhost:5090/auth/check
```

---

## 🔧 Jika Error?

### ❌ Error: "Port already in use"
```bash
Error: listen EADDRINUSE: address already in use :::5090
```

**Solusi:**
- Cek apakah ada server lain di port 5090
- Atau ubah port di `.env`

### ❌ Error: "Cannot find module"
```bash
Error: Cannot find module 'fastify'
```

**Solusi:**
```bash
npm install
```

### ❌ Error: "Database connection failed"
```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solusi:**
- Pastikan MySQL sudah hidup
- Cek konfigurasi di `.env`

### ❌ Error: "Token expired"
```bash
Error: Token has expired
```

**Solusi:**
- Login ulang untuk dapat token baru

---

## 📋 Cara Cepat Install dari Nol

Kalau Anda mau buat project baru:

```bash
# 1. Buat folder
mkdir server_fast
cd server_fast

# 2. Init npm
npm init -y

# 3. Install Fastify dan dependencies
npm install fastify @fastify/cors @fastify/jwt @fastify/static mysql bcryptjs joi dotenv

# 4. Install dev dependencies (optional)
npm install --save-dev nodemon

# 5. Buat file index.js
touch index.js

# 6. Jalankan
node index.js
```

---

## 🐳 Alternatif: Pakai Docker (Advanced)

Kalau tidak mau install manual:

```bash
# Buat Dockerfile
echo 'FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5090
CMD ["node", "index.js"]' > Dockerfile

# Build & Jalan
docker build -t server-fast .
docker run -p 5090:5090 server-fast
```

---

## 📊 Perbandingan: Install Express vs Fastify

### Express:
```bash
npm init -y
npm install express cors mysql bcryptjs jsonwebtoken joi dotenv
```

### Fastify:
```bash
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/static mysql bcryptjs joi dotenv
```

**Bedanya:**
- Express: `express`, `cors`, `jsonwebtoken`
- Fastify: `fastify`, `@fastify/cors`, `@fastify/jwt`

---

## ✅ Checklist Installation

- [ ] Node.js sudah terinstall (`node --version`)
- [ ] npm sudah terinstall (`npm --version`)
- [ ] Masuk ke folder project (`cd server_fast`)
- [ ] Jalankan `npm install`
- [ ] Buat file `.env`
- [ ] Pastikan MySQL hidup
- [ ] Jalankan `npm start`
- [ ] Test dengan `curl http://localhost:5090/`

---

# ✅ KESIMPULAN

| Komponen | Express | Fastify |
|----------|---------|---------|
| Setup | `express()` | `fastify({ logger: true })` |
| JSON Body | `express.json()` | **Otomatis!** |
| Route GET | `app.get()` | `fastify.get()` |
| Route POST | `app.post()` | `fastify.post()` |
| Request | `req.body` | `request.body` |
| Response | `res.json()` | `return {}` |
| CORS |包 `cors` |包 `@fastify/cors` |
| JWT |包 `jsonwebtoken` |包 `@fastify/jwt` |
| Validasi | Manual (Joi) | **Schema otomatis!** |
| Logger |包 `morgan` | **Built-in!** |

---

# 🎓 TUGAS!

Sekarang coba Anda:

1. ✅ Pahami alur dari awal sampai login
2. ✅ Coba buat route baru `/welcome` yang mengembalikan pesan selamat datang
3. ✅ Coba lihat kode di `server_fast/src/routes/auth.js`
4. ✅ Coba test dengan curl seperti di Bab 11

**Contoh route `/welcome`:**
```javascript
fastify.get('/welcome', async (request, reply) => {
  return { message: 'Selamat datang di Fastify!' };
});
```

**Caranya:**
1. Buka `server_fast/index.js`
2. Tambah route di atas
3. Restart server (`npm start`)
4. Test: `curl http://localhost:5090/welcome`

---

# 🚀 LANGKAH SELANJUTNYA

Kalau sudah paham semua ini, siap untuk:

1. **Migrasi Express → Fastify** - Pindahkan semua route satu per satu
2. **Tambah Route Baru** - Seperti `/api/stok_darah`, `/api/permintaan_darah`
3. **Socket.IO** - Real-time communication
4. **File Upload** - Pakai `@fastify/multipart`

Tanya saja kalau ada yang bingung! 😊

---

**#HappyLearning #FastifyVsExpress #JavaScript**

