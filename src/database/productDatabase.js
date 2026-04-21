const pool = require('../config/database');

const getAllProducts = async (nameFilter = null) => {
  let query = 'SELECT * FROM products';
  const params = [];

  if (nameFilter) {
    query += ' WHERE LOWER(name) LIKE LOWER($1)';
    params.push(`%${nameFilter}%`);
  }

  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const createProduct = async ({ name, description, price, stock, category, image_url }) => {
  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, description, price, stock || 0, category, image_url]
  );
  return result.rows[0];
};

const updateProduct = async (id, { name, description, price, stock, category, image_url }) => {
  const result = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, image_url=$6
     WHERE id=$7 RETURNING *`,
    [name, description, price, stock, category, image_url, id]
  );
  return result.rows[0] || null;
};

const deleteProduct = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
