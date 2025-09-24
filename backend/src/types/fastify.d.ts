import "fastify";
import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorizeRole: (...roles: Array<"ADMIN" | "USER">) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      sub: string;
      role: "ADMIN" | "USER";
    };
  }
}