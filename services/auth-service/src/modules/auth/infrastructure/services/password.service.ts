import { Injectable } from '@nestjs/common';
import bcryptjs from 'bcryptjs';
import type { IPasswordService } from '../../domain/services/password.service';

@Injectable()
export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return await bcryptjs.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcryptjs.compare(password, hashedPassword);
  }
}
