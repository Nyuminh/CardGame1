const GameCard = require('../models/GameCard');
const path = require('path');
const fs = require('fs');

// GET /api/cards - Lấy tất cả cards
const getAllCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, dna_rate } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (dna_rate) filter.dna_rate = dna_rate;

    const cards = await GameCard.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await GameCard.countDocuments(filter);

    res.json({
      success: true,
      data: cards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/:id - Lấy 1 card theo ID
const getCardById = async (req, res, next) => {
  try {
    const card = await GameCard.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cards - Tạo card mới
const createCard = async (req, res, next) => {
  try {
    const existingCard = await GameCard.findById(req.body._id);
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: 'Card ID already exists'
      });
    }

    // Xử lý đường dẫn ảnh nếu có upload
    const cardData = { ...req.body };
    if (req.file) {
      cardData.image_url = `/images/${req.file.filename}`;
    }

    const card = new GameCard(cardData);
    const savedCard = await card.save();

    res.status(201).json({
      success: true,
      data: savedCard,
      message: 'Card created successfully'
    });
  } catch (error) {
    // Xóa file đã upload nếu có lỗi
    if (req.file) {
      const filePath = path.join(__dirname, '../images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// PUT /api/cards/:id - Cập nhật card
const updateCard = async (req, res, next) => {
  try {
    const existingCard = await GameCard.findById(req.params.id);
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Xử lý đường dẫn ảnh nếu có upload mới
    const updateData = { ...req.body };
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (existingCard.image_url && existingCard.image_url !== '/images/default.svg') {
        const oldImagePath = path.join(__dirname, '..', existingCard.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image_url = `/images/${req.file.filename}`;
    }

    const card = await GameCard.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: card,
      message: 'Card updated successfully'
    });
  } catch (error) {
    // Xóa file đã upload nếu có lỗi
    if (req.file) {
      const filePath = path.join(__dirname, '../images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// DELETE /api/cards/:id - Xóa card
const deleteCard = async (req, res, next) => {
  try {
    const card = await GameCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Xóa ảnh nếu có
    if (card.image_url && card.image_url !== '/images/default.svg') {
      const imagePath = path.join(__dirname, '..', card.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await GameCard.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/search - Tìm kiếm card
const searchCards = async (req, res, next) => {
  try {
    const { q, type, min_attack, max_attack, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { lore: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (type) filter.type = type;
    
    if (min_attack || max_attack) {
      filter['stats.attack'] = {};
      if (min_attack) filter['stats.attack'].$gte = parseInt(min_attack);
      if (max_attack) filter['stats.attack'].$lte = parseInt(max_attack);
    }

    const cards = await GameCard.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await GameCard.countDocuments(filter);

    res.json({
      success: true,
      data: cards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/types - Lấy danh sách các types
const getCardTypes = async (req, res, next) => {
  try {
    const types = ['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid'];
    
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