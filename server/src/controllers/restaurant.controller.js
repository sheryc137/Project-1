const Restaurant = require('../models/Restaurant');

const list = async (req, res) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  const restaurants = await Restaurant.find(query).sort({ name: 1 });
  res.json(restaurants);
};

const getOne = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(restaurant);
};

const create = async (req, res) => {
  const restaurant = await Restaurant.create({ ...req.body, createdBy: req.user.userId });
  res.status(201).json(restaurant);
};

const update = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(restaurant);
};

const remove = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json({ message: 'Deleted' });
};

module.exports = { list, getOne, create, update, remove };
