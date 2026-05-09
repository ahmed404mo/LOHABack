// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const config = require('./core/config');
// const { apiLimiter } = require('./core/middlewares/rate-limit.middleware');
// const errorHandler = require('./core/middlewares/error.middleware');

// // Import modules
// const { userRoutes } = require('./modules/users');
// const { productRoutes } = require('./modules/products');
// const { orderRoutes } = require('./modules/orders');
// const { customOrderRoutes } = require('./modules/custom-orders');

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(cors({
//   origin: config.cors.origins,
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// // Rate limiting
// app.use('/api/', apiLimiter);

// // Routes
// app.use('/api/auth', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/custom-orders', customOrderRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Error handler
// app.use(errorHandler);

// module.exports = app;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './core/config';
import { errorMiddleware } from './core/middlewares/error.middleware';

// Import all routes
import userRoutes from './modules/users/users.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes from './modules/orders/orders.routes';
import customOrderRoutes from './modules/custom-orders/custom-orders.routes';
import { settingsRoutes } from './modules/settings'; 

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

export default app;