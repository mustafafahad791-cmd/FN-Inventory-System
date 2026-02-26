const express = require('express');
const cors = require('cors');
require('express-async-errors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/items', require('./routes/items'));
app.use('/api/entry-templates', require('./routes/entry-templates'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/customer-logs', require('./routes/customer-logs'));
app.use('/api/system-logs', require('./routes/system-logs'));
app.use('/api/analytics', require('./routes/analytics'));

// 404 Handler - must be before error middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
