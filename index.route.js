const express = require('express');
const authenticate = require('./middleware/authentication.middleware');

const router = express.Router();

const authRoutes = require('./server/user/auth.routes');
const userRoutes = require('./server/user//user.routes');

router.use(authRoutes);
router.use([authenticate], userRoutes);

module.exports = router;
