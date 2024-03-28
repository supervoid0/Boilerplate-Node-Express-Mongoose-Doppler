const express = require('express');
const {
  restrictContentHeadersTo
} = require('../../middleware/authorization.middleware');
const router = new express.Router();
const userController = require('./user.controller');

router
  .route('/user/login')
  .post([restrictContentHeadersTo(['application/json'])], userController.login);

router
  .route('/user/logout')
  .post(
    [restrictContentHeadersTo(['application/json'])],
    userController.logout
  );

module.exports = router;
