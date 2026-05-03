const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./core/config');
const { apiLimiter } = require('./core/middlewares/rate-limit.middleware');
const errorHandler = require('./core/middlewares/error.middleware');

// Import modules
const { userRoutes } = require('./modules/users');
const { productRoutes } = require('./modules/products');
const { orderRoutes } = require('./modules/orders');
const { customOrderRoutes } = require('./modules/custom-orders');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

module.exports = app;