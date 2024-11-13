import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { formatErrors } from '../lib/util.js';
import { hashPassword, matchPassword } from '../services/password_service.js';
import User from '../models/user.js';
import {
  generate_access_token,
  generate_refresh_token,
} from '../services/jwt_service.js';
import sendVerification from '../services/mail/otp.js';
import { sendPasswordResetLink } from '../services/mail/reset.js';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }

  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.sendStatus(401);

  const match = await matchPassword(password, user.password);

  if (!match) return res.sendStatus(401);

  if (!user.isVerified)
    return res.status(422).json({ errors: { email: 'email is not verified' } });

  const access_token = generate_access_token(
    user._id,
    user.isAdmin,
    user.username,
    user.email
  );
  const refresh_token = generate_refresh_token(
    user._id,
    user.isAdmin,
    user.username,
    user.email
  );

  res.status(201).json({ access_token, refresh_token });
}

export async function signup(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }

  const { username, email, password } = req.body;

  let user = await User.findOne({ username });
  if (user)
    return res.status(409).json({ errors: { username: 'username is taken' } });

  user = await User.findOne({ email });
  if (user)
    return res.status(409).json({ errors: { email: 'email is taken' } });

  const hashedPassword = await hashPassword(password);

  const otp = crypto.randomInt(1000, 9999);
  const otpExpiration = Date.now() + 10 * 60 * 1000;

  const newUser = new User({
    username,
    password: hashedPassword,
    email,
    otp,
    otpExpiration,
  });

  await newUser.save();
  await sendVerification(newUser);
  res.status(201).json({ message: 'Verify your email' });
}

export async function refresh_token(req, res) {
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
      user.isAdmin,
      user.username,
      user.email
    );

    res.status(201).json({ access_token, refresh_token: token });
  });
}

export async function verify_token(req, res) {
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
        user.isAdmin,
        user.username,
        user.email
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
            user.isAdmin,
            user.username,
            user.email
          );

          return res.status(201).json({ access_token, refresh_token: token });
        });
      }
      res.status(201).json({ access_token, refresh_token: token });
    });
  }
}

export async function verify_otp(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }

  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.sendStatus(401);

  if (user.otp != otp) {
    return res.status(422).json({ error: 'incorrect otp' });
  }

  if (user.isVerified)
    return res.status(422).json({ message: 'User already verified' });

  if (user.otp !== parseInt(otp) || Date.now() > user.otpExpiration) {
    return res.status(422).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiration = null;

  await user.save();

  res.sendStatus(200);
}

export async function forgot_password(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ errors: { email: 'User with provided email not found' } });

  if (!user.isVerified)
    return res.status(422).json({ error: 'Email not verified' });

  const token = crypto.randomInt(100000, 999999);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;

  await sendPasswordResetLink(token, user);
  res.sendStatus(200);
}

export async function change_password(req, res) {
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

  if (!user.isVerified)
    return res.status(422).json({ error: 'Email not verified' });

  const hashedPassword = await hashPassword(new_password);
  user.password = hashedPassword;
  await user.save();

  res.sendStatus(200);
}

export async function reset_password(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}
