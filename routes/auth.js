import { Router } from 'express';
import { check } from 'express-validator';
import { authorize } from '../middleware/authorize.js';
import uploadImages from '../middleware/file_upload.js';

class AuthRoutes {
  constructor(authController) {
    (this.router = Router()),
      (this.authController = authController),
      this.initializeRoutes();
  }

  initializeRoutes() {
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
     *       201:
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

    this.router.post(
      '/login',
      [
        check('phoneNumber')
          .isMobilePhone()
          .withMessage('phoneNumber should be mobile phone'),
        check('password').notEmpty().withMessage('password is required'),
      ],
      this.authController.login
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

    this.router.post(
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
          .isLength({ min: 6, max: 6 })
          .withMessage('password length should be 6')
          .isNumeric()
          .withMessage('password should be a number'),
        check('phoneNumber')
          .isMobilePhone()
          .withMessage('phoneNumber should be mobile phone'),
      ],
      this.authController.signup
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
     *       201:
     *         description: New access token issued.
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

    this.router.post(
      '/refresh-token',
      check('token').notEmpty().withMessage('token is required'),
      this.authController.refresh_token
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
     *       201:
     *         description: Token verified successfully.
     *       400:
     *         description: Validation error.
     *       401:
     *         description: Invalid token.
     */

    this.router.post(
      '/verify-token',
      check('token').notEmpty().withMessage('token is required'),
      this.authController.verify_token
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
     *       201:
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

    this.router.get('/users', authorize(['Admin']), this.authController.users);

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
     *       401:
     *         description: Unauthorized access.
     */

    this.router.patch(
      '/change-password',
      authorize(['Seller', 'Admin', 'Buyer']),

      [
        check('old_password')
          .notEmpty()
          .withMessage('old_password is required'),
        check('old_password')
          .notEmpty()
          .withMessage('old_password is required'),
        check('new_password')
          .isLength({ min: 6 })
          .withMessage('minimum password length is 6'),
      ],
      this.authController.change_password
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

    this.router.patch(
      '/change-status/',
      authorize(['Seller', 'Admin', 'Buyer']),
      this.authController.changeStatus
    );

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

    this.router.get(
      '/profile',
      authorize(['Admin', 'Buyer', 'Seller']),
      this.authController.getProfile
    );
    this.router.patch(
      '/profile',
      authorize(['Admin', 'Buyer', 'Seller']),
      uploadImages,
      check('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters.')
        .matches(/^[a-zA-Zà-žÀ-Ž\s'-]+$/)
        .withMessage('Name contains invalid characters.')
    );

    this.router.get(
      '/profile',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.authController.refresh_token
    );

    /**
     * @swagger
     * /auth/users/{id}/rate:
     *   patch:
     *     summary: Rate a user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the house to rate.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               amount:
     *                 type: number
     *                 description: Rating amount (1 to 5).
     *     responses:
     *       200:
     *         description: User rated successfully.
     *       400:
     *         description: Validation error.
     *       404:
     *         description: User not found.
     *       401:
     *         description: Unauthorized access.
     */

    // Rate a house
    this.router.patch(
      '/users/:id/rate',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('amount').isNumeric().withMessage('amount should be a number'),
      this.authController.rate
    );

    this.router.get(
      '/users/:id/rate',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.authController.fetchUserRate
    );
  }
}

export default AuthRoutes;
