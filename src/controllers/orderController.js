const pool = require('../config/database');

// POST /api/orders — create a new order
const createOrder = async (req, res) => {
  const { items } = req.body;
  // items = [{ product_id: 1, quantity: 2 }, ...]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalPrice = 0;

    // Validate products and calculate total
    for (const item of items) {
      const result = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      const product = result.rows[0];

      if (!product) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: `Product ID ${item.product_id} not found.` });
      }

      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Not enough stock for "${product.name}".` });
      }

      totalPrice += product.price * item.quantity;
      item._price = product.price; // save price for order_items
    }

    // Create the order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *',
      [req.user.id, totalPrice]
    );
    const order = orderResult.rows[0];

    // Insert order items and reduce stock
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item._price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

// GET /api/orders — get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'name', p.name
      )) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/orders/all — get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/orders/:id/status — update order status (admin only)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ message: 'Order status updated!', order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
