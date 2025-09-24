import { FastifyInstance } from "fastify";
import { createId, createToken, hashToken } from "@/utils/crypto";
import { appConfig } from "@/config/env";
import { RefreshToken, User } from "@prisma/client";

export interface RefreshTokenIssueResult {
  refreshToken: string;
  record: RefreshToken;
}

export const createAccessToken = async (fastify: FastifyInstance, user: User): Promise<string> => {
  return fastify.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: appConfig.jwt.accessExpiresIn });
};

export const issueRefreshToken = async (
  fastify: FastifyInstance,
  params: {
    user: User;
    ip?: string | null;
    userAgent?: string | null;
    replacesId?: string | null;
  }
): Promise<RefreshTokenIssueResult> => {
  const { user, ip, userAgent, replacesId } = params;

  const token = createToken(48);
  const hashed = hashToken(token, appConfig.tokens.pepper);

  const record = await fastify.prisma.refreshToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: hashed,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + appConfig.tokens.refreshTtlMs),
      ip: ip ?? null,
      userAgent: userAgent ?? null
    }
  });

  if (replacesId) {
    await fastify.prisma.refreshToken.update({
      where: { id: replacesId },
      data: {
        revokedAt: new Date(),
        replacedByTokenId: record.id
      }
    });
  }

  return { refreshToken: token, record };
};

export const revokeRefreshToken = async (fastify: FastifyInstance, tokenId: string): Promise<void> => {
  await fastify.prisma.refreshToken.updateMany({
    where: { id: tokenId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
};

export const revokeUserRefreshTokens = async (fastify: FastifyInstance, userId: string): Promise<void> => {
  await fastify.prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
};

export const verifyRefreshToken = async (
  fastify: FastifyInstance,
  token: string
): Promise<RefreshToken | null> => {
  const hash = hashToken(token, appConfig.tokens.pepper);
  const record = await fastify.prisma.refreshToken.findFirst({
    where: {
      tokenHash: hash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  return record;
};