/**
 * ========================================================
 * AUTH ROUTES
 * ========================================================
 * 
 * Route untuk authentication (login, register, dll)
 * 
 * Di Express:
 * const router = express.Router();
 * router.post('/login', ...);
 * module.exports = router;
 * 
 * Di Fastify:
 * async function authRoutes(fastify, options) {
 *   fastify.post('/login', ...);
 * }
 * module.exports = authRoutes;
 */

const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { query } = require('../db');

async function authRoutes(fastify, options) {

  // ========================================================
  // GET /auth (cek status)
  // ========================================================
  fastify.get('/', async (request, reply) => {
    return { 
      message: 'Auth API Ready',
      endpoints: [
        'GET  /',
        'POST /login',
        'GET  /check'
      ]
    };
  });

  // ========================================================
  // POST /auth/login
  // ========================================================
  const loginSchema = Joi.object({
    username: Joi.string()
      .regex(/^[a-zA-Z0-9_]*$/)
      .min(3)
      .max(13)
      .required(),
    password: Joi.string().min(6).required()
  });

  fastify.post('/login', {
    schema: { body: loginSchema }  // ✅ Validasi otomatis!
  }, async (request, reply) => {
    try {
      console.log("🔐 ADA YANG LOGIN:", request.body);

      const { username, password } = request.body;

      // Query ke database (sama seperti Express)
      const viewSql = `
        SELECT u.*
        FROM stokdarah_konut.users u
        WHERE u.username = ?
        LIMIT 1
      `;
      
      const rows = await query(viewSql, [username]);

      // Cek user ada atau tidak
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        reply.code(422);
        return { 
          success: false,
          message: "Username tidak ditemukan" 
        };
      }

      const user = rows[0];

      // Verifikasi password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        reply.code(422);
        return { 
          success: false,
          message: "Password salah" 
        };
      }

      // Ambil data ruangan jika ada
      let ruanganData = null;
      try {
        const sqlRuangan = `
          SELECT id AS ruangan_id, nama_ruangan
          FROM stokdarah_konut.tenaga_medis
          WHERE users_id = ?
          LIMIT 1
        `;
        const ruanganRows = await query(sqlRuangan, [user.id]);
        if (ruanganRows && ruanganRows.length > 0) {
          ruanganData = ruanganRows[0];
        }
      } catch (e) {
        console.warn("Gagal mengambil data ruangan:", e);
      }

      // Buat payload JWT
      const payload = {
        _id: user.id,
        username: user.username,
        profile: {
          nama: user.nama || user.nama_nip || '',
          stokdarah_konut: user.stokdarah_konut || null,
          ...(ruanganData ? ruanganData : {}),
          [process.env.MAIN_DB_MYSQL || 'main_db']: user[process.env.MAIN_DB_MYSQL] || null
        }
      };

      // Generate token (cara Fastify!)
      const token = fastify.jwt.sign(payload, { expiresIn: '24h' });
      
      return { 
        success: true,
        token, 
        profile: payload 
      };
      
    } catch (err) {
      console.error('❌ LOGIN ERROR:', err);
      reply.code(500);
      return { 
        success: false,
        message: err.message 
      };
    }
  });

  // ========================================================
  // GET /auth/check (cek token)
  // ========================================================
  fastify.get('/check', {
    preHandler: [fastify.authenticate]  // ✅ Proteksi route ini!
  }, async (request, reply) => {
    return { 
      success: true,
      message: 'Token valid',
      user: request.user
    };
  });

}

module.exports = authRoutes;

