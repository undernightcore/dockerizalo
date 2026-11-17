export class AuthError extends Error {
  status: number;

  constructor(message = "Token is invalid") {
    super(message);
    this.status = 401;
  }
}

export class AccessError extends AuthError {
  constructor(message: string) {
    super(message);
    this.status = 403;
  }
}
