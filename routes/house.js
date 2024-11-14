import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import {
  addHouse,
  deleteHouse,
  getHouse,
  getHouses,
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
    check('for_sell')
      .isBoolean()
      .withMessage('for_sell should be true of false'),
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

export default houseRouter;
