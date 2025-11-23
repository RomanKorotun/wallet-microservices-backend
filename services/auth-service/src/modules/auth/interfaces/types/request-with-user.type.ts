import { DomainUser } from '../../domain/entities/user';

export interface RequestWithUser extends Request {
  user: DomainUser;
}
