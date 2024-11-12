import bcrypt from 'bcrypt';

export async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw new Error(e);
  }
}

export async function matchPassword(password, hashed_password) {
  try {
    const match = await bcrypt.compare(password, hashed_password);
    return match;
  } catch (error) {
    throw new Error(e);
  }
}
