const Joi = require('joi');
const { gameCardCreateSchema, gameCardUpdateSchema, cardFilterQuerySchema, cardSearchQuerySchema } = require('../schemas/joiSchemas');

// Middleware function to validate using Joi
const createJoiValidator = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data, { 
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
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }
    
    next();
  };
};

exports.createCardValidator = createJoiValidator(gameCardCreateSchema, 'body');
exports.updateCardValidator = createJoiValidator(gameCardUpdateSchema, 'body');
exports.cardFilterValidator = createJoiValidator(cardFilterQuerySchema, 'query');
exports.cardSearchValidator = createJoiValidator(cardSearchQuerySchema, 'query');