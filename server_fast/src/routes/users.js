/**
 * ========================================================
 * USER ROUTES - Contoh Route Lainnya
 * ========================================================
 * 
 * Ini contoh route untuk management users
 * Kita pisahkan dari auth agar struktur rapi
 */

const { query } = require('../db');

async function userRoutes(fastify, options) {

  // ========================================================
  // GET /api/users (ambil semua user)
  // ========================================================
  fastify.get('/users', {
    preHandler: [fastify.authenticate]  // Proteksi dengan JWT
  }, async (request, reply) => {
    try {
      const sql = `SELECT id, username, nama, stokdarah_konut FROM stokdarah_konut.users LIMIT 10`;
      const users = await query(sql);
      
      return { 
        success: true, 
        data: users 
      };
    } catch (err) {
      reply.code(500);
      return { 
        success: false, 
        message: err.message 
      };
    }
  });

  // ========================================================
  // GET /api/users/:id (ambil user by ID)
  // ========================================================
  fastify.get('/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const sql = `SELECT * FROM stokdarah_konut.users WHERE id = ?`;
      const users = await query(sql, [id]);
      
      if (users.length === 0) {
        reply.code(404);
        return { 
          success: false, 
          message: 'User tidak ditemukan' 
        };
      }
      
      return { 
        success: true, 
        data: users[0] 
      };
    } catch (err) {
      reply.code(500);
      return { 
        success: false, 
        message: err.message 
      };
    }
  });

  // ========================================================
  // POST /api/users (tambah user baru)
  // ========================================================
  fastify.post('/users', async (request, reply) => {
    const { username, password, nama } = request.body;
    
    if (!username || !password) {
      reply.code(400);
      return { 
        success: false, 
        message: 'Username dan password wajib diisi' 
      };
    }
    
    try {
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const sql = `INSERT INTO stokdarah_konut.users (username, password, nama) VALUES (?, ?, ?)`;
      const result = await query(sql, [username, hashedPassword, nama || '']);
      
      return { 
        success: true, 
        message: 'User created',
        id: result.insertId
      };
    } catch (err) {
      reply.code(500);
      return { 
        success: false, 
        message: err.message 
      };
    }
  });

}

module.exports = userRoutes;

