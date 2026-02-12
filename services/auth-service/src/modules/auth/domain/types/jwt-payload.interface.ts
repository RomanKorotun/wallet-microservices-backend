export interface IJwtPayload {
  id: string;
  jti: string;
  iat?: number;
  exp?: number;
}
