import { Server } from 'http';
import request from 'supertest';

export const postRequest = async <T extends object>(
  server: Server,
  url: string,
  body: T,
): Promise<request.Response> => {
  return await request(server).post(url).send(body);
};
