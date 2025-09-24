import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { appConfig } from "@/config/env";
import { hashPassword, verifyPassword } from "@/services/password";
import { createAccessToken, issueRefreshToken, revokeRefreshToken, verifyRefreshToken } from "@/services/token-service";
import { createId, createToken, hashToken } from "@/utils/crypto";
import { differenceInSeconds } from "date-fns";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = registerSchema;

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

const MAX_LOGIN_FAILURES = 5;
const FAILURE_WINDOW_MS = 5 * 60 * 1000;

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const setRefreshCookie = (reply: any, token: string) => {
    reply.setCookie("refresh_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: appConfig.isProduction,
      maxAge: Math.floor(appConfig.tokens.refreshTtlMs / 1000)
    });
  };

  const clearRefreshCookie = (reply: any) => {
    reply.clearCookie("refresh_token", { path: "/" });
  };

  fastify.post("/register", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const parse = registerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ message: parse.error.errors[0]?.message ?? "Invalid payload" });
    }

    const email = parse.data.email.toLowerCase();
    const passwordHash = await hashPassword(parse.data.password);

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ message: "Email already registered." });
    }

    const user = await fastify.prisma.user.create({
      data: {
        id: createId(),
        email,
        passwordHash,
        passwordAlgo: "argon2id",
        role: "USER",
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    return reply.code(201).send(user);
  });

  fastify.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ message: parse.error.errors[0]?.message ?? "Invalid payload" });
    }

    const email = parse.data.email.toLowerCase();

    const recentAttempts = await fastify.prisma.loginAttempt.findMany({
      where: {
        email,
        createdAt: {
          gt: new Date(Date.now() - FAILURE_WINDOW_MS)
        }
      },
      orderBy: { createdAt: "desc" },
      take: MAX_LOGIN_FAILURES
    });

    const recentFailures = recentAttempts.filter((attempt) => !attempt.success);
    if (recentFailures.length >= 3) {
      const backoffSeconds = Math.min(120, recentFailures.length * 5);
      const latestFailure = recentFailures[0];
      const secondsSinceLastFailure = differenceInSeconds(new Date(), latestFailure.createdAt);
      if (secondsSinceLastFailure < backoffSeconds) {
        return reply.code(429).send({
          message: `Too many failed attempts. Try again in ${backoffSeconds - secondsSinceLastFailure}s.`
        });
      }
    }

    const user = await fastify.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      await fastify.prisma.loginAttempt.create({
        data: {
          id: createId(),
          email,
          userId: user?.id ?? null,
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? null,
          success: false
        }
      });
      return reply.code(401).send({ message: "Invalid email or password." });
    }

    const isValidPassword = await verifyPassword(parse.data.password, user.passwordHash);

    await fastify.prisma.loginAttempt.create({
      data: {
        id: createId(),
        email,
        userId: user.id,
        ip: request.ip,
        userAgent: request.headers["user-agent"] ?? null,
        success: isValidPassword
      }
    });

    if (!isValidPassword) {
      return reply.code(401).send({ message: "Invalid email or password." });
    }

    const accessToken = await createAccessToken(fastify, user);
    const refresh = await issueRefreshToken(fastify, {
      user,
      ip: request.ip,
      userAgent: request.headers["user-agent"]?.toString() ?? null
    });

    setRefreshCookie(reply, refresh.refreshToken);

    await fastify.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return reply.send({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt
      }
    });
  });

  fastify.post("/refresh", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const cookie = request.cookies["refresh_token"];
    if (!cookie) {
      return reply.code(401).send({ message: "Missing refresh token." });
    }

    const record = await verifyRefreshToken(fastify, cookie);
    if (!record) {
      clearRefreshCookie(reply);
      return reply.code(401).send({ message: "Invalid refresh token." });
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || !user.isActive) {
      clearRefreshCookie(reply);
      await revokeRefreshToken(fastify, record.id);
      return reply.code(401).send({ message: "Invalid session." });
    }

    const accessToken = await createAccessToken(fastify, user);
    const refresh = await issueRefreshToken(fastify, {
      user,
      ip: request.ip,
      userAgent: request.headers["user-agent"]?.toString() ?? null,
      replacesId: record.id
    });

    setRefreshCookie(reply, refresh.refreshToken);

    return reply.send({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt
      }
    });
  });

  fastify.post("/logout", async (request, reply) => {
    const cookie = request.cookies["refresh_token"];
    if (cookie) {
      const record = await verifyRefreshToken(fastify, cookie);
      if (record) {
        await revokeRefreshToken(fastify, record.id);
      }
    }
    clearRefreshCookie(reply);
    return reply.code(204).send();
  });

  fastify.get("/me", { preHandler: fastify.authenticate }, async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true,
        email: true,
        role: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    return reply.send(user);
  });

  fastify.post("/forgot-password", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const parse = forgotPasswordSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ message: parse.error.errors[0]?.message ?? "Invalid payload" });
    }

    const email = parse.data.email.toLowerCase();
    const user = await fastify.prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = createToken(32);
      const hashedToken = hashToken(rawToken, appConfig.tokens.pepper);

      await fastify.prisma.passwordResetToken.create({
        data: {
          id: createId(),
          userId: user.id,
          tokenHash: hashedToken,
          reason: "reset",
          expiresAt: new Date(Date.now() + appConfig.tokens.resetTtlMs),
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? null
        }
      });

      fastify.log.info({ email, resetToken: rawToken }, "Password reset token generated");
    }

    return reply.code(202).send({ message: "If the account exists, password reset instructions were sent." });
  });

  fastify.post("/reset-password", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const parse = resetPasswordSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ message: parse.error.errors[0]?.message ?? "Invalid payload" });
    }

    const tokenHash = hashToken(parse.data.token, appConfig.tokens.pepper);

    const record = await fastify.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!record) {
      return reply.code(400).send({ message: "Invalid or expired token." });
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) {
      return reply.code(400).send({ message: "Invalid token." });
    }

    const newHash = await hashPassword(parse.data.password);

    await fastify.prisma.$transaction([
      fastify.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash, passwordAlgo: "argon2id" }
      }),
      fastify.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      }),
      fastify.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);

    clearRefreshCookie(reply);

    return reply.code(204).send();
  });
};

export default authRoutes;
