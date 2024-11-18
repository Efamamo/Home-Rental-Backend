import { validationResult } from 'express-validator';
import { formatErrors } from '../lib/util.js';
import { hashPassword, matchPassword } from '../services/password_service.js';
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

    const { name, phoneNumber, password, role } = req.body;

    let user = await User.findOne({ name });

    user = await User.findOne({ phoneNumber });
    if (user)
      return res
        .status(409)
        .json({ errors: { phoneNumber: 'phoneNumber is taken' } });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      password: hashedPassword,
      phoneNumber,
      role,
    });

    await newUser.save();
    res.status(201).json(newUser);
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
      res.status(400).json({ errors: formattedErrors });
      return;
    }

    const authHeader = req.headers['authorization'];
    const access_token = authHeader && authHeader.split(' ')[1];
    const { token } = req.body;

    if (access_token == null) {
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
    } else {
      jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
        if (err) {
          jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err, user) => {
            if (err) return res.sendStatus(401);

            const access_token = generate_access_token(
              user.id,
              user.role,
              user.name,
              user.phoneNumber
            );

            return res.status(201).json({ access_token, refresh_token: token });
          });
        }
        res.status(201).json({ access_token, refresh_token: token });
      });
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

    res.sendStatus(200);
  }

  // promote promotes user from buyer to seller
  async promote(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.role == 'Buyer') {
        user.role = 'Seller';
        await user.save();
      }

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
}
