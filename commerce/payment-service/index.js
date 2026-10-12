const express = require('express');
const os = require('os');
const Payment = require('./payment_schema');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send(`Payment Microservice running on ${os.hostname()} at port ${PORT}`);
});

// 1. Process a new Payment (POST /payments)
app.post('/payments', async (req, res) => {
  try {
    const { orderId, customerEmail, amount, paymentMethod } = req.body;

    if (!orderId || !customerEmail || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newPayment = new Payment({
      orderId,
      customerEmail,
      amount,
      paymentMethod,
      status: 'Completed'
    });

    const savedPayment = await newPayment.save();
    res.status(201).json({
      message: "Payment processed successfully",
      payment: savedPayment
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
});

// 2. Get all Payments (GET /payments)
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

// 3. Get Payment by ID (GET /payments/:id)
app.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
});

// 4. Get Payment by Order ID (GET /payments/order/:orderId)
app.get('/payments/order/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment for this order not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment by order", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Microservice is listening on port ${PORT}`);
});
