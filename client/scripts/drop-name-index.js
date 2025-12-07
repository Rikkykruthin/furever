/**
 * Script to drop the unique index on the 'name' field in the users collection
 * Run this once to fix the duplicate key error for Google OAuth
 * 
 * Usage: node scripts/drop-name-index.js
 */

import mongoose from "mongoose";
import { connectToDatabase } from "../db/dbConfig.js";

async function dropNameIndex() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    // Check if name_1 index exists
    const nameIndex = indexes.find(index => index.name === "name_1");
    
    if (nameIndex) {
      console.log("Found unique index on 'name' field. Dropping it...");
      await collection.dropIndex("name_1");
      console.log("✅ Successfully dropped the unique index on 'name' field");
    } else {
      console.log("ℹ️  No unique index found on 'name' field. Nothing to drop.");
    }

    // Verify indexes after drop
    const updatedIndexes = await collection.indexes();
    console.log("Updated indexes:", updatedIndexes);

    process.exit(0);
  } catch (error) {
    console.error("Error dropping index:", error);
    process.exit(1);
  }
}

dropNameIndex();

