import { TokenType } from '../../../../src/modules/auth/domain/enums/token-type.enum';

export function getToken(cookies: string[], tokenType: TokenType): string {
  const cookie = cookies.find((c) => c.startsWith(tokenType));
  if (!cookie) throw new Error(`Cookie ${tokenType} not found`);
  return cookie.split(';')[0].split('=')[1];
}
