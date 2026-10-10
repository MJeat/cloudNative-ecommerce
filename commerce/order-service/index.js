const express = require('express');
const os = require('os');
const Order = require('./order_schema');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send(`Order Microservice running on ${os.hostname()} at port ${PORT}`);
});

// 1. Create a new Order (POST /orders)
app.post('/orders', async (req, res) => {
  try {
    const { customerEmail, productId, productName, quantity, totalPrice } = req.body;
    
    if (!customerEmail || !productId || !productName || !quantity || !totalPrice) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newOrder = new Order({
      customerEmail,
      productId,
      productName,
      quantity,
      totalPrice,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// 2. Get all Orders (GET /orders)
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// 3. Get single Order by ID (GET /orders/:id)
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
});

// 4. Update Order status (PATCH /orders/:id)
app.patch('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Order Microservice is listening on port ${PORT}`);
});
