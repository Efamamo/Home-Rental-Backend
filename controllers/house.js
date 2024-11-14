import { validationResult } from 'express-validator';
import { House } from '../models/house.js';
import { formatErrors } from '../lib/util.js';
import fs from 'fs';
import mongoose from 'mongoose';
import User from '../models/user.js';

export async function getHouses(req, res) {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (error) {
    console.log(error);
  }
}

export async function getHouse(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }

    const house = await House.findById(id);
    if (!house) return res.status(404).json({ error: 'House Not Found' });

    res.json(house);
  } catch (error) {
    console.log(error);
  }
}

export async function addHouse(req, res) {
  const er = validationResult(req);

  if (!er.isEmpty()) {
    if (req.files.main_image) {
      fs.unlink(req.files.image.path, (err) => {
        console.log(err);
      });
    }

    if (req.files.sub_images) {
      fs.unlink(req.files.sub_images.path, (err) => {
        console.log(err);
      });
    }
    return res.status(400).json({ errors: formatErrors(er) });
  }

  const image_url = req.files.main_image;
  if (!image_url) {
    return res.status(400).send({
      errors: {
        image: 'main_image is required',
      },
    });
  }

  const { title, location, description, price, for_sell } = req.body;
  const { id } = req.user;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newHouse = new House({
    title,
    location,
    description,
    price,
    for_sell,
    ownerId: id,
    main_image: image_url[0].path,
    sub_images: image_url.sub_images ? image_url.sub_images[0].path : [],
  });

  await newHouse.save();

  res.status(201).json(newHouse);
}
