const cors = require('cors');
const express = require('express');
const compress = require('compression');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const routes = require('../index.route');
const path = require('path');
const app = express();

const dirname = path.resolve();

app.use('/uploads', express.static(path.join(dirname, '/uploads')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(
  cors({
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200
  })
);
app.use('/site', routes);

// app.use(
//   (
//     err,
//     req,
//     res,
//     next // eslint-disable-line no-unused-vars
//   ) =>
//     res.status(err.status).send({
//       status: 'error',
//       message: err.message,
//       statusCode: 500,
//       payload: err.payload || {}
//     })
// );

module.exports = app;
