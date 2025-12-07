import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/dbConfig.js";
import Groomer from "./db/schema/groomer.schema.js";

const sampleGroomers = [
  {
    name: "Maria Gonzalez",
    email: "maria.groomer@furever.com",
    phone: "+1-555-0301",
    password: "password123",
    licenseNumber: "GROOM001USA",
    groomingSpecialties: ["Full Grooming", "Bath & Brush", "Nail Trimming", "De-shedding"],
    yearsOfExperience: 6,
    bio: "Maria Gonzalez is a professional pet groomer with 6 years of experience creating beautiful, comfortable styles for dogs and cats. She specializes in breed-specific cuts and has a gentle touch that helps even the most anxious pets feel at ease. Maria is certified in safe grooming practices and uses only premium, pet-safe products.",
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
      },
      {
        name: "Bath & Brush",
        description: "Relaxing bath with premium shampoo and thorough brushing",
        duration: 60,
        basePrice: 35,
        prices: [
          { size: "Small", price: 35 },
          { size: "Medium", price: 45 },
          { size: "Large", price: 60 }
        ],
        isPopular: false
      },
      {
        name: "Nail Trimming",
        description: "Professional nail trimming and paw care",
        duration: 30,
        basePrice: 25,
        prices: [
          { size: "Small", price: 25 },
          { size: "Medium", price: 25 },
          { size: "Large", price: 30 }
        ],
        isPopular: false
      }
    ],
    salon: {
      name: "Pawsome Salon",
      address: "123 Grooming Grove, Los Angeles, CA 90210",
      photos: ["/salon1.jpg", "/salon2.jpg"],
      amenities: ["Air Conditioning", "Separate Cat Area", "Nail Trimming Station"],
      parkingAvailable: true
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "11:00", endTime: "13:00", isBooked: false },
          { startTime: "14:00", endTime: "16:00", isBooked: false },
          { startTime: "16:00", endTime: "18:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "12:00", endTime: "14:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:00", isBooked: false },
          { startTime: "14:00", endTime: "16:00", isBooked: false },
          { startTime: "16:00", endTime: "18:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:00", isBooked: false },
          { startTime: "10:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.8,
      totalReviews: 156
    },
    stats: {
      totalGroomings: 423,
      totalPets: 298,
      responseTime: 20,
      repeatCustomers: 78
    },
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
    bio: "James Wilson brings grooming directly to your doorstep with his fully-equipped mobile grooming van. With 8 years of experience, he specializes in stress-free grooming for pets who are anxious about salon visits. James is particularly skilled with senior pets and offers gentle, patient care for pets with special needs.",
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
      },
      {
        name: "Mobile Bath & Brush",
        description: "Convenient mobile bath and brush service",
        duration: 90,
        basePrice: 55,
        prices: [
          { size: "Small", price: 55 },
          { size: "Medium", price: 70 },
          { size: "Large", price: 90 },
          { size: "Extra Large", price: 110 }
        ],
        isPopular: false
      },
      {
        name: "Senior Pet Special",
        description: "Gentle grooming designed for older pets",
        duration: 120,
        basePrice: 75,
        prices: [
          { size: "Small", price: 75 },
          { size: "Medium", price: 95 },
          { size: "Large", price: 120 }
        ],
        isPopular: false
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
          { startTime: "11:00", endTime: "13:30", isBooked: false },
          { startTime: "14:00", endTime: "16:30", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:30", isBooked: false },
          { startTime: "12:00", endTime: "14:30", isBooked: false },
          { startTime: "15:00", endTime: "17:30", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:30", isBooked: false },
          { startTime: "13:00", endTime: "15:30", isBooked: false },
          { startTime: "16:00", endTime: "18:30", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:30", isBooked: false },
          { startTime: "14:00", endTime: "16:30", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:30", isBooked: false },
          { startTime: "11:00", endTime: "13:30", isBooked: false },
          { startTime: "15:00", endTime: "17:30", isBooked: false }
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
          { startTime: "10:00", endTime: "12:30", isBooked: false },
          { startTime: "13:00", endTime: "15:30", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.9,
      totalReviews: 203
    },
    stats: {
      totalGroomings: 567,
      totalPets: 378,
      responseTime: 15,
      repeatCustomers: 85
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Sophie Chen",
    email: "sophie.groomer@furever.com",
    phone: "+1-555-0303",
    password: "password123",
    licenseNumber: "GROOM003USA",
    groomingSpecialties: ["Breed-specific Cuts", "Show Grooming", "Creative Grooming", "Spa Treatments"],
    yearsOfExperience: 10,
    bio: "Sophie Chen is a master groomer with 10 years of experience in competition and show grooming. She specializes in breed-specific cuts and creative styling, having groomed dogs for Westminster and other major shows. Sophie offers luxury spa treatments and is known for her artistic flair and attention to detail.",
    location: {
      address: "789 Luxury Lane",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33101"
    },
    languages: ["English", "Mandarin"],
    serviceTypes: ["in_salon"],
    petTypesSupported: ["Dog"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)"],
    services: [
      {
        name: "Show Quality Grooming",
        description: "Professional show-quality grooming and styling",
        duration: 180,
        basePrice: 120,
        prices: [
          { size: "Small", price: 120 },
          { size: "Medium", price: 150 },
          { size: "Large", price: 200 }
        ],
        isPopular: false
      },
      {
        name: "Luxury Spa Package",
        description: "Full spa treatment with aromatherapy and conditioning",
        duration: 240,
        basePrice: 150,
        prices: [
          { size: "Small", price: 150 },
          { size: "Medium", price: 185 },
          { size: "Large", price: 240 }
        ],
        isPopular: true
      },
      {
        name: "Creative Styling",
        description: "Artistic grooming with colors and creative cuts",
        duration: 210,
        basePrice: 100,
        prices: [
          { size: "Small", price: 100 },
          { size: "Medium", price: 130 },
          { size: "Large", price: 170 }
        ],
        isPopular: false
      }
    ],
    salon: {
      name: "Elite Pet Spa",
      address: "789 Luxury Lane, Miami, FL 33101",
      photos: ["/spa1.jpg", "/spa2.jpg", "/spa3.jpg"],
      amenities: ["Air Conditioning", "Heating", "Nail Trimming Station", "Dental Care", "Pickup/Dropoff"],
      parkingAvailable: true
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "13:00", isBooked: false },
          { startTime: "14:00", endTime: "17:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "16:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: false,
        slots: []
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "13:00", isBooked: false },
          { startTime: "15:00", endTime: "18:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "12:00", isBooked: false },
          { startTime: "14:00", endTime: "17:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "11:00", isBooked: false },
          { startTime: "12:00", endTime: "15:00", isBooked: false }
        ]
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
      totalGroomings: 345,
      totalPets: 234,
      responseTime: 10,
      repeatCustomers: 92
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "Robert Taylor",
    email: "robert.groomer@furever.com",
    phone: "+1-555-0304",
    password: "password123",
    licenseNumber: "GROOM004USA",
    groomingSpecialties: ["Full Grooming", "Flea Treatment", "Teeth Cleaning", "Ear Cleaning"],
    yearsOfExperience: 5,
    bio: "Robert Taylor is a dedicated groomer with 5 years of experience providing comprehensive pet care services. He specializes in health-focused grooming, including flea treatments, dental care, and therapeutic baths. Robert takes a holistic approach to pet grooming, ensuring both beauty and health for every pet in his care.",
    location: {
      address: "321 Health Haven",
      city: "Denver",
      state: "CO",
      country: "USA",
      zipCode: "80202"
    },
    languages: ["English"],
    serviceTypes: ["in_salon"],
    petTypesSupported: ["Dog", "Cat"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)"],
    services: [
      {
        name: "Health & Beauty Package",
        description: "Grooming with focus on health and hygiene",
        duration: 120,
        basePrice: 70,
        prices: [
          { size: "Small", price: 70 },
          { size: "Medium", price: 90 },
          { size: "Large", price: 115 }
        ],
        isPopular: true
      },
      {
        name: "Flea & Tick Treatment",
        description: "Specialized treatment for flea and tick removal",
        duration: 90,
        basePrice: 55,
        prices: [
          { size: "Small", price: 55 },
          { size: "Medium", price: 70 },
          { size: "Large", price: 90 }
        ],
        isPopular: false
      },
      {
        name: "Dental Care Add-on",
        description: "Professional teeth cleaning and oral care",
        duration: 30,
        basePrice: 25,
        prices: [
          { size: "Small", price: 25 },
          { size: "Medium", price: 30 },
          { size: "Large", price: 35 }
        ],
        isPopular: false
      }
    ],
    salon: {
      name: "Healthy Paws Grooming",
      address: "321 Health Haven, Denver, CO 80202",
      photos: ["/health1.jpg", "/health2.jpg"],
      amenities: ["Air Conditioning", "Flea Treatment", "Dental Care"],
      parkingAvailable: true
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "12:00", endTime: "14:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false },
          { startTime: "16:00", endTime: "18:00", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "14:00", endTime: "16:00", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "13:00", isBooked: false },
          { startTime: "15:00", endTime: "17:00", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:00", isBooked: false },
          { startTime: "13:00", endTime: "15:00", isBooked: false },
          { startTime: "16:00", endTime: "18:00", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:00", isBooked: false },
          { startTime: "11:00", endTime: "13:00", isBooked: false },
          { startTime: "14:00", endTime: "16:00", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: false,
        slots: []
      }
    },
    rating: {
      average: 4.7,
      totalReviews: 98
    },
    stats: {
      totalGroomings: 267,
      totalPets: 189,
      responseTime: 18,
      repeatCustomers: 76
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  },
  {
    name: "Lisa Park",
    email: "lisa.groomer@furever.com",
    phone: "+1-555-0305",
    password: "password123",
    licenseNumber: "GROOM005USA",
    groomingSpecialties: ["Mobile Grooming", "Express Grooming", "Bath & Brush", "Nail Trimming"],
    yearsOfExperience: 4,
    bio: "Lisa Park offers convenient mobile grooming services with a focus on efficiency and quality. With 4 years of experience, she specializes in express grooming for busy pet owners who need quick, professional service. Lisa's mobile unit is fully equipped and she pride herself on providing stress-free grooming experiences.",
    location: {
      address: "567 Express Way",
      city: "Seattle",
      state: "WA",
      country: "USA",
      zipCode: "98101"
    },
    languages: ["English", "Korean"],
    serviceTypes: ["mobile"],
    travelRadius: 20,
    petTypesSupported: ["Dog", "Cat"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)"],
    services: [
      {
        name: "Express Mobile Grooming",
        description: "Quick and efficient mobile grooming service",
        duration: 75,
        basePrice: 60,
        prices: [
          { size: "Small", price: 60 },
          { size: "Medium", price: 75 },
          { size: "Large", price: 95 }
        ],
        isPopular: true
      },
      {
        name: "Mobile Wash & Go",
        description: "Fast bath and brush service at your door",
        duration: 45,
        basePrice: 40,
        prices: [
          { size: "Small", price: 40 },
          { size: "Medium", price: 50 },
          { size: "Large", price: 65 }
        ],
        isPopular: false
      },
      {
        name: "Nail & Paw Care",
        description: "Mobile nail trimming and paw maintenance",
        duration: 30,
        basePrice: 30,
        prices: [
          { size: "Small", price: 30 },
          { size: "Medium", price: 35 },
          { size: "Large", price: 40 }
        ],
        isPopular: false
      }
    ],
    mobileService: {
      vehicleType: "Ford Transit Grooming Van",
      isFullyEquipped: true,
      waterSource: "Self-contained",
      powerSource: "Generator"
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:15", isBooked: false },
          { startTime: "11:00", endTime: "12:15", isBooked: false },
          { startTime: "13:00", endTime: "14:15", isBooked: false },
          { startTime: "15:00", endTime: "16:15", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:15", isBooked: false },
          { startTime: "12:00", endTime: "13:15", isBooked: false },
          { startTime: "14:00", endTime: "15:15", isBooked: false },
          { startTime: "16:00", endTime: "17:15", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:15", isBooked: false },
          { startTime: "11:00", endTime: "12:15", isBooked: false },
          { startTime: "14:00", endTime: "15:15", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "11:15", isBooked: false },
          { startTime: "13:00", endTime: "14:15", isBooked: false },
          { startTime: "15:00", endTime: "16:15", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:15", isBooked: false },
          { startTime: "12:00", endTime: "13:15", isBooked: false },
          { startTime: "14:00", endTime: "15:15", isBooked: false },
          { startTime: "16:00", endTime: "17:15", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "10:15", isBooked: false },
          { startTime: "10:30", endTime: "11:45", isBooked: false },
          { startTime: "12:00", endTime: "13:15", isBooked: false },
          { startTime: "14:00", endTime: "15:15", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "11:00", endTime: "12:15", isBooked: false },
          { startTime: "13:00", endTime: "14:15", isBooked: false },
          { startTime: "15:00", endTime: "16:15", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.6,
      totalReviews: 67
    },
    stats: {
      totalGroomings: 145,
      totalPets: 123,
      responseTime: 25,
      repeatCustomers: 68
    },
    isVerified: true,
    isActive: true,
    isOnline: true,
    approvalStatus: "approved"
  },
  {
    name: "Antonio Rodriguez",
    email: "antonio.groomer@furever.com",
    phone: "+1-555-0306",
    password: "password123",
    licenseNumber: "GROOM006USA",
    groomingSpecialties: ["Full Grooming", "Bath & Brush", "Spa Treatments", "Mobile Grooming"],
    yearsOfExperience: 9,
    bio: "Antonio Rodriguez brings 9 years of grooming expertise to both salon and mobile services. He's passionate about providing personalized care for each pet and specializes in creating a calm, relaxing environment. Antonio offers both traditional grooming and luxury spa treatments, adapting his approach to each pet's individual needs and temperament.",
    location: {
      address: "890 Dual Service Drive",
      city: "San Diego",
      state: "CA",
      country: "USA",
      zipCode: "92101"
    },
    languages: ["English", "Spanish"],
    serviceTypes: ["both"],
    travelRadius: 15,
    petTypesSupported: ["Dog", "Cat", "Rabbit"],
    petSizeLimit: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)", "Extra Large (100lbs+)"],
    services: [
      {
        name: "Premium Full Service",
        description: "Complete grooming with luxury touches",
        duration: 135,
        basePrice: 80,
        prices: [
          { size: "Small", price: 80 },
          { size: "Medium", price: 105 },
          { size: "Large", price: 135 },
          { size: "Extra Large", price: 165 }
        ],
        isPopular: true
      },
      {
        name: "Relaxation Package",
        description: "Spa treatment with aromatherapy and massage",
        duration: 180,
        basePrice: 110,
        prices: [
          { size: "Small", price: 110 },
          { size: "Medium", price: 140 },
          { size: "Large", price: 180 }
        ],
        isPopular: false
      },
      {
        name: "Exotic Pet Grooming",
        description: "Specialized grooming for rabbits and other small pets",
        duration: 60,
        basePrice: 45,
        prices: [
          { size: "Small", price: 45 }
        ],
        isPopular: false
      }
    ],
    salon: {
      name: "Dual Service Pet Spa",
      address: "890 Dual Service Drive, San Diego, CA 92101",
      photos: ["/dual1.jpg", "/dual2.jpg"],
      amenities: ["Air Conditioning", "Heating", "Separate Cat Area", "Pickup/Dropoff"],
      parkingAvailable: true
    },
    mobileService: {
      vehicleType: "Custom Grooming Trailer",
      isFullyEquipped: true,
      waterSource: "Both",
      powerSource: "Both"
    },
    availability: {
      monday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:15", isBooked: false },
          { startTime: "11:00", endTime: "13:15", isBooked: false },
          { startTime: "14:00", endTime: "16:15", isBooked: false }
        ]
      },
      tuesday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:15", isBooked: false },
          { startTime: "12:00", endTime: "14:15", isBooked: false },
          { startTime: "15:00", endTime: "17:15", isBooked: false }
        ]
      },
      wednesday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:15", isBooked: false },
          { startTime: "13:00", endTime: "15:15", isBooked: false },
          { startTime: "16:00", endTime: "18:15", isBooked: false }
        ]
      },
      thursday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:15", isBooked: false },
          { startTime: "14:00", endTime: "16:15", isBooked: false }
        ]
      },
      friday: {
        isAvailable: true,
        slots: [
          { startTime: "08:00", endTime: "10:15", isBooked: false },
          { startTime: "11:00", endTime: "13:15", isBooked: false },
          { startTime: "15:00", endTime: "17:15", isBooked: false }
        ]
      },
      saturday: {
        isAvailable: true,
        slots: [
          { startTime: "09:00", endTime: "11:15", isBooked: false },
          { startTime: "12:00", endTime: "14:15", isBooked: false }
        ]
      },
      sunday: {
        isAvailable: true,
        slots: [
          { startTime: "10:00", endTime: "12:15", isBooked: false },
          { startTime: "13:00", endTime: "15:15", isBooked: false }
        ]
      }
    },
    rating: {
      average: 4.8,
      totalReviews: 134
    },
    stats: {
      totalGroomings: 378,
      totalPets: 267,
      responseTime: 12,
      repeatCustomers: 82
    },
    isVerified: true,
    isActive: true,
    isOnline: false,
    approvalStatus: "approved"
  }
];

async function setupGroomers() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    
    console.log("Clearing existing groomers...");
    await Groomer.deleteMany({});
    
    console.log("Creating sample groomers...");
    
    for (const groomerData of sampleGroomers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(groomerData.password, 12);
      groomerData.password = hashedPassword;
      
      // Create groomer
      const groomer = new Groomer(groomerData);
      await groomer.save();
      
      console.log(`Created groomer: ${groomerData.name}`);
    }
    
    console.log(`Successfully created ${sampleGroomers.length} sample groomers!`);
    console.log("\nGroomer credentials for testing:");
    sampleGroomers.forEach(groomer => {
      console.log(`Email: ${groomer.email} | Password: password123`);
    });
    
  } catch (error) {
    console.error("Error setting up groomers:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Run the setup
setupGroomers();