const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const list = async (req, res) => {
  const items = await MenuItem.find({ restaurant: req.params.restaurantId, isAvailable: true }).sort({ category: 1, name: 1 });
  res.json(items);
};

const getOne = async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.itemId, restaurant: req.params.restaurantId });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
};

const create = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  const item = await MenuItem.create({ ...req.body, restaurant: req.params.restaurantId });
  res.status(201).json(item);
};

const update = async (req, res) => {
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.itemId, restaurant: req.params.restaurantId },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
};

const remove = async (req, res) => {
  const item = await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurant: req.params.restaurantId });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ message: 'Deleted' });
};

module.exports = { list, getOne, create, update, remove };
