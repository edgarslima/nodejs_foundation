import { createHash, randomBytes, randomUUID } from "node:crypto";

export const createToken = (bytes = 48): string => randomBytes(bytes).toString("base64url");

export const hashToken = (token: string, pepper: string): string =>
  createHash("sha256").update(`${token}${pepper}`).digest("hex");

export const createId = (): string => randomUUID();