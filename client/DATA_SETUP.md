# 🗄️ Sample Data Setup Guide

This guide will help you populate your Furever platform with sample data for **veterinarians**, **pet trainers**, and **pet groomers**.

## 🚀 Quick Setup (Recommended)

**Populate ALL sample data at once:**

```bash
cd client
npm run setup-data
```

This will create:
- ✅ **2 Sample Veterinarians** 
- ✅ **2 Sample Pet Trainers**
- ✅ **2 Sample Pet Groomers**

## 🎯 Individual Setup (Optional)

If you want to set up specific data types individually:

```bash
# Set up only veterinarians
npm run setup-vets

# Set up only pet trainers  
npm run setup-trainers

# Set up only pet groomers
npm run setup-groomers
```

## 📊 What Gets Created

### 👩‍⚕️ **Veterinarians**
- **Dr. Sarah Johnson** - General Practice (New York)
- **Dr. Michael Chen** - Surgery & Emergency Care (Los Angeles)

### 🐕‍🦺 **Pet Trainers**  
- **Alex Martinez** - Basic Obedience & Puppy Training (Austin)
- **Sarah Thompson** - Behavioral Modification & Aggression Training (Denver)

### ✂️ **Pet Groomers**
- **Maria Gonzalez** - In-Salon Full Service Grooming (Los Angeles)
- **James Wilson** - Mobile Grooming Services (Austin)

## 🔐 Test Credentials

**All accounts use the same password:** `password123`

### Veterinarian Emails:
- `dr.sarah@furever.com`
- `dr.chen@furever.com`

### Trainer Emails:
- `alex.trainer@furever.com`
- `sarah.trainer@furever.com`

### Groomer Emails:
- `maria.groomer@furever.com`
- `james.groomer@furever.com`

## 🌐 Testing Your Platform

After running the setup, visit these pages to see the data in action:

1. **Veterinary Consultations:** http://localhost:3000/vet-consultation
2. **Pet Training:** http://localhost:3000/pet-training  
3. **Pet Grooming:** http://localhost:3000/pet-grooming

## ✨ Features to Test

### 🔍 **Search & Filters**
- Search by name, specialization, or location
- Filter by service type, rating, and price
- Sort by different criteria

### 📅 **Availability**
- View real availability slots
- See "Available Now" indicators
- Check next available appointments

### 💰 **Pricing**
- Compare service fees
- View package deals
- See mobile service pricing

### ⭐ **Reviews & Ratings**
- Browse professional ratings
- Read sample reviews
- See experience levels

## 🛠️ Troubleshooting

**Database Connection Issues?**
Make sure your MongoDB is running and the connection string in `db/dbConfig.js` is correct.

**Permission Errors?**
Make sure you're in the `client` directory when running the setup commands.

**Data Already Exists?**
The setup scripts will clear existing data before creating new sample data.

## 🔄 Re-running Setup

You can run the setup commands multiple times. Each run will:
1. Clear existing sample data
2. Create fresh sample data with the same credentials

This is useful for testing or resetting your development environment.

---

**🎉 Ready to explore your fully functional pet care platform!**