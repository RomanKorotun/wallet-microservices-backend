import { DomainSession } from '../entities/session';

export interface ISessionRepository {
  set(key: string, value: DomainSession, ttlSeconds: number): Promise<void>;
  getSession(sessionKey: string): Promise<DomainSession | null>;
  deleteSession(sessionKey: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  getUserSessions(userId: string): Promise<DomainSession[]>;
  deleteAll(): Promise<void>;
}
