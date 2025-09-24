import crypto from "node:crypto";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { buildServer } from "./app";
import { hashPassword } from "@/services/password";

const prisma = new PrismaClient();
const app = buildServer({ prismaClient: prisma });

const basePath = "/api/channel";
const TEST_EMAIL = "test-user@example.com";
const TEST_PASSWORD = "TestPass123!";

const generateBase64 = (value: string): string => Buffer.from(value, "utf8").toString("base64");

describe("channel routes", () => {
  let accessToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await app.ready();

    await prisma.loginAttempt.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

    const passwordHash = await hashPassword(TEST_PASSWORD);
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: TEST_EMAIL,
        passwordHash,
        passwordAlgo: "argon2id",
        role: "ADMIN",
        isActive: true
      }
    });
  });

  beforeEach(async () => {
    await prisma.channelCategory.deleteMany();
    await prisma.channel.deleteMany();
    await prisma.category.deleteMany();

    const response = await request(app.server)
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(200);

    accessToken = response.body.accessToken;
  });

  afterEach(async () => {
    await prisma.channelCategory.deleteMany();
    await prisma.channel.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  test("performs full CRUD lifecycle", async () => {
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const educationCategory = await prisma.category.create({
      data: {
        name: `Education-${crypto.randomUUID()}`
      }
    });

    const comedyCategory = await prisma.category.create({
      data: {
        name: `Comedy-${crypto.randomUUID()}`,
        youtubeCategoryId: 23
      }
    });

    const createPayload = {
      channelCode: `channel-${crypto.randomUUID()}`,
      name: "Primary Channel",
      description: "Initial description",
      publishToken: {
        cipher: generateBase64("cipher-1"),
        iv: generateBase64("iv-1"),
        tag: generateBase64("tag-1")
      },
      lastPublishAt: new Date().toISOString(),
      isActive: true,
      createdByUserId: crypto.randomUUID(),
      updatedByUserId: crypto.randomUUID(),
      categoryIds: [educationCategory.id]
    };

    const createResponse = await request(app.server)
      .post(basePath)
      .set(authHeader)
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toMatchObject({
      channelCode: createPayload.channelCode,
      name: createPayload.name,
      description: createPayload.description,
      isActive: true
    });
    expect(createResponse.body.publishToken).toEqual(createPayload.publishToken);
    expect(createResponse.body.categories).toHaveLength(1);

    const channelId = createResponse.body.id as string;

    const listResponse = await request(app.server).get(basePath).set(authHeader).expect(200);
    expect(listResponse.body).toHaveLength(1);

    const byIdResponse = await request(app.server).get(`${basePath}/${channelId}`).set(authHeader).expect(200);
    expect(byIdResponse.body.id).toBe(channelId);

    const byCodeResponse = await request(app.server)
      .get(`${basePath}/code/${createPayload.channelCode}`)
      .set(authHeader)
      .expect(200);
    expect(byCodeResponse.body.id).toBe(channelId);

    const updatePayload = {
      name: "Updated Name",
      description: null,
      publishToken: {
        cipher: generateBase64("cipher-2"),
        iv: generateBase64("iv-2"),
        tag: generateBase64("tag-2")
      },
      categoryIds: [comedyCategory.id],
      isActive: false,
      lastPublishAt: null
    };

    const updateResponse = await request(app.server)
      .put(`${basePath}/${channelId}`)
      .set(authHeader)
      .send(updatePayload)
      .expect(200);

    expect(updateResponse.body.name).toBe(updatePayload.name);
    expect(updateResponse.body.description).toBeNull();
    expect(updateResponse.body.publishToken).toEqual(updatePayload.publishToken);
    expect(updateResponse.body.isActive).toBe(false);
    expect(updateResponse.body.categories).toHaveLength(1);
    expect(updateResponse.body.categories[0].id).toBe(comedyCategory.id);

    await request(app.server)
      .delete(`${basePath}/${channelId}`)
      .set(authHeader)
      .expect(204);

    const finalListResponse = await request(app.server).get(basePath).set(authHeader).expect(200);
    expect(finalListResponse.body).toHaveLength(0);
  });
});