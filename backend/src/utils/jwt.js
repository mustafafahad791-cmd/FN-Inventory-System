const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn = process.env.JWT_EXPIRY) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
