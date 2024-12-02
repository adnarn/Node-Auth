// server.js or app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRouter = require('./src/routes/userRoutes');
const cookieParser = require('cookie-parser');

// Initialize dotenv for environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());  // Use express.json() to parse JSON bodies
app.use(cookieParser());
app.use(cors());

// Use the userRouter for user-related routes
app.use('/api/users', userRouter);

// MongoDB connection using the URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-mangement';

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
    console.log('Connected to the database successfully');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
