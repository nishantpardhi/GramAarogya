import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    console.log('ℹ️ MONGODB_URI not detected in environment. Using robust in-memory database store with live persistence.');
    return false;
  }

  try {
    if (isConnected) {
      return true;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('ℹ️ Running in memory-buffered mode with fallback to local persistent store.');
    return false;
  }
};

export const getDBStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || 'gramarogya_db',
  };
};
