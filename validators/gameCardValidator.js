const { body, param, query } = require('express-validator');

exports.createCardValidator = [
  body('_id').notEmpty().withMessage('Card ID is required'),
  body('name').notEmpty().withMessage('Card name is required'),
  body('type').isIn(['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid']).withMessage('Invalid card type'),
  body('origin').notEmpty().withMessage('Origin is required'),
  body('dna_rate').isInt({ min: 1, max: 10 }).withMessage('DNA rate must be between 1-10'),
  body('icon.ic1').notEmpty().withMessage('Icon ic1 is required'),
  body('icon.ic2').notEmpty().withMessage('Icon ic2 is required'),
  body('icon.ic3').notEmpty().withMessage('Icon ic3 is required'),
  body('stats.attack').isInt({ min: 0 }).withMessage('Attack must be non-negative'),
  body('stats.defense').isInt({ min: 0 }).withMessage('Defense must be non-negative'),
  body('stats.mana').isInt({ min: 0 }).withMessage('Mana must be non-negative'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('skills.*.name').notEmpty().withMessage('Skill name is required'),
  body('skills.*.description').notEmpty().withMessage('Skill description is required'),
  body('lore').notEmpty().withMessage('Lore is required')
];

exports.updateCardValidator = [
  param('id').notEmpty().withMessage('Card ID is required'),
  body('name').optional().notEmpty().withMessage('Card name cannot be empty'),
  body('type').optional().isIn(['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid']).withMessage('Invalid card type'),
  body('dna_rate').optional().isInt({ min: 1, max: 10 }).withMessage('DNA rate must be between 1-10'),
  body('stats.attack').optional().isInt({ min: 0 }).withMessage('Attack must be non-negative'),
  body('stats.defense').optional().isInt({ min: 0 }).withMessage('Defense must be non-negative'),
  body('stats.mana').optional().isInt({ min: 0 }).withMessage('Mana must be non-negative')
];

exports.getCardValidator = [
  param('id').notEmpty().withMessage('Card ID is required')
];

exports.searchCardValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('min_attack').optional().isInt({ min: 0 }).withMessage('Min attack must be non-negative'),
  query('max_attack').optional().isInt({ min: 0 }).withMessage('Max attack must be non-negative')
];