/**
 * ========================================================
 * JWT PLUGIN
 * ========================================================
 * 
 * Untuk authentication menggunakan JSON Web Token
 * Sama seperti Express: jwt.sign() dari package jsonwebtoken
 * 
 * DI FASTIFY:
 * fastify.register(require('@fastify/jwt'), { secret: '...' })
 * 
 * KEUNGGULAN:
 * - Generate token: fastify.jwt.sign(payload)
 * - Verify token: fastify.jwt.verify(token)
 * - Tidak perlu import jwt manual!
 */

const fp = require('fastify-plugin');

async function jwtPlugin(fastify, options) {
  // Register @fastify/jwt
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.TOKEN_SECRET || 'your-secret-key'
  });

  // Decorate fastify dengan helper untuk方便 akses
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

module.exports = jwtPlugin;

