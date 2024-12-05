import { Router } from 'express';
import { authorize } from '../middleware/authorize.js';
import { check } from 'express-validator';

class CoinRoutes {
  constructor(coinController) {
    this.router = Router();
    this.coinController = coinController;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/',
      authorize(['Admin', 'Seller', 'Buyer']),
      check('coins').isNumeric().withMessage('coins should be number'),
      this.coinController.buyCoins
    );

    this.router.get('/verify', this.coinController.verifyPayment);
  }
}

export default CoinRoutes;
