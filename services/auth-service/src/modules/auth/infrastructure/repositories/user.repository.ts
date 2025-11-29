import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositiries/user.repository';
import { DomainUser } from '../../domain/entities/user';
import { ICreateUserProps } from '../../domain/types/create-user.props';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(user: User): DomainUser {
    return new DomainUser(
      user.id,
      user.username,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt,
    );
  }

  async createUser(props: ICreateUserProps): Promise<DomainUser> {
    const createdUser = await this.prismaService.user.create({ data: props });
    return this.mapToDomain(createdUser);
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return this.mapToDomain(user);
  }

  async findById(id: string): Promise<DomainUser | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    return this.mapToDomain(user);
  }

  async deleteAll(): Promise<void> {
    await this.prismaService.user.deleteMany({});
  }
}
