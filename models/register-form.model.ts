import { User } from './user.model';

export class RegisterForm {
  constructor(
    public email: string,
    public password: string,
    public confirmPassword: string,
    public pid: string
  ) {}

  toUser(): User {
    return new User(this.email, this.password);
  }
}