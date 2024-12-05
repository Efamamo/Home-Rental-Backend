import { Coin } from '../models/coin.js';
import User from '../models/user.js';

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

      res.send(`<!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                <title>Payment Success</title>
                <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f6f9;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                }
                .container {
                    background-color: #fff;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 500px;
                }
                h1 {
                    font-size: 36px;
                    color: #4caf50;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 18px;
                    color: #555;
                    margin-bottom: 30px;
                }
                .icon {
                    font-size: 50px;
                    color: #4caf50;
                    margin-bottom: 20px;
                }
                .cta-button {
                    display: inline-block;
                    padding: 15px 30px;
                    font-size: 18px;
                    font-weight: bold;
                    background-color: #4caf50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s;
                }
                .cta-button:hover {
                    background-color: #45a049;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="icon">&#x1F389;</div>
                <h1>Payment Successful!</h1>
                <p>
                    Thank you for your purchase! Your transaction was completed
                    successfully.
                </p>
                
                </div>
            </body>
            </html>
`);
    } catch (err) {
      console.error(`Error retrieving session: ${err.message}`);
      res.status(500).send({ error: err });
    }
  }
}
