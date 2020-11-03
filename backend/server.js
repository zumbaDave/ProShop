// we added "type": "modules" in root package.json file, so we can use import now instead of require
//const express = require('express');
//const dotenv = require('dotenv');
//const products = require('./data/products');

import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

connectDB();

const app = express();

// run morgan in development mode
// morgan logs to console url's visitors of site uses
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// middleware that allows us to accept json data in the body of a post request
app.use(express.json());

// Comment this out for production mode
// will put it in else part of if production mode
// if we get a get request to /
//app.get('/', (req, res) => {
//  res.send('API is running...');
//});

// using routes in productRoutes file instead of doing all the routes here
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

// route for paypal, we will create here instead of putting into a routes file
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

// make the upload folder accessible by making it static
// __dirname is current folder
// __dirname is only available if we use "require" which we are not doing,
//     so we have to mimic this with path.resolve
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// If in production mode, make frontend/build folder a static folder
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  // any route that is not our api, will point to our index.html file
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

/*
// middleware to send json error message for routes that do not exist
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// create middleware to override error message with wrong id
// if id is wrong, by default we get an html error reponse
// we want a json error message, so will do that here
app.use((err, req, res, next) => {
  // convert a 200 error code to a 500 error code(which is a server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
*/

// instead of above, middleware was created in a separate file and used here
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
