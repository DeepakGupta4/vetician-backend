const { validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  
  next();
};

module.exports = { validate };