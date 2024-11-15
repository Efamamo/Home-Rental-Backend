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

houseRouter.get('/', authorize(['Admin', 'Seller', 'Buyer']), getHouses);
houseRouter.get('/:id', authorize(['Admin', 'Seller', 'Buyer']), getHouse);
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
houseRouter.patch('/:id', authorize(['Admin', 'Seller'], true), updateHouse);
houseRouter.patch(
  '/:id/image',
  uploadImages,
  authorize(['Admin', 'Seller'], true),
  updateHouseImages
);

houseRouter.delete('/:id', authorize(['Admin', 'Seller'], true), deleteHouse);
houseRouter.patch(
  '/:id/rate',
  authorize(['Admin', 'Seller', 'Buyer']),
  check('amount').isNumeric().withMessage('amount should be number'),
  rate
);

export default houseRouter;
