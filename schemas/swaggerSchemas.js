const j2s = require('joi-to-swagger');
const joiSchemas = require('./joiSchemas');

// Convert Joi schemas to OpenAPI schemas
const convertJoiToSwagger = (joiSchema) => {
  const { swagger } = j2s(joiSchema);
  return swagger;
};

// Response schemas
const successResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    message: {
      type: 'string',
      example: 'Operation successful'
    }
  }
};

const errorResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: false
    },
    message: {
      type: 'string',
      example: 'Error description'
    }
  }
};

const paginationSchema = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
      example: 1
    },
    limit: {
      type: 'integer',
      example: 10
    },
    total: {
      type: 'integer',
      example: 100
    },
    pages: {
      type: 'integer',
      example: 10
    }
  }
};

// Auth response schemas
const authResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    message: {
      type: 'string',
      example: 'Login successful'
    },
    user: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '64f5e1234567890abcdef123'
        },
        username: {
          type: 'string',
          example: 'gameuser123'
        },
        email: {
          type: 'string',
          example: 'user@example.com'
        },
        tokenVersion: {
          type: 'number',
          example: 1
        }
      }
    },
    accessToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
};

const userProfileSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '64f5e1234567890abcdef123'
    },
    username: {
      type: 'string',
      example: 'gameuser123'
    },
    email: {
      type: 'string',
      example: 'user@example.com'
    },
    profile: {
      type: 'object',
      properties: {
        displayName: {
          type: 'string',
          example: 'Game User'
        },
        avatar: {
          type: 'string',
          example: 'https://example.com/avatar.jpg'
        },
        bio: {
          type: 'string',
          example: 'Passionate gamer'
        }
      }
    },
    gameStats: {
      type: 'object',
      properties: {
        gamesPlayed: {
          type: 'number',
          example: 0
        },
        wins: {
          type: 'number',
          example: 0
        },
        losses: {
          type: 'number',
          example: 0
        },
        score: {
          type: 'number',
          example: 0
        }
      }
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2023-09-01T12:00:00.000Z'
    }
  }
};

// GameCard response schema
const gameCardResponseSchema = {
  allOf: [
    convertJoiToSwagger(joiSchemas.gameCardCreateSchema),
    {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'Image URL path',
          example: '/images/cards/aurelios.png'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2023-09-01T12:00:00.000Z'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2023-09-01T12:00:00.000Z'
        }
      }
    }
  ]
};

// Paginated response schemas
const paginatedCardsResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    data: {
      type: 'array',
      items: gameCardResponseSchema
    },
    pagination: paginationSchema
  }
};

const singleCardResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    data: gameCardResponseSchema
  }
};

const cardTypesResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    data: {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid']
    }
  }
};

// Export all schemas
module.exports = {
  // Security schemes
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },

  // Request schemas (converted from Joi)
  schemas: {
    // Auth request schemas
    RegisterRequest: convertJoiToSwagger(joiSchemas.registerSchema),
    LoginRequest: convertJoiToSwagger(joiSchemas.loginSchema),
    
    // GameCard request schemas
    GameCardCreateRequest: convertJoiToSwagger(joiSchemas.gameCardCreateSchema),
    GameCardUpdateRequest: convertJoiToSwagger(joiSchemas.gameCardUpdateSchema),
    
    // Query parameter schemas
    PaginationQuery: convertJoiToSwagger(joiSchemas.paginationQuerySchema),
    CardFilterQuery: convertJoiToSwagger(joiSchemas.cardFilterQuerySchema),
    CardSearchQuery: convertJoiToSwagger(joiSchemas.cardSearchQuerySchema),
    
    // Response schemas
    AuthResponse: authResponseSchema,
    UserProfile: userProfileSchema,
    GameCard: gameCardResponseSchema,
    PaginatedCardsResponse: paginatedCardsResponseSchema,
    SingleCardResponse: singleCardResponseSchema,
    CardTypesResponse: cardTypesResponseSchema,
    SuccessResponse: successResponseSchema,
    ErrorResponse: errorResponseSchema
  }
};