/*jshint esversion: 8 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealershipSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('dealerships', dealershipSchema);
