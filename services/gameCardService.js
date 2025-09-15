const gameCardRepository = require('../repositories/gameCardRepository');
const path = require('path');
const fs = require('fs');

class GameCardService {
  // Lấy tất cả cards với filter và pagination
  async getAllCards(queryParams) {
    const { page = 1, limit = 10, type, dna_rate } = queryParams;
    
    const filter = {};
    if (type) filter.type = type;
    if (dna_rate) filter.dna_rate = parseInt(dna_rate);

    return await gameCardRepository.findCards(filter, { page: parseInt(page), limit: parseInt(limit) });
  }

  // Lấy card theo ID
  async getCardById(id) {
    const card = await gameCardRepository.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }
    return card;
  }

  // Tạo card mới
  async createCard(cardData, file = null) {
    // Kiểm tra ID đã tồn tại
    if (await gameCardRepository.exists(cardData._id)) {
      throw new Error('Card ID already exists');
    }

    try {
      // Xử lý đường dẫn ảnh nếu có upload
      const finalCardData = { ...cardData };
      if (file) {
        finalCardData.image_url = `/images/${file.filename}`;
      }

      return await gameCardRepository.create(finalCardData);
    } catch (error) {
      // Xóa file đã upload nếu có lỗi
      if (file) {
        this._deleteUploadedFile(file.filename);
      }
      throw error;
    }
  }

  // Cập nhật card
  async updateCard(id, updateData, file = null) {
    const existingCard = await gameCardRepository.findById(id);
    if (!existingCard) {
      throw new Error('Card not found');
    }

    try {
      // Xử lý đường dẫn ảnh nếu có upload mới
      const finalUpdateData = { ...updateData };
      if (file) {
        // Xóa ảnh cũ nếu có
        if (existingCard.image_url && existingCard.image_url !== '/images/default.svg') {
          this._deleteImageFile(existingCard.image_url);
        }
        finalUpdateData.image_url = `/images/${file.filename}`;
      }

      return await gameCardRepository.updateById(id, finalUpdateData);
    } catch (error) {
      // Xóa file đã upload nếu có lỗi
      if (file) {
        this._deleteUploadedFile(file.filename);
      }
      throw error;
    }
  }

  // Xóa card
  async deleteCard(id) {
    const card = await gameCardRepository.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }

    // Xóa ảnh nếu có
    if (card.image_url && card.image_url !== '/images/default.svg') {
      this._deleteImageFile(card.image_url);
    }

    await gameCardRepository.deleteById(id);
    return { message: 'Card deleted successfully' };
  }

  // Tìm kiếm cards
  async searchCards(queryParams) {
    const { q, type, min_attack, max_attack, page = 1, limit = 10 } = queryParams;
    
    let filter = {};
    
    // Thêm type filter
    if (type) filter.type = type;
    
    // Thêm attack range filter
    if (min_attack || max_attack) {
      filter['stats.attack'] = {};
      if (min_attack) filter['stats.attack'].$gte = parseInt(min_attack);
      if (max_attack) filter['stats.attack'].$lte = parseInt(max_attack);
    }

    const options = { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    };

    // Nếu có query text, sử dụng search function
    if (q) {
      return await gameCardRepository.searchCards(q, filter, options);
    }
    
    // Nếu không có query text, chỉ filter
    return await gameCardRepository.findCards(filter, options);
  }

  // Lấy danh sách các types
  async getCardTypes() {
    // Có thể lấy từ database hoặc định nghĩa sẵn
    const predefinedTypes = ['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid'];
    
    // Hoặc lấy động từ database
    // const dynamicTypes = await gameCardRepository.getDistinctTypes();
    
    return predefinedTypes;
  }

  // Lấy thống kê cards
  async getCardStats() {
    const total = await gameCardRepository.count();
    const types = await gameCardRepository.getDistinctTypes();
    
    const statsByType = {};
    for (const type of types) {
      statsByType[type] = await gameCardRepository.count({ type });
    }

    return {
      total,
      types: types.length,
      distribution: statsByType
    };
  }

  // Lấy cards theo type
  async getCardsByType(type, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    return await gameCardRepository.findByType(type, { page: parseInt(page), limit: parseInt(limit) });
  }

  // Lấy cards theo DNA rate
  async getCardsByDnaRate(dnaRate, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    return await gameCardRepository.findByDnaRate(parseInt(dnaRate), { page: parseInt(page), limit: parseInt(limit) });
  }

  // Private helper methods
  _deleteUploadedFile(filename) {
    try {
      const filePath = path.join(__dirname, '../images', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting uploaded file:', error);
    }
  }

  _deleteImageFile(imageUrl) {
    try {
      const imagePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
    }
  }
}

module.exports = new GameCardService();