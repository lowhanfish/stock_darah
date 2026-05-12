/**
 * ========================================================
 * CORS PLUGIN
 * ========================================================
 * 
 * Untuk mengaktifkan CORS (Cross-Origin Resource Sharing)
 * Sama seperti Express: app.use(cors())
 * 
 * DI FASTIFY:
 * const cors = require('@fastify/cors');
 * fastify.register(cors, { origin: true });
 */

const fp = require('fastify-plugin');

async function corsPlugin(fastify, options) {
  // Register @fastify/cors
  fastify.register(require('@fastify/cors'), {
    origin: true  // Izinkan semua origin
  });
}

module.exports = corsPlugin;

