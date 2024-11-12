import { validationResult } from 'express-validator';
import { formatErrors } from '../lib/util.js';

export async function login(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
}

export async function signup(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors);
    res.status(400).json({ errors: formattedErrors });
    return;
  }
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
