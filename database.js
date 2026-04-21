const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'products.db'));
    this.init();
  }

  init() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating products table:', err);
      } else {
        console.log('Products table initialized');
        this.seedData();
      }
    });
  }

  seedData() {
    const checkDataSQL = 'SELECT COUNT(*) as count FROM products';
    this.db.get(checkDataSQL, (err, row) => {
      if (err) {
        console.error('Error checking data:', err);
        return;
      }

      if (row.count === 0) {
        const sampleProducts = [
          { name: 'Laptop Computer', description: 'High-performance laptop', price: 999.99, category: 'Electronics' },
          { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'Electronics' },
          { name: 'Coffee Mug', description: 'Ceramic coffee mug', price: 12.99, category: 'Kitchen' },
          { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 45.99, category: 'Office' },
          { name: 'Notebook', description: 'Lined notebook for writing', price: 8.99, category: 'Stationery' }
        ];

        const insertSQL = 'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)';
        sampleProducts.forEach(product => {
          this.db.run(insertSQL, [product.name, product.description, product.price, product.category]);
        });
        console.log('Sample data inserted');
      }
    });
  }

  getAllProducts(nameFilter = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM products';
      let params = [];

      if (nameFilter) {
        sql += ' WHERE LOWER(name) LIKE LOWER(?)';
        params.push(`%${nameFilter}%`);
      }

      sql += ' ORDER BY created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getProductById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM products WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  createProduct(product) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)';
      this.db.run(sql, [product.name, product.description, product.price, product.category], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...product });
        }
      });
    });
  }

  updateProduct(id, product) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?';
      this.db.run(sql, [product.name, product.description, product.price, product.category, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...product });
        }
      });
    });
  }

  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM products WHERE id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedId: id, changes: this.changes });
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();