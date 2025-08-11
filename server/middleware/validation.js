import Joi from 'joi';

// Validation schemas
export const housekeeperRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().pattern(/(^\(\d{3}\) \d{3}-\d{4}$)|(^\d{2} \d{2} \d{2} \d{2} \d{2}$)/).required(), // Accepts both US and French formats
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
  phone: Joi.string().pattern(/(^\(\d{3}\) \d{3}-\d{4}$)|(^\d{2} \d{2} \d{2} \d{2} \d{2}$)/).optional(), // Accepts both US and French formats
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
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,  // Pour collecter toutes les erreurs, pas seulement la première
      errors: { 
        wrap: { 
          label: false  // Pour éviter de préfixer les messages d'erreur avec le nom du champ
        } 
      }
    });
    
    if (error) {
      // Organiser les erreurs par champ pour plus de clarté
      const errorDetails = {};
      const errorMessages = [];
      
      error.details.forEach(detail => {
        const field = detail.path[0];
        const message = detail.message;
        
        // Ajouter au dictionnaire des erreurs par champ
        if (!errorDetails[field]) {
          errorDetails[field] = [];
        }
        errorDetails[field].push(message);
        
        // Ajouter à la liste plate de tous les messages
        errorMessages.push(`${field}: ${message}`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: errorMessages.join(', '),
        errorDetails: errorDetails,  // Structure détaillée des erreurs par champ
        errorCount: errorMessages.length
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Parameter validation middleware
export const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide : doit être un nombre',
      errorCode: 'INVALID_ID_FORMAT'
    });
  }
  
  if (id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide : doit être un nombre positif',
      errorCode: 'INVALID_ID_VALUE'
    });
  }
  
  req.validatedId = id;
  next();
};
