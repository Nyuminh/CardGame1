const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              example: 'gameuser123'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
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
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              example: 'Password123'
            }
          }
        },
        AuthResponse: {
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
              example: 'Error description'
            }
          }
        },
        UserProfile: {
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
        },
        GameCard: {
          type: 'object',
          required: ['_id', 'name', 'type', 'origin', 'dna_rate', 'icon', 'stats', 'skills', 'lore'],
          properties: {
            _id: {
              type: 'string',
              description: 'Mã định danh duy nhất',
              example: 'card_001'
            },
            name: {
              type: 'string',
              description: 'Tên Animon',
              example: 'Aurelios'
            },
            type: {
              type: 'string',
              enum: ['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid'],
              description: 'Loại Animon',
              example: 'Ancient'
            },
            origin: {
              type: 'string',
              description: 'Nguồn gốc',
              example: 'Hinh thanh tu cai j do bla bla'
            },
            dna_rate: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              description: 'Mã DNA',
              example: 5
            },
            icon: {
              type: 'object',
              properties: {
                ic1: {
                  type: 'string',
                  example: 'Tự do'
                },
                ic2: {
                  type: 'string',
                  example: 'bản năng'
                },
                ic3: {
                  type: 'string',
                  example: 'sự trung thành'
                }
              }
            },
            stats: {
              type: 'object',
              properties: {
                attack: {
                  type: 'number',
                  minimum: 0,
                  example: 800
                },
                defense: {
                  type: 'number',
                  minimum: 0,
                  example: 600
                },
                mana: {
                  type: 'number',
                  minimum: 0,
                  example: 300
                }
              }
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Primordial Light'
                  },
                  description: {
                    type: 'string',
                    example: 'Tấn công tất cả kẻ địch, hồi 20% HP.'
                  }
                }
              }
            },
            lore: {
              type: 'string',
              description: 'Câu chuyện',
              example: 'Chúa tể ánh sáng nguyên thủy...'
            },
            image_url: {
              type: 'string',
              description: 'Đường dẫn hình ảnh',
              example: '/images/cards/aurelios.png'
            },
            release_date: {
              type: 'string',
              format: 'date',
              description: 'Ngày phát hành',
              example: '2050-01-01'
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
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
