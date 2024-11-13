import bcrypt from 'bcrypt';

export async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
}

export async function matchPassword(password, hashed_password) {
  try {
    const match = await bcrypt.compare(password, hashed_password);
    return match;
  } catch (error) {
    console.log(e);
  }
}
