import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/dbConfig.js";
import Trainer from "./db/schema/trainer.schema.js";

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
    bio: "Alex Martinez is a certified professional dog trainer with 5 years of experience helping dogs and their families build stronger relationships. Specializing in positive reinforcement techniques, Alex has a particular passion for working with puppies and first-time dog owners. Alex graduated from the Karen Pryor Academy and believes that training should be fun for both pets and their humans.",
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
    certifications: [
      {
        certification: "Certified Professional Dog Trainer",
        issuingBody: "CCPDT",
        year: 2019
      }
    ],
    trainingPrograms: [
      {
        name: "Puppy Foundations",
        description: "Essential skills for puppies 8-16 weeks",
        duration: 6,
        sessionsPerWeek: 1,
        totalSessions: 6,
        price: 270,
        level: "Beginner"
      },
      {
        name: "Basic Manners",
        description: "Sit, stay, come, and leash walking",
        duration: 4,
        sessionsPerWeek: 1,
        totalSessions: 4,
        price: 180,
        level: "Beginner"
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "11:00", endTime: "12:00", isBooked: false }
        ]
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
      totalSessions: 156,
      totalPets: 134,
      responseTime: 30,
      successRate: 92
    },
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
    bio: "Sarah Thompson is a Certified Dog Behavior Consultant with 8 years of experience specializing in complex behavioral issues. She has helped hundreds of dogs overcome aggression, anxiety, and fear-based behaviors using science-based, force-free methods. Sarah holds a degree in Animal Behavior and is passionate about helping reactive dogs live happier, more confident lives.",
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
    certifications: [
      {
        certification: "Certified Dog Behavior Consultant",
        issuingBody: "IAABC",
        year: 2016
      },
      {
        certification: "Fear Free Certified Professional",
        issuingBody: "Fear Free",
        year: 2018
      }
    ],
    trainingPrograms: [
      {
        name: "Reactive Dog Rehabilitation",
        description: "Comprehensive program for leash reactive dogs",
        duration: 12,
        sessionsPerWeek: 1,
        totalSessions: 12,
        price: 780,
        level: "Advanced"
      },
      {
        name: "Anxiety Relief Program",
        description: "Help anxious dogs build confidence",
        duration: 8,
        sessionsPerWeek: 1,
        totalSessions: 8,
        price: 520,
        level: "Intermediate"
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false },
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
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
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
      average: 4.9,
      totalReviews: 127
    },
    stats: {
      totalSessions: 298,
      totalPets: 201,
      responseTime: 15,
      successRate: 96
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Michael Chen",
    email: "michael.trainer@furever.com",
    phone: "+1-555-0203",
    password: "password123",
    certificationNumber: "NACSW003",
    trainingSpecialties: ["Advanced Obedience", "Agility Training", "Trick Training"],
    yearsOfExperience: 10,
    sessionFee: 55,
    groupSessionFee: 40,
    bio: "Michael Chen is a professional dog trainer with over 10 years of experience in competitive dog sports. He specializes in advanced obedience, agility, and trick training. Michael has trained multiple dogs to championship levels and enjoys helping pet owners unlock their dogs' potential through fun, challenging training exercises.",
    location: {
      address: "789 Agility Avenue",
      city: "Portland",
      state: "OR",
      country: "USA",
      zipCode: "97201"
    },
    languages: ["English", "Mandarin"],
    trainingModes: ["video", "in_person", "group_video"],
    petTypesSupported: ["Dog"],
    certifications: [
      {
        certification: "Canine Scent Work Instructor",
        issuingBody: "NACSW",
        year: 2015
      },
      {
        certification: "AKC CGC Evaluator",
        issuingBody: "American Kennel Club",
        year: 2017
      }
    ],
    trainingPrograms: [
      {
        name: "Agility Foundations",
        description: "Introduction to agility obstacles and handling",
        duration: 8,
        sessionsPerWeek: 1,
        totalSessions: 8,
        price: 440,
        level: "Intermediate"
      },
      {
        name: "Trick Training Mastery",
        description: "Fun tricks and advanced commands",
        duration: 6,
        sessionsPerWeek: 1,
        totalSessions: 6,
        price: 330,
        level: "Intermediate"
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false },
          { startTime: "19:00", endTime: "20:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.8,
      totalReviews: 156
    },
    stats: {
      totalSessions: 423,
      totalPets: 287,
      responseTime: 20,
      successRate: 94
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "Jessica Rodriguez",
    email: "jessica.trainer@furever.com",
    phone: "+1-555-0204",
    password: "password123",
    certificationNumber: "KPA004",
    trainingSpecialties: ["Clicker Training", "Service Dog Training", "Therapy Dog Training"],
    yearsOfExperience: 7,
    sessionFee: 60,
    groupSessionFee: 42,
    bio: "Jessica Rodriguez is a Karen Pryor Academy certified clicker trainer with 7 years of experience in positive reinforcement training. She specializes in service dog training and therapy dog preparation. Jessica is passionate about the human-animal bond and helps dogs develop the skills they need to be confident, well-behaved companions in any environment.",
    location: {
      address: "321 Service Drive",
      city: "Tampa",
      state: "FL",
      country: "USA",
      zipCode: "33602"
    },
    languages: ["English", "Spanish"],
    trainingModes: ["video", "in_person"],
    petTypesSupported: ["Dog"],
    certifications: [
      {
        certification: "Karen Pryor Academy Graduate",
        issuingBody: "Karen Pryor Academy",
        year: 2017
      },
      {
        certification: "Service Dog Training Certification",
        issuingBody: "IAADP",
        year: 2019
      }
    ],
    trainingPrograms: [
      {
        name: "Service Dog Foundations",
        description: "Basic training for future service dogs",
        duration: 16,
        sessionsPerWeek: 2,
        totalSessions: 32,
        price: 1920,
        level: "Advanced"
      },
      {
        name: "Therapy Dog Prep",
        description: "Prepare for therapy dog certification",
        duration: 10,
        sessionsPerWeek: 1,
        totalSessions: 10,
        price: 600,
        level: "Advanced"
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "13:00", endTime: "14:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "14:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
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
      average: 4.9,
      totalReviews: 98
    },
    stats: {
      totalSessions: 234,
      totalPets: 156,
      responseTime: 12,
      successRate: 97
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "David Kim",
    email: "david.trainer@furever.com",
    phone: "+1-555-0205",
    password: "password123",
    certificationNumber: "CCPDT005",
    trainingSpecialties: ["House Training", "Socialization", "Puppy Training"],
    yearsOfExperience: 4,
    sessionFee: 40,
    groupSessionFee: 28,
    bio: "David Kim is a certified dog trainer specializing in puppy development and socialization. With 4 years of experience, he focuses on setting puppies up for success through proper socialization and house training. David is known for his patient approach and ability to help new dog owners navigate the challenges of puppyhood with confidence.",
    location: {
      address: "567 Puppy Place",
      city: "San Diego",
      state: "CA",
      country: "USA",
      zipCode: "92101"
    },
    languages: ["English", "Korean"],
    trainingModes: ["video", "in_person", "group_video"],
    petTypesSupported: ["Dog"],
    certifications: [
      {
        certification: "Certified Professional Dog Trainer",
        issuingBody: "CCPDT",
        year: 2020
      }
    ],
    trainingPrograms: [
      {
        name: "Puppy Socialization",
        description: "Critical socialization for young puppies",
        duration: 4,
        sessionsPerWeek: 2,
        totalSessions: 8,
        price: 320,
        level: "Beginner"
      },
      {
        name: "House Training Bootcamp",
        description: "Fast-track house training program",
        duration: 3,
        sessionsPerWeek: 2,
        totalSessions: 6,
        price: 240,
        level: "Beginner"
      }
    ],
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "14:00", endTime: "15:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "15:00", endTime: "16:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:00", isBooked: false },
          { startTime: "11:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "14:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "14:00", endTime: "15:00", isBooked: false },
          { startTime: "16:00", endTime: "17:00", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.6,
      totalReviews: 74
    },
    stats: {
      totalSessions: 145,
      totalPets: 123,
      responseTime: 25,
      successRate: 91
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Emily Johnson",
    email: "emily.trainer@furever.com",
    phone: "+1-555-0206",
    password: "password123",
    certificationNumber: "CFBT006",
    trainingSpecialties: ["Guard Dog Training", "Advanced Obedience", "Behavioral Modification"],
    yearsOfExperience: 12,
    sessionFee: 70,
    groupSessionFee: 50,
    bio: "Emily Johnson is a master trainer with 12 years of experience in advanced canine training. She specializes in protection dog training, advanced obedience, and complex behavioral rehabilitation. Emily has trained dogs for law enforcement agencies and private security companies, bringing professional-level expertise to pet owners seeking the highest level of training.",
    location: {
      address: "890 Security Street",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      zipCode: "85001"
    },
    languages: ["English"],
    trainingModes: ["video", "in_person"],
    petTypesSupported: ["Dog"],
    certifications: [
      {
        certification: "Certified Force-Free Behavior Trainer",
        issuingBody: "CCPDT",
        year: 2012
      },
      {
        certification: "Professional Protection Dog Trainer",
        issuingBody: "NAPDT",
        year: 2015
      }
    ],
    trainingPrograms: [
      {
        name: "Elite Obedience Program",
        description: "Competition-level obedience training",
        duration: 12,
        sessionsPerWeek: 2,
        totalSessions: 24,
        price: 1680,
        level: "Advanced"
      },
      {
        name: "Personal Protection Training",
        description: "Advanced protection training for family dogs",
        duration: 20,
        sessionsPerWeek: 2,
        totalSessions: 40,
        price: 2800,
        level: "Advanced"
      }
    ],
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
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "07:00", endTime: "08:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "09:00", isBooked: false },
          { startTime: "18:00", endTime: "19:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "07:00", endTime: "08:00", isBooked: false },
          { startTime: "17:00", endTime: "18:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:00", isBooked: false },
          { startTime: "10:00", endTime: "11:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.9,
      totalReviews: 145
    },
    stats: {
      totalSessions: 389,
      totalPets: 234,
      responseTime: 8,
      successRate: 98
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  }
];

async function setupTrainers() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    
    console.log("Clearing existing trainers...");
    await Trainer.deleteMany({});
    
    console.log("Creating sample trainers...");
    
    for (const trainerData of sampleTrainers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(trainerData.password, 12);
      trainerData.password = hashedPassword;
      
      // Create trainer
      const trainer = new Trainer(trainerData);
      await trainer.save();
      
      console.log(`Created trainer: ${trainerData.name}`);
    }
    
    console.log(`Successfully created ${sampleTrainers.length} sample trainers!`);
    console.log("\nTrainer credentials for testing:");
    sampleTrainers.forEach(trainer => {
      console.log(`Email: ${trainer.email} | Password: password123`);
    });
    
  } catch (error) {
    console.error("Error setting up trainers:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Run the setup
setupTrainers();