import { Injectable } from '@nestjs/common';
import bcryptjs from 'bcryptjs';

@Injectable()
export class PasswordService {
  async hash(password: string) {
    return await bcryptjs.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string) {
    return await bcryptjs.compare(password, hashedPassword);
  }
}
