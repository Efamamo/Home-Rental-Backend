import { Coin } from '../models/coin.js';

export class CoinsController {
  async buyCoins(req, res) {
    const { id } = req.user;
    const { coins } = req.body;

    const newCoin = new Coin({
      coins,
      user: id,
    });

    const tx = `chewatatest-${newCoin._id}`;

    const url = `https://home-rental-backend-1-8uxh.onrender.com/api/v1/coins/verify?id=${tx}`;

    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${process.env.CHAPA_SECRET_KEY}`);
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      amount: coins * 5,
      currency: 'ETB',
      phone_number: '0960625471',
      tx_ref: tx,
      callback_url: 'https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60',
      return_url: url,
      'customization[title]': 'Payment for my favourite merchant',
      'customization[description]': 'I love online payments',
      'meta[hide_receipt]': 'true',
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    const chapa = await fetch(
      'https://api.chapa.co/v1/transaction/initialize',
      requestOptions
    );

    const result = await chapa.json();

    if (result.status === 'success') {
      await newCoin.save();

      return res.json(result.data.checkout_url);
    } else {
      return res.json(500).json('server error');
    }
  }

  async verifyPayment(req, res) {
    const chapa_id = req.query.id;

    if (!chapa_id) {
      return res.status(400).json({ error: 'No ID provided.' });
    }

    try {
      const arr = chapa_id.split('-');
      if (arr.length != 2) {
        return res.status(400).json({ error: 'ID provided is invalid.' });
      }

      const id = arr[1];
      const coin = await Coin.findById(id);
      if (!coin) {
        return res.status(404).json({ error: 'Coin not found' });
      }

      const user = await User.findById(coin.user);

      if (!user) {
        return res
          .status(404)
          .json({ error: 'The Requested user is not found' });
      }

      user.coins += coin.coins;
      await user.save();

      res.sendStatus(200);
    } catch (err) {
      console.error(`Error retrieving session: ${err.message}`);
      res.status(500).send({ error: err });
    }
  }
}
