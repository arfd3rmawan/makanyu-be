# 🛒 E-commerce REST API

Built with **Express.js**, **PostgreSQL**, and **JWT Authentication**.

---

## 📁 Project Structure

```
ecommerce-api/
├── src/
│   ├── index.js              ← App entry point
│   ├── config/
│   │   ├── database.js       ← PostgreSQL connection
│   │   └── schema.sql        ← Database tables (run this first!)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect & adminOnly
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── productRoutes.js
│       └── orderRoutes.js
├── .env.example              ← Copy this to .env
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
```bash
cp .env.example .env
# Then edit .env with your database credentials and JWT secret
```

### 3. Setup PostgreSQL database
```bash
# Create the database
createdb ecommerce_db

# Run the schema
psql -d ecommerce_db -f src/config/schema.sql
```

### 4. Start the server
```bash
npm run dev     # development (auto-restart)
npm start       # production
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint            | Access  | Description       |
|--------|---------------------|---------|-------------------|
| POST   | /api/auth/register  | Public  | Register new user |
| POST   | /api/auth/login     | Public  | Login             |
| GET    | /api/auth/me        | Private | Get my profile    |

### Products
| Method | Endpoint            | Access  | Description        |
|--------|---------------------|---------|--------------------|
| GET    | /api/products       | Public  | Get all products   |
| GET    | /api/products/:id   | Public  | Get single product |
| POST   | /api/products       | Admin   | Create product     |
| PUT    | /api/products/:id   | Admin   | Update product     |
| DELETE | /api/products/:id   | Admin   | Delete product     |

### Orders
| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| POST   | /api/orders                 | Private | Place an order       |
| GET    | /api/orders                 | Private | Get my orders        |
| GET    | /api/orders/all             | Admin   | Get all orders       |
| PUT    | /api/orders/:id/status      | Admin   | Update order status  |

---

## 🔐 How to use JWT

After login, you get a `token`. Send it in every protected request:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📦 Example Request — Place Order

```json
POST /api/orders
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```
