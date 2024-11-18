import jwt from 'jsonwebtoken';
export const authorize = (roles, checkOwnership = false) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(401);

      try {
        const userId = user.id;
        const userRole = user.role;
        if (!roles.includes(userRole)) {
          return res
            .status(403)
            .json({ message: 'Forbidden: Insufficient permissions' });
        }

        if (checkOwnership) {
          const resourceId = req.params.id;
          if (resourceId !== userId && userRole !== 'Admin') {
            return res.status(403).json({
              message: 'Forbidden: You can only modify your own resources',
            });
          }
        }
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  };
};
