import { prisma } from "../../db/prismaClient.js";

export function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser({ name, email, passwordHash, role }) {
  return prisma.user.create({ data: { name, email, passwordHash, role } });
}

export function createRefreshToken({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
}

export function findActiveRefreshTokenByHash(tokenHash) {
  return prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
  });
}

export function revokeRefreshTokenById(id) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export function revokeRefreshTokenByHash(tokenHash) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
