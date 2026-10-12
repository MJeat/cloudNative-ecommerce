const express = require('express');
const os = require('os');
const Product = require('./product_schema');

const app = express();
const PORT = process.env.PORT || 5006;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Product Microservice running on ${os.hostname()} at port ${PORT}`);
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, categoryId, description, imageUrl } = req.body;
    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ message: 'Please provide name, price, and categoryId' });
    }
    const product = await Product.create({ name, price, categoryId, description, imageUrl });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    res.status(200).json(await Product.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

app.patch('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

app.listen(PORT, () => console.log(`Product Microservice is listening on port ${PORT}`));
