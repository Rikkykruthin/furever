"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Video, 
  MessageCircle, 
  Phone,
  Grid3X3,
  List,
  ChevronDown,
  Heart,
  Award,
  Users,
  Calendar,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  HeartHandshake,
  PlayCircle,
  TrendingUp,
  Globe,
  Monitor,
  Headphones,
  MessageSquare,
  BookOpen,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function VetConsultationPage() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    location: "",
    availability: "",
    minRating: 0,
    maxFee: 200,
    languages: "",
    sortBy: "rating",
    sortOrder: "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    specializations: [],
    locations: [],
    languages: [],
    priceRange: { minFee: 0, maxFee: 200, avgFee: 50 }
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVets: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchVets();
  }, [filters, pagination.currentPage]);

  const fetchVets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: 12
      });

      const response = await fetch(`/api/vet?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setVets(data.data.vets);
        setPagination(data.data.pagination);
        setAvailableFilters(data.data.filters);
      }
    } catch (error) {
      console.error("Error fetching vets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      specialization: "",
      location: "",
      availability: "",
      minRating: 0,
      maxFee: 200,
      languages: "",
      sortBy: "rating",
      sortOrder: "desc"
    });
  };

  const VetCard = ({ vet, isListView = false }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md ${isListView ? 'flex flex-row' : ''}`}>
      <div className={`relative ${isListView ? 'w-48 flex-shrink-0' : 'w-full h-48'}`}>
        <Image
                              src={vet.photo || "/default-vet-avatar.svg"}
          alt={vet.name}
          fill
          className={`object-cover ${isListView ? 'rounded-l-lg' : 'rounded-t-lg'} group-hover:scale-105 transition-transform duration-300`}
        />
        {vet.isOnline && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
        )}
        {vet.isAvailableNow && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white">
            Available Now
          </Badge>
        )}
      </div>
      
      <CardContent className={`p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                Dr. {vet.name}
              </h3>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{vet.rating?.average?.toFixed(1) || "New"}</span>
                <span className="text-slate-500 text-sm">
                  ({vet.rating?.totalReviews || 0} reviews)
                </span>
              </div>
              {vet.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {vet.specializations?.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {vet.specializations?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{vet.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span>{vet.yearsOfExperience} years exp</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{vet.location?.city || "Remote"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>${vet.consultationFee}/session</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{vet.responseTimeFormatted || "Quick"}</span>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">Languages:</span>
              <span>{vet.languages?.join(", ") || "English"}</span>
            </div>
          </div>

          {/* Consultation Modes */}
          <div className="flex gap-2">
            {vet.consultationModes?.includes("video") && (
              <Badge variant="secondary" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            {vet.consultationModes?.includes("chat") && (
              <Badge variant="secondary" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Badge>
            )}
            {vet.consultationModes?.includes("audio") && (
              <Badge variant="secondary" className="text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Audio
              </Badge>
            )}
          </div>

          {/* Next Available Slot */}
          {vet.nextAvailableSlot && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Next available:</span>
                <span className="ml-2">
                  {new Date(vet.nextAvailableSlot.date).toLocaleDateString()} at {vet.nextAvailableSlot.time}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/vet-consultation/${vet._id}`)}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push(`/vet-consultation/${vet._id}/book`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="relative bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
                            <div className="text-white space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-700/30 border border-emerald-500/40 rounded-full px-4 py-2 backdrop-blur-sm">
                    <HeartHandshake className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm font-medium text-emerald-200">Professional Pet Care</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    Expert Veterinary Care
                    <span className="block text-emerald-300">
                      At Your Fingertips
                    </span>
            </h1>
                  
                  <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                    Connect instantly with certified veterinarians through video, audio, or chat. 
                    Get professional pet care advice from the comfort of your home.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">500+</div>
                    <div className="text-sm text-slate-400">Expert Vets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">24/7</div>
                    <div className="text-sm text-slate-400">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">50k+</div>
                    <div className="text-sm text-slate-400">Consultations</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => document.getElementById('find-vets')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Find a Vet Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-slate-300 text-white hover:bg-slate-700 hover:border-slate-400 px-8 py-4 text-lg font-semibold transition-all duration-300"
                  >
                    <PlayCircle className="mr-2 w-5 h-5" />
                    How It Works
                  </Button>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <Video className="w-8 h-8 text-emerald-300 mb-4" />
                      <h3 className="font-semibold text-white mb-2">Video Calls</h3>
                      <p className="text-slate-300 text-sm">Face-to-face consultations with HD quality</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-8">
                      <MessageCircle className="w-8 h-8 text-emerald-300 mb-4" />
                      <h3 className="font-semibold text-white mb-2">Live Chat</h3>
                      <p className="text-slate-300 text-sm">Instant messaging with file sharing</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <Phone className="w-8 h-8 text-emerald-300 mb-4" />
                      <h3 className="font-semibold text-white mb-2">Audio Calls</h3>
                      <p className="text-slate-300 text-sm">Crystal clear voice consultations</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <Shield className="w-8 h-8 text-emerald-300 mb-4" />
                      <h3 className="font-semibold text-white mb-2">Secure & Private</h3>
                      <p className="text-slate-300 text-sm">HIPAA compliant consultations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We've designed the most comprehensive and user-friendly veterinary consultation platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Instant Connect</h3>
              <p className="text-slate-600">Connect with vets in under 60 seconds for urgent pet care needs</p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Verified Experts</h3>
              <p className="text-slate-600">All veterinarians are licensed and background-verified professionals</p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Affordable Care</h3>
              <p className="text-slate-600">Starting from $25 per consultation - much less than clinic visits</p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">24/7 Available</h3>
              <p className="text-slate-600">Round-the-clock availability for emergency pet consultations</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get professional veterinary care in three simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Choose Your Vet</h3>
                <p className="text-slate-600">Browse verified veterinarians by specialty, rating, and availability</p>
                <div className="absolute top-10 left-full w-8 h-0.5 bg-slate-300 hidden md:block transform -translate-y-1/2"></div>
              </div>

              <div className="relative text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Book & Connect</h3>
                <p className="text-slate-600">Schedule your appointment and connect via video, audio, or chat</p>
                <div className="absolute top-10 left-full w-8 h-0.5 bg-slate-300 hidden md:block transform -translate-y-1/2"></div>
              </div>

              <div className="relative text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Get Expert Care</h3>
                <p className="text-slate-600">Receive professional diagnosis, treatment plans, and follow-up care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties & Services Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Comprehensive Pet Care Services
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our certified veterinarians provide expert consultation across all pet care needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">General Health</h3>
              <p className="text-slate-600 mb-4">Routine check-ups, wellness advice, and general health concerns for all pets</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Wellness Check</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Vaccinations</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Preventive Care</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Behavioral Issues</h3>
              <p className="text-slate-600 mb-4">Expert guidance for pet behavior, training, and psychological well-being</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Training</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Anxiety</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Aggression</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Nutrition & Diet</h3>
              <p className="text-slate-600 mb-4">Personalized nutrition plans and dietary recommendations for optimal health</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Diet Plans</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Weight Management</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Allergies</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Skin & Allergies</h3>
              <p className="text-slate-600 mb-4">Diagnosis and treatment for skin conditions, allergies, and dermatological issues</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Skin Issues</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Allergies</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Parasites</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Senior Pet Care</h3>
              <p className="text-slate-600 mb-4">Specialized care for aging pets, managing chronic conditions and comfort</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Senior Care</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Arthritis</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Mobility</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Second Opinions</h3>
              <p className="text-slate-600 mb-4">Get expert second opinions on diagnoses, treatment plans, and medical decisions</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Diagnosis Review</span>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Treatment Options</span>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Expert Advice</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Find Veterinarians Section */}
      <div id="find-vets" className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Find Your Perfect Veterinarian
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse our network of certified veterinary professionals and book your consultation today
            </p>
          </div>

        {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search for vets by name, specialization, or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Filter Toggle and Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.availability === "online" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("availability", filters.availability === "online" ? "" : "online")}
              >
                Online Now
              </Button>
              <Button
                variant={filters.availability === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("availability", filters.availability === "available" ? "" : "available")}
              >
                Available Today
              </Button>
              <Button
                variant={filters.minRating >= 4 ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("minRating", filters.minRating >= 4 ? 0 : 4)}
              >
                4+ Rating
              </Button>
            </div>

            {/* Clear Filters */}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange("specialization", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Specializations</option>
                  {availableFilters.specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Locations</option>
                  {availableFilters.locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Max Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Fee: ${filters.maxFee}
                </label>
                <input
                  type="range"
                  min={availableFilters.priceRange.minFee}
                  max={availableFilters.priceRange.maxFee}
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange("maxFee", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="fee">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
          <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">
              {pagination.totalVets} Veterinarians Found
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4"/>
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vet Grid/List */}
        {!loading && (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"
          }>
            {vets.map((vet) => (
              <VetCard 
                key={vet._id} 
                vet={vet} 
                isListView={viewMode === "list"} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && vets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              No vets found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Transparent & Affordable Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Quality veterinary care shouldn't break the bank. Choose the consultation type that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Chat Consultation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Chat Consultation</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$25</div>
                <p className="text-slate-500 mb-6">Perfect for quick questions</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Instant messaging with vet</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Photo sharing capability</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Written care plan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">15-30 minute session</span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Chat Consultation
                </Button>
              </div>
            </div>

            {/* Audio Consultation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Audio Call</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">$40</div>
                <p className="text-slate-500 mb-6">Personal voice consultation</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Live audio conversation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Real-time Q&A session</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Detailed care instructions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">30-45 minute session</span>
                  </li>
                </ul>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Book Audio Call
                </Button>
              </div>
            </div>

            {/* Video Consultation */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Video Consultation</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-2">$60</div>
                <p className="text-slate-500 mb-6">Complete visual examination</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">HD video examination</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Visual symptom assessment</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Comprehensive care plan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">45-60 minute session</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">Follow-up chat included</span>
                  </li>
                </ul>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Book Video Call
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">💡 All consultations include a detailed summary and care recommendations</p>
            <p className="text-sm text-slate-500">Prices may vary based on specialty and complexity. Emergency consultations may have different rates.</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              What Pet Owners Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of satisfied pet owners who trust our platform for their veterinary needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "The video consultation was incredibly helpful. Dr. Smith provided excellent advice for my cat's condition and saved me a trip to the clinic."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-800">Sarah Johnson</p>
                  <p className="text-sm text-slate-500">Cat owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "Amazing service! Got help for my dog's emergency at 2 AM. The vet was professional and caring throughout the consultation."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-800">Mike Chen</p>
                  <p className="text-sm text-slate-500">Dog owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "Convenient and affordable. The chat consultation helped me understand my rabbit's dietary needs better. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-800">Emma Davis</p>
                  <p className="text-sm text-slate-500">Rabbit owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get answers to common questions about our online veterinary consultation service
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    How quickly can I connect with a vet?
                  </h3>
                  <p className="text-slate-600">Most consultations start within 2-5 minutes during business hours. We have vets available 24/7 for urgent concerns.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    Are your veterinarians licensed?
                  </h3>
                  <p className="text-slate-600">Yes, all our veterinarians are fully licensed, certified professionals with years of experience in their specialties.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    What if I need a prescription?
                  </h3>
                  <p className="text-slate-600">Our vets can prescribe medications when appropriate. We partner with pharmacies to deliver prescriptions directly to your door.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    Is this service right for emergencies?
                  </h3>
                  <p className="text-slate-600">For life-threatening emergencies, visit your nearest animal hospital. Our service is ideal for urgent care, second opinions, and non-emergency concerns.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    How does payment work?
                  </h3>
                  <p className="text-slate-600">We accept all major credit cards and PayPal. Payment is processed securely after your consultation is complete.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    Can I get follow-up care?
                  </h3>
                  <p className="text-slate-600">Absolutely! You can schedule follow-up appointments with the same vet or access our 24/7 support for ongoing questions.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    What about my pet's privacy?
                  </h3>
                  <p className="text-slate-600">We take privacy seriously. All consultations are HIPAA-compliant and your pet's medical information is completely secure and confidential.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    What if I'm not satisfied?
                  </h3>
                  <p className="text-slate-600">We offer a 100% satisfaction guarantee. If you're not happy with your consultation, we'll provide a full refund or free follow-up session.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600 mb-6">Still have questions? Our support team is here to help!</p>
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

            {/* Final CTA */}
      <div className="py-20 bg-slate-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Give Your Pet the Best Care?
          </h2>
            <p className="text-xl mb-8 text-slate-300">
              Join thousands of pet owners who trust our platform for reliable, professional veterinary consultations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold"
                onClick={() => document.getElementById('find-vets')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Your Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-400 text-white hover:bg-slate-700 hover:border-slate-300 px-8 py-4 text-lg font-semibold"
              >
                Learn More About Our Vets
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 