const express = require('express');
const os = require('os');
const Inventory = require('./inventory_schema');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send(`Inventory Microservice running on ${os.hostname()} at port ${PORT}`);
});

// 1. Add or initialize Product Inventory (POST /inventory)
app.post('/inventory', async (req, res) => {
  try {
    const { productId, productName, stock, warehouseLocation } = req.body;

    if (!productId || !productName || stock === undefined) {
      return res.status(400).json({ message: "Please provide productId, productName, and stock" });
    }

    const newItem = new Inventory({
      productId,
      productName,
      stock,
      warehouseLocation: warehouseLocation || 'Warehouse-Main'
    });

    const savedItem = await newItem.save();
    res.status(201).json({
      message: "Inventory item added successfully",
      inventory: savedItem
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding inventory item", error: error.message });
  }
});

// 2. Get all Inventory items (GET /inventory)
app.get('/inventory', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
});

// 3. Get Inventory by Product ID (GET /inventory/:productId)
app.get('/inventory/:productId', async (req, res) => {
  try {
    const item = await Inventory.findOne({ productId: req.params.productId });
    if (!item) {
      return res.status(404).json({ message: "Product not found in inventory" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory item", error: error.message });
  }
});

// 4. Update Stock Quantity (PATCH /inventory/:productId)
app.patch('/inventory/:productId', async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ message: "Please provide stock value" });
    }

    const updatedItem = await Inventory.findOneAndUpdate(
      { productId: req.params.productId },
      { stock },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Product not found in inventory" });
    }

    res.status(200).json({
      message: "Stock updated successfully",
      inventory: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory Microservice is listening on port ${PORT}`);
});
