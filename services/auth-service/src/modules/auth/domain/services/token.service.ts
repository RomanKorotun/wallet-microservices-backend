import { TokenType } from '../enums/token-type.enum';
import { IJwtPayload } from '../types/jwt-payload.interface';

export interface ITokenService {
  generate(userId: string, tokenType: TokenType): string;
  decode(token: string, tokenType: TokenType): IJwtPayload;
}
