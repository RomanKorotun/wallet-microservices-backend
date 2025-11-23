import { DomainUser } from '../entities/user';
import { ICreateUserProps } from '../types/create-user.props';

export interface IUserRepository {
  createUser(props: ICreateUserProps): Promise<DomainUser>;
  findByEmail(email: string): Promise<DomainUser | null>;
  findById(id: string): Promise<DomainUser | null>;
}
