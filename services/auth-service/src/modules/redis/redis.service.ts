import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    const url = config.getOrThrow('REDIS_URL_AUTH');
    const useTLS = config.getOrThrow('REDIS_USE_TLS_AUTH') === 'true';
    super(url, {
      tls: useTLS ? { rejectUnauthorized: false } : undefined,
    });

    this.on('connect', () => console.log('Redis connected'));
    this.on('error', (err) => console.error('Redis error', err.message));
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
