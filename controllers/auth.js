import { validationResult } from 'express-validator';
import { formatErrors } from '../lib/util.js';
import { hashPassword, matchPassword } from '../services/password_service.js';
import mongoose from 'mongoose';
import User from '../models/user.js';
import {
  generate_access_token,
  generate_refresh_token,
} from '../services/jwt_service.js';
import jwt from 'jsonwebtoken';

export class AuthController {
  // users fetch all users from database excluding their password
  async users(req, res) {
    try {
      const users = await User.find().select('-password');
      res.json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  //login logs user in using phoneNumber and password
  async login(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) return res.sendStatus(401);

    const match = await matchPassword(password, user.password);

    if (!match) return res.sendStatus(401);

    const access_token = generate_access_token(
      user._id,
      user.role,
      user.name,
      user.phoneNumber
    );
    const refresh_token = generate_refresh_token(
      user._id,
      user.role,
      user.name,
      user.phoneNumber
    );

    res.status(201).json({ access_token, refresh_token });
  }

  //signup signs user up using the parameters
  async signup(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { name, phoneNumber, password } = req.body;

    let user = await User.findOne({ name });

    user = await User.findOne({ phoneNumber });
    if (user)
      return res
        .status(409)
        .json({ errors: { phoneNumber: 'phoneNumber is taken' } });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      coins: 200,
      name,
      password: hashedPassword,
      phoneNumber,
      role: 'Seller',
    });

    await newUser.save();
    const access_token = generate_access_token(
      newUser._id,
      newUser.role,
      newUser.name,
      newUser.phoneNumber
    );
    const refresh_token = generate_refresh_token(
      newUser._id,
      newUser.role,
      newUser.name,
      newUser.phoneNumber
    );
    res.status(201).json({ access_token, refresh_token });
  }

  // refresh_token refreshes the access token
  async refresh_token(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { token } = req.body;

    jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(401);

      const access_token = generate_access_token(
        user.id,
        user.role,
        user.name,
        user.phoneNumber
      );

      res.status(201).json({ access_token, refresh_token: token });
    });
  }

  // verify_token verifies users token if not refreshes the token
  async verify_token(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      return res.status(400).json({ errors: formattedErrors }); // Early return
    }

    const authHeader = req.headers['authorization'];
    const access_token = authHeader && authHeader.split(' ')[1];
    const { token } = req.body;

    try {
      // If `access_token` exists, verify it
      if (access_token) {
        const user = jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
        return res.status(201).json({ access_token, refresh_token: token }); // Return early
      }

      // If `access_token` is missing, verify the refresh token
      const user = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);

      // Generate a new access token if refresh token is valid
      const new_access_token = generate_access_token(
        user.id,
        user.role,
        user.name,
        user.phoneNumber
      );

      return res
        .status(201)
        .json({ access_token: new_access_token, refresh_token: token });
    } catch (err) {
      // Handle JWT verification errors
      console.error(err);
      return res.sendStatus(401); // Unauthorized
    }
  }

  // change_password changes the password of the user
  async change_password(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const { old_password, new_password } = req.body;
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) return res.sendStatus(401);

    const match = await matchPassword(old_password, user.password);
    if (!match)
      return res.status(422).json({ error: 'old password is incorrect' });

    const hashedPassword = await hashPassword(new_password);
    user.password = hashedPassword;
    await user.save();

    res.sendStatus(204);
  }

  // promote promotes user from buyer to seller
  async becomeSeller(req, res) {
    try {
      const { id } = req.user;
      const user = await User.findById(id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      user.role = 'Seller';
     

      await user.save();
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
    }
  }

   // promote promotes user from buyer to seller
   async becomeBuyer(req, res) {
    try {
      const { id } = req.user;
      const user = await User.findById(id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      user.role = 'Buyer';
      

      await user.save();
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
    }
  }

  // demote demotes user from seller to buyer
  async demote(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.role == 'Seller') {
        user.role = 'Buyer';
        await user.save();
      }

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
    }
  }

  async getProfile(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'server error' });
    }
  }

  async updateProfile(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ errors: formattedErrors });
      return;
    }
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      const { name } = req.body;

      user.name = name;
      user.profile_pic = req.files.main_image
        ? req.files.main_image[0]
        : user.profile_pic;

      await user.save();

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'server error' });
    }
  }

  async getProfile(req, res) {
    const { id } = req.user;

    try {
      const user = await User.findById(id).select('-password');
      if (!user) return res.sendStatus(401);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
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
        const formattedErrors = formatErrors(errors);
        res.status(400).json({ errors: formattedErrors });
        return;
      }

      const { amount } = req.body;
      console.log(amount);

      if (typeof amount !== 'number' || amount < 1 || amount > 5) {
        return res
          .status(400)
          .json({ error: 'Amount must be a number between 1 and 5.' });
      }

      const raterId = req.user.id;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      const userHasRated = user.raters.has(raterId);

      if (userHasRated) {
        const previousRating = user.raters.get(raterId);
        user.total_amount = user.total_amount + amount - previousRating;
      } else {
        user.total_amount += amount;
        user.total_people += 1;
      }

      user.average_rating = user.total_amount / user.total_people;
      user.raters.set(raterId, amount);

      await user.save();

      res.json(user);
    } catch (error) {
      console.error('Error rating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async fetchUserRate(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid House ID' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ rate: user.average_rating });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
}
