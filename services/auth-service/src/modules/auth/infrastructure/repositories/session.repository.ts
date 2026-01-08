import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../domain/repositories/session.repository';
import { DomainSession } from '../../domain/entities/session';
import { RedisService } from '../../../../modules/redis/redis.service';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly redis: RedisService) {}

  async set(
    key: string,
    value: DomainSession,
    ttlSeconds: number,
  ): Promise<void> {
    const data = JSON.stringify(value);
    await this.redis.set(key, data, 'EX', ttlSeconds);
  }

  async getByRefreshToken(refreshToken: string): Promise<DomainSession | null> {
    const data = await this.redis.get(`session:${refreshToken}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.redis.del(`session:${refreshToken}`);
  }

  async deleteSession(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const keys = await this.redis.keys(`session:${userId}:*`);
    await this.redis.del(...keys);
  }

  async deleteAll(): Promise<void> {
    await this.redis.flushall();
  }
}
