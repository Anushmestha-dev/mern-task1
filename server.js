// Import required modules
const express = require('express');
const path = require('path');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Middleware to serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory array storing our items (No database needed)
// Initialized with 2 sample items as required
let items = [
  { id: 1, name: "Laptop", price: 75000 },
  { id: 2, name: "iPhone", price: 69999 }
];

// Counter for auto-incrementing item IDs
let nextId = 3;

// ==========================================
// REST API ROUTES
// ==========================================

/**
 * GET /api/items
 * Description: Retrieve all items
 * Status code: 200 OK
 */
app.get('/api/items', (req, res) => {
  res.status(200).json(items);
});

/**
 * POST /api/items
 * Description: Add a new item to the array
 * Status code: 201 Created on success, 400 Bad Request on validation failure
 */
app.post('/api/items', (req, res) => {
  const { name, price } = req.body;

  // Validation: Check if name is provided and not empty
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Name must not be empty." });
  }

  // Validation: Check if price is a valid positive number
  const parsedPrice = Number(price);
  if (price === undefined || price === null || isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }

  // Create new item object with auto-incremented ID
  const newItem = {
    id: nextId++,
    name: name.trim(),
    price: parsedPrice
  };

  // Add the new item to our in-memory array
  items.push(newItem);

  // Return the newly created item with 201 status code
  res.status(201).json(newItem);
});

/**
 * PUT /api/items/:id
 * Description: Update an existing item by ID
 * Status code: 200 OK on success, 400 Bad Request if invalid input, 404 Not Found if item doesn't exist
 */
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Find the item in the array
  const item = items.find(i => i.id === id);

  // If item does not exist, return 404
  if (!item) {
    return res.status(404).json({ error: "Item not found." });
  }

  const { name, price } = req.body;

  // Validation: Check if name is provided and not empty
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Name must not be empty." });
  }

  // Validation: Check if price is a valid positive number
  const parsedPrice = Number(price);
  if (price === undefined || price === null || isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }

  // Update item properties
  item.name = name.trim();
  item.price = parsedPrice;

  // Return updated item with 200 status code
  res.status(200).json(item);
});

/**
 * DELETE /api/items/:id
 * Description: Delete an item by ID
 * Status code: 200 OK on success, 404 Not Found if item doesn't exist
 */
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Find index of the item
  const itemIndex = items.findIndex(i => i.id === id);

  // If item does not exist, return 404
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found." });
  }

  // Remove the item from array
  const deletedItem = items.splice(itemIndex, 1)[0];

  // Return success message with 200 status code
  res.status(200).json({ message: "Item deleted successfully.", item: deletedItem });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
