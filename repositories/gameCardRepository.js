const GameCard = require('../models/GameCard');

class GameCardRepository {
  // Lấy tất cả cards với filter và pagination
  async findCards(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    
    const cards = await GameCard.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await GameCard.countDocuments(filter);

    return {
      cards,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Lấy card theo ID
  async findById(id) {
    return await GameCard.findById(id);
  }

  // Tạo card mới
  async create(cardData) {
    const card = new GameCard(cardData);
    return await card.save();
  }

  // Cập nhật card
  async updateById(id, updateData) {
    return await GameCard.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Xóa card
  async deleteById(id) {
    return await GameCard.findByIdAndDelete(id);
  }

  // Kiểm tra card có tồn tại không
  async exists(id) {
    const card = await GameCard.findById(id);
    return !!card;
  }

  // Đếm số lượng cards
  async count(filter = {}) {
    return await GameCard.countDocuments(filter);
  }

  // Tìm kiếm cards với text search
  async searchCards(searchQuery, filter = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    
    // Tạo text search filter
    const searchFilter = {
      ...filter,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { lore: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    return await this.findCards(searchFilter, { page, limit });
  }

  // Lấy cards theo type
  async findByType(type, options = {}) {
    return await this.findCards({ type }, options);
  }

  // Lấy cards theo DNA rate
  async findByDnaRate(dnaRate, options = {}) {
    return await this.findCards({ dna_rate: dnaRate }, options);
  }

  // Lấy cards theo stats range
  async findByStatsRange(statType, min, max, options = {}) {
    const filter = {};
    if (min !== undefined || max !== undefined) {
      filter[`stats.${statType}`] = {};
      if (min !== undefined) filter[`stats.${statType}`].$gte = min;
      if (max !== undefined) filter[`stats.${statType}`].$lte = max;
    }
    
    return await this.findCards(filter, options);
  }

  // Lấy danh sách types có sẵn
  async getDistinctTypes() {
    return await GameCard.distinct('type');
  }
}

module.exports = new GameCardRepository();