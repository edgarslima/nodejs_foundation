import fastifySensible from "@fastify/sensible";
import { PrismaClient } from "@prisma/client";
import Fastify, { FastifyInstance } from "fastify";
import authRoutes from "@/routes/auth";
import channelRoutes from "@/routes/channel";
import profileRoutes from "@/routes/profile";
import prismaPlugin from "@/plugins/prisma";
import securityPlugin from "@/plugins/security";
import authHooksPlugin from "@/plugins/auth-hooks";
import { appConfig } from "@/config/env";

export interface HealthResponse {
  status: "ok";
}

export interface BuildServerOptions {
  prismaClient?: PrismaClient;
}

export const buildServer = (options: BuildServerOptions = {}): FastifyInstance => {
  const app = Fastify({
    logger: {
      level: appConfig.server.logLevel
    }
  });

  void app.register(fastifySensible);
  void app.register(securityPlugin);
  void app.register(authHooksPlugin);

  if (options.prismaClient) {
    app.decorate("prisma", options.prismaClient);
    app.addHook("onClose", async () => {
      await options.prismaClient?.$disconnect();
    });
  } else {
    void app.register(prismaPlugin);
  }

  app.get("/health", async () => {
    const response: HealthResponse = { status: "ok" };
    return response;
  });

  void app.register(authRoutes, { prefix: "/auth" });
  void app.register(profileRoutes, { prefix: "/api" });
  void app.register(channelRoutes, { prefix: "/api/channel" });

  return app;
};