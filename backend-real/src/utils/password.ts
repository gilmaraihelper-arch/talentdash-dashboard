import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Comparar senha com hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}