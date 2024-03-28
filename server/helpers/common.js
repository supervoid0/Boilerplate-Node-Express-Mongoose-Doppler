const moment = require('moment');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

exports.formatDate = date => {
  const newDate = new Date(date);
  return newDate;
};
exports.parseQuery = query => {
  const parsedQuery = { ...query };
  const pagination = {
    limit: parseInt(query.limit) || 10,
    page: parseInt(query.page) - 1 || 0
  };

  let dateRange = null;
  if (query['startDate'] && query['endDate']) {
    dateRange = {
      $gte: this.formatDate(query['startDate']),
      $lte: this.formatDate(query['endDate'])
    };
  }

  if(query.cameraIDs){
    delete parsedQuery['cameraIDs']
    if(query.cameraIDs.length){
      parsedQuery['cameraID'] = { $in: query.cameraIDs }
    }
  }

  delete parsedQuery.limit;
  delete parsedQuery.page;
  delete parsedQuery.startDate;
  delete parsedQuery.endDate;
  return { parsedQuery, pagination, ...(dateRange && { dateRange }) };
};

exports.getUserFromToken = (token) => {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Extract user information from the decoded payload
    const { user_id, email } = decoded;

    // Return the user information
    return { user_id, email };
  } catch (error) {
    // Handle token verification errors
    console.error('Error verifying token:', error.message);
    return null; // or throw an error
  }
};