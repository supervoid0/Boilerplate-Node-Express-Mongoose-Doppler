const APIError = require('../server/helpers/APIError');
const httpStatus = require('http-status');

exports.restrictContentHeadersTo =
  (allowedContentHeaderTypes = ['application/json']) =>
  (req, res, next) => {
    const reqContentHeader = req.header('Content-Type');

    if (!reqContentHeader)
      next(
        new APIError(
          'No Content-Type header found in request.',
          httpStatus.METHOD_NOT_ALLOWED,
          true
        )
      );

    const reqContentHeaderContainsAllowedHeaderType = allowedContentHeaderTypes.some(
      allowedHeaderType => reqContentHeader.includes(allowedHeaderType)
    );

    if (reqContentHeaderContainsAllowedHeaderType) next();
    else
      next(
        new APIError(
          `The endpoint you are trying to reach only accepts the following Content-Type header(s): ${allowedContentHeaderTypes.join(
            ', '
          )}. This request contained Content-Type ${reqContentHeader}`,
          httpStatus.METHOD_NOT_ALLOWED,
          true
        )
      );
  };
