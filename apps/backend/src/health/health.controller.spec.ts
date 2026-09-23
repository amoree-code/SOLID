import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { HealthController } from './health.controller.js';

function controllerWith(queryRaw: () => Promise<unknown>) {
  return new HealthController({ $queryRaw: vi.fn(queryRaw) } as unknown as PrismaService);
}

describe('HealthController', () => {
  it('reports liveness without touching the database', () => {
    const controller = controllerWith(() => Promise.reject(new Error('down')));
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('reports ready when the database answers', async () => {
    const controller = controllerWith(() => Promise.resolve([{ '?column?': 1 }]));
    await expect(controller.ready()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('reports 503 when the database does not answer', async () => {
    const controller = controllerWith(() => Promise.reject(new Error('ECONNREFUSED')));
    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
