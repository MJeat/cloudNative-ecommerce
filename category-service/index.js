const express = require('express');
const os = require('os');
const Category = require('./category_schema');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Category Microservice running on ${os.hostname()} at port ${PORT}`);
});

app.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Please provide a category name' });
    res.status(201).json(await Category.create({ name, description }));
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    res.status(200).json(await Category.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

app.patch('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

app.listen(PORT, () => console.log(`Category Microservice is listening on port ${PORT}`));
