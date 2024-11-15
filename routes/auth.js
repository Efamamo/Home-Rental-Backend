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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: JWT Access Token.
 *                 refresh_token:
 *                   type: string
 *                   description: JWT Refresh Token.
 *       400:
 *         description: Validation error.
 */

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

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name.
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *               role:
 *                 type: string
 *                 description: The user's role (Buyer or Seller).
 *     responses:
 *       201:
 *         description: User signed up successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: JWT Access Token.
 *                 refresh_token:
 *                   type: string
 *                   description: JWT Refresh Token.
 *       400:
 *         description: Validation error.
 *       409:
 *         description: Phone number already exists.
 */

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

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The refresh token.
 *     responses:
 *       200:
 *         description: New access and refresh tokens issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: JWT Access Token.
 *                 refresh_token:
 *                   type: string
 *                   description: JWT Refresh Token.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid or expired refresh token.
 */

authRouter.post(
  '/refresh-token',
  check('token').notEmpty().withMessage('token is required'),
  refresh_token
);

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Verify a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token to verify.
 *     responses:
 *       200:
 *         description: Token verified successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid token.
 */

authRouter.post(
  '/verify-token',
  check('token').notEmpty().withMessage('token is required'),
  verify_token
);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Unauthorized access.
 */

authRouter.get('/users', authorize(['Admin']), users);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 description: The old password.
 *               new_password:
 *                 type: string
 *                 description: The new password.
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized access.
 */

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

/**
 * @swagger
 * /auth/promote/{id}:
 *   patch:
 *     summary: Promote a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to promote.
 *     responses:
 *       200:
 *         description: User promoted successfully.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access.
 */

authRouter.patch('/promote/:id', authorize(['Admin']), promote);

/**
 * @swagger
 * /auth/demote/{id}:
 *   patch:
 *     summary: Demote a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to demote.
 *     responses:
 *       200:
 *         description: User demoted successfully.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access.
 */

authRouter.patch('/demote/:id', authorize(['Admin']), demote);

export default authRouter;
