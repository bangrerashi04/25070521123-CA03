const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * The server refuses to start if the database is unreachable,
 * because every API depends on it.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ca3_melody';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected -> ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Start MongoDB (or MongoDB Compass) and check MONGO_URI in server/.env');
    process.exit(1);
  }
}

module.exports = connectDB;
