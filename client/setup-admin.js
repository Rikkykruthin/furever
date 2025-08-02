const { connectToDatabase } = require("./db/dbConfig");
const User = require("./db/schema/user.schema").default;
const bcrypt = require("bcryptjs");

const setupDefaultAdmin = async () => {
  try {
    console.log("🔧 Setting up default admin user...");
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: "admin@furever.com" },
        { name: "admin" },
        { role: "admin" }
      ]
    });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists. Updating credentials...");
      
      // Update existing admin with new credentials
      const hashedPassword = await bcrypt.hash("camberwell", 10);
      await User.findByIdAndUpdate(existingAdmin._id, {
        name: "admin",
        email: "admin@furever.com",
        password: hashedPassword,
        role: "admin",
        adminLevel: "super",
        updatedAt: new Date(),
      });
      
      console.log("✅ Admin user updated successfully!");
    } else {
      // Create new admin user
      console.log("🔧 Creating new admin user...");
      
      const hashedPassword = await bcrypt.hash("camberwell", 10);
      await User.create({
        name: "admin",
        email: "admin@furever.com",
        password: hashedPassword,
        role: "admin",
        adminLevel: "super",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log("✅ Admin user created successfully!");
    }
    
    console.log("📧 Email: admin@furever.com");
    console.log("👤 Username: admin");
    console.log("🔑 Password: camberwell");
    console.log("🔐 Role: admin");
    console.log("");
    console.log("ℹ️  You can now access admin features by navigating directly to /emergency/admin");
    console.log("ℹ️  Admin login is not available through the public login page");
    
  } catch (error) {
    console.error("❌ Error setting up admin:", error.message);
    if (error.code === 11000) {
      console.log("🔄 Attempting to update existing user...");
      
      try {
        const hashedPassword = await bcrypt.hash("camberwell", 10);
        await User.findOneAndUpdate(
          { $or: [{ email: "admin@furever.com" }, { name: "admin" }] },
          {
            name: "admin",
            email: "admin@furever.com",
            password: hashedPassword,
            role: "admin",
            adminLevel: "super",
            updatedAt: new Date(),
          },
          { upsert: true }
        );
        console.log("✅ Admin user updated successfully!");
      } catch (updateError) {
        console.error("❌ Failed to update admin:", updateError.message);
      }
    }
  } finally {
    process.exit(0);
  }
};

setupDefaultAdmin(); 