import { validationResult } from 'express-validator';
import { House } from '../models/house.js';
import { formatErrors } from '../lib/util.js';
import fs from 'fs';
import mongoose from 'mongoose';
import User from '../models/user.js';

export class HouseController {
  async getHouses(req, res) {
    try {
      const houses = await House.find();
      res.json(houses);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getHouse(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID' });
      }

      const house = await House.findById(id).populate('ownerId');
      if (!house) return res.status(404).json({ error: 'House Not Found' });

      res.json(house);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async addHouse(req, res) {
    try {
      const er = validationResult(req);

      if (!er.isEmpty()) {
        console.log(formatErrors(er));
        if (req.files.main_image) {
          fs.unlink(req.files.main_image[0].path, (err) => {
            console.log(err);
          });
        }

        if (req.files.sub_images) {
          fs.unlink(req.files.sub_images[0].path, (err) => {
            console.log(err);
          });
        }
        return res.status(400).json({ errors: formatErrors(er) });
      }

      const image_url = req.files.main_image;
      if (!image_url) {
        return res.status(400).send({
          errors: {
            image: 'main_image is required and should be image file',
          },
        });
      }

      console.log(image_url);

      const {
        title,
        location,
        description,
        price,
        for_rent,
        number_of_bedrooms,
        number_of_bathrooms,
        number_of_floors,
        category,
      } = req.body;
      const { id } = req.user;

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newHouse = new House({
        title,
        location,
        description,
        price,
        for_rent,
        ownerId: id,
        main_image: image_url[0].path,
        sub_images: image_url.sub_images ? image_url.sub_images[0].path : [],
        number_of_bedrooms,
        number_of_bathrooms,
        number_of_floors,
        category,
      });

      await newHouse.save();

      res.status(201).json(newHouse);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  async deleteHouse(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID' });
      }

      const product = await House.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ error: 'Product Not Found' });
      }

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  }

  async updateHouse(req, res) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID' });
      }

      const updateData = {};
      const allowedFields = [
        'title',
        'location',
        'description',
        'price',
        'for_rent',
        'ownerId',
        'number_of_bedrooms',
        'number_of_bathrooms',
        'number_of_floors',
        'category',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedHouse = await House.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedHouse) {
        return res.status(404).json({ error: 'House Not Found' });
      }

      res.json(updatedHouse);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  }

  async updateHouseImages(req, res) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID' });
      }

      const imageURL = req.files.main_image;
      if (!imageURL) {
        return res.status(400).send({
          errors: {
            image: 'main_image is required',
          },
        });
      }

      const house = await House.findById(id);

      if (!house) {
        return res.status(404).json({ error: 'House Not Found' });
      }

      house.main_image = imageURL[0].path;

      const subImageUrl = req.files.sub_images;
      if (subImageUrl) {
        house.sub_images = subImageUrl[0].path;
      }

      await house.save();
      res.json(house);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async rate(req, res) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid House ID' });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount } = req.body;

      if (typeof amount !== 'number' || amount < 1 || amount > 5) {
        return res
          .status(400)
          .json({ error: 'Amount must be a number between 1 and 5.' });
      }

      const userId = req.user.id;

      const house = await House.findById(id);
      if (!house) {
        return res.status(404).json({ error: 'House Not Found' });
      }

      const userHasRated = house.raters.has(userId);

      if (userHasRated) {
        const previousRating = house.raters.get(userId);
        house.total_amount = house.total_amount + amount - previousRating;
      } else {
        house.total_amount += amount;
        house.total_people += 1;
      }

      house.average_rating = house.total_amount / house.total_people;
      house.raters.set(userId, amount);

      await house.save();

      res.json(house);
    } catch (error) {
      console.error('Error rating house:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async housePayment(req, res) {
    const er = validationResult(req);

    if (!er.isEmpty()) {
      console.log(formatErrors(er));
      if (req.files.main_image) {
        fs.unlink(req.files.main_image[0].path, (err) => {
          console.log(err);
        });
      }

      if (req.files.sub_images) {
        fs.unlink(req.files.sub_images[0].path, (err) => {
          console.log(err);
        });
      }
      return res.status(400).json({ errors: formatErrors(er) });
    }

    const image_url = req.files.main_image;
    if (!image_url) {
      return res.status(400).send({
        errors: {
          image: 'main_image is required and should be image file',
        },
      });
    }

    console.log(image_url);

    const {
      title,
      location,
      description,
      price,
      for_rent,
      number_of_bedrooms,
      number_of_bathrooms,
      number_of_floors,
      category,
    } = req.body;
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newHouse = new House({
      title,
      location,
      description,
      price,
      for_rent,
      ownerId: id,
      main_image: image_url[0].path,
      sub_images: image_url.sub_images ? image_url.sub_images[0].path : [],
      number_of_bedrooms,
      number_of_bathrooms,
      number_of_floors,
      category,
    });

    const tx = `chewatatest-${newHouse._id}`;
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${process.env.CHAPA_SECRET_KEY}`);
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      amount: 1000,
      currency: 'ETB',
      phone_number: user.phoneNumber,
      tx_ref: tx,
      callback_url: 'https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60',
      return_url: `http://localhost:3000/api/v1/houses/verify?id=${tx}`,
      'customization[title]': 'Payment for my favourite merchant',
      'customization[description]': 'I love online payments',
      'meta[hide_receipt]': 'true',
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch(
      'https://api.chapa.co/v1/transaction/initialize',
      requestOptions
    );

    const result = await response.json();

    if (result.status === 'success') {
      await newHouse.save();

      res.json(result.data.checkout_url);
    } else {
      return res.json(500).json('server error');
    }
  }

  async verifyPayment(req, res) {
    const chapa_id = req.query.id;

    if (!chapa_id) {
      return res.status(400).send({ error: 'No ID provided.' });
    }

    try {
      const arr = chapa_id.split('-');
      if (arr.length != 2) {
        return res.status(400).send({ error: 'ID provided is invalid.' });
      }

      const id = arr[1];
      const house = await House.findById(id);

      house.isVerified = true;
      await house.save();

      res.send();
    } catch (err) {
      console.error(`Error retrieving session: ${err.message}`);
      res.status(500).send({ error: err });
    }
  }
}
