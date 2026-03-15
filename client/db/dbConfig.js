import "dotenv/config";
import mongoose from "mongoose";

// Configure Mongoose for serverless environments
mongoose.set('bufferCommands', false); // Disable mongoose buffering

// Connection state management for serverless environments
let isConnecting = false;
let connectionPromise = null;

export async function connectToDatabase() {
  try {
    // Runtime check for MONGO_URI
    if (!process.env.MONGO_URI) {
      const error = new Error("MONGO_URI environment variable is required");
      error.name = "ConfigurationError";
      throw error;
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return { database: mongoose.connection.db };
    }

    // Check if connection is in progress (prevent multiple simultaneous connections)
    if (isConnecting && connectionPromise) {
      return await connectionPromise;
    }

    // Check if connection is connecting (state 2)
    if (mongoose.connection.readyState === 2) {
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        mongoose.connection.once('connected', () => {
          resolve({ database: mongoose.connection.db });
        });
        mongoose.connection.once('error', reject);
      });
    }

    // Start new connection attempt
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        // Connection options optimized for serverless/Vercel
        const connectionOptions = {
          serverSelectionTimeoutMS: 15000, // Increased timeout for Vercel
          socketTimeoutMS: 45000,
          maxPoolSize: 1, // Reduced for serverless (each function gets its own connection)
          minPoolSize: 0, // Allow connection pool to close
          retryWrites: true,
          w: 'majority',
          retryReads: true,
          // Handle connection errors gracefully
          connectTimeoutMS: 15000,
        };

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, connectionOptions);
        
        console.log("✅ Connected to MongoDB successfully!");
        
        // Set up connection event handlers (only once)
        if (!mongoose.connection.listeners('error').length) {
          mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnecting = false;
            connectionPromise = null;
          });

          mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
            isConnecting = false;
            connectionPromise = null;
          });

          mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
          });
        }

        isConnecting = false;
        connectionPromise = null;
        return { database: mongoose.connection.db };
      } catch (connectError) {
        isConnecting = false;
        connectionPromise = null;
        throw connectError;
      }
    })();

    return await connectionPromise;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    
    // Enhanced error handling with specific messages
    console.error("❌ MongoDB connection failed!");
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    
    if (error.name === 'ConfigurationError') {
      console.error("\n🔧 Configuration Error:");
      console.error("   MONGO_URI environment variable is not set!");
      console.error("   For Vercel: Go to Settings → Environment Variables → Add MONGO_URI");
      throw error;
    }
    
    if (error.name === 'MongoServerError') {
      if (error.code === 8000 || error.codeName === 'AtlasError') {
        console.error("\n🔐 Authentication Error:");
        console.error("   - Check MongoDB username and password in MONGO_URI");
        console.error("   - URL-encode special characters in password (!@#$%^&*)");
        console.error("   - Verify database user exists in MongoDB Atlas → Database Access");
        console.error("   - Format: mongodb+srv://username:password@cluster.mongodb.net/database");
      } else {
        console.error("\n🔐 MongoDB Server Error:");
        console.error(`   Code: ${error.code}, CodeName: ${error.codeName}`);
        console.error(`   Message: ${error.message}`);
      }
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error("\n🌐 Network/Connection Error:");
      console.error("   This usually means your IP address is NOT whitelisted in MongoDB Atlas");
      console.error("\n📋 CRITICAL FIX FOR VERCEL:");
      console.error("   1. Go to https://cloud.mongodb.com/");
      console.error("   2. Select your project/cluster");
      console.error("   3. Click 'Network Access' in left sidebar");
      console.error("   4. Click 'Add IP Address' button");
      console.error("   5. Enter '0.0.0.0/0' (allows all IPs)");
      console.error("   6. Add comment: 'Allow Vercel deployments'");
      console.error("   7. Click 'Confirm'");
      console.error("   8. Wait 1-2 minutes for changes to take effect");
      console.error("   9. Redeploy your Vercel application");
    } else {
      console.error("\n❌ Unexpected Error:");
      console.error(`   Type: ${error.name}`);
      console.error(`   Message: ${error.message}`);
    }
    
    console.error("\n💡 Additional Troubleshooting:");
    console.error("   1. Verify MONGO_URI is set in Vercel Environment Variables");
    console.error("   2. Check MongoDB Atlas cluster is running (not paused)");
    console.error("   3. Test connection string in MongoDB Compass");
    console.error("   4. Check Vercel function logs for detailed error messages");
    
    throw error;
  }
}
