import { hash, verify } from "@node-rs/argon2";
import { appConfig } from "@/config/env";

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  type: "argon2id"
} as const;

export const hashPassword = async (password: string): Promise<string> => {
  return hash(`${password}${appConfig.tokens.pepper}`, ARGON2_OPTIONS);
};

export const verifyPassword = async (password: string, hashValue: string): Promise<boolean> => {
  return verify(hashValue, `${password}${appConfig.tokens.pepper}`);
};