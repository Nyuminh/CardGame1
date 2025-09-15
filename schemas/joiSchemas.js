const Joi = require('joi');

// Auth Schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .description('Username must be 3-30 characters, alphanumeric only')
    .example('gameuser123'),
  
  email: Joi.string()
    .email()
    .required()
    .description('Valid email address')
    .example('user@example.com'),
  
  password: Joi.string()
    .min(6)
    .required()
    .description('Password must be at least 6 characters')
    .example('Password123')
}).description('User registration data');

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .description('Valid email address')
    .example('user@example.com'),
  
  password: Joi.string()
    .required()
    .description('User password')
    .example('Password123')
}).description('User login credentials');

// GameCard Schemas
const gameCardStatsSchema = Joi.object({
  attack: Joi.number()
    .integer()
    .min(0)
    .required()
    .description('Attack power')
    .example(800),
  
  defense: Joi.number()
    .integer()
    .min(0)
    .required()
    .description('Defense power')
    .example(600),
  
  mana: Joi.number()
    .integer()
    .min(0)
    .required()
    .description('Mana cost')
    .example(300)
});

const gameCardSkillSchema = Joi.object({
  name: Joi.string()
    .required()
    .description('Skill name')
    .example('Primordial Light'),
  
  description: Joi.string()
    .required()
    .description('Skill description')
    .example('Tấn công tất cả kẻ địch, hồi 20% HP.')
});

const gameCardIconSchema = Joi.object({
  ic1: Joi.string()
    .required()
    .description('First icon attribute')
    .example('Tự do'),
  
  ic2: Joi.string()
    .required()
    .description('Second icon attribute')
    .example('bản năng'),
  
  ic3: Joi.string()
    .required()
    .description('Third icon attribute')
    .example('sự trung thành')
});

const gameCardCreateSchema = Joi.object({
  _id: Joi.string()
    .required()
    .description('Unique card identifier')
    .example('card_001'),
  
  name: Joi.string()
    .required()
    .description('Card name')
    .example('Aurelios'),
  
  type: Joi.string()
    .valid('Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid')
    .required()
    .description('Card type')
    .example('Ancient'),
  
  origin: Joi.string()
    .required()
    .description('Card origin story')
    .example('Hinh thanh tu cai j do bla bla'),
  
  dna_rate: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .description('DNA rate (1-10)')
    .example(5),
  
  icon: gameCardIconSchema.required(),
  
  stats: gameCardStatsSchema.required(),
  
  skills: Joi.array()
    .items(gameCardSkillSchema)
    .required()
    .description('Array of card skills'),
  
  lore: Joi.string()
    .required()
    .description('Card lore/story')
    .example('Chúa tể ánh sáng nguyên thủy...'),
  
  release_date: Joi.date()
    .optional()
    .description('Release date')
    .example('2050-01-01')
}).description('Game card creation data');

const gameCardUpdateSchema = Joi.object({
  name: Joi.string()
    .optional()
    .description('Card name'),
  
  type: Joi.string()
    .valid('Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid')
    .optional()
    .description('Card type'),
  
  origin: Joi.string()
    .optional()
    .description('Card origin story'),
  
  dna_rate: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .description('DNA rate (1-10)'),
  
  icon: gameCardIconSchema.optional(),
  
  stats: gameCardStatsSchema.optional(),
  
  skills: Joi.array()
    .items(gameCardSkillSchema)
    .optional()
    .description('Array of card skills'),
  
  lore: Joi.string()
    .optional()
    .description('Card lore/story'),
  
  release_date: Joi.date()
    .optional()
    .description('Release date')
}).description('Game card update data');

// Query Schemas
const paginationQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('Page number')
    .example(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .description('Items per page')
    .example(10)
});

const cardFilterQuerySchema = paginationQuerySchema.keys({
  type: Joi.string()
    .valid('Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid')
    .optional()
    .description('Filter by card type'),
  
  dna_rate: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .description('Filter by DNA rate')
});

const cardSearchQuerySchema = paginationQuerySchema.keys({
  q: Joi.string()
    .optional()
    .description('Search query for name or lore')
    .example('Aurelios'),
  
  type: Joi.string()
    .valid('Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid')
    .optional()
    .description('Filter by card type'),
  
  min_attack: Joi.number()
    .integer()
    .min(0)
    .optional()
    .description('Minimum attack power'),
  
  max_attack: Joi.number()
    .integer()
    .min(0)
    .optional()
    .description('Maximum attack power')
});

module.exports = {
  // Auth schemas
  registerSchema,
  loginSchema,
  
  // GameCard schemas
  gameCardCreateSchema,
  gameCardUpdateSchema,
  gameCardStatsSchema,
  gameCardSkillSchema,
  gameCardIconSchema,
  
  // Query schemas
  paginationQuerySchema,
  cardFilterQuerySchema,
  cardSearchQuerySchema
};