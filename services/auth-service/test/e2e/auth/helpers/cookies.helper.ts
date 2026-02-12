import { Response } from 'supertest';

export const getCookies = (response: Response): string[] => {
  const cookies = response.headers['set-cookie'];
  if (!cookies) throw new Error('No cookies found in response');
  return Array.isArray(cookies) ? cookies : [cookies];
};

export const getCookiesHeader = (cookies: string[]): string => {
  return cookies.map((c) => c.split(';')[0]).join('; ');
};
