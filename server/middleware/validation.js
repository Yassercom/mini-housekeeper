import Joi from 'joi';

// Validation schemas
export const housekeeperRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/).required(),
  location: Joi.string().min(5).max(100).required(),
  experience: Joi.string().valid('Less than 1 year', '1-2 years', '3-5 years', '5+ years').required(),
  hourlyRate: Joi.number().min(15).max(100).required(),
  photoUrl: Joi.string().uri().allow('').optional(),
  bio: Joi.string().max(500).allow('').optional(),
  services: Joi.array().items(Joi.string()).min(1).required()
});

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const housekeeperUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/).optional(),
  location: Joi.string().min(5).max(100).optional(),
  experience: Joi.string().valid('Less than 1 year', '1-2 years', '3-5 years', '5+ years').optional(),
  hourlyRate: Joi.number().min(15).max(100).optional(),
  photoUrl: Joi.string().uri().allow('').optional(),
  bio: Joi.string().max(500).allow('').optional(),
  services: Joi.array().items(Joi.string()).min(1).optional()
});

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Parameter validation middleware
export const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter'
    });
  }
  
  req.validatedId = id;
  next();
};
