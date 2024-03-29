/**
 * Function responsible for auto-generating unique temporary passwords
 *
 * @function
 * @returns {string} random password
 */
exports.generateTempPassword = () => Math.random().toString(36).substring(5);

/**
 * Function responsible for populating the user object with
 *
 * @function
 * @param {object} user user instance
 * @returns {string} random password
 */
exports.populateUserFields = async user =>
  user
    .populate({
      path: 'facilityID'
    })
    .execPopulate();