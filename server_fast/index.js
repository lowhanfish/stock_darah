/**
 * ========================================================
 * FASTIFY PROJECT STRUCTURE - BELAJAR FASTIFY
 * ========================================================
 * 
 * Struktur folder yang rapih seperti ini:
 * 
 * server_fast/
 * ├── src/
 * │   ├── db/           → Koneksi database
 * │   ├── plugins/      → Plugin konfigurasi
 * │   ├── routes/       → Route/API endpoints
 * │   └── utils/        → Fungsi helper
 * ├── uploads/          → File static
 * ├── index.js          → Entry point/server utama
 * ├── package.json
 * └── .env
 * 
 * Ini sama seperti struktur Express yang sudah kamu punya!
 */

require('dotenv').config();

const fastify = require('fastify')({ 
  logger: true 
});

// ========================================================
// IMPORT PLUGINS
// ========================================================
const cors = require('./src/plugins/cors');
const jwt = require('./src/plugins/jwt');

// Register plugins
fastify.register(cors);
fastify.register(jwt);

// ========================================================
// IMPORT ROUTES
// ========================================================
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');

// Register routes dengan prefix
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/api' });

// ========================================================
// ROOT ROUTE
// ========================================================
fastify.get('/', async (request, reply) => {
  return {
    message: '🦄🌈✨ Hello dari Fastify! 🌈✨🦄',
    struktur: 'server_fast/src/routes/',
    routes: [
      'GET  /',
      'POST /auth/login',
      'GET  /auth/check',
      'GET  /api/users',
      'GET  /api/users/:id'
    ]
  };
});

// ========================================================
// STATIC FILES
// ========================================================
fastify.register(require('@fastify/static'), {
  root: require('path').join(__dirname, 'uploads'),
  prefix: '/uploads/'
});

// ========================================================
// ERROR HANDLER
// ========================================================
fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.code(400).send({
      success: false,
      message: 'Validation error',
      errors: error.validation
    });
    return;
  }
  
  reply.code(error.statusCode || 500).send({
    success: false,
    message: error.message
  });
});

// ========================================================
// SOCKET.IO (optional)
// ========================================================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(fastify.server);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Disconnected:', socket.id));
});

// ========================================================
// START SERVER
// ========================================================
const start = async () => {
  try {
    const port = process.env.PORT || 5090;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🚀 FASTIFY SERVER - STRUKTUR RAPIH              ║
╠═══════════════════════════════════════════════════════════╣
║  Port: ${port}                                              ║
║  URL:  http://localhost:${port}                             ║
║                                                           ║
║  Struktur Folder:                                        ║
║  ├── src/                                                ║
║  │   ├── db/         → Database connection              ║
║  │   ├── plugins/    → Plugin konfigurasi               ║
║  │   ├── routes/     → API routes                       ║
║  │   └── utils/      → Helper functions                ║
║  └── uploads/       → Static files                      ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

