const mongoose = require('./dbconnect');

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: 'Completed' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('payment_collection', PaymentSchema);
