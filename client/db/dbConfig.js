import "dotenv/config";
import mongoose from "mongoose";

// Check if MONGO_URI is set
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set!");
  throw new Error("MONGO_URI environment variable is required");
}

export async function connectToDatabase() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Already connected to MongoDB");
      return { database: mongoose.connection.db };
    }

    // Connection options for better error handling and reliability
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      w: 'majority'
    };

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    console.log("✅ Connected to MongoDB successfully!");
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return { database: mongoose.connection.db };
  } catch (error) {
    // Enhanced error handling with specific messages
    console.error("❌ MongoDB connection failed!");
    
    if (error.name === 'MongoServerError') {
      if (error.code === 8000 || error.codeName === 'AtlasError') {
        console.error("🔐 Authentication Error Details:");
        console.error("   - Check your MongoDB username and password");
        console.error("   - Ensure password is URL-encoded if it contains special characters");
        console.error("   - Verify the database user exists in MongoDB Atlas");
        console.error("   - Check IP whitelist in MongoDB Atlas Network Access");
        console.error("   - Format: mongodb+srv://username:password@cluster.mongodb.net/database");
      } else {
        console.error("   Error Code:", error.code);
        console.error("   Error Name:", error.codeName);
        console.error("   Message:", error.message);
      }
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error("🌐 Network/Connection Error:");
      console.error("   - Check your internet connection");
      console.error("   - Verify MongoDB Atlas cluster is running");
      console.error("   - Check IP whitelist in MongoDB Atlas");
      console.error("   - Ensure firewall allows MongoDB connections");
    } else {
      console.error("   Error Type:", error.name);
      console.error("   Message:", error.message);
    }
    
    console.error("\n💡 Troubleshooting Tips:");
    console.error("   1. Verify MONGO_URI format: mongodb+srv://username:password@cluster.mongodb.net/database");
    console.error("   2. URL-encode special characters in password (!@#$%^&*)");
    console.error("   3. Check MongoDB Atlas → Network Access → IP Whitelist");
    console.error("   4. Verify database user exists in MongoDB Atlas → Database Access");
    console.error("   5. Test connection string in MongoDB Compass");
    
    throw error; // Re-throw to let callers handle it
  }
}
