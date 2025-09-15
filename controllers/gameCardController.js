const gameCardService = require('../services/gameCardService');

// GET /api/cards - Lấy tất cả cards
const getAllCards = async (req, res, next) => {
  try {
    const result = await gameCardService.getAllCards(req.query);

    res.json({
      success: true,
      data: result.cards,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/:id - Lấy 1 card theo ID
const getCardById = async (req, res, next) => {
  try {
    const card = await gameCardService.getCardById(req.params.id);

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    if (error.message === 'Card not found') {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }
    next(error);
  }
};

// POST /api/cards - Tạo card mới
const createCard = async (req, res, next) => {
  try {
    const savedCard = await gameCardService.createCard(req.body, req.file);

    res.status(201).json({
      success: true,
      data: savedCard,
      message: 'Card created successfully'
    });
  } catch (error) {
    if (error.message === 'Card ID already exists') {
      return res.status(400).json({
        success: false,
        message: 'Card ID already exists'
      });
    }
    next(error);
  }
};

// PUT /api/cards/:id - Cập nhật card
const updateCard = async (req, res, next) => {
  try {
    const card = await gameCardService.updateCard(req.params.id, req.body, req.file);

    res.json({
      success: true,
      data: card,
      message: 'Card updated successfully'
    });
  } catch (error) {
    if (error.message === 'Card not found') {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }
    next(error);
  }
};

// DELETE /api/cards/:id - Xóa card
const deleteCard = async (req, res, next) => {
  try {
    await gameCardService.deleteCard(req.params.id);

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Card not found') {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }
    next(error);
  }
};

// GET /api/cards/search - Tìm kiếm card
const searchCards = async (req, res, next) => {
  try {
    const result = await gameCardService.searchCards(req.query);

    res.json({
      success: true,
      data: result.cards,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/types - Lấy danh sách các types
const getCardTypes = async (req, res, next) => {
  try {
    const types = await gameCardService.getCardTypes();
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  searchCards,
  getCardTypes
};