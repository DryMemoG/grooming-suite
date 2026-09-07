import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';

const REFRESH_TOKEN_TTL_DAYS = 30;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueRefreshToken(usuarioId: string): Promise<string> {
  const token = randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(token), expiresAt, usuarioId },
  });

  return token;
}

export async function rotateRefreshToken(oldToken: string) {
  const tokenHash = hashToken(oldToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing) return null;

  if (existing.revokedAt || existing.expiresAt < new Date()) {
    // Reuso de un token ya revocado/expirado: señal de robo.
    // Se revocan TODOS los refresh tokens activos del usuario, no solo este.
    await prisma.refreshToken.updateMany({
      where: { usuarioId: existing.usuarioId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const newToken = await issueRefreshToken(existing.usuarioId);
  return { usuarioId: existing.usuarioId, newToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}