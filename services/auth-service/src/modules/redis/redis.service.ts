import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      host:
        config.get('NODE_ENV') === 'test'
          ? config.get('REDIS_HOST_AUTH_TEST')
          : config.get('REDIS_HOST_AUTH'),
      port:
        config.get('NODE_ENV') === 'test'
          ? Number(config.get('REDIS_PORT_AUTH_TEST'))
          : Number(config.get('REDIS_PORT_AUTH')),
      password:
        config.get('NODE_ENV') === 'test'
          ? config.get('REDIS_PASSWORD_AUTH_TEST')
          : config.get('REDIS_PASSWORD_AUTH'),
      db: 0,
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
