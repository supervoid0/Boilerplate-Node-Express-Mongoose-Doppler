const express = require('express');
const {
  restrictContentHeadersTo
} = require('../../middleware/authorization.middleware');
const router = new express.Router();
const userController = require('./user.controller');

router.route('/user').post(userController.createUser);

router.route('/users').get(userController.getUsers);

router
  .route('/user/:userID')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .put(userController.updateUser);

router.route('/user-me').get(userController.loadUser);

module.exports = router;
