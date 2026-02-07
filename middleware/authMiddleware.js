const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Verifying token with secret starting with:', process.env.JWT_SECRET?.substring(0, 3));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const landlord = (req, res, next) => {
  if (req.user && req.user.role === 'landlord') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a landlord' });
  }
};

module.exports = { protect, admin, landlord };
