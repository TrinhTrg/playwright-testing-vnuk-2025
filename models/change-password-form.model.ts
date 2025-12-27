export class ChangePasswordForm {
  constructor(
    public currentPassword: string,
    public newPassword: string,
    public confirmPassword: string
  ) {}
}

