const jwt = require('jsonwebtoken');

const config = require('../config/config');

const verifyToken = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (req.header('Authorization')) {
    token = req.header('Authorization').replace('Bearer ', '');
  }

  if (!token) {
    return res.status(403).send('No authentication parameters provided in request');
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).send({ ...err, message: 'Session Expired' });
    return res.status(401).send(err);
  }
  next();
};

module.exports = verifyToken;
