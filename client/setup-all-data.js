import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/dbConfig.js";

// Import schemas
import Vet from "./db/schema/vet.schema.js";
import Trainer from "./db/schema/trainer.schema.js";
import Groomer from "./db/schema/groomer.schema.js";

// Sample data
const sampleVets = [
  {
    name: "Sarah Johnson",
    email: "dr.sarah@furever.com",
    phone: "+1-555-0101",
    password: "password123",
    licenseNumber: "VET001USA",
    specializations: ["General Practice", "Canine", "Feline"],
    yearsOfExperience: 8,
    consultationFee: 45,
    bio: "Dr. Sarah Johnson is a passionate veterinarian with over 8 years of experience in small animal medicine. She specializes in preventive care, internal medicine, and has a special interest in canine and feline behavior.",
    location: {
      address: "123 Pet Care Avenue",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    languages: ["English", "Spanish"],
    consultationModes: ["video", "chat", "audio"],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "09:30", endTime: "10:00", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false },
          { startTime: "14:30", endTime: "15:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      wednesday: { isAvailable: false, slots: [] },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "11:30", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      saturday: { isAvailable: false, slots: [] },
      sunday: { isAvailable: false, slots: [] }
    },
    rating: { average: 4.8, totalReviews: 127 },
    stats: { totalConsultations: 340, totalPatients: 285, responseTime: 15, followUpRate: 89 },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "Michael Chen",
    email: "dr.chen@furever.com",
    phone: "+1-555-0102",
    password: "password123",
    licenseNumber: "VET002USA",
    specializations: ["Surgery", "Emergency Care", "Canine"],
    yearsOfExperience: 12,
    consultationFee: 65,
    bio: "Dr. Michael Chen is a board-certified veterinary surgeon with extensive experience in emergency and critical care. He has performed over 2,000 surgical procedures.",
    location: {
      address: "456 Surgical Center Blvd",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      zipCode: "90210"
    },
    languages: ["English", "Mandarin"],
    consultationModes: ["video", "audio"],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false }
        ]
      },
      wednesday: { isAvailable: false, slots: [] },
      thursday: { isAvailable: false, slots: [] },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false }
        ]
      },
      sunday: { isAvailable: false, slots: [] }
    },
    rating: { average: 4.9, totalReviews: 203 },
    stats: { totalConsultations: 567, totalPatients: 412, responseTime: 8, followUpRate: 95 },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  }
];

const sampleTrainers = [
  {
    name: "Alex Martinez",
    email: "alex.trainer@furever.com",
    phone: "+1-555-0201",
    password: "password123",
    certificationNumber: "CCPDT001",
    trainingSpecialties: ["Basic Obedience", "Puppy Training", "Leash Training"],
    yearsOfExperience: 5,
    sessionFee: 45,
    groupSessionFee: 30,
    bio: "Alex Martinez is a certified professional dog trainer with 5 years of experience helping dogs and their families build stronger relationships. Specializing in positive reinforcement techniques.",
    location: {
      address: "123 Training Lane",
      city: "Austin",
      state: "TX",
      country: "USA",
      zipCode: "78701"
    },
    languages: ["English", "Spanish"],
    trainingModes: ["video", "in_person"],
    petTypesSupported: ["Dog"],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      thursday: { isAvailable: false, slots: [] },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "11:00", endTime: "12:00", isBooked: false }
        ]
      },
      sunday: { isAvailable: false, slots: [] }
    },
    rating: { average: 4.7, totalReviews: 89 },
    stats: { totalSessions: 156, totalPets: 134, responseTime: 30, successRate: 92 },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "Sarah Thompson",
    email: "sarah.trainer@furever.com",
    phone: "+1-555-0202",
    password: "password123",
    certificationNumber: "CDBC002",
    trainingSpecialties: ["Behavioral Modification", "Aggression Training", "Anxiety Training"],
    yearsOfExperience: 8,
    sessionFee: 65,
    groupSessionFee: 45,
    bio: "Sarah Thompson is a Certified Dog Behavior Consultant with 8 years of experience specializing in complex behavioral issues. She has helped hundreds of dogs overcome aggression, anxiety, and fear-based behaviors.",
    location: {
      address: "456 Behavior Blvd",
      city: "Denver",
      state: "CO",
      country: "USA",
      zipCode: "80202"
    },
    languages: ["English"],
    trainingModes: ["video", "in_person"],
    petTypesSupported: ["Dog"],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
        ]
      },
      wednesday: { isAvailable: false, slots: [] },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false }
        ]
      },
      saturday: { isAvailable: false, slots: [] },
      sunday: { isAvailable: false, slots: [] }
    },
    rating: { average: 4.9, totalReviews: 127 },
    stats: { totalSessions: 298, totalPets: 201, responseTime: 15, successRate: 96 },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  }
];

const sampleGroomers = [
  {
    name: "Maria Gonzalez",
    email: "maria.groomer@furever.com",
    phone: "+1-555-0301",
    password: "password123",
    licenseNumber: "GROOM001USA",
    groomingSpecialties: ["Full Grooming", "Bath & Brush", "Nail Trimming", "De-shedding"],
    yearsOfExperience: 6,
    bio: "Maria Gonzalez is a professional pet groomer with 6 years of experience creating beautiful, comfortable styles for dogs and cats. She specializes in breed-specific cuts and has a gentle touch.",
    location: {
      address: "123 Grooming Grove",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      zipCode: "90210"
    },
    languages: ["English", "Spanish"],
    serviceTypes: ["in_salon"],
    petTypesSupported: ["Dog", "Cat"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)"],
    services: [
      {
        name: "Full Grooming Package",
        description: "Complete grooming with bath, cut, nails, and ears",
        duration: 120,
        basePrice: 65,
        prices: [
          { size: "Small", price: 65 },
          { size: "Medium", price: 85 },
          { size: "Large", price: 110 }
        ],
        isPopular: true
      }
    ],
    salon: {
      name: "Pawsome Salon",
      address: "123 Grooming Grove, Los Angeles, CA 90210",
      amenities: ["Air Conditioning", "Separate Cat Area", "Nail Trimming Station"],
      parkingAvailable: true
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "14:00", endTime: "16:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "14:00", endTime: "16:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "13:00", endTime: "15:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false }
        ]
      },
      sunday: { isAvailable: false, slots: [] }
    },
    rating: { average: 4.8, totalReviews: 156 },
    stats: { totalGroomings: 423, totalPets: 298, responseTime: 20, repeatCustomers: 78 },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "James Wilson",
    email: "james.groomer@furever.com",
    phone: "+1-555-0302",
    password: "password123",
    licenseNumber: "GROOM002USA",
    groomingSpecialties: ["Mobile Grooming", "Full Grooming", "Senior Pet Care", "Express Grooming"],
    yearsOfExperience: 8,
    bio: "James Wilson brings grooming directly to your doorstep with his fully-equipped mobile grooming van. With 8 years of experience, he specializes in stress-free grooming for pets who are anxious about salon visits.",
    location: {
      address: "456 Mobile Way",
      city: "Austin",
      state: "TX",
      country: "USA",
      zipCode: "78701"
    },
    languages: ["English"],
    serviceTypes: ["mobile"],
    travelRadius: 25,
    petTypesSupported: ["Dog", "Cat"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)", "Extra Large (100lbs+)"],
    services: [
      {
        name: "Mobile Full Service",
        description: "Complete grooming service at your location",
        duration: 150,
        basePrice: 85,
        prices: [
          { size: "Small", price: 85 },
          { size: "Medium", price: 110 },
          { size: "Large", price: 140 },
          { size: "Extra Large", price: 170 }
        ],
        isPopular: true
      }
    ],
    mobileService: {
      vehicleType: "Mercedes Sprinter Grooming Van",
      isFullyEquipped: true,
      waterSource: "Self-contained",
      powerSource: "Generator"
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:30", isBooked: false },
          { startTime: "14:00", endTime: "16:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:30", isBooked: false },
          { startTime: "15:00", endTime: "17:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:30", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "14:00", endTime: "16:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "13:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:30", isBooked: false },
          { startTime: "12:00", endTime: "14:30", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:30", isBooked: false }
        ]
      }
    },
    rating: { average: 4.9, totalReviews: 203 },
    stats: { totalGroomings: 567, totalPets: 378, responseTime: 15, repeatCustomers: 85 },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  }
];

async function setupAllData() {
  try {
    console.log("🚀 Starting comprehensive database setup...");
    await connectToDatabase();
    
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Vet.deleteMany({}),
      Trainer.deleteMany({}),
      Groomer.deleteMany({})
    ]);
    
    console.log("✅ Cleared all existing data");
    
    // Setup Vets
    console.log("\n👩‍⚕️ Creating sample veterinarians...");
    for (const vetData of sampleVets) {
      const hashedPassword = await bcrypt.hash(vetData.password, 12);
      vetData.password = hashedPassword;
      
      const vet = new Vet(vetData);
      await vet.save();
      console.log(`   ✓ Created vet: Dr. ${vetData.name}`);
    }
    
    // Setup Trainers
    console.log("\n🐕‍🦺 Creating sample trainers...");
    for (const trainerData of sampleTrainers) {
      const hashedPassword = await bcrypt.hash(trainerData.password, 12);
      trainerData.password = hashedPassword;
      
      const trainer = new Trainer(trainerData);
      await trainer.save();
      console.log(`   ✓ Created trainer: ${trainerData.name}`);
    }
    
    // Setup Groomers
    console.log("\n✂️ Creating sample groomers...");
    for (const groomerData of sampleGroomers) {
      const hashedPassword = await bcrypt.hash(groomerData.password, 12);
      groomerData.password = hashedPassword;
      
      const groomer = new Groomer(groomerData);
      await groomer.save();
      console.log(`   ✓ Created groomer: ${groomerData.name}`);
    }
    
    console.log("\n🎉 DATABASE SETUP COMPLETE!");
    console.log("=" * 50);
    console.log("\n📊 SUMMARY:");
    console.log(`   • ${sampleVets.length} Veterinarians created`);
    console.log(`   • ${sampleTrainers.length} Pet Trainers created`);
    console.log(`   • ${sampleGroomers.length} Pet Groomers created`);
    
    console.log("\n🔐 TEST CREDENTIALS:");
    console.log("   All accounts use password: password123");
    console.log("\n   Veterinarians:");
    sampleVets.forEach(vet => {
      console.log(`   📧 ${vet.email}`);
    });
    
    console.log("\n   Trainers:");
    sampleTrainers.forEach(trainer => {
      console.log(`   📧 ${trainer.email}`);
    });
    
    console.log("\n   Groomers:");
    sampleGroomers.forEach(groomer => {
      console.log(`   📧 ${groomer.email}`);
    });
    
    console.log("\n🌐 NEXT STEPS:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Visit http://localhost:3000/vet-consultation");
    console.log("   3. Visit http://localhost:3000/pet-training");
    console.log("   4. Visit http://localhost:3000/pet-grooming");
    console.log("   5. Test the search and filter functionality!");
    
  } catch (error) {
    console.error("❌ Error setting up data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
}

// Run the setup
setupAllData();