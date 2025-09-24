import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { buildServer } from './app';

describe('health route', () => {
  const app = buildServer();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('returns ok status', async () => {
    const response = await request(app.server).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
