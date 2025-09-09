const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GameCard Authentication API',
      version: '1.0.0',
      description: 'API xác thực người dùng với JWT cho GameCard project',
      contact: {
        name: 'GameCard Team',
        email: 'support@gamecard.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token (không cần prefix "Bearer ")'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Tên người dùng'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email'
            },
            isActive: {
              type: 'boolean',
              description: 'Trạng thái tài khoản'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Ngày tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Ngày cập nhật'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9]+$',
              description: 'Tên người dùng (3-30 ký tự, chỉ chữ và số)',
              example: 'gameuser2024'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Địa chỉ email',
              example: 'user@gamecard.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])',
              description: 'Mật khẩu (ít nhất 6 ký tự, có chữ thường, chữ hoa và số)',
              example: 'Password123'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Địa chỉ email',
              example: 'user@gamecard.com'
            },
            password: {
              type: 'string',
              description: 'Mật khẩu',
              example: 'Password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Trạng thái thành công'
            },
            message: {
              type: 'string',
              description: 'Thông báo'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT token'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Thông báo lỗi'
            },
            errors: {
              type: 'string',
              description: 'Chi tiết lỗi'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'API xác thực người dùng'
      },
      {
        name: 'User Profile',
        description: 'Quản lý thông tin người dùng'
      },
      {
        name: 'Health',
        description: 'Kiểm tra trạng thái server'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
