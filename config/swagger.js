const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { securitySchemes, schemas } = require('../schemas/swaggerSchemas');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GameCard Authentication API',
      version: '1.0.0',
      description: 'API for user authentication and game card management with JWT tokens'
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? (process.env.RENDER_EXTERNAL_URL || 'https://cardgame-main.onrender.com')
               : 'http://localhost:3000'),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      },
      {
        url: 'https://cardgame-main.onrender.com',
        description: 'Render production server'
      }
    ],
    components: {
      securitySchemes,
      schemas
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
