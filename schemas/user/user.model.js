const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const moment = require('moment');
const uniqid = require('uniqid');
const mongooseAutoPopulate = require('mongoose-autopopulate');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { validUserTypes } = require('./user.constants');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      default: () => uniqid('acc')
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long!'],
      maxlength: [50, 'First name must be less than 50 characters long!']
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long!'],
      maxlength: [50, 'First name must be less than 50 characters long!']
    },
    email: {
      type: String,
      default: '46865',
      required: [true, 'Email is a required field!'],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [50, 'Email cannot be more than 50 characters long!'],
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid!');
        }
      }
    },
    password: {
      type: String,
      required: [true, 'Password is a required field!'],
      trim: true,
      default: 'abc',
      validate(value) {
        if (!validator.isStrongPassword(value)) throw new Error('Password is not strong');
        // Even though our model trims the whitespace from the beginning and end of the supplied string,
        // we have to ensure no spaces are included WITHIN the password itself.
        if (/\s/.test(value)) throw new Error('Password cannot contain empty spaces.');
      }
    },
    sessions: {
      adminPortal: { type: String, default: '' },
      clientWeb: { type: String, default: '' }
    },
    isLocked: {
      type: Boolean
      // required: [true, 'User account locked status must be included!'],
      // default: false
    },
    passwordExpirationDate: {
      type: Date,
      required: true,
      default: moment().utc().toDate()
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    loginAttemptsResetDate: {
      type: Date,
      required: true,
      default: moment().utc().toDate()
    },
    userType: {
      type: String,
      required: [true, 'User type must be provided!'],
      trim: true,
      lowercase: true,
      default: validUserTypes[2]
      // enum: {
      //   values: userTypeRefList,
      //   message: 'Invalid user type provided.'
      // }
    },
    language: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    id: false
  }
);

userSchema.plugin(mongooseUniqueValidator, {
  message: '{VALUE} is already in use, {PATH} must be unique.'
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);

    // Check if the user-type is superuser (this is only relevant for creating
    // superuser accounts so that their accounts don't have an automatically expired password
    if (user.type === validUserTypes.Superuser) {
      user.passwordExpirationDate = moment().utc().add(90, 'days').toDate();
    }
  }
  // If a user's account gets unlocked, also reset the login attempts and login attempt date before saving.
  if (user.isModified('isLocked')) {
    if (!user.isLocked) {
      user.failedLoginAttempts = 0;
      user.loginAttemptsResetDate = moment().utc().toDate();
    }
  }
  next();
});

userSchema.methods.toJSON = function () {
  const user = this.toObject({
    getters: true,
    virtuals: true,
    flattenMaps: true,
    useProjection: true
  });

  // Removing sensitive fields from the user object...
  delete user.password;
  delete user.temporaryPassword;
  return user;
};

userSchema.methods.logIncorrectPasswordAttempt = async function () {
  const user = this;
  const rightNow = moment().utc().toDate();

  if (rightNow > user.loginAttemptsResetDate && user.failedLoginAttempts < 5) {
    user.failedLoginAttempts = 0;
  }

  if (user.failedLoginAttempts === 0) {
    user.loginAttemptsResetDate = moment().utc().add(1, 'day').toDate();
  }

  if (rightNow < user.loginAttemptsResetDate && user.failedLoginAttempts < 5) {
    user.failedLoginAttempts++;
  }

  if (user.failedLoginAttempts >= 5) {
    user.isLocked = true;
  }
  return user.save();
};

userSchema.methods.checkIfPasswordStillValid = function () {
  const user = this;
  const rightNow = moment().utc().toDate();

  // Check if right now is beyond the password expiry date on the instance
  return rightNow < user.passwordExpirationDate;
};

userSchema.methods.resetUserPassword = async function () {
  const user = this;

  const temporaryPassword = generateTempPassword();

  user.password = temporaryPassword;
  user.passwordExpirationDate = moment().utc().toDate();

  await user.save();
  return temporaryPassword;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error('Invalid credentials.');

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    await user.logIncorrectPasswordAttempt();
    if (user.failedLoginAttempts < 5)
      throw new Error(
        `Invalid credentials. ${
          5 - user.failedLoginAttempts
        } attempts left before this account is locked.`
      );
    else throw new Error('Max failed login attempts exceeded. This account has been locked.');
  } else {
    if (user.isLocked)
      throw new Error(
        'This account has been locked. Contact your administrator to unlock account.'
      );
    // Resetting login attempts after a successful login.
    user.failedLoginAttempts = 0;

    await user.save();

    return populateUserFields(user);
  }
};

userSchema.statics.findByUsernameAndEmailForPassReset = async (username, email) => {
  const user = await User.findOne({ username, email });
  if (!user) throw new Error('Invalid credentials.');

  if (user.isLocked) {
    throw new Error('This account has been locked. Contact your administrator to unlock account.');
  }

  return await user.resetUserPassword();
};

const User = mongoose.model('User', userSchema);

module.exports = User;