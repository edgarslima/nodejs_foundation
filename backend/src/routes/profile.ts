import { FastifyPluginAsync } from "fastify";

const profileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => ({ status: "ok" }));

  fastify.get("/profile", { preHandler: fastify.authenticate }, async (request, reply) => {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
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

    return user;
  });
};

export default profileRoutes;