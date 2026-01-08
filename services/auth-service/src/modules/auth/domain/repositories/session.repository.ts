import { DomainSession } from '../entities/session';

export interface ISessionRepository {
  set(key: string, value: DomainSession, ttlSeconds: number): Promise<void>;
  getByRefreshToken(refreshToken: string): Promise<DomainSession | null>;
  deleteByRefreshToken(refrehToken: string): Promise<void>;
  deleteSession(key: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  deleteAll(): Promise<void>;
}
