const mongoose = require('./dbconnect');

const InventorySchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    warehouseLocation: { type: String, default: 'Warehouse-Main' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('inventory_collection', InventorySchema);
