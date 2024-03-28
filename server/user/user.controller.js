const httpStatus = require('http-status');
const userHelper = require('./user.helper.js');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
exports.getUser = async (req, res, next) => {
  try {
    const { params } = req;
    const user = await userHelper.getUser(params);
    res.status(httpStatus.OK).send({ user, message: 'successful' });
  } catch (error) {
    error.status = httpStatus.BAD_REQUEST;
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { body } = req;
    const user = await userHelper.createUser(body);
    res.status(httpStatus.OK).send({ user, message: 'successfully created' });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error, message: 'Create user failed' });
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { query } = req;
    const users = await userHelper.getUsers(query);
    res.status(httpStatus.OK).send({ users, message: 'successfully fetched users' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { params } = req;
    const user = await userHelper.deleteUser(params);
    res.status(httpStatus.OK).send({ user, message: 'successfully deleted user' });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const { params, body = {} } = req;
  try {
    const user = await userHelper.updateUser(params, body);
    res.status(httpStatus.OK).send({ user, message: 'successfully deleted user' });
  } catch (error) {
    next(error);
  }
};

//Login, Authentication

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send('All inputs are required');
    }

    // Validate if user exist in our database
    const user = await userHelper.getUser({ email });

    const isUserAndPasswordValid = user && (await bcrypt.compare(password, user.password));

    if (isUserAndPasswordValid) {
      // Create token
      const token = jwt.sign({ user_id: user.userID, email }, config.jwtSecret, {
        expiresIn: config.jwtExpiration
      });

      const payload = { user, token };
      res.status(httpStatus.OK).send({ payload, message: 'Successfully logged in' });
    } else {
      res.status(httpStatus.UNAUTHORIZED).send({ message: 'Email or Password is incorrect' });
    }
  } catch (error) {
    next(error);
  }
};

exports.loadUser = async (req, res, next) => {
  try {
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      // Verify the token
      const { user_id } = jwt.verify(token, process.env.JWT_SECRET);
      const dbUser = await userHelper.getUser({ userID: user_id });
      res.status(httpStatus.OK).send({ user: dbUser, message: 'user loaded' });
    } else res.status(httpStatus.UNAUTHORIZED).send({ message: 'Unauthorized' });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error });
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    jwt.sign(authHeader, '', { expiresIn: 1 }, (logout, err) => {
      if (logout) {
        res.send({ msg: 'You have been Logged Out' });
      } else {
        res.send({ msg: 'Error' });
      }
    });
  } catch (error) {
    next(error);
  }
};
