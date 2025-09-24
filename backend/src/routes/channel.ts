import "@fastify/sensible";
import { Prisma } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";

interface PublishTokenPayload {
  cipher: string;
  iv: string;
  tag: string;
}

interface ChannelMutationPayload {
  channelCode?: string;
  name?: string;
  description?: string | null;
  publishToken?: PublishTokenPayload;
  lastPublishAt?: string | null;
  isActive?: boolean;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
  categoryIds?: string[];
}

interface ChannelCreatePayload extends ChannelMutationPayload {
  channelCode: string;
  name: string;
  publishToken: PublishTokenPayload;
}

interface ChannelCategoryResponse {
  id: string;
  name: string;
  youtubeCategoryId: number | null;
}

interface ChannelResponse {
  id: string;
  channelCode: string;
  name: string;
  description: string | null;
  publishToken: PublishTokenPayload;
  lastPublishAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  categories: ChannelCategoryResponse[];
}

interface ChannelListQuerystring {
  search?: string;
  isActive?: string;
  categoryId?: string;
}

interface ChannelParams {
  id: string;
}

interface ChannelCodeParams {
  channelCode: string;
}

const channelInclude = {
  categories: {
    include: {
      category: true
    }
  }
} satisfies Prisma.ChannelInclude;

type ChannelWithRelations = Prisma.ChannelGetPayload<{
  include: typeof channelInclude;
}>;

const publishTokenSchema = {
  type: "object",
  required: ["cipher", "iv", "tag"],
  properties: {
    cipher: { type: "string", minLength: 1 },
    iv: { type: "string", minLength: 1 },
    tag: { type: "string", minLength: 1 }
  }
};

const channelResponseSchema = {
  type: "object",
  required: [
    "id",
    "channelCode",
    "name",
    "description",
    "publishToken",
    "lastPublishAt",
    "isActive",
    "createdAt",
    "updatedAt",
    "createdByUserId",
    "updatedByUserId",
    "categories"
  ],
  properties: {
    id: { type: "string" },
    channelCode: { type: "string" },
    name: { type: "string" },
    description: { type: ["string", "null"] },
    publishToken: publishTokenSchema,
    lastPublishAt: { type: ["string", "null"], format: "date-time" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    createdByUserId: { type: ["string", "null"] },
    updatedByUserId: { type: ["string", "null"] },
    categories: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "youtubeCategoryId"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          youtubeCategoryId: { type: ["integer", "null"] }
        }
      }
    }
  }
};

const channelRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const decodeBase64 = (value: string, field: string): Buffer => {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
      throw fastify.httpErrors.badRequest(`${field} must be a valid base64 string.`);
    }

    const buffer = Buffer.from(value, "base64");
    if (buffer.byteLength === 0) {
      throw fastify.httpErrors.badRequest(`${field} must be a valid base64 string.`);
    }

    return buffer;
  };

  const parseLastPublishAt = (value: string | null | undefined): Date | null | undefined => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) {
      throw fastify.httpErrors.badRequest("lastPublishAt must be a valid ISO date string.");
    }

    return parsed;
  };

  const ensureCategories = async (categoryIds: string[], tx: Prisma.TransactionClient): Promise<void> => {
    if (categoryIds.length === 0) {
      return;
    }

    const categories = await tx.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true }
    });

    if (categories.length !== categoryIds.length) {
      throw fastify.httpErrors.badRequest("One or more categories do not exist.");
    }
  };

  const toBase64 = (input: Buffer | Uint8Array): string => Buffer.from(input).toString("base64");

  const mapChannelToResponse = (channel: ChannelWithRelations): ChannelResponse => {
    return {
      id: channel.id,
      channelCode: channel.channelCode,
      name: channel.name,
      description: channel.description ?? null,
      publishToken: {
        cipher: toBase64(channel.publishTokenCipher),
        iv: toBase64(channel.publishTokenIv),
        tag: toBase64(channel.publishTokenTag)
      },
      lastPublishAt: channel.lastPublishAt ? channel.lastPublishAt.toISOString() : null,
      isActive: channel.isActive,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
      createdByUserId: channel.createdByUserId ?? null,
      updatedByUserId: channel.updatedByUserId ?? null,
      categories: channel.categories.map((relation) => ({
        id: relation.category.id,
        name: relation.category.name,
        youtubeCategoryId: relation.category.youtubeCategoryId ?? null
      }))
    };
  };

  fastify.get<{ Reply: ChannelResponse[]; Querystring: ChannelListQuerystring }>("/", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          search: { type: "string" },
          isActive: { type: "string", enum: ["true", "false"] },
          categoryId: { type: "string" }
        }
      },
      response: {
        200: {
          type: "array",
          items: channelResponseSchema
        }
      }
    }
  }, async (request) => {
    const { search, isActive, categoryId } = request.query;

    const where: Prisma.ChannelWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { channelCode: { contains: search } }
      ];
    }

    if (typeof isActive !== "undefined") {
      where.isActive = isActive === "true";
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId }
      };
    }

    const channels = await fastify.prisma.channel.findMany({
      where,
      include: channelInclude,
      orderBy: { createdAt: "desc" }
    });

    return channels.map(mapChannelToResponse);
  });

  fastify.get<{ Reply: ChannelResponse; Params: ChannelCodeParams }>("/code/:channelCode", {
    schema: {
      params: {
        type: "object",
        required: ["channelCode"],
        properties: {
          channelCode: { type: "string" }
        }
      },
      response: {
        200: channelResponseSchema
      }
    }
  }, async (request) => {
    const { channelCode } = request.params;

    const channel = await fastify.prisma.channel.findUnique({
      where: { channelCode },
      include: channelInclude
    });

    if (!channel) {
      throw fastify.httpErrors.notFound("Channel not found.");
    }

    return mapChannelToResponse(channel);
  });

  fastify.get<{ Reply: ChannelResponse; Params: ChannelParams }>("/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      },
      response: {
        200: channelResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params;

    const channel = await fastify.prisma.channel.findUnique({
      where: { id },
      include: channelInclude
    });

    if (!channel) {
      throw fastify.httpErrors.notFound("Channel not found.");
    }

    return mapChannelToResponse(channel);
  });

  fastify.post<{ Body: ChannelCreatePayload; Reply: ChannelResponse }>("/", {
    schema: {
      body: {
        type: "object",
        required: ["channelCode", "name", "publishToken"],
        properties: {
          channelCode: { type: "string", minLength: 1 },
          name: { type: "string", minLength: 1 },
          description: { type: ["string", "null"] },
          publishToken: publishTokenSchema,
          lastPublishAt: { type: ["string", "null"], format: "date-time" },
          isActive: { type: "boolean" },
          createdByUserId: { type: ["string", "null"] },
          updatedByUserId: { type: ["string", "null"] },
          categoryIds: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true
          }
        }
      },
      response: {
        201: channelResponseSchema
      }
    }
  }, async (request, reply) => {
    const payload = request.body;
    const categoryIds = Array.from(new Set(payload.categoryIds ?? []));

    const publishTokenCipher = decodeBase64(payload.publishToken.cipher, "publishToken.cipher");
    const publishTokenIv = decodeBase64(payload.publishToken.iv, "publishToken.iv");
    const publishTokenTag = decodeBase64(payload.publishToken.tag, "publishToken.tag");
    const lastPublishAt = parseLastPublishAt(payload.lastPublishAt);

    const channel = await fastify.prisma.$transaction(async (tx) => {
      await ensureCategories(categoryIds, tx);

      const created = await tx.channel.create({
        data: {
          channelCode: payload.channelCode,
          name: payload.name,
          description: payload.description ?? null,
          publishTokenCipher,
          publishTokenIv,
          publishTokenTag,
          lastPublishAt: lastPublishAt ?? undefined,
          isActive: payload.isActive ?? true,
          createdByUserId: payload.createdByUserId ?? null,
          updatedByUserId: payload.updatedByUserId ?? null
        }
      });

      if (categoryIds.length > 0) {
        await tx.channelCategory.createMany({
          data: categoryIds.map((categoryId) => ({ channelId: created.id, categoryId }))
        });
      }

      return tx.channel.findUniqueOrThrow({
        where: { id: created.id },
        include: channelInclude
      });
    });

    reply.code(201);
    return mapChannelToResponse(channel);
  });

  fastify.put<{ Params: ChannelParams; Body: ChannelMutationPayload; Reply: ChannelResponse }>("/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      },
      body: {
        type: "object",
        properties: {
          channelCode: { type: "string", minLength: 1 },
          name: { type: "string", minLength: 1 },
          description: { type: ["string", "null"] },
          publishToken: publishTokenSchema,
          lastPublishAt: { type: ["string", "null"], format: "date-time" },
          isActive: { type: "boolean" },
          createdByUserId: { type: ["string", "null"] },
          updatedByUserId: { type: ["string", "null"] },
          categoryIds: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true
          }
        }
      },
      response: {
        200: channelResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params;
    const payload = request.body;

    if (!payload || Object.keys(payload).length === 0) {
      throw fastify.httpErrors.badRequest("Request body cannot be empty.");
    }

    const categoryIds = payload.categoryIds !== undefined ? Array.from(new Set(payload.categoryIds)) : undefined;
    const publishTokenCipher = payload.publishToken
      ? decodeBase64(payload.publishToken.cipher, "publishToken.cipher")
      : undefined;
    const publishTokenIv = payload.publishToken
      ? decodeBase64(payload.publishToken.iv, "publishToken.iv")
      : undefined;
    const publishTokenTag = payload.publishToken
      ? decodeBase64(payload.publishToken.tag, "publishToken.tag")
      : undefined;
    const lastPublishAt = parseLastPublishAt(payload.lastPublishAt);

    const channel = await fastify.prisma.$transaction(async (tx) => {
      const existing = await tx.channel.findUnique({ where: { id } });
      if (!existing) {
        throw fastify.httpErrors.notFound("Channel not found.");
      }

      if (categoryIds !== undefined) {
        await ensureCategories(categoryIds, tx);

        await tx.channelCategory.deleteMany({
          where: {
            channelId: id,
            categoryId: { notIn: categoryIds }
          }
        });

        const existingRelations = await tx.channelCategory.findMany({
          where: { channelId: id },
          select: { categoryId: true }
        });

        const relationSet = new Set(existingRelations.map((relation) => relation.categoryId));
        const toCreate = categoryIds.filter((categoryId) => !relationSet.has(categoryId));

        if (toCreate.length > 0) {
          await tx.channelCategory.createMany({
            data: toCreate.map((categoryId) => ({ channelId: id, categoryId }))
          });
        }
      }

      const data: Prisma.ChannelUpdateInput = {};

      if (payload.channelCode !== undefined) {
        data.channelCode = payload.channelCode;
      }

      if (payload.name !== undefined) {
        data.name = payload.name;
      }

      if (payload.description !== undefined) {
        data.description = payload.description ?? null;
      }

      if (payload.isActive !== undefined) {
        data.isActive = payload.isActive;
      }

      if (payload.createdByUserId !== undefined) {
        data.createdByUserId = payload.createdByUserId ?? null;
      }

      if (payload.updatedByUserId !== undefined) {
        data.updatedByUserId = payload.updatedByUserId ?? null;
      }

      if (lastPublishAt !== undefined) {
        data.lastPublishAt = lastPublishAt;
      }

      if (payload.publishToken) {
        if (!publishTokenCipher || !publishTokenIv || !publishTokenTag) {
          throw fastify.httpErrors.badRequest("publishToken must include cipher, iv, and tag.");
        }

        data.publishTokenCipher = publishTokenCipher;
        data.publishTokenIv = publishTokenIv;
        data.publishTokenTag = publishTokenTag;
      }

      if (Object.keys(data).length > 0) {
        await tx.channel.update({
          where: { id },
          data
        });
      }

      return tx.channel.findUniqueOrThrow({
        where: { id },
        include: channelInclude
      });
    });

    return mapChannelToResponse(channel);
  });

  fastify.delete<{ Params: ChannelParams }>("/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      },
      response: {
        204: { type: "null" }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      await fastify.prisma.channel.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw fastify.httpErrors.notFound("Channel not found.");
      }

      throw error;
    }

    reply.code(204).send();
  });
};

export default channelRoutes;