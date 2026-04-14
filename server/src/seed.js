/**
 * Seed script — populates the database with sample restaurants and menu items.
 * Usage:  node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const restaurants = [
  {
    name: 'Waves Burritos',
    description: 'Fresh Mexican-inspired burritos, bowls, and tacos',
    category: 'Mexican',
    address: '3151 Malibu Canyon Rd, Malibu, CA',
    estimatedDeliveryMinutes: 20,
    deliveryFee: 199,
    minimumOrder: 500,
    isOpen: true,
  },
  {
    name: 'Pacific Poke',
    description: 'Hawaiian-style poke bowls made with fresh campus ingredients',
    category: 'Hawaiian',
    address: '24255 Pacific Coast Hwy, Malibu, CA',
    estimatedDeliveryMinutes: 25,
    deliveryFee: 149,
    minimumOrder: 800,
    isOpen: true,
  },
  {
    name: 'Malibu Coffee Co.',
    description: 'Specialty coffees, smoothies, and light bites',
    category: 'Café',
    address: 'Tyler Campus Center, Pepperdine University',
    estimatedDeliveryMinutes: 15,
    deliveryFee: 99,
    minimumOrder: 0,
    isOpen: true,
  },
];

const menuItems = {
  'Waves Burritos': [
    { name: 'Classic Burrito', description: 'Rice, beans, choice of protein, salsa, cheese', price: 1095, category: 'Burritos',
      customizationOptions: [{ label: 'Protein', choices: [{ name: 'Chicken', additionalCost: 0 }, { name: 'Steak', additionalCost: 150 }, { name: 'Veggie', additionalCost: 0 }] }] },
    { name: 'Pepperdine Bowl', description: 'Burrito bowl with all the fixings', price: 1195, category: 'Bowls' },
    { name: 'Street Tacos (3)', description: 'Three corn tortilla tacos with your choice of protein', price: 895, category: 'Tacos' },
    { name: 'Chips & Guac', description: 'Fresh house-made guacamole', price: 395, category: 'Sides' },
    { name: 'Agua Fresca', description: 'Daily rotating fresh fruit drink', price: 350, category: 'Drinks' },
  ],
  'Pacific Poke': [
    { name: 'Regular Bowl', description: 'Base + 2 proteins + 4 toppings + sauce', price: 1295, category: 'Bowls',
      customizationOptions: [{ label: 'Base', choices: [{ name: 'White Rice', additionalCost: 0 }, { name: 'Brown Rice', additionalCost: 0 }, { name: 'Salad', additionalCost: 0 }] }] },
    { name: 'Large Bowl', description: 'Base + 2 proteins + 6 toppings + 2 sauces', price: 1595, category: 'Bowls' },
    { name: 'Edamame', description: 'Steamed salted edamame', price: 395, category: 'Sides' },
    { name: 'Miso Soup', description: 'Traditional Japanese miso soup', price: 295, category: 'Sides' },
    { name: 'Sparkling Water', description: '12oz can', price: 199, category: 'Drinks' },
  ],
  'Malibu Coffee Co.': [
    { name: 'Latte', description: 'Espresso with steamed milk', price: 595, category: 'Hot Coffee',
      customizationOptions: [{ label: 'Size', choices: [{ name: '12oz', additionalCost: 0 }, { name: '16oz', additionalCost: 100 }] }, { label: 'Milk', choices: [{ name: 'Whole', additionalCost: 0 }, { name: 'Oat', additionalCost: 75 }, { name: 'Almond', additionalCost: 75 }] }] },
    { name: 'Iced Americano', description: 'Espresso over ice', price: 495, category: 'Cold Coffee' },
    { name: 'Cold Brew', description: 'Smooth 16-hour cold brew', price: 545, category: 'Cold Coffee' },
    { name: 'Green Tea Latte', description: 'Matcha with your choice of milk', price: 595, category: 'Other Drinks' },
    { name: 'Avocado Toast', description: 'Multigrain toast with smashed avo, everything bagel seasoning', price: 795, category: 'Food' },
    { name: 'Banana Bread', description: 'House-baked banana bread slice', price: 395, category: 'Food' },
  ],
};

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/waves_delivery';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('Cleared existing restaurants and menu items');

  for (const rData of restaurants) {
    const restaurant = await Restaurant.create(rData);
    console.log(`Created restaurant: ${restaurant.name}`);

    const items = menuItems[rData.name] || [];
    for (const itemData of items) {
      await MenuItem.create({ ...itemData, restaurant: restaurant._id });
    }
    console.log(`  Added ${items.length} menu items`);
  }

  console.log('\nSeed complete!');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
