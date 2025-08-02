import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/dbConfig.js";
import Vet from "./db/schema/vet.schema.js";

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
    bio: "Dr. Sarah Johnson is a passionate veterinarian with over 8 years of experience in small animal medicine. She specializes in preventive care, internal medicine, and has a special interest in canine and feline behavior. Dr. Johnson graduated from Cornell University College of Veterinary Medicine and is dedicated to providing compassionate care for pets and their families.",
    location: {
      address: "123 Pet Care Avenue",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    languages: ["English", "Spanish"],
    consultationModes: ["video", "chat", "audio"],
    degrees: [
      {
        degree: "Doctor of Veterinary Medicine",
        institution: "Cornell University College of Veterinary Medicine",
        year: 2016
      }
    ],
    certifications: [
      {
        certification: "Fear Free Certified Professional",
        issuingBody: "Fear Free",
        year: 2019
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "09:30", endTime: "10:00", isBooked: false },
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false },
          { startTime: "14:30", endTime: "15:00", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "10:30", endTime: "11:00", isBooked: false },
          { startTime: "11:00", endTime: "11:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false },
          { startTime: "15:30", endTime: "16:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "09:30", endTime: "10:00", isBooked: false },
          { startTime: "13:00", endTime: "13:30", isBooked: false },
          { startTime: "13:30", endTime: "14:00", isBooked: false },
          { startTime: "16:00", endTime: "16:30", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "11:30", isBooked: false },
          { startTime: "11:30", endTime: "12:00", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false },
          { startTime: "14:30", endTime: "15:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false },
          { startTime: "15:30", endTime: "16:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: false,
        slots: []
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.8,
      totalReviews: 127
    },
    stats: {
      totalConsultations: 340,
      totalPatients: 285,
      responseTime: 15,
      followUpRate: 89
    },
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
    bio: "Dr. Michael Chen is a board-certified veterinary surgeon with extensive experience in emergency and critical care. He has performed over 2,000 surgical procedures and specializes in orthopedic surgery and soft tissue surgery. Dr. Chen is known for his calm demeanor during emergencies and his commitment to providing the highest quality surgical care.",
    location: {
      address: "456 Surgical Center Blvd",
      city: "Los Angeles",
      state: "CA", 
      country: "USA",
      zipCode: "90210"
    },
    languages: ["English", "Mandarin"],
    consultationModes: ["video", "audio"],
    degrees: [
      {
        degree: "Doctor of Veterinary Medicine",
        institution: "UC Davis School of Veterinary Medicine",
        year: 2012
      },
      {
        degree: "Master of Veterinary Surgery",
        institution: "UC Davis",
        year: 2015
      }
    ],
    certifications: [
      {
        certification: "Diplomate, American College of Veterinary Surgeons",
        issuingBody: "ACVS",
        year: 2017
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "08:30", endTime: "09:00", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false },
          { startTime: "17:30", endTime: "18:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false },
          { startTime: "18:00", endTime: "18:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "07:30", endTime: "08:00", isBooked: false },
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:30", endTime: "18:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "09:30", endTime: "10:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.9,
      totalReviews: 203
    },
    stats: {
      totalConsultations: 567,
      totalPatients: 412,
      responseTime: 8,
      followUpRate: 95
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Emily Rodriguez",
    email: "dr.emily@furever.com",
    phone: "+1-555-0103", 
    password: "password123",
    licenseNumber: "VET003USA",
    specializations: ["Exotic Pets", "Bird", "Reptile"],
    yearsOfExperience: 6,
    consultationFee: 55,
    bio: "Dr. Emily Rodriguez is a specialist in exotic pet medicine with a focus on avian and reptile care. She has extensive experience treating birds, reptiles, small mammals, and other exotic pets. Dr. Rodriguez is passionate about educating pet owners on proper exotic pet care and nutrition.",
    location: {
      address: "789 Exotic Pet Lane",
      city: "Miami",
      state: "FL",
      country: "USA", 
      zipCode: "33101"
    },
    languages: ["English", "Spanish", "Portuguese"],
    consultationModes: ["video", "chat"],
    degrees: [
      {
        degree: "Doctor of Veterinary Medicine",
        institution: "University of Florida College of Veterinary Medicine",
        year: 2018
      }
    ],
    certifications: [
      {
        certification: "Certified Avian Veterinarian",
        issuingBody: "Association of Avian Veterinarians",
        year: 2020
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "10:30", endTime: "11:00", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false },
          { startTime: "14:30", endTime: "15:00", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "13:00", endTime: "13:30", isBooked: false },
          { startTime: "16:00", endTime: "16:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "11:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false },
          { startTime: "15:30", endTime: "16:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "13:00", endTime: "13:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: false,
        slots: []
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.7,
      totalReviews: 89
    },
    stats: {
      totalConsultations: 234,
      totalPatients: 198,
      responseTime: 12,
      followUpRate: 91
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "David Thompson",
    email: "dr.david@furever.com",
    phone: "+1-555-0104",
    password: "password123", 
    licenseNumber: "VET004USA",
    specializations: ["Livestock", "Large Animals", "General Practice"],
    yearsOfExperience: 15,
    consultationFee: 40,
    bio: "Dr. David Thompson brings 15 years of experience in large animal and livestock veterinary medicine. He specializes in cattle, horses, sheep, and goats, providing both routine care and emergency services. Dr. Thompson is known for his practical approach and deep understanding of agricultural veterinary needs.",
    location: {
      address: "321 Ranch Road",
      city: "Austin",
      state: "TX",
      country: "USA",
      zipCode: "73301"
    },
    languages: ["English"],
    consultationModes: ["video", "audio", "chat"],
    degrees: [
      {
        degree: "Doctor of Veterinary Medicine",
        institution: "Texas A&M University College of Veterinary Medicine",
        year: 2009
      }
    ],
    certifications: [
      {
        certification: "Large Animal Emergency Medicine Certification",
        issuingBody: "American Association of Bovine Practitioners",
        year: 2012
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "06:00", endTime: "06:30", isBooked: false },
          { startTime: "06:30", endTime: "07:00", isBooked: false },
          { startTime: "18:00", endTime: "18:30", isBooked: false },
          { startTime: "18:30", endTime: "19:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "06:00", endTime: "06:30", isBooked: false },
          { startTime: "18:00", endTime: "18:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "06:00", endTime: "06:30", isBooked: false },
          { startTime: "18:30", endTime: "19:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "06:30", endTime: "07:00", isBooked: false },
          { startTime: "18:00", endTime: "18:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "06:00", endTime: "06:30", isBooked: false },
          { startTime: "18:00", endTime: "18:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "08:30", endTime: "09:00", isBooked: false },
          { startTime: "09:00", endTime: "09:30", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "08:30", isBooked: false },
          { startTime: "17:00", endTime: "17:30", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.6,
      totalReviews: 156
    },
    stats: {
      totalConsultations: 445,
      totalPatients: 312,
      responseTime: 20,
      followUpRate: 87
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Lisa Park",
    email: "dr.lisa@furever.com",
    phone: "+1-555-0105",
    password: "password123",
    licenseNumber: "VET005USA",
    specializations: ["Dermatology", "Feline", "Canine"],
    yearsOfExperience: 10,
    consultationFee: 50,
    bio: "Dr. Lisa Park is a veterinary dermatologist with a decade of experience treating skin conditions in dogs and cats. She specializes in allergies, autoimmune skin diseases, and chronic dermatological conditions. Dr. Park takes a holistic approach to skin health, considering nutrition, environment, and underlying health factors.",
    location: {
      address: "567 Dermatology Drive",
      city: "Seattle",
      state: "WA",
      country: "USA",
      zipCode: "98101"
    },
    languages: ["English", "Korean"],
    consultationModes: ["video", "chat"],
    degrees: [
      {
        degree: "Doctor of Veterinary Medicine", 
        institution: "Washington State University College of Veterinary Medicine",
        year: 2014
      }
    ],
    certifications: [
      {
        certification: "Diplomate, American College of Veterinary Dermatology",
        issuingBody: "ACVD",
        year: 2018
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "11:30", isBooked: false },
          { startTime: "11:30", endTime: "12:00", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "14:00", endTime: "14:30", isBooked: false },
          { startTime: "16:00", endTime: "16:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: false,
        slots: []
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "09:30", isBooked: false },
          { startTime: "13:00", endTime: "13:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "10:30", isBooked: false },
          { startTime: "15:00", endTime: "15:30", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: false,
        slots: []
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.8,
      totalReviews: 112
    },
    stats: {
      totalConsultations: 298,
      totalPatients: 264,
      responseTime: 10,
      followUpRate: 93
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  }
];

async function setupVets() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    
    console.log("Clearing existing vets...");
    await Vet.deleteMany({});
    
    console.log("Creating sample vets...");
    
    for (const vetData of sampleVets) {
      // Hash password
      const hashedPassword = await bcrypt.hash(vetData.password, 12);
      vetData.password = hashedPassword;
      
      // Create vet
      const vet = new Vet(vetData);
      await vet.save();
      
      console.log(`Created vet: Dr. ${vetData.name}`);
    }
    
    console.log(`Successfully created ${sampleVets.length} sample vets!`);
    console.log("\nVet credentials for testing:");
    sampleVets.forEach(vet => {
      console.log(`Email: ${vet.email} | Password: password123`);
    });
    
  } catch (error) {
    console.error("Error setting up vets:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Run the setup
setupVets(); 