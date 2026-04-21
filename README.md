# Product & Card Management API

A RESTful API for managing products and project management cards with Atlassian integration.

## Features

### Products
- CRUD operations for products
- SQLite database storage
- Product filtering by name

### Cards (NEW)
- Create cards from Atlassian URLs
- CRUD operations for project cards
- Automatic card details fetching from Atlassian
- Proper card title extraction from Atlassian data

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, for Atlassian integration):
```bash
ATLASSIAN_USERNAME=your-email@example.com
ATLASSIAN_API_TOKEN=your-api-token
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get card by ID
- `POST /api/cards` - Create new card manually
- `POST /api/cards/from-atlassian` - Create card from Atlassian URL
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

## Card Creation from Atlassian URL

To create a card from an Atlassian URL like `https://arif-dermawan.atlassian.net/browse/AIAGENT-1`:

```bash
curl -X POST http://localhost:3000/api/cards/from-atlassian \
  -H "Content-Type: application/json" \
  -d '{"url": "https://arif-dermawan.atlassian.net/browse/AIAGENT-1"}'
```

The system will:
1. Extract the card ID from the URL (e.g., AIAGENT-1)
2. Attempt to fetch card details from Atlassian (if credentials are configured)
3. Create a card with proper title and details
4. Store the card in the local database

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Health Check

```bash
GET /health
```

Returns server status and available endpoints.

## Database

The API uses SQLite for data persistence:
- `products.db` - Product data
- `cards.db` - Card data

Databases are automatically created and initialized on first run.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `ATLASSIAN_USERNAME` - Atlassian account email
- `ATLASSIAN_API_TOKEN` - Atlassian API token

## Testing

```bash
npm test
```

## License

MIT