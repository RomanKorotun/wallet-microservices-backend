import { Server } from 'http';
import request from 'supertest';
import { ROUTES } from './routes';

export const signupRequest = <T extends object>(server: Server, body: T) => {
  return request(server).post(ROUTES.SIGNUP).send(body);
};

export const signinRequest = <T extends object>(server: Server, body: T) => {
  return request(server).post(ROUTES.SIGNIN).send(body);
};

export const refreshRequest = (server: Server, cookiesHeader?: string) => {
  const req = request(server).post(ROUTES.REFRESH);
  if (cookiesHeader) {
    req.set('Cookie', cookiesHeader);
  }
  return req;
};

export const signoutRequest = (server: Server, cookiesHeader?: string) => {
  const req = request(server).post(ROUTES.SIGNOUT);
  if (cookiesHeader) {
    req.set('Cookie', cookiesHeader);
  }
  return req;
};
