/**
 * MongoDB Connection Test Script
 * 
 * This script helps diagnose MongoDB connection issues
 * 
 * Usage: node scripts/test-mongodb-connection.js
 */

import "dotenv/config";
import mongoose from "mongoose";

// URL encode password helper
function encodePassword(password) {
  return encodeURIComponent(password);
}

// Test MongoDB connection
async function testConnection() {
  console.log("🔍 Testing MongoDB Connection...\n");

  // Check if MONGO_URI is set
  if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set!");
    console.log("\n💡 Solution:");
    console.log("   1. Create a .env.local file in the client folder");
    console.log("   2. Add: MONGO_URI=your_connection_string");
    process.exit(1);
  }

  console.log("✅ MONGO_URI is set");
  
  // Check connection string format
  const uri = process.env.MONGO_URI;
  console.log("\n📋 Connection String Analysis:");
  
  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    console.error("❌ Invalid connection string format!");
    console.log("   Should start with: mongodb+srv:// or mongodb://");
    process.exit(1);
  }
  
  if (uri.includes("<password>") || uri.includes("<username>")) {
    console.error("❌ Connection string contains placeholders!");
    console.log("   Replace <username> and <password> with actual values");
    process.exit(1);
  }
  
  // Extract username from connection string (if possible)
  try {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    if (match) {
      const username = match[1];
      const password = match[2];
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password.length > 0 ? "***" + password.slice(-3) : "NOT SET"}`);
      
      // Check if password might need encoding
      if (password.includes("!") || password.includes("@") || password.includes("#") || 
          password.includes("$") || password.includes("%") || password.includes("&")) {
        console.log("\n⚠️  WARNING: Password contains special characters!");
        console.log("   These may need to be URL-encoded:");
        console.log(`   Current: ${password}`);
        console.log(`   Encoded: ${encodePassword(password)}`);
        console.log("\n   If connection fails, try using the encoded version.");
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  console.log("\n🔄 Attempting to connect...");

  try {
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, connectionOptions);
    console.log("✅ SUCCESS: Connected to MongoDB!");
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log("   Collections:", collections.map(c => c.name).join(", "));
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!\n");
    
    if (error.name === 'MongoServerError') {
      if (error.code === 8000 || error.codeName === 'AtlasError') {
        console.error("🔐 Authentication Error (Code: 8000)");
        console.error("\nPossible causes:");
        console.error("   1. Incorrect username or password");
        console.error("   2. Password contains special characters that need URL-encoding");
        console.error("   3. Database user doesn't exist in MongoDB Atlas");
        console.error("   4. IP address not whitelisted");
        console.error("\nSolutions:");
        console.error("   1. Go to MongoDB Atlas → Database Access");
        console.error("   2. Verify username and reset password if needed");
        console.error("   3. URL-encode special characters in password:");
        console.error("      ! → %21, @ → %40, # → %23, $ → %24");
        console.error("      % → %25, ^ → %5E, & → %26, * → %2A");
        console.error("   4. Go to MongoDB Atlas → Network Access");
        console.error("   5. Add your IP address or 0.0.0.0/0 (for development)");
      } else {
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Error Name: ${error.codeName}`);
        console.error(`   Message: ${error.message}`);
      }
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error("🌐 Network/Connection Error");
      console.error("\nPossible causes:");
      console.error("   1. Internet connection issue");
      console.error("   2. MongoDB Atlas cluster is down");
      console.error("   3. IP address not whitelisted");
      console.error("   4. Firewall blocking connection");
      console.error("\nSolutions:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MongoDB Atlas cluster status");
      console.error("   3. Add IP to whitelist: MongoDB Atlas → Network Access");
    } else {
      console.error(`   Error Type: ${error.name}`);
      console.error(`   Message: ${error.message}`);
    }
    
    console.error("\n📖 For more help, see: MONGODB_TROUBLESHOOTING.md");
    process.exit(1);
  }
}

testConnection();

