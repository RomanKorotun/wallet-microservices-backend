import { Response } from 'supertest';

export function getCookies(response: Response): string[] {
  const cookies = response.headers['set-cookie'];
  if (!cookies) throw new Error('No cookies found in response');
  return Array.isArray(cookies) ? cookies : [cookies];
}
