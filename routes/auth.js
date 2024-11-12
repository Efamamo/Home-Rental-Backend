import { Router } from 'express';
import {
  change_password,
  forgot_password,
  login,
  refresh_token,
  signup,
  verify_token,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.post('/refresh-token', refresh_token);
authRouter.post('/verify-token', verify_token);
authRouter.patch('/forgot-password', forgot_password);
authRouter.patch('/change-password', change_password);

export default authRouter;
