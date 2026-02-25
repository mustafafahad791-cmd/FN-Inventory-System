# FN Furniture Inventory System

A comprehensive inventory management system for furniture businesses.

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **PDF Generation**: pdf-lib
- **Image Rendering**: sharp

## Project Structure

```
FN-Furniture-Inventory-System/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── .env.example
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Helper functions
│   │   └── styles/          # CSS files
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── database/                # Database schema
│   └── schema.sql           # PostgreSQL schema
│
└── README.md
```

## Key Features

1. **System Initialization** - Admin branch and item setup
2. **Dashboard** - Real-time inventory overview
3. **Item Management** - CRUD operations for items and templates
4. **Inventory Management** - Stock tracking per branch
5. **Transfers** - Inter-branch inventory transfers with logging
6. **E-Receipt** - PDF & Image receipt generation
7. **Customer Log** - Customer purchase history
8. **History & Analytics** - Operational logs and system statistics
9. **Search** - Global search functionality

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Database Setup
```bash
# Create PostgreSQL database and run schema
psql -U postgres -d fn_furniture_inventory -f database/schema.sql
```

## Git Workflow

This project is developed on the `initial-structure` branch for initial setup.

```bash
git checkout initial-structure
```

## Next Steps

- [ ] Create database models and connections
- [ ] Implement authentication system
- [ ] Build API endpoints
- [ ] Create React components
- [ ] Implement PDF/Image generation
- [ ] Add analytics features
- [ ] User testing and refinement

---

**Status**: Initial structure created - Ready for feature development
