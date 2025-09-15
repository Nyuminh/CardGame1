const express = require('express');
const router = express.Router();
const gameCardController = require('../controllers/gameCardController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseFormData = require('../middleware/parseFormData');
const { validateInput } = require('../middleware/validation');
const {
  createCardValidator,
  updateCardValidator,
  cardFilterValidator,
  cardSearchValidator
} = require('../validators/gameCardValidator');

/**
 * @swagger
 * tags:
 *   name: GameCards
 *   description: Game card management endpoints
 */

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get all game cards with filtering and pagination
 *     tags: [GameCards]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/PaginationQuery/properties/page'
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/PaginationQuery/properties/limit'
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardFilterQuery/properties/type'
 *       - in: query
 *         name: dna_rate
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardFilterQuery/properties/dna_rate'
 *     responses:
 *       200:
 *         description: List of cards with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCardsResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', cardFilterValidator, validateInput, gameCardController.getAllCards);

/**
 * @swagger
 * /api/cards/search:
 *   get:
 *     summary: Search game cards
 *     tags: [GameCards]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/q'
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/type'
 *       - in: query
 *         name: min_attack
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/min_attack'
 *       - in: query
 *         name: max_attack
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/max_attack'
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/page'
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/CardSearchQuery/properties/limit'
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCardsResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', cardSearchValidator, validateInput, gameCardController.searchCards);

/**
 * @swagger
 * /api/cards/types:
 *   get:
 *     summary: Get available card types
 *     tags: [GameCards]
 *     responses:
 *       200:
 *         description: List of available card types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardTypesResponse'
 */
router.get('/types', gameCardController.getCardTypes);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get a specific game card by ID
 *     tags: [GameCards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: 'card_001'
 *     responses:
 *       200:
 *         description: Card details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCardResponse'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', gameCardController.getCardById);

// Protected routes (require authentication)

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new game card
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             allOf:
 *               - $ref: '#/components/schemas/GameCardCreateRequest'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *                     description: Card image file
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCardCreateRequest'
 *     responses:
 *       201:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SingleCardResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'Card created successfully'
 *       400:
 *         description: Bad request or card ID already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
  authenticateToken, 
  upload.single('image'), 
  parseFormData, 
  createCardValidator, 
  validateInput, 
  gameCardController.createCard
);

/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     summary: Update an existing game card
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: 'card_001'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             allOf:
 *               - $ref: '#/components/schemas/GameCardUpdateRequest'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *                     description: New card image file
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCardUpdateRequest'
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SingleCardResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'Card updated successfully'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', 
  authenticateToken, 
  upload.single('image'), 
  parseFormData, 
  updateCardValidator, 
  validateInput, 
  gameCardController.updateCard
);

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete a game card
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: 'card_001'
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'Card deleted successfully'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, gameCardController.deleteCard);

module.exports = router;