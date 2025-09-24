import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";
import { appConfig } from "@/config/env";

const securityPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const redisClient = appConfig.redis.url ? new Redis(appConfig.redis.url) : undefined;

  await fastify.register(fastifyCors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (appConfig.cors.origins.includes("*") || appConfig.cors.origins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed"), false);
    },
    credentials: true
  });

  await fastify.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });

  await fastify.register(fastifyCookie, {
    hook: "onRequest",
    parseOptions: {
      sameSite: "lax",
      httpOnly: true,
      secure: appConfig.isProduction
    }
  });

  await fastify.register(fastifyRateLimit, {
    global: true,
    max: 200,
    timeWindow: "1 minute",
    redis: redisClient,
    keyGenerator: (request) => request.ip
  });

  await fastify.register(fastifyJwt, {
    secret: {
      private: appConfig.jwt.privateKey,
      public: appConfig.jwt.publicKey
    },
    sign: {
      algorithm: "RS256",
      expiresIn: appConfig.jwt.accessExpiresIn
    }
  });

  fastify.log.info({ hasJwt: Boolean((fastify as any).jwt) }, "JWT plugin registered");

  fastify.addHook("onClose", async () => {
    if (redisClient) {
      await redisClient.quit();
    }
  });
}, { name: "security" });

export default securityPlugin;