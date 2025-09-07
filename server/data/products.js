const products = [
  {
    name: 'Organic Bananas',
    description:
      'A sweet, creamy fruit with a bright yellow peel. Perfect for snacking, smoothies, and baking.',
    price: 2.99,
    image: '/images/products/bananas.jpg',
    category: 'Fruits',
    inStock: true,
    origin: 'Ecuador',
    freshness: '3-5 days',
    nutritionFacts: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
    },
    recipeSuggestions: ['Banana Bread', 'Fruit Salad'],
  },
  {
    name: 'Heirloom Tomatoes',
    description:
      'A juicy, flavorful tomato with a vibrant red color. Ideal for salads, sauces, and sandwiches.',
    price: 4.99,
    image: '/images/products/tomatoes.jpg',
    category: 'Vegetables',
    inStock: true,
    origin: 'Local Farm',
    freshness: '5-7 days',
    nutritionFacts: {
      calories: 22,
      protein: 1.1,
      carbs: 4.8,
      fat: 0.2,
    },
    recipeSuggestions: ['Caprese Salad', 'Tomato Soup'],
  },
  {
    name: 'Dragon Fruit',
    description:
      'A beautiful exotic fruit with a bright pink skin and a sweet, speckled flesh.',
    price: 7.99,
    image: '/images/products/dragon-fruit.jpg',
    category: 'Exotic Produce',
    inStock: true,
    origin: 'Vietnam',
    freshness: '7-10 days',
    nutritionFacts: {
      calories: 60,
      protein: 1.2,
      carbs: 13,
      fat: 0.6,
    },
    recipeSuggestions: ['Dragon Fruit Smoothie', 'Exotic Fruit Platter'],
  },
  {
    name: 'Organic Avocados',
    description:
      'A creamy, nutrient-dense fruit with a rich, buttery flavor. Perfect for toast, guacamole, and salads.',
    price: 5.99,
    image: '/images/products/avocados.jpg',
    category: 'Organic / Specials',
    inStock: true,
    origin: 'Mexico',
    freshness: '3-5 days',
    nutritionFacts: {
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
    },
    recipeSuggestions: ['Avocado Toast', 'Guacamole'],
  },
];

module.exports = products;
