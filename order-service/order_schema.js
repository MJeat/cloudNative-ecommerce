const mongoose = require('./dbconnect');

const OrderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('order_collection', OrderSchema);
