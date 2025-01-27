/**
 * @file generate-account-data.js
 * @descr Exports utility function generateAccountData, which generates
 *        valid account data.
 */

let emailCounter = 0;
const generateUniqueEmail = () => `test${emailCounter++}@example.com`;

const DEFAULT_ACCOUNT = {
  password: 'ValidPass123!',
  displayName: 'Test User',
  securityQuestion: 'First pet name?',
  securityAnswer: 'Daisy',
  profilePic: "images/DefaultProfilePic.jpg" //The default profile picture
};

/**
 * @func generateAccountData
 * @descr Generates an object containing account data.
 * @param {Object} overrides - Optional object containing properties to override.
 * @returns {Object} - Account data object.
 */
export const generateAccountData = (overrides = {}) => ({
  ...DEFAULT_ACCOUNT,
  email: generateUniqueEmail(),
  ...overrides
});