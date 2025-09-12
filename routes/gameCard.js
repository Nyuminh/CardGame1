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
  getCardValidator,
  searchCardValidator
} = require('../validators/gameCardValidator');

/**
 * @swagger
 * tags:
 *   name: GameCards
 *   description: Game card management
 */

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Lấy danh sách tất cả cards
 *     tags: [GameCards]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng cards mỗi trang
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Ancient, Elemental, Beast, Spirit, Hybrid]
 *         description: Loại Animon
 *       - in: query
 *         name: dna_rate
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         description: Mã DNA
 *     responses:
 *       200:
 *         description: Danh sách cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameCard'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
// Public routes
router.get('/', searchCardValidator, validateInput, gameCardController.getAllCards);

/**
 * @swagger
 * /api/cards/search:
 *   get:
 *     summary: Tìm kiếm cards
 *     tags: [GameCards]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (name, lore)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Ancient, Elemental, Beast, Spirit, Hybrid]
 *         description: Loại Animon
 *       - in: query
 *         name: min_attack
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Attack tối thiểu
 *       - in: query
 *         name: max_attack
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Attack tối đa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng cards mỗi trang
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameCard'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/search', searchCardValidator, validateInput, gameCardController.searchCards);

/**
 * @swagger
 * /api/cards/types:
 *   get:
 *     summary: Lấy danh sách các types
 *     tags: [GameCards]
 *     responses:
 *       200:
 *         description: Danh sách types thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [Ancient, Elemental, Beast, Spirit, Hybrid]
 */
router.get('/types', gameCardController.getCardTypes);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Lấy thông tin card theo ID
 *     tags: [GameCards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     responses:
 *       200:
 *         description: Thông tin card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameCard'
 *       404:
 *         description: Card không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Card not found
 */
router.get('/:id', getCardValidator, validateInput, gameCardController.getCardById);

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Tạo card mới với upload ảnh
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: ID duy nhất của card
 *               name:
 *                 type: string
 *                 description: Tên của card
 *               type:
 *                 type: string
 *                 enum: [Ancient, Elemental, Beast, Spirit, Hybrid]
 *                 description: Loại Animon
 *               origin:
 *                 type: string
 *                 description: Nguồn gốc
 *               dna_rate:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Tỷ lệ DNA
 *               icon:
 *                 type: object
 *                 properties:
 *                   ic1:
 *                     type: string
 *                   ic2:
 *                     type: string
 *                   ic3:
 *                     type: string
 *               stats:
 *                 type: object
 *                 properties:
 *                   attack:
 *                     type: integer
 *                     minimum: 0
 *                   defense:
 *                     type: integer
 *                     minimum: 0
 *                   mana:
 *                     type: integer
 *                     minimum: 0
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *               lore:
 *                 type: string
 *                 description: Câu chuyện về card
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh của card (tùy chọn)
 *           example:
 *             _id: "card_001"
 *             name: "Aurelios"
 *             type: "Ancient"
 *             origin: "Hinh thanh tu cai j do bla bla"
 *             dna_rate: 5
 *             icon:
 *               ic1: "Tự do"
 *               ic2: "bản năng"
 *               ic3: "sự trung thành"
 *             stats:
 *               attack: 800
 *               defense: 600
 *               mana: 300
 *             skills:
 *               - name: "Primordial Light"
 *                 description: "Tấn công tất cả kẻ địch, hồi 20% HP."
 *               - name: "DNA Fusion"
 *                 description: "Kết hợp với 1 Animon bất kỳ để tạo Animon lai."
 *             lore: "Chúa tể ánh sáng nguyên thủy..."
 *             image_url: "/images/cards/aurelios.png"
 *     responses:
 *       201:
 *         description: Card được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameCard'
 *                 message:
 *                   type: string
 *                   example: Card created successfully
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc ID đã tồn tại
 *       401:
 *         description: Không có quyền truy cập
 */
// Protected routes (require authentication)
router.post('/', authenticateToken, upload.single('image'), parseFormData, createCardValidator, validateInput, gameCardController.createCard);

/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     summary: Cập nhật card với upload ảnh
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên của card
 *               type:
 *                 type: string
 *                 enum: [Ancient, Elemental, Beast, Spirit, Hybrid]
 *                 description: Loại Animon
 *               origin:
 *                 type: string
 *                 description: Nguồn gốc
 *               dna_rate:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Tỷ lệ DNA
 *               icon:
 *                 type: object
 *                 properties:
 *                   ic1:
 *                     type: string
 *                   ic2:
 *                     type: string
 *                   ic3:
 *                     type: string
 *               stats:
 *                 type: object
 *                 properties:
 *                   attack:
 *                     type: integer
 *                     minimum: 0
 *                   defense:
 *                     type: integer
 *                     minimum: 0
 *                   mana:
 *                     type: integer
 *                     minimum: 0
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *               lore:
 *                 type: string
 *                 description: Câu chuyện về card
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh mới của card (tùy chọn)
 *     responses:
 *       200:
 *         description: Card được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameCard'
 *                 message:
 *                   type: string
 *                   example: Card updated successfully
 *       404:
 *         description: Card không tồn tại
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', authenticateToken, upload.single('image'), parseFormData, updateCardValidator, validateInput, gameCardController.updateCard);

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Xóa card
 *     tags: [GameCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     responses:
 *       200:
 *         description: Card được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Card deleted successfully
 *       404:
 *         description: Card không tồn tại
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete('/:id', authenticateToken, getCardValidator, validateInput, gameCardController.deleteCard);

module.exports = router;