export class AuthError extends Error {
  constructor() {
    super("Token is invalid");
  }
}
