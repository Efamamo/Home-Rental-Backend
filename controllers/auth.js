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
}

export async function verify_token(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}

export async function forgot_password(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}

export async function change_password(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}

export async function reset_password(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}
