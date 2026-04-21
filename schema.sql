-- Products table schema
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for testing
INSERT INTO products (name, description, price, category) VALUES 
  ('Laptop Computer', 'High-performance laptop', 999.99, 'Electronics'),
  ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 'Electronics'),
  ('Coffee Mug', 'Ceramic coffee mug', 12.99, 'Kitchen'),
  ('Desk Lamp', 'LED desk lamp with adjustable brightness', 45.99, 'Office'),
  ('Notebook', 'Lined notebook for writing', 8.99, 'Stationery');

-- Index for name filtering performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);