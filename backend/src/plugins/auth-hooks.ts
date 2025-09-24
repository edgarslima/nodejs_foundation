import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

const authHooksPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      throw fastify.httpErrors.unauthorized("Unauthorized");
    }
  });

  fastify.decorate("authorizeRole", (...roles: Array<"ADMIN" | "USER">) => {
    return async (request) => {
      if (!request.user) {
        throw fastify.httpErrors.unauthorized("Unauthorized");
      }

      if (roles.length > 0 && !roles.includes(request.user.role)) {
        throw fastify.httpErrors.forbidden("Forbidden");
      }
    };
  });
});

export default authHooksPlugin;