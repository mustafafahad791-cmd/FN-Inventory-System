# FN Furniture Inventory System - Setup Guide

## 📋 Project Overview

This is a complete furniture inventory management system built with React, Node.js, and PostgreSQL. The project is organized as a monorepo with separate frontend and backend applications.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git
- npm or yarn

### Step 1: Clone and Setup Repository

```bash
# Navigate to project directory
cd "FN Furniture Inventory System"

# Ensure you're on the initial-structure branch
git checkout initial-structure
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE fn_furniture_inventory;"

# Run schema to create tables
psql -U postgres -d fn_furniture_inventory -f database/schema.sql
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_super_secret_key_12345

# Start backend server
npm run dev  # Development mode with hot reload
# or
npm start    # Production mode
```

Server will run on: `http://localhost:5000`

### Step 4: Frontend Setup

```bash
# From root directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start React application
npm start
```

Application will open on: `http://localhost:3000`

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── models/            # Database models
│   │   ├── Branch.js
│   │   ├── Item.js
│   │   ├── EntryTemplate.js
│   │   ├── Inventory.js
│   │   ├── Customer.js
│   │   ├── Receipt.js
│   │   └── SystemLog.js
│   ├── routes/            # API routes
│   │   ├── branches.js
│   │   ├── items.js
│   │   ├── inventory.js
│   │   ├── receipts.js
│   │   ├── customers.js
│   │   └── analytics.js
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   │   └── auth.js       # JWT authentication
│   └── utils/
│       ├── db.js          # Database connection
│       └── jwt.js         # JWT utilities
├── package.json
├── .env.example
└── server.js

### Frontend Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar.js
│   │   ├── Dashboard.js
│   │   ├── ItemManagement.js
│   │   ├── InventoryManagement.js
│   │   ├── Transfer.js
│   │   ├── EReceipt.js
│   │   ├── CustomerLog.js
│   │   ├── Analytics.js
│   │   └── History.js
│   ├── pages/            # Page containers
│   ├── services/         # API services
│   │   ├── apiClient.js  # Axios instance
│   │   └── api.js        # API endpoints
│   ├── context/          # React Context
│   │   ├── AuthContext.js
│   │   └── AppContext.js
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Helper functions
│   │   └── formatters.js
│   ├── styles/           # CSS files
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── package.json
└── .env.example

### Database Structure

```
database/
└── schema.sql            # PostgreSQL schema with all tables

```

---

## 🗄️ Database Schema

The system uses 8 main tables:

1. **Branch** - Store locations/branches
2. **Item** - Master product items
3. **EntryTemplate** - Product variants/specifications
4. **Inventory** - Stock levels per branch
5. **Customer** - Customer information
6. **Receipt** - Sales receipts
7. **ReceiptItems** - Items in each receipt
8. **SystemLog** - All system activities

---

## 🔌 API Endpoints (To Be Implemented)

### Branches
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch
- `GET /api/branches/:id` - Get branch details
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item

### Entry Templates
- `GET /api/entry-templates` - Get all templates
- `POST /api/entry-templates` - Create template
- `GET /api/entry-templates?itemId=:id` - Get by item

### Inventory
- `GET /api/inventory?branchId=:id` - Get branch inventory
- `PUT /api/inventory/quantity` - Update quantity

### Receipts
- `POST /api/receipts` - Create receipt
- `GET /api/receipts/:id` - Get receipt
- `GET /api/receipts/:id/pdf` - Download PDF

### Customers
- `GET /api/customers/search?q=:query` - Search customers
- `GET /api/customers/:id/history` - Purchase history

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/inventory-by-branch` - Inventory data
- `GET /api/analytics/sales` - Sales data

---

## 🚀 Development Workflow

### Running the Application

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm start
```

### Making Changes

1. Create feature branch from `initial-structure`
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes

3. Commit with clear messages
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

4. Push and create pull request
   ```bash
   git push origin feature/your-feature
   ```

---

## 📦 Dependencies

### Backend
- **express** - Web framework
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **pdf-lib** - PDF generation
- **sharp** - Image processing

### Frontend
- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **chart.js** - Data visualization
- **tailwindcss** - CSS framework

---

## 🔐 Security

- Environment variables for sensitive data (.env files)
- JWT token-based authentication
- Password hashing with bcryptjs
- CORS configuration for API
- Input validation with Joi

---

## ✅ Next Steps

### Phase 2: Core Features
- [ ] Implement all controllers
- [ ] Build API routes
- [ ] Create React components for each workflow
- [ ] Add form validation
- [ ] Implement PDF/Image generation

### Phase 3: Advanced Features
- [ ] Analytics dashboard
- [ ] System logging
- [ ] Email notifications
- [ ] Data export functionality

### Phase 4: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Deploy to production server
- [ ] Setup CI/CD pipeline

---

## 📝 Notes

- All timestamps are automatically managed
- IDs are auto-generated UUIDs
- Quantity can't go negative (uses GREATEST function)
- Receipts are immutable once created
- Customers are auto-created on first purchase

---

## 🤝 Contributing

1. Follow the established folder structure
2. Use consistent naming conventions
3. Add comments for complex logic
4. Test before committing
5. Update documentation

---

**Last Updated**: February 25, 2026
**Branch**: initial-structure
**Status**: Ready for feature development
