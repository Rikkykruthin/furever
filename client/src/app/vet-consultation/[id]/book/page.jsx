"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Phone,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  AlertCircle,
  Heart,
  Camera,
  FileImage,
  DollarSign,
  User,
  PawPrint,
  Stethoscope,
  Shield,
  Star,
  ChevronRight,
  Info,
  MapPin,
  Edit3,
  Plus,
  ChevronDown,
  Scale,
  CalendarDays,
  Hash,
  Loader2,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "../../../../../actions/loginActions";
import toast from "react-hot-toast";

// Custom Input Components - Moved outside to prevent re-creation on renders
const CustomInput = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  type = "text",
  className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  
  return (
    <div className={`relative ${className}`}>
      <div className={`relative border-2 rounded-xl transition-all duration-200 ${
        isFocused 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : hasValue
          ? 'border-accent/30 shadow-sm'
          : 'border-accent/20 hover:border-accent/40'
      }`}>
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isFocused ? 'text-primary' : 'text-accent'
          }`} />
        )}
        
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          className={`w-full h-14 px-4 ${Icon ? 'pl-12' : 'pl-4'} pr-4 bg-white text-primary placeholder-transparent focus:outline-none rounded-xl`}
        />
        
        <label className={`absolute left-4 ${Icon ? 'left-12' : 'left-4'} transition-all duration-200 pointer-events-none ${
          isFocused || hasValue
            ? '-top-2 text-xs bg-white px-2 font-bold'
            : 'top-1/2 transform -translate-y-1/2 text-secondary'
        } ${isFocused ? 'text-primary' : 'text-secondary'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    </div>
  );
};

const CustomTextarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  rows = 4,
  className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const charCount = value ? value.length : 0;
  const maxChars = 500;
  
  return (
    <div className={`relative ${className}`}>
      <div className={`relative border-2 rounded-xl transition-all duration-200 ${
        isFocused 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : hasValue
          ? 'border-accent/30 shadow-sm'
          : 'border-accent/20 hover:border-accent/40'
      }`}>
        <textarea
          value={value || ""}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          rows={rows}
          maxLength={maxChars}
          className="w-full p-4 pt-6 bg-white text-primary placeholder-transparent focus:outline-none rounded-xl resize-none"
        />
        
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFocused || hasValue
            ? '-top-2 text-xs bg-white px-2 font-bold'
            : 'top-4 text-secondary'
        } ${isFocused ? 'text-primary' : 'text-secondary'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {isFocused && (
          <div className={`absolute bottom-2 right-3 text-xs font-medium ${
            charCount > maxChars * 0.9 ? 'text-red-500' : 'text-secondary'
          }`}>
            {charCount}/{maxChars}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomSelect = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  required = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  
  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );
  
  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : '';
  
  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className={`relative border-2 rounded-xl transition-all duration-200 ${
        isFocused || isOpen
          ? 'border-primary shadow-lg shadow-primary/20' 
          : hasValue
          ? 'border-accent/30 shadow-sm'
          : 'border-accent/20 hover:border-accent/40'
      }`}>
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isFocused || isOpen ? 'text-primary' : 'text-accent'
          }`} />
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`w-full h-14 px-4 ${Icon ? 'pl-12' : 'pl-4'} pr-10 bg-white text-primary focus:outline-none rounded-xl text-left font-medium`}
        >
          {displayValue || <span className="text-secondary">Select {label}</span>}
        </button>
        
        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
        
        <label className={`absolute left-4 ${Icon ? 'left-12' : 'left-4'} transition-all duration-200 pointer-events-none ${
          isFocused || hasValue || isOpen
            ? '-top-2 text-xs bg-white px-2 font-bold'
            : 'top-1/2 transform -translate-y-1/2 text-secondary'
        } ${isFocused || isOpen ? 'text-primary' : 'text-secondary'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-primary/30 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
            {options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = value === optionValue;
              
              return (
                <button
                  key={index}
                  type="button"
                  onMouseDown={() => handleOptionClick(optionValue)}
                  className={`w-full px-4 py-3 text-left transition-all duration-200 focus:outline-none first:rounded-t-xl last:rounded-b-xl ${
                    isSelected 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'hover:bg-accent/10 text-primary'
                  }`}
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const CONSULTATION_TYPES = [
  {
    id: "video",
    name: "Video Call",
    icon: Video,
    description: "Face-to-face consultation with HD video",
    duration: "30 min",
    price: "Standard",
    features: ["HD Video", "Screen Share", "Recording"],
    color: "from-primary to-primary/90"
  },
  {
    id: "audio",
    name: "Voice Call",
    icon: Phone,
    description: "High-quality audio consultation",
    duration: "20 min",
    price: "Reduced",
    features: ["Crystal Audio", "Quick Setup", "Mobile"],
    color: "from-accent to-accent/80"
  },
  {
    id: "chat",
    name: "Text Chat",
    icon: MessageCircle,
    description: "Real-time messaging consultation",
    duration: "45 min",
    price: "Budget",
    features: ["Text & Media", "File Share", "24/7"],
    color: "from-primary/80 to-accent"
  }
];

const PET_SPECIES = [
  "Dog", "Cat", "Bird", "Rabbit", "Hamster", "Guinea Pig", "Fish", "Reptile", "Other"
];

const URGENCY_LEVELS = [
  { value: "Low", label: "Routine", color: "bg-green-50 text-green-700 border-green-200", icon: "🌿", hoverColor: "hover:bg-green-100" },
  { value: "Medium", label: "Moderate", color: "bg-accent/20 text-primary border-accent/40", icon: "⚡", hoverColor: "hover:bg-accent/30" },
  { value: "High", label: "Urgent", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "🔥", hoverColor: "hover:bg-orange-100" },
  { value: "Emergency", label: "Emergency", color: "bg-red-50 text-red-700 border-red-200", icon: "🚨", hoverColor: "hover:bg-red-100" }
];

// Step Components - Moved outside to prevent re-creation on renders
const DateTimeStep = ({ booking, handleInputChange, availableSlots }) => (
  <div className="space-y-8 animate-slide-in-up">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
        <Calendar className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Step 1 of 4</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 titlefont">When would you like to meet?</h2>
      <p className="text-lg text-secondary">Choose your preferred appointment date and time</p>
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Select Date</CardTitle>
              <p className="text-white/80 text-sm">Choose from available dates</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-3">
            {availableSlots.map((daySlot, index) => {
              const date = new Date(daySlot.date);
              const isSelected = booking.selectedDate === daySlot.date;
              const isToday = date.toDateString() === new Date().toDateString();
              const availableCount = daySlot.slots?.length || 0;
              
              return (
                <button
                  key={index}
                  onClick={() => handleInputChange("", "selectedDate", daySlot.date)}
                  className={`p-3 rounded-xl text-center transition-all duration-300 hover:scale-110 relative group ${
                    isSelected 
                      ? 'bg-primary text-white shadow-lg ring-4 ring-accent/30' 
                      : isToday 
                      ? 'bg-accent/20 text-primary ring-2 ring-primary/30 font-semibold' 
                      : 'bg-secondary text-primary hover:bg-accent/10'
                  }`}
                >
                  <div className="text-xs font-medium opacity-75 mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xl font-bold">{date.getDate()}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  {availableCount > 0 && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {availableCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 backdrop-blur-sm p-2 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-primary text-xl">Available Times</CardTitle>
              <p className="text-primary/80 text-sm">Select your preferred time slot</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {booking.selectedDate ? (
            <div className="space-y-6">
              <div className="bg-accent/10 rounded-xl p-4 border-2 border-accent/20">
                <p className="text-lg font-bold text-primary text-center">
                  {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSlots
                  .find(slot => slot.date === booking.selectedDate)
                  ?.slots?.map((timeSlot, index) => (
                    <button
                      key={index}
                      onClick={() => handleInputChange("", "selectedTime", timeSlot.startTime)}
                      className={`p-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-110 relative group ${
                        booking.selectedTime === timeSlot.startTime 
                          ? 'bg-primary text-white shadow-xl ring-4 ring-accent/30' 
                          : 'bg-accent/10 text-primary border-2 border-accent/20 hover:bg-accent/20 hover:border-primary/30'
                      }`}
                    >
                      <Clock className={`w-4 h-4 inline-block mr-2 ${booking.selectedTime === timeSlot.startTime ? 'text-white' : 'text-accent'}`} />
                      {timeSlot.startTime}
                      {booking.selectedTime === timeSlot.startTime && (
                        <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-primary rounded-full p-1" />
                      )}
                    </button>
                  ))
                }
              </div>
              {(!availableSlots.find(slot => slot.date === booking.selectedDate)?.slots || availableSlots.find(slot => slot.date === booking.selectedDate)?.slots.length === 0) && (
                <div className="text-center py-8 bg-accent/5 rounded-xl border-2 border-accent/20">
                  <AlertCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                  <p className="text-primary font-medium">No available slots for this date</p>
                  <p className="text-secondary text-sm mt-1">Please select another date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-4">
                <Clock className="w-10 h-10 text-accent" />
              </div>
              <p className="text-primary font-semibold mb-1">Select a date first</p>
              <p className="text-secondary text-sm">Choose a date from the calendar to see available times</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

const PetDetailsStep = ({ booking, handleInputChange, handleFileUpload, removeFile, uploading }) => (
  <div className="space-y-8 animate-slide-in-up">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
        <PawPrint className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Step 2 of 4</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 titlefont">Tell us about your pet</h2>
      <p className="text-lg text-secondary">This helps our vet provide the best care</p>
    </div>

    <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Pet Information</CardTitle>
            <p className="text-white/80 text-sm">Help us understand your pet's needs</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <CustomInput
            label="Pet Name"
            icon={PawPrint}
            value={booking.petDetails.name}
            onChange={(e) => handleInputChange("petDetails", "name", e.target.value)}
            required={true}
          />

          <CustomSelect
            label="Species"
            icon={Heart}
            value={booking.petDetails.species}
            onChange={(value) => handleInputChange("petDetails", "species", value)}
            options={PET_SPECIES}
            required={true}
          />

          <CustomInput
            label="Breed"
            icon={Edit3}
            value={booking.petDetails.breed}
            onChange={(e) => handleInputChange("petDetails", "breed", e.target.value)}
          />

          <CustomInput
            label="Age"
            icon={CalendarDays}
            value={booking.petDetails.age}
            onChange={(e) => handleInputChange("petDetails", "age", e.target.value)}
            type="number"
          />

          <CustomInput
            label="Weight (lbs)"
            icon={Scale}
            value={booking.petDetails.weight}
            onChange={(e) => handleInputChange("petDetails", "weight", e.target.value)}
            type="number"
          />

          <CustomSelect
            label="Gender"
            icon={User}
            value={booking.petDetails.gender}
            onChange={(value) => handleInputChange("petDetails", "gender", value)}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Unknown", label: "Unknown" }
            ]}
          />
        </div>

        {/* Urgency Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h4 className="text-primary font-bold text-lg">How urgent is this consultation?</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {URGENCY_LEVELS.map(level => {
              const isSelected = booking.petDetails.urgencyLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange("petDetails", "urgencyLevel", level.value)}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-110 relative group ${
                    isSelected 
                      ? level.color.replace('50', '100').replace('border-', 'border-2 border-') + ' shadow-xl ring-4 ring-primary/20' 
                      : level.color + ' hover:shadow-lg ' + level.hoverColor
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{level.icon}</div>
                    <div className="font-bold text-sm">{level.label}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <CustomTextarea
          label="Reason for consultation"
          value={booking.reason}
          onChange={(e) => handleInputChange("", "reason", e.target.value)}
          required={true}
          rows={4}
        />

        {/* Medical History */}
        <CustomTextarea
          label="Medical History"
          value={booking.petDetails.medicalHistory}
          onChange={(e) => handleInputChange("petDetails", "medicalHistory", e.target.value)}
          rows={3}
        />

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" />
            <h4 className="text-primary font-bold text-lg">Upload Photos/Videos <span className="text-secondary font-normal">(Optional)</span></h4>
          </div>
          <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center hover:border-primary transition-all duration-300 bg-accent/5 hover:bg-accent/10 group cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                  <p className="font-bold text-primary mb-1">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-accent group-hover:text-primary transition-colors" />
                  <p className="font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                    Click to upload media
                  </p>
                  <p className="text-sm text-secondary">
                    Help us understand your pet's condition
                  </p>
                </>
              )}
            </label>
          </div>
          
          {booking.mediaFiles && booking.mediaFiles.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {booking.mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-accent/10 rounded-xl overflow-hidden border-2 border-accent/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                    {file.type === "image" ? (
                      <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileImage className="w-8 h-8 text-accent" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {file.filename}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Placeholder components for other steps (keep original functionality for now)
const ConsultationTypeStep = ({ booking, handleInputChange, user }) => (
  <div className="space-y-8 animate-slide-in-up">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
        <Video className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Step 3 of 4</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 titlefont">How would you like to consult?</h2>
      <p className="text-lg text-secondary">Choose the consultation method that works best for you</p>
    </div>

    {!user && (
      <Card className="bg-accent/10 border-2 border-accent/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary text-lg mb-1">Account Required</p>
              <p className="text-secondary">You'll need to sign in before completing your booking.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    <div className="grid md:grid-cols-3 gap-6">
      {CONSULTATION_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = booking.consultationType === type.id;
        
        return (
          <Card
            key={type.id}
            onClick={() => handleInputChange("", "consultationType", type.id)}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 overflow-hidden group ${
              isSelected ? 'border-primary shadow-2xl ring-4 ring-accent/20 scale-105' : 'border-accent/20 hover:border-primary/40'
            }`}
          >
            <CardHeader className={`bg-gradient-to-r ${type.color} p-6 text-white text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white"></div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl w-fit mx-auto mb-3">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                <p className="text-sm opacity-90">{type.duration}</p>
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6 space-y-4 bg-white">
              <p className="text-secondary text-sm text-center font-medium">{type.description}</p>
              
              <div className="text-center">
                <Badge className={`font-semibold ${
                  isSelected ? 'bg-primary text-white' : 'bg-accent/20 text-primary'
                }`}>
                  {type.price}
                </Badge>
              </div>
              
              <div className="space-y-2 pt-2">
                {type.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-accent'}`} />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

const PaymentStep = ({ booking, vet, submitBooking, bookingInProgress, validateCurrentStep }) => (
  <div className="space-y-8 animate-slide-in-up">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
        <CreditCard className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Step 4 of 4</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 titlefont">Review & Confirm</h2>
      <p className="text-lg text-secondary">Please review your appointment details before confirming</p>
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      {/* Summary */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Appointment Summary</CardTitle>
              <p className="text-white/80 text-sm">Review your booking details</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Vet Info */}
          <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary text-lg">Dr. {vet?.name}</p>
              <p className="text-sm text-secondary">{vet?.specializations?.join(", ")}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t-2 border-accent/20">
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <span className="text-secondary font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                Date:
              </span>
              <span className="font-bold text-primary">
                {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <span className="text-secondary font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Time:
              </span>
              <span className="font-bold text-primary">{booking.selectedTime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <span className="text-secondary font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-accent" />
                Type:
              </span>
              <span className="font-bold text-primary capitalize">{booking.consultationType}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <span className="text-secondary font-medium flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-accent" />
                Pet:
              </span>
              <span className="font-bold text-primary">{booking.petDetails.name} ({booking.petDetails.species})</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <span className="text-secondary font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" />
                Urgency:
              </span>
              <Badge className="font-bold">{booking.petDetails.urgencyLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 backdrop-blur-sm p-2 rounded-xl">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-primary text-xl">Payment</CardTitle>
              <p className="text-primary/80 text-sm">Secure checkout</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-center bg-primary/5 rounded-xl p-6 border-2 border-primary/20">
            <div className="text-5xl font-bold text-primary mb-2 titlefont">
              ${vet?.consultationFee}
            </div>
            <p className="text-secondary font-medium">Consultation fee</p>
          </div>

          <div className="space-y-3 bg-accent/5 rounded-xl p-4 border-2 border-accent/20">
            <div className="flex items-center gap-3 text-sm text-primary">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium">Secure payment processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium">Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Star className="w-4 h-4 text-green-600 fill-green-600" />
              </div>
              <span className="font-medium">Professional veterinary care</span>
            </div>
          </div>

          <Button
            onClick={submitBooking}
            disabled={bookingInProgress || !validateCurrentStep()}
            className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {bookingInProgress ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Confirm & Pay ${vet?.consultationFee}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SuccessStep = ({ vet, booking, bookingResult, router }) => (
  <div className="max-w-3xl mx-auto text-center animate-fade-in-scale">
    <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-2xl p-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-accent/20">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 titlefont">
            Appointment Confirmed! 🎉
          </h1>
          
          <p className="text-xl text-secondary mb-8 leading-relaxed">
            Your consultation with <span className="font-bold text-primary">Dr. {vet?.name}</span> has been successfully booked for{" "}
            <span className="font-bold text-primary">
              {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })} at {booking.selectedTime}
            </span>
          </p>
          
          {bookingResult?.data && (
            <Card className="bg-accent/10 border-2 border-accent/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3">
                <Hash className="w-5 h-5 text-accent" />
                <p className="font-bold text-primary">
                  Appointment ID: <span className="font-mono text-primary bg-white px-3 py-1 rounded-lg">{bookingResult.data.appointmentId || bookingResult.data._id}</span>
                </p>
              </div>
            </Card>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={() => router.push(`/dashboard`)}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View My Appointments
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push("/vet-consultation")}
              className="w-full h-14 border-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-lg"
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default function BookAppointmentPage() {
  const [vet, setVet] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [booking, setBooking] = useState({
    selectedDate: "",
    selectedTime: "",
    consultationType: "video",
    petDetails: {
      name: "",
      species: "Dog",
      breed: "",
      age: "",
      weight: "",
      gender: "Male",
      medicalHistory: "",
      currentSymptoms: "",
      urgencyLevel: "Medium"
    },
    reason: "",
    mediaFiles: [],
    paymentMethod: "mock"
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    
    if (date) {
      setBooking(prev => ({ ...prev, selectedDate: date }));
    }
    if (time) {
      setBooking(prev => ({ ...prev, selectedTime: time }));
    }

    const pendingBooking = localStorage.getItem('pendingBooking');
    const storedVetId = localStorage.getItem('vetId');
    
    if (pendingBooking && storedVetId === id) {
      setBooking(JSON.parse(pendingBooking));
      setCurrentStep(4);
      localStorage.removeItem('pendingBooking');
      localStorage.removeItem('vetId');
    }

    fetchVetAndUser();
  }, [id]);

  const fetchVetAndUser = async () => {
    try {
      setLoading(true);
      const [vetResponse, userResponse] = await Promise.all([
        fetch(`/api/vet/${id}`),
        getAuthenticatedUser()
      ]);
      
      const vetData = await vetResponse.json();
      
      if (vetData.success) {
        setVet(vetData.data);
        setAvailableSlots(vetData.data.availableSlots || []);
      }
      
      if (userResponse) {
        setUser(userResponse);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setBooking(prevBooking => {
      if (section === "petDetails") {
        return {
          ...prevBooking,
          petDetails: {
            ...prevBooking.petDetails,
            [field]: value
          }
        };
      } else {
        return {
          ...prevBooking,
          [field]: value
        };
      }
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          type: file.type.startsWith("image/") ? "image" : "video",
          url: URL.createObjectURL(file),
          filename: file.name,
          description: ""
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setBooking(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...uploadedFiles]
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setBooking(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const submitBooking = async () => {
    if (!user) {
      localStorage.setItem('pendingBooking', JSON.stringify(booking));
      localStorage.setItem('vetId', id);
      router.push("/login");
      return;
    }

    setBookingInProgress(true);
    try {
      // Step 1: Create appointment first
      const bookingData = {
        userId: user._id,
        vetId: id,
        petDetails: booking.petDetails,
        scheduledDate: booking.selectedDate,
        scheduledTime: {
          startTime: booking.selectedTime,
          endTime: addMinutesToTime(booking.selectedTime, 30),
          duration: 30
        },
        consultationType: booking.consultationType,
        reason: booking.reason,
        mediaFiles: booking.mediaFiles,
        paymentMethod: "stripe",
        urgencyLevel: booking.petDetails.urgencyLevel
      };

      const appointmentResponse = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const appointmentResult = await appointmentResponse.json();
      
      if (!appointmentResult.success) {
        toast.error(appointmentResult.message || "Failed to create appointment");
        setBookingResult(appointmentResult);
        setBookingInProgress(false);
        return;
      }

      const appointmentId = appointmentResult.data._id;
      setCreatedAppointmentId(appointmentId);

      // Step 2: Create Stripe checkout session
      const paymentResponse = await fetch("/api/appointments/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          userId: user._id,
          vetId: id,
          amount: vet?.consultationFee || 0,
          currency: vet?.currency || "USD"
        })
      });

      const paymentResult = await paymentResponse.json();
      
      if (!paymentResult.success) {
        toast.error(paymentResult.message || "Failed to create payment session");
        setBookingResult(paymentResult);
        setBookingInProgress(false);
        return;
      }

      // Step 3: Redirect to Stripe checkout
      if (paymentResult.url) {
        // Store appointment ID for success page
        localStorage.setItem('pendingAppointmentId', appointmentId);
        
        // Redirect to Stripe checkout
        window.location.href = paymentResult.url;
      } else if (paymentResult.sessionId) {
        // Fallback: Use Stripe.js if URL not provided
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        
        if (stripe) {
          localStorage.setItem('pendingAppointmentId', appointmentId);
          await stripe.redirectToCheckout({
            sessionId: paymentResult.sessionId
          });
        } else {
          throw new Error("Failed to initialize Stripe");
        }
      } else {
        throw new Error("No checkout URL or session ID provided");
      }
      
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to process booking. Please try again.");
      setBookingResult({
        success: false,
        message: "Failed to book appointment. Please try again."
      });
      setBookingInProgress(false);
    }
  };

  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return date.toTimeString().slice(0, 5);
  };

  const nextStep = async () => {
    if (validateCurrentStep()) {
      if (currentStep === 3 && !user) {
        localStorage.setItem('pendingBooking', JSON.stringify(booking));
        localStorage.setItem('vetId', id);
        toast.success("Please sign in to complete your booking");
        router.push("/login");
        return;
      }
      setCurrentStep(prev => prev + 1);
      toast.success(`Step ${currentStep + 1} completed!`);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return booking.selectedDate && booking.selectedTime;
      case 2:
        return booking.petDetails.name && booking.petDetails.species && booking.reason;
      case 3:
        return booking.consultationType;
      case 4:
        return true;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2 titlefont">Preparing your booking...</h2>
            <p className="text-secondary">Just a moment</p>
          </div>
        </div>
      </div>
    );
  }



      const steps = [
    { number: 1, title: "Date & Time" },
    { number: 2, title: "Pet Details" },
    { number: 3, title: "Consultation" },
    { number: 4, title: "Review" },
    { number: 5, title: "Success" }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DateTimeStep booking={booking} handleInputChange={handleInputChange} availableSlots={availableSlots} />;
      case 2:
        return <PetDetailsStep booking={booking} handleInputChange={handleInputChange} handleFileUpload={handleFileUpload} removeFile={removeFile} uploading={uploading} />;
      case 3:
        return <ConsultationTypeStep booking={booking} handleInputChange={handleInputChange} user={user} />;
      case 4:
        return <PaymentStep booking={booking} vet={vet} submitBooking={submitBooking} bookingInProgress={bookingInProgress} validateCurrentStep={validateCurrentStep} />;
      case 5:
        return <SuccessStep vet={vet} booking={booking} bookingResult={bookingResult} router={router} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b-2 border-accent/20 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-primary hover:text-accent hover:bg-accent/10"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary titlefont">Book Appointment</h1>
                {vet && (
                  <p className="text-secondary text-sm flex items-center gap-1 mt-1">
                    <Stethoscope className="w-4 h-4 text-accent" />
                    with Dr. {vet.name}
                  </p>
                )}
              </div>
            </div>
            
            {user ? (
              <div className="text-right bg-accent/10 px-4 py-2 rounded-xl border-2 border-accent/20">
                <p className="text-xs text-secondary">Booking for</p>
                <p className="font-bold text-primary">{user.name}</p>
              </div>
            ) : (
              <div className="text-right bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-200">
                <p className="text-sm text-amber-700 font-bold">Guest Mode</p>
                <p className="text-xs text-amber-600">Login required at checkout</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Progress Steps */}
        <Card className="mb-12 bg-white/90 backdrop-blur-md border-2 border-accent/20 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              {steps.slice(0, 4).map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="relative">
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 relative z-10
                      ${currentStep >= step.number 
                        ? "bg-primary text-white shadow-xl ring-4 ring-accent/20 scale-110" 
                        : "bg-secondary text-secondary border-2 border-accent/30"
                      }
                    `}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {currentStep === step.number && (
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-bold transition-colors min-w-[80px] ${
                    currentStep >= step.number ? "text-primary" : "text-secondary"
                  }`}>
                    {step.title}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-6 transition-all duration-500 rounded-full ${
                      currentStep > step.number ? "bg-gradient-to-r from-primary to-accent" : "bg-accent/20"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-12 max-w-6xl mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 h-14 px-8 border-2 border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={submitBooking}
                disabled={bookingInProgress || !validateCurrentStep()}
                className="flex items-center gap-2 h-14 px-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl relative overflow-hidden group disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {bookingInProgress ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Confirm & Pay ${vet?.consultationFee}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="flex items-center gap-2 h-14 px-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl relative overflow-hidden group disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {currentStep === 3 && !user ? "Sign In to Continue" : "Continue"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            )}
          </div>
        )}

        {/* Error Message */}
        {bookingResult && !bookingResult.success && (
          <Card className="mt-8 max-w-6xl mx-auto bg-red-50 border-2 border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex gap-4 items-start">
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 text-lg mb-1">Booking Failed</h3>
                  <p className="text-red-700">{bookingResult.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 