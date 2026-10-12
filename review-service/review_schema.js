const mongoose = require('./dbconnect');

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('review_collection', ReviewSchema);
