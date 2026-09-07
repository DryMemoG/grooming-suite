import type { FastifyInstance } from 'fastify';
import { LoginSchema } from '@grooming-suite/shared';
import { prisma } from '../../lib/prisma.js';
import { verifyPassword } from './password.js';
import { issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from './refresh-token.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const isDev = process.env.NODE_ENV !== 'production';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    const usuario = await prisma.usuario.findUnique({
      where: { email: body.email },
      include: { rol: true },
    });

    if (!usuario || !usuario.activo) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await verifyPassword(usuario.passwordHash, body.password);
    if (!passwordValida) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }

    const accessToken = await reply.jwtSign(
      { sub: usuario.id, rol: usuario.rol.nombre, sucursalId: usuario.sucursalId },
      { expiresIn: '15m' },
    );

    const refreshToken = await issueRefreshToken(usuario.id);

    reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: 'strict',
      path: '/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
    };
  });

  app.post('/auth/refresh', async (request, reply) => {
    const oldToken = request.cookies[REFRESH_COOKIE_NAME];
    if (!oldToken) {
      return reply.code(401).send({ error: 'No hay refresh token' });
    }

    const result = await rotateRefreshToken(oldToken);
    if (!result) {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
      return reply.code(401).send({ error: 'Refresh token inválido o revocado' });
    }

    const usuario = await prisma.usuario.findUniqueOrThrow({
      where: { id: result.usuarioId },
      include: { rol: true },
    });

    const accessToken = await reply.jwtSign(
      { sub: usuario.id, rol: usuario.rol.nombre, sucursalId: usuario.sucursalId },
      { expiresIn: '15m' },
    );

    reply.setCookie(REFRESH_COOKIE_NAME, result.newToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: 'strict',
      path: '/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });

    return { accessToken };
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (token) await revokeRefreshToken(token);
    reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
    return { status: 'ok' };
  });
}