import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generate_access_token(id, isAdmin, username, email) {
  try {
    const access_token = jwt.sign(
      { id, isAdmin, username, email },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '15m' }
    );
    return access_token;
  } catch (e) {
    throw new Error(e);
  }
}

export function generate_refresh_token(id, isAdmin, username, email) {
  try {
    const refresh_token = jwt.sign(
      { id, isAdmin, username, email },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: '3d' }
    );
    return refresh_token;
  } catch (e) {
    throw new Error(e);
  }
}
