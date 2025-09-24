import { z } from "zod";
import ms from "ms";
import { generateKeyPairSync } from "node:crypto";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.string().default("3010"),
  LOG_LEVEL: z.string().default("info"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  RESET_TOKEN_TTL: z.string().default("20m"),
  PASSWORD_PEPPER: z.string().min(8, "PASSWORD_PEPPER must be at least 8 characters"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000")
});

const parsed = envSchema.parse(process.env);

const parseOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const accessTokenMs = ms(parsed.ACCESS_TOKEN_TTL);
const refreshTokenMs = ms(parsed.REFRESH_TOKEN_TTL);
const resetTokenMs = ms(parsed.RESET_TOKEN_TTL);

if (!accessTokenMs || !refreshTokenMs || !resetTokenMs) {
  throw new Error("Invalid token TTL configuration; please use values compatible with npm `ms`.");
}

let privateKey = parsed.JWT_PRIVATE_KEY?.trim();
let publicKey = parsed.JWT_PUBLIC_KEY?.trim();

const corsOrigins = parseOrigins(parsed.CORS_ALLOWED_ORIGINS);

if (!privateKey || !publicKey) {
  const { privateKey: generatedPrivateKey, publicKey: generatedPublicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" }
  });

  privateKey = generatedPrivateKey;
  publicKey = generatedPublicKey;

  console.warn("JWT key pair not provided via environment. Generated ephemeral keys for development.");
}

export const appConfig = {
  environment: parsed.NODE_ENV,
  isProduction: parsed.NODE_ENV === "production",
  server: {
    host: parsed.HOST,
    port: Number(parsed.PORT),
    logLevel: parsed.LOG_LEVEL
  },
  database: {
    url: parsed.DATABASE_URL
  },
  redis: {
    url: parsed.REDIS_URL ?? null
  },
  cors: {
    origins: corsOrigins
  },
  tokens: {
    accessTtlMs: accessTokenMs,
    refreshTtlMs: refreshTokenMs,
    resetTtlMs: resetTokenMs,
    pepper: parsed.PASSWORD_PEPPER
  },
  adminSeed: {
    email: parsed.ADMIN_EMAIL,
    password: parsed.ADMIN_PASSWORD
  },
  jwt: {
    privateKey,
    publicKey,
    accessExpiresIn: parsed.ACCESS_TOKEN_TTL
  }
} as const;