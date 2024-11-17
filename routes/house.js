import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { check } from 'express-validator';
import uploadImages from '../middleware/file_upload.js';
import { HouseController } from '../controllers/house.js';

class HouseRoutes {
  constructor() {
    this.router = Router();
    this.houseController = new HouseController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    /**
     * @swagger
     * Add Swagger documentation here...
     */

    // Get all houses
    this.router.get(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.houseController.getHouses
    );

    // Get house by ID
    this.router.get(
      '/:id',
      authorize(['Admin', 'Seller', 'Buyer']),
      this.houseController.getHouse
    );

    // Add a new house
    this.router.post(
      '/',
      uploadImages,
      authorize(['Admin', 'Seller']),
      [
        check('title').notEmpty().withMessage('title is required'),
        check('location').notEmpty().withMessage('location is required'),
        check('description').notEmpty().withMessage('description is required'),
        check('price').isNumeric().withMessage('price should be a number'),
        check('for_rent')
          .isBoolean()
          .withMessage('for_rent should be true or false'),
        check('number_of_bedrooms')
          .isNumeric()
          .withMessage('number_of_bedrooms should be a number')
          .isLength({ min: 0 })
          .withMessage('number_of_bedrooms cannot be negative'),
        check('number_of_bathrooms')
          .isNumeric()
          .withMessage('number_of_bathrooms should be a number')
          .isLength({ min: 0 })
          .withMessage('number_of_bathrooms cannot be negative'),
        check('number_of_floors')
          .isNumeric()
          .withMessage('number_of_floors should be a number')
          .isLength({ min: 0 })
          .withMessage('number_of_floors cannot be negative'),
        check('category').notEmpty().withMessage('category is required'),
      ],
      this.houseController.addHouse
    );

    // Update house details
    this.router.patch(
      '/:id',
      authorize(['Admin', 'Seller']),
      this.houseController.updateHouse
    );

    // Update house images
    this.router.patch(
      '/:id/image',
      uploadImages,
      authorize(['Admin', 'Seller']),
      this.houseController.updateHouseImages
    );

    // Delete a house
    this.router.delete(
      '/:id',
      authorize(['Admin', 'Seller']),
      this.houseController.deleteHouse
    );

    // Rate a house
    this.router.patch(
      '/:id/rate',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('amount').isNumeric().withMessage('amount should be a number'),
      this.houseController.rate
    );
  }

  getRouter() {
    return this.router;
  }
}

export default new HouseRoutes().getRouter();
