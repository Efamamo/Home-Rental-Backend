import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'House Rental API',
      version: '1.0.0',
      description: 'API documentation for the House Rental system',
    },
    servers: [
      {
        url: '/api/v1', // Base URL for the API
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, indicates token format
        },
      },
    },
    security: [{ bearerAuth: [] }], // Apply globally if all endpoints need authentication
  },
  apis: ['./routes/*.js'], // Path to route files with annotations
};

const swaggerSpec = swaggerJsDoc(options);

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default swaggerSpec;
