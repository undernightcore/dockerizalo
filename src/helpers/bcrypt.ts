import { compare, hash } from "bcrypt";

export function hashPassword(password: string) {
  return hash(password, 10);
}

export function isValidPassword(password: string, hash: string) {
  return compare(password, hash);
}
