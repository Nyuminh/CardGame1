const mongoose = require('mongoose');

const gameCardSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Ancient', 'Elemental', 'Beast', 'Spirit', 'Hybrid']
  },
  origin: {
    type: String,
    required: true
  },
  dna_rate: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  icon: {
    ic1: { type: String, required: true },
    ic2: { type: String, required: true },
    ic3: { type: String, required: true }
  },
  stats: {
    attack: { type: Number, required: true, min: 0 },
    defense: { type: Number, required: true, min: 0 },
    mana: { type: Number, required: true, min: 0 }
  },
  skills: [{
    name: { type: String, required: true },
    description: { type: String, required: true }
  }],
  lore: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    default: '/images/default.svg'
  },
  release_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('GameCard', gameCardSchema);