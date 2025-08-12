const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Check if URI contains placeholder values
    if (mongoURI.includes('<db_username>') || mongoURI.includes('<db_password>')) {
      throw new Error('Please replace <db_username> and <db_password> with actual credentials in .env file');
    }

    // MongoDB connection options for Atlas
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the .env file');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your internet connection and cluster URL');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.log('💡 MongoDB Atlas might be unreachable. Check your IP whitelist and network');
    }
    
    // Don't exit the process in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Running without database connection in development mode');
      return null;
    }
    
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
  }
  process.exit(0);
});

module.exports = connectDB;
