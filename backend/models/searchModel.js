// models/searchModel.js
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  searchTerm: String,
  location: String,
  country: String,
  resultsCount: Number,
  results: Array,
  timestamp: { type: Date, default: Date.now }
});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
