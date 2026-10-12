const express = require('express');
const os = require('os');
const Review = require('./review_schema');

const app = express();
const PORT = process.env.PORT || 5008;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Review Microservice running on ${os.hostname()} at port ${PORT}`);
});

app.post('/reviews', async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    if (!productId || !userId || rating === undefined) {
      return res.status(400).json({ message: 'Please provide productId, userId, and rating' });
    }
    res.status(201).json(await Review.create({ productId, userId, rating, comment }));
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

app.get('/reviews', async (req, res) => {
  try {
    const filter = req.query.productId ? { productId: req.query.productId } : {};
    res.status(200).json(await Review.find(filter));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

app.get('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

app.patch('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

app.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

app.listen(PORT, () => console.log(`Review Microservice is listening on port ${PORT}`));
