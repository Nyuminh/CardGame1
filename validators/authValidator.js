const Joi = require('joi');
const { registerSchema, loginSchema } = require('../schemas/joiSchemas');

// Middleware function to validate using Joi
const createJoiValidator = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Store validated data
    req.body = value;
    next();
  };
};

exports.validateRegister = createJoiValidator(registerSchema);
exports.validateLogin = createJoiValidator(loginSchema);
