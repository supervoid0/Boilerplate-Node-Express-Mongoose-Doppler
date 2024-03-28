const {user} = require('@application/schemas');

exports.getUser = async query =>
  user.findOne(query, {
    createdAt: 0,
    updatedAt: 0,
    loginAttemptsResetDate: 0,
    failedLoginAttempts: 0,
    passwordExpirationDate: 0,
    sessions: 0,
    _id: 0,
    __v: 0
  }).lean();

exports.getUsers = async query =>
  user.find(query, {
    createdAt: 0,
    updatedAt: 0,
    loginAttemptsResetDate: 0,
    failedLoginAttempts: 0,
    passwordExpirationDate: 0,
    sessions: 0,
    _id: 0,
    __v: 0
  }).lean();

exports.updateUser = async (filter, update) =>
  user.findOneAndUpdate(filter, update, {
    returnOriginal: false
  });

exports.createUser = async data => user.create(data);
exports.deleteUser = async query => user.deleteOne(query);
