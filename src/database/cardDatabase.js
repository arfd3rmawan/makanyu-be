const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class CardDatabase {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '..', '..', 'cards.db'));
    this.init();
  }

  init() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'TODO',
        priority TEXT DEFAULT 'Medium',
        assignee TEXT,
        url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating cards table:', err);
      } else {
        console.log('Cards table initialized');
      }
    });
  }

  getAllCards() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM cards ORDER BY created_at DESC';
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getCardById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM cards WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createCard(card) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO cards (id, title, description, status, priority, assignee, url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        card.id,
        card.title,
        card.description,
        card.status,
        card.priority,
        card.assignee,
        card.url,
        card.createdAt,
        card.updatedAt
      ], function(err) {
        if (err) reject(err);
        else resolve(card);
      });
    });
  }

  updateCard(id, card) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE cards
        SET title = ?, description = ?, status = ?, priority = ?, assignee = ?, updated_at = ?
        WHERE id = ?
      `;

      this.db.run(sql, [
        card.title,
        card.description,
        card.status,
        card.priority,
        card.assignee,
        new Date().toISOString(),
        id
      ], function(err) {
        if (err) reject(err);
        else resolve({ id, ...card, updatedAt: new Date().toISOString() });
      });
    });
  }

  deleteCard(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM cards WHERE id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ deletedId: id, changes: this.changes });
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new CardDatabase();
