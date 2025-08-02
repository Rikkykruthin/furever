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
  Hash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "../../../../../actions/loginActions";

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
          ? 'border-indigo-400 shadow-lg shadow-indigo-100' 
          : hasValue
          ? 'border-slate-300 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}>
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isFocused ? 'text-indigo-500' : 'text-slate-400'
          }`} />
        )}
        
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          className={`w-full h-14 px-4 ${Icon ? 'pl-12' : 'pl-4'} pr-4 bg-transparent text-slate-800 placeholder-transparent focus:outline-none rounded-xl`}
        />
        
        <label className={`absolute left-4 ${Icon ? 'left-12' : 'left-4'} transition-all duration-200 pointer-events-none ${
          isFocused || hasValue
            ? '-top-2 text-xs bg-white px-2 font-medium'
            : 'top-1/2 transform -translate-y-1/2 text-slate-500'
        } ${isFocused ? 'text-indigo-600' : 'text-slate-600'}`}>
          {label} {required && <span className="text-red-400">*</span>}
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
          ? 'border-indigo-400 shadow-lg shadow-indigo-100' 
          : hasValue
          ? 'border-slate-300 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}>
        <textarea
          value={value || ""}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          rows={rows}
          maxLength={maxChars}
          className="w-full p-4 pt-6 bg-transparent text-slate-800 placeholder-transparent focus:outline-none rounded-xl resize-none"
        />
        
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFocused || hasValue
            ? '-top-2 text-xs bg-white px-2 font-medium'
            : 'top-4 text-slate-500'
        } ${isFocused ? 'text-indigo-600' : 'text-slate-600'}`}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {isFocused && (
          <div className="absolute bottom-2 right-3 text-xs text-slate-400">
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
          ? 'border-indigo-400 shadow-lg shadow-indigo-100' 
          : hasValue
          ? 'border-slate-300 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}>
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isFocused || isOpen ? 'text-indigo-500' : 'text-slate-400'
          }`} />
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`w-full h-14 px-4 ${Icon ? 'pl-12' : 'pl-4'} pr-10 bg-transparent text-slate-800 focus:outline-none rounded-xl text-left`}
        >
          {displayValue}
        </button>
        
        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
        
        <label className={`absolute left-4 ${Icon ? 'left-12' : 'left-4'} transition-all duration-200 pointer-events-none ${
          isFocused || hasValue || isOpen
            ? '-top-2 text-xs bg-white px-2 font-medium'
            : 'top-1/2 transform -translate-y-1/2 text-slate-500'
        } ${isFocused || isOpen ? 'text-indigo-600' : 'text-slate-600'}`}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
            {options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <button
                  key={index}
                  type="button"
                  onMouseDown={() => handleOptionClick(optionValue)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none first:rounded-t-xl last:rounded-b-xl"
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
    color: "from-slate-600 to-slate-700"
  },
  {
    id: "audio",
    name: "Voice Call",
    icon: Phone,
    description: "High-quality audio consultation",
    duration: "20 min",
    price: "Reduced",
    features: ["Crystal Audio", "Quick Setup", "Mobile"],
    color: "from-emerald-600 to-emerald-700"
  },
  {
    id: "chat",
    name: "Text Chat",
    icon: MessageCircle,
    description: "Real-time messaging consultation",
    duration: "45 min",
    price: "Budget",
    features: ["Text & Media", "File Share", "24/7"],
    color: "from-indigo-600 to-indigo-700"
  }
];

const PET_SPECIES = [
  "Dog", "Cat", "Bird", "Rabbit", "Hamster", "Guinea Pig", "Fish", "Reptile", "Other"
];

const URGENCY_LEVELS = [
  { value: "Low", label: "Routine", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🌿" },
  { value: "Medium", label: "Moderate", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚡" },
  { value: "High", label: "Urgent", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "🔥" },
  { value: "Emergency", label: "Emergency", color: "bg-red-50 text-red-700 border-red-200", icon: "🚨" }
];

// Step Components - Moved outside to prevent re-creation on renders
const DateTimeStep = ({ booking, handleInputChange, availableSlots }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">When would you like to meet?</h2>
      <p className="text-slate-600">Choose your preferred appointment time</p>
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Select Date</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {availableSlots.map((daySlot, index) => {
              const date = new Date(daySlot.date);
              const isSelected = booking.selectedDate === daySlot.date;
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => handleInputChange("", "selectedDate", daySlot.date)}
                  className={`p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 ${
                    isSelected 
                      ? 'bg-slate-600 text-white shadow-lg' 
                      : isToday 
                      ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-300' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-medium opacity-75">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Available Times</h3>
          </div>
        </div>
        <div className="p-6">
          {booking.selectedDate ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availableSlots
                  .find(slot => slot.date === booking.selectedDate)
                  ?.slots?.map((timeSlot, index) => (
                    <button
                      key={index}
                      onClick={() => handleInputChange("", "selectedTime", timeSlot.startTime)}
                      className={`p-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                        booking.selectedTime === timeSlot.startTime 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {timeSlot.startTime}
                    </button>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Select a date to see available times</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const PetDetailsStep = ({ booking, handleInputChange, handleFileUpload, removeFile, uploading }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Tell us about your pet</h2>
      <p className="text-slate-600">This helps our vet provide the best care</p>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3 text-white">
          <PawPrint className="w-5 h-5" />
          <h3 className="font-semibold">Pet Information</h3>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
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
          <h4 className="text-slate-700 font-medium">How urgent is this consultation?</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {URGENCY_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInputChange("petDetails", "urgencyLevel", level.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  booking.petDetails.urgencyLevel === level.value 
                    ? level.color.replace('50', '100').replace('border-', 'border-2 border-') + ' shadow-lg' 
                    : level.color + ' hover:shadow-md'
                }`}
              >
                <div className="text-center space-y-1">
                  <div className="text-xl">{level.icon}</div>
                  <div className="font-medium text-sm">{level.label}</div>
                </div>
              </button>
            ))}
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
          <h4 className="text-slate-700 font-medium">Upload Photos/Videos <span className="text-slate-500">(Optional)</span></h4>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="font-medium text-slate-700 mb-1">
                {uploading ? "Uploading..." : "Click to upload media"}
              </p>
              <p className="text-sm text-slate-500">
                Help us understand your pet's condition
              </p>
            </label>
          </div>
          
          {booking.mediaFiles && booking.mediaFiles.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {booking.mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                    {file.type === "image" ? (
                      <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileImage className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Placeholder components for other steps (keep original functionality for now)
const ConsultationTypeStep = ({ booking, handleInputChange, user }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">How would you like to consult?</h2>
      <p className="text-slate-600">Choose the consultation method that works best for you</p>
    </div>

    {!user && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Account Required</p>
            <p className="text-amber-700 text-sm">You'll need to sign in before completing your booking.</p>
          </div>
        </div>
      </div>
    )}

    <div className="grid md:grid-cols-3 gap-6">
      {CONSULTATION_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = booking.consultationType === type.id;
        
        return (
          <div
            key={type.id}
            onClick={() => handleInputChange("", "consultationType", type.id)}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              isSelected ? 'scale-105' : ''
            }`}
          >
            <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${
              isSelected ? 'border-slate-400 shadow-lg' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className={`bg-gradient-to-r ${type.color} p-6 text-white text-center`}>
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">{type.name}</h3>
                <p className="text-sm opacity-90">{type.duration}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-sm text-center">{type.description}</p>
                
                <div className="text-center">
                  <Badge variant={isSelected ? "default" : "secondary"} className="bg-slate-100 text-slate-700">
                    {type.price}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const PaymentStep = ({ booking, vet, submitBooking, bookingInProgress, validateCurrentStep }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & Confirm</h2>
      <p className="text-slate-600">Please review your appointment details</p>
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-semibold">Appointment Summary</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Vet Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Dr. {vet?.name}</p>
              <p className="text-sm text-slate-600">{vet?.specializations?.join(", ")}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium text-slate-800">
                {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Time:</span>
              <span className="font-medium text-slate-800">{booking.selectedTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Type:</span>
              <span className="font-medium text-slate-800 capitalize">{booking.consultationType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pet:</span>
              <span className="font-medium text-slate-800">{booking.petDetails.name} ({booking.petDetails.species})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Urgency:</span>
              <span className="font-medium text-slate-800">{booking.petDetails.urgencyLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Payment</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800 mb-1">
              ${vet?.consultationFee}
            </div>
            <p className="text-slate-600">Consultation fee</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Star className="w-4 h-4 text-emerald-500" />
              <span>Professional veterinary care</span>
            </div>
          </div>

          <Button
            onClick={submitBooking}
            disabled={bookingInProgress || !validateCurrentStep()}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
          >
            {bookingInProgress ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Confirm & Pay ${vet?.consultationFee}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const SuccessStep = ({ vet, booking, bookingResult, router }) => (
  <div className="max-w-2xl mx-auto text-center">
    <div className="bg-white rounded-2xl shadow-lg p-12">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        Appointment Confirmed! 🎉
      </h1>
      
      <p className="text-lg text-slate-600 mb-8">
        Your consultation with <span className="font-semibold">Dr. {vet?.name}</span> has been successfully booked for{" "}
        <span className="font-semibold">
          {new Date(booking.selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric' 
          })} at {booking.selectedTime}
        </span>
      </p>
      
      {bookingResult?.data && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
          <p className="font-medium text-slate-700">
            Appointment ID: <span className="font-mono text-slate-800">{bookingResult.data.appointmentId}</span>
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        <Button 
          onClick={() => router.push(`/dashboard`)}
          className="w-full h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
        >
          <Calendar className="w-5 h-5 mr-2" />
          View My Appointments
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => router.push("/vet-consultation")}
          className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Book Another Appointment
        </Button>
      </div>
    </div>
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
        paymentMethod: booking.paymentMethod,
        urgencyLevel: booking.petDetails.urgencyLevel
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      setBookingResult(result);
      
      if (result.success) {
        setCurrentStep(5);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setBookingResult({
        success: false,
        message: "Failed to book appointment. Please try again."
      });
    } finally {
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
        router.push("/login");
        return;
      }
      setCurrentStep(prev => prev + 1);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-slate-700">Preparing your booking...</h2>
          <p className="text-slate-500">Just a moment</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
                <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Book Appointment</h1>
              {vet && (
                  <p className="text-slate-600 text-sm">with Dr. {vet.name}</p>
              )}
              </div>
            </div>
            
            {user ? (
              <div className="text-right">
                <p className="text-sm text-slate-500">Booking for</p>
                <p className="font-medium text-slate-800">{user.name}</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm text-amber-600 font-medium">Guest Mode</p>
                <p className="text-xs text-slate-500">Login required at checkout</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.slice(0, 4).map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${currentStep >= step.number 
                    ? "bg-slate-600 text-white shadow-md" 
                    : "bg-slate-200 text-slate-500"
                  }
                `}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium transition-colors ${
                  currentStep >= step.number ? "text-slate-700" : "text-slate-400"
                }`}>
                  {step.title}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 transition-colors ${
                    currentStep > step.number ? "bg-slate-600" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

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
              className="flex items-center gap-2 h-12 px-6 border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={submitBooking}
                disabled={bookingInProgress || !validateCurrentStep()}
                className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
              >
                {bookingInProgress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Confirm & Pay ${vet?.consultationFee}
                  </div>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
              >
                {currentStep === 3 && !user ? "Sign In to Continue" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Error Message */}
        {bookingResult && !bookingResult.success && (
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{bookingResult.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 