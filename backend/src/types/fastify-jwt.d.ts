import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: "ADMIN" | "USER";
    };
    user: {
      sub: string;
      role: "ADMIN" | "USER";
    };
  }
}