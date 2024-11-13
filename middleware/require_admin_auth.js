import jwt from 'jsonwebtoken';

// Middleware to check if the user is an admin
function require_admin_auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    if (decoded.isAdmin) {
      req.user = decoded;
      next();
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Invalid token.' });
  }
}

export default require_admin_auth;
