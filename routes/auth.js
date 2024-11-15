import { Router } from 'express';
import { check } from 'express-validator';
import {
  change_password,
  demote,
  login,
  promote,
  refresh_token,
  signup,
  users,
  verify_token,
} from '../controllers/auth.js';
import { authorize } from '../middleware/authorize.js';

const authRouter = Router();

authRouter.post(
  '/login',
  [
    check('phoneNumber')
      .isMobilePhone()
      .withMessage('phoneNumber should be mobile phone'),
    check('password').notEmpty().withMessage('password is required'),
  ],
  login
);

authRouter.post(
  '/signup',
  [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters.')
      .matches(/^[a-zA-Zà-žÀ-Ž\s'-]+$/)
      .withMessage('Name contains invalid characters.'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('minimum password length is 6'),
    check('phoneNumber')
      .isMobilePhone()
      .withMessage('phoneNumber should be mobile phone'),
    check('role')
      .isIn(['Seller', 'Buyer'])
      .withMessage('Role must be either Seller or Buyer'),
  ],
  signup
);

authRouter.post(
  '/refresh-token',
  check('token').notEmpty().withMessage('token is required'),
  refresh_token
);

authRouter.post(
  '/verify-token',
  check('token').notEmpty().withMessage('token is required'),
  verify_token
);

authRouter.get('/users', authorize(['Admin']), users);

authRouter.patch(
  '/change-password',
  authorize(['Seller', 'Admin', 'Buyer']),

  [
    check('old_password').notEmpty().withMessage('old_password is required'),
    check('old_password').notEmpty().withMessage('old_password is required'),
    check('new_password')
      .isLength({ min: 6 })
      .withMessage('minimum password length is 6'),
  ],
  change_password
);

authRouter.patch('/promote/:id', authorize(['Admin']), promote);
authRouter.patch('/demote/:id', authorize(['Admin']), demote);

export default authRouter;
