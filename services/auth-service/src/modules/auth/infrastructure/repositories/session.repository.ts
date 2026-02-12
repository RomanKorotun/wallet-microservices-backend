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

  async getSession(sessionKey: string): Promise<DomainSession | null> {
    const data = await this.redis.get(sessionKey);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionKey: string): Promise<void> {
    await this.redis.del(sessionKey);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    let cursor = '0';
    const pattern = `session:${userId}:*`;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  async getUserSessions(userId: string): Promise<DomainSession[]> {
    let cursor = '0';
    const pattern = `session:${userId}:*`;
    const sessions: DomainSession[] = [];

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length === 0) continue;

      const values = await this.redis.mget(...keys);

      for (const value of values) {
        if (value) {
          sessions.push(JSON.parse(value));
        }
      }
    } while (cursor !== '0');

    return sessions;
  }

  async deleteAll(): Promise<void> {
    await this.redis.flushall();
  }
}
