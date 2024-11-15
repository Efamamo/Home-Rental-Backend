import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import {
  addHouse,
  deleteHouse,
  getHouse,
  getHouses,
  rate,
  updateHouse,
  updateHouseImages,
} from '../controllers/house.js';
import { check } from 'express-validator';
import uploadImages from '../middleware/file_upload.js';

const houseRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Houses
 *   description: Operations related to house listings
 */

/**
 * @swagger
 * /houses:
 *   get:
 *     summary: Get all houses
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all houses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: House ID.
 *                   title:
 *                     type: string
 *                     description: Title of the house.
 *                   location:
 *                     type: string
 *                     description: Location of the house.
 *                   price:
 *                     type: number
 *                     description: Price of the house.
 *                   for_rent:
 *                     type: boolean
 *                     description: Indicates if the house is for rent.
 *                   category:
 *                     type: string
 *                     description: Category of the house.
 *       401:
 *         description: Unauthorized access.
 */

houseRouter.get('/', authorize(['Admin', 'Seller', 'Buyer']), getHouses);

/**
 * @swagger
 * /houses/{id}:
 *   get:
 *     summary: Get details of a specific house
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the house.
 *     responses:
 *       200:
 *         description: Details of the requested house.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 location:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 for_rent:
 *                   type: boolean
 *                 category:
 *                   type: string
 *                 number_of_bedrooms:
 *                   type: number
 *                 number_of_bathrooms:
 *                   type: number
 *                 number_of_floors:
 *                   type: number
 *       404:
 *         description: House not found.
 *       401:
 *         description: Unauthorized access.
 */

houseRouter.get('/:id', authorize(['Admin', 'Seller', 'Buyer']), getHouse);

/**
 * @swagger
 * /houses:
 *   post:
 *     summary: Add a new house
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               for_rent:
 *                 type: boolean
 *               number_of_bedrooms:
 *                 type: number
 *               number_of_bathrooms:
 *                 type: number
 *               number_of_floors:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: House added successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized access.
 */

houseRouter.post(
  '/',
  uploadImages,
  authorize(['Admin', 'Seller']),
  [
    check('title').notEmpty().withMessage('title is required'),
    check('location').notEmpty().withMessage('location is required'),
    check('description').notEmpty().withMessage('description is required'),
    check('price').isNumeric().withMessage('price should be number'),
    check('for_rent')
      .isBoolean()
      .withMessage('for_sell should be true of false'),
    check('number_of_bedrooms')
      .isNumeric()
      .withMessage('number_of_bedrooms should be number')
      .isLength({ min: 0 })
      .withMessage('number_of_bedroom cant be negative'),
    check('number_of_bathrooms')
      .isNumeric()
      .withMessage('number_of_bathrooms should be number')
      .isLength({ min: 0 })
      .withMessage('number_of_bathrooms cant be negative'),
    check('number_of_floors')
      .isNumeric()
      .withMessage('number_of_floors should be number')
      .isLength({ min: 0 })
      .withMessage('number_of_floors cant be negative'),
    check('category').notEmpty().withMessage('category is required'),
  ],

  addHouse
);

/**
 * @swagger
 * /houses/{id}:
 *   patch:
 *     summary: Update house details
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the house to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               for_rent:
 *                 type: boolean
 *               number_of_bedrooms:
 *                 type: number
 *               number_of_bathrooms:
 *                 type: number
 *               number_of_floors:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: House updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized access.
 *       404:
 *         description: House not found.
 */
houseRouter.patch('/:id', authorize(['Admin', 'Seller'], true), updateHouse);

/**
 * @swagger
 * /houses/{id}/image:
 *   patch:
 *     summary: Update house images
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the house to update images for.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: House images updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized access.
 *       404:
 *         description: House not found.
 */

houseRouter.patch(
  '/:id/image',
  uploadImages,
  authorize(['Admin', 'Seller'], true),
  updateHouseImages
);

/**
 * @swagger
 * /houses/{id}:
 *   delete:
 *     summary: Delete a house
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the house to delete.
 *     responses:
 *       200:
 *         description: House deleted successfully.
 *       404:
 *         description: House not found.
 *       401:
 *         description: Unauthorized access.
 */

houseRouter.delete('/:id', authorize(['Admin', 'Seller'], true), deleteHouse);

/**
 * @swagger
 * /houses/{id}/rate:
 *   patch:
 *     summary: Rate a house
 *     tags: [Houses]
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
 *         description: House rated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: House not found.
 *       401:
 *         description: Unauthorized access.
 */

houseRouter.patch(
  '/:id/rate',
  authorize(['Admin', 'Seller', 'Buyer']),
  check('amount').isNumeric().withMessage('amount should be number'),
  rate
);

export default houseRouter;
