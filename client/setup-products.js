import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/dbConfig.js";

// Import schemas
import User from "./db/schema/user.schema.js";
import Product from "./db/schema/product.schema.js";

// Sample seller users
const sampleSellers = [
  {
    name: "PawPerfect Store",
    email: "pawperfect@furever.com",
    password: "password123",
    role: "seller",
    storeName: "PawPerfect Pet Supplies",
    bio: "Your one-stop shop for premium pet food and treats.",
    profilePicture: "/default-avatar.svg"
  },
  {
    name: "ToyTown Pets",
    email: "toytown@furever.com",
    password: "password123",
    role: "seller",
    storeName: "ToyTown Pet Emporium",
    bio: "Best selection of pet toys and accessories for every furry friend.",
    profilePicture: "/default-avatar-2.svg"
  },
  {
    name: "HealthyPaws",
    email: "healthypaws@furever.com",
    password: "password123",
    role: "seller",
    storeName: "HealthyPaws Wellness",
    bio: "Premium health products and supplements for pets.",
    profilePicture: "/default-avatar-3.svg"
  }
];

// Sample products with realistic pet store items
const sampleProducts = [
  // Dog Food & Treats
  {
    name: "Premium Chicken & Rice Dog Food",
    description: "High-quality dry dog food made with real chicken and brown rice. Perfect for adult dogs of all sizes. Rich in protein and essential nutrients for optimal health.",
    images: ["/product-images/dog-food-1.jpg", "/product-images/dog-food-1-2.jpg"],
    price: 45.99,
    quantity: 50,
    discount: 10,
    rating: 4.8,
    category: "Dog Food",
    tags: ["chicken", "rice", "dry food", "adult dogs", "premium", "protein"]
  },
  {
    name: "Grain-Free Salmon Dog Treats",
    description: "Delicious grain-free salmon treats perfect for training and rewards. Made with wild-caught salmon and no artificial preservatives.",
    images: ["/product-images/dog-treats-1.jpg"],
    price: 12.99,
    quantity: 100,
    discount: 0,
    rating: 4.6,
    category: "Dog Treats",
    tags: ["salmon", "grain-free", "training treats", "natural", "no preservatives"]
  },
  {
    name: "Puppy Growth Formula",
    description: "Specially formulated dry food for growing puppies. Contains DHA for brain development and calcium for strong bones.",
    images: ["/product-images/puppy-food-1.jpg", "/product-images/puppy-food-1-2.jpg"],
    price: 38.99,
    quantity: 30,
    discount: 15,
    rating: 4.9,
    category: "Dog Food",
    tags: ["puppy", "growth formula", "DHA", "calcium", "brain development"]
  },

  // Cat Food & Treats
  {
    name: "Indoor Cat Formula",
    description: "Specially designed for indoor cats with reduced calories and hairball control. Made with real chicken and vegetables.",
    images: ["/product-images/cat-food-1.jpg"],
    price: 32.99,
    quantity: 40,
    discount: 5,
    rating: 4.7,
    category: "Cat Food",
    tags: ["indoor cats", "hairball control", "chicken", "reduced calories"]
  },
  {
    name: "Freeze-Dried Tuna Cat Treats",
    description: "Pure freeze-dried tuna treats with no additives. Perfect for cats who love fish and need a healthy snack.",
    images: ["/product-images/cat-treats-1.jpg"],
    price: 8.99,
    quantity: 75,
    discount: 0,
    rating: 4.5,
    category: "Cat Treats",
    tags: ["tuna", "freeze-dried", "no additives", "fish", "healthy snack"]
  },

  // Dog Toys
  {
    name: "Interactive Puzzle Feeder",
    description: "Mental stimulation puzzle feeder that slows down eating and engages your dog's mind. Great for reducing boredom and anxiety.",
    images: ["/product-images/puzzle-feeder-1.jpg", "/product-images/puzzle-feeder-1-2.jpg"],
    price: 24.99,
    quantity: 25,
    discount: 20,
    rating: 4.4,
    category: "Dog Toys",
    tags: ["puzzle", "mental stimulation", "slow feeder", "interactive", "anxiety relief"]
  },
  {
    name: "Rope Tug Toy",
    description: "Durable cotton rope toy perfect for tug-of-war and dental health. Helps clean teeth and gums during play.",
    images: ["/product-images/rope-toy-1.jpg"],
    price: 9.99,
    quantity: 60,
    discount: 0,
    rating: 4.3,
    category: "Dog Toys",
    tags: ["rope", "tug toy", "dental health", "cotton", "durable"]
  },
  {
    name: "Squeaky Duck Toy",
    description: "Classic rubber duck toy with squeaker. Perfect size for medium to large dogs. Non-toxic and durable.",
    images: ["/product-images/squeaky-duck-1.jpg"],
    price: 7.99,
    quantity: 80,
    discount: 0,
    rating: 4.2,
    category: "Dog Toys",
    tags: ["squeaky", "rubber", "duck", "medium dogs", "large dogs", "non-toxic"]
  },

  // Cat Toys
  {
    name: "Feather Wand Toy",
    description: "Interactive feather wand that triggers your cat's hunting instincts. Extendable wand with replaceable feathers.",
    images: ["/product-images/feather-wand-1.jpg"],
    price: 11.99,
    quantity: 45,
    discount: 0,
    rating: 4.6,
    category: "Cat Toys",
    tags: ["feather", "wand", "interactive", "hunting instincts", "extendable"]
  },
  {
    name: "Catnip Mouse Set",
    description: "Set of 3 soft catnip-filled mice toys. Made with organic catnip to drive cats wild with excitement.",
    images: ["/product-images/catnip-mice-1.jpg"],
    price: 6.99,
    quantity: 90,
    discount: 0,
    rating: 4.4,
    category: "Cat Toys",
    tags: ["catnip", "mice", "soft toys", "organic", "set of 3"]
  },

  // Pet Accessories
  {
    name: "Adjustable Dog Collar",
    description: "Comfortable nylon collar with quick-release buckle. Adjustable sizing and reflective stitching for safety.",
    images: ["/product-images/dog-collar-1.jpg", "/product-images/dog-collar-1-2.jpg"],
    price: 15.99,
    quantity: 35,
    discount: 0,
    rating: 4.5,
    category: "Dog Accessories",
    tags: ["collar", "adjustable", "nylon", "quick-release", "reflective", "safety"]
  },
  {
    name: "Retractable Dog Leash",
    description: "16-foot retractable leash with comfortable grip handle. Perfect for dogs up to 50 lbs with one-button brake system.",
    images: ["/product-images/retractable-leash-1.jpg"],
    price: 22.99,
    quantity: 20,
    discount: 0,
    rating: 4.3,
    category: "Dog Accessories",
    tags: ["leash", "retractable", "16 foot", "comfortable grip", "brake system"]
  },
  {
    name: "Self-Cleaning Cat Litter Box",
    description: "Automatic self-cleaning litter box with odor control. Makes cat care easier with minimal maintenance required.",
    images: ["/product-images/litter-box-1.jpg", "/product-images/litter-box-1-2.jpg"],
    price: 89.99,
    quantity: 10,
    discount: 25,
    rating: 4.1,
    category: "Cat Accessories",
    tags: ["litter box", "self-cleaning", "automatic", "odor control", "low maintenance"]
  },

  // Health & Wellness
  {
    name: "Joint Support Supplement",
    description: "Glucosamine and chondroitin supplement for dogs. Supports joint health and mobility in aging pets.",
    images: ["/product-images/joint-supplement-1.jpg"],
    price: 29.99,
    quantity: 40,
    discount: 0,
    rating: 4.7,
    category: "Health & Wellness",
    tags: ["supplement", "joint support", "glucosamine", "chondroitin", "mobility", "aging pets"]
  },
  {
    name: "Omega-3 Fish Oil for Pets",
    description: "Pure fish oil supplement rich in omega-3 fatty acids. Promotes healthy skin, coat, and brain function.",
    images: ["/product-images/fish-oil-1.jpg"],
    price: 19.99,
    quantity: 55,
    discount: 10,
    rating: 4.6,
    category: "Health & Wellness",
    tags: ["fish oil", "omega-3", "healthy skin", "coat health", "brain function"]
  },

  // Pet Beds & Comfort
  {
    name: "Memory Foam Dog Bed",
    description: "Orthopedic memory foam bed with removable washable cover. Perfect for senior dogs or those with joint issues.",
    images: ["/product-images/memory-foam-bed-1.jpg", "/product-images/memory-foam-bed-1-2.jpg"],
    price: 65.99,
    quantity: 15,
    discount: 15,
    rating: 4.8,
    category: "Pet Beds",
    tags: ["memory foam", "orthopedic", "washable cover", "senior dogs", "joint support"]
  },
  {
    name: "Heated Cat Bed",
    description: "Self-warming cat bed that reflects your cat's body heat. Ultra-soft faux fur surface for maximum comfort.",
    images: ["/product-images/heated-cat-bed-1.jpg"],
    price: 34.99,
    quantity: 25,
    discount: 0,
    rating: 4.5,
    category: "Pet Beds",
    tags: ["heated", "self-warming", "faux fur", "comfort", "reflects body heat"]
  },

  // Bird & Small Pet Supplies
  {
    name: "Premium Bird Seed Mix",
    description: "Nutritious seed blend for songbirds and parakeets. Contains sunflower seeds, millet, and safflower seeds.",
    images: ["/product-images/bird-seed-1.jpg"],
    price: 16.99,
    quantity: 30,
    discount: 0,
    rating: 4.4,
    category: "Bird Supplies",
    tags: ["bird seed", "songbirds", "parakeets", "sunflower seeds", "millet", "nutritious"]
  },
  {
    name: "Small Pet Bedding",
    description: "Ultra-absorbent paper bedding for hamsters, guinea pigs, and rabbits. Dust-free and odor-controlling.",
    images: ["/product-images/small-pet-bedding-1.jpg"],
    price: 12.99,
    quantity: 50,
    discount: 0,
    rating: 4.3,
    category: "Small Pet Supplies",
    tags: ["bedding", "hamsters", "guinea pigs", "rabbits", "absorbent", "dust-free", "odor control"]
  },

  // Grooming Supplies
  {
    name: "Professional Dog Grooming Kit",
    description: "Complete grooming kit with clippers, scissors, nail trimmer, and brushes. Everything you need for at-home grooming.",
    images: ["/product-images/grooming-kit-1.jpg", "/product-images/grooming-kit-1-2.jpg"],
    price: 78.99,
    quantity: 12,
    discount: 30,
    rating: 4.7,
    category: "Grooming Supplies",
    tags: ["grooming kit", "clippers", "scissors", "nail trimmer", "brushes", "professional"]
  },
  {
    name: "De-shedding Brush",
    description: "Professional de-shedding tool that reduces shedding by up to 90%. Safe and gentle for regular use.",
    images: ["/product-images/deshedding-brush-1.jpg"],
    price: 25.99,
    quantity: 40,
    discount: 0,
    rating: 4.6,
    category: "Grooming Supplies",
    tags: ["de-shedding", "brush", "reduces shedding", "professional", "gentle", "safe"]
  }
];

async function setupProducts() {
  try {
    console.log("🛍️ Starting pet store database setup...");
    await connectToDatabase();
    
    // Clear existing data
    console.log("🧹 Clearing existing products and sellers...");
    await Product.deleteMany({});
    await User.deleteMany({ role: "seller" });
    
    console.log("✅ Cleared existing store data");
    
    // Create seller users
    console.log("\n👨‍💼 Creating sample sellers...");
    const createdSellers = [];
    
    for (const sellerData of sampleSellers) {
      const hashedPassword = await bcrypt.hash(sellerData.password, 12);
      sellerData.password = hashedPassword;
      
      const seller = new User(sellerData);
      await seller.save();
      createdSellers.push(seller);
      
      console.log(`   ✓ Created seller: ${sellerData.storeName}`);
    }
    
    // Create products
    console.log("\n🛒 Creating sample products...");
    let productIndex = 0;
    
    for (const productData of sampleProducts) {
      // Assign products to sellers in rotation
      const sellerIndex = productIndex % createdSellers.length;
      productData.owner = createdSellers[sellerIndex]._id;
      
      const product = new Product(productData);
      await product.save();
      
      console.log(`   ✓ Created product: ${productData.name} (owned by ${createdSellers[sellerIndex].storeName})`);
      productIndex++;
    }
    
    console.log("\n🎉 PET STORE SETUP COMPLETE!");
    console.log("=" .repeat(50));
    console.log("\n📊 SUMMARY:");
    console.log(`   • ${createdSellers.length} Sellers created`);
    console.log(`   • ${sampleProducts.length} Products created`);
    
    console.log("\n🔐 SELLER CREDENTIALS:");
    console.log("   All accounts use password: password123");
    console.log("\n   Sellers:");
    sampleSellers.forEach(seller => {
      console.log(`   📧 ${seller.email} (${seller.storeName})`);
    });
    
    console.log("\n📦 PRODUCT CATEGORIES:");
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    categories.forEach(category => {
      const count = sampleProducts.filter(p => p.category === category).length;
      console.log(`   • ${category}: ${count} products`);
    });
    
    console.log("\n🌐 NEXT STEPS:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Visit http://localhost:3000/store");
    console.log("   3. Browse products, add to cart, and test checkout!");
    console.log("   4. Test seller login and dashboard functionality");
    
  } catch (error) {
    console.error("❌ Error setting up pet store:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
}

// Run the setup
setupProducts();