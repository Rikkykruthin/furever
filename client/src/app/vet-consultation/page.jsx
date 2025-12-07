"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Target,
  Scissors,
  GraduationCap,
  X,
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function VetConsultationPage() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
    totalVets: 0,
    hasPrev: false,
    hasNext: false
  });
  const [favorites, setFavorites] = useState(new Set());
  const filtersRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    fetchVets();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('vetFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    
    // Mouse tracking for parallax
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [filters, pagination.currentPage]);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        // Don't close if clicking on filter toggle button
        if (!event.target.closest('[data-filter-toggle]')) {
          setShowFilters(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: 12
      });

      const response = await fetch(`/api/vet?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setVets(data.data.vets || []);
        setPagination({
          ...pagination,
          ...data.data.pagination,
          hasPrev: data.data.pagination.currentPage > 1,
          hasNext: data.data.pagination.currentPage < data.data.pagination.totalPages
        });
        setAvailableFilters(data.data.filters || availableFilters);
      } else {
        setError(data.message || "Failed to fetch veterinarians");
        toast.error(data.message || "Failed to load veterinarians");
      }
    } catch (error) {
      console.error("Error fetching vets:", error);
      setError("Unable to connect to the server. Please try again later.");
      toast.error("Failed to load veterinarians");
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    toast.success("Filters cleared");
  };

  const toggleFavorite = (vetId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(vetId)) {
      newFavorites.delete(vetId);
      toast.success("Removed from favorites");
    } else {
      newFavorites.add(vetId);
      toast.success("Added to favorites");
    }
    setFavorites(newFavorites);
    localStorage.setItem('vetFavorites', JSON.stringify([...newFavorites]));
  };

  const VetCard = ({ vet, isListView = false }) => {
    const isFavorite = favorites.has(vet._id);
    
    return (
      <Card className={`group hover:shadow-2xl transition-all duration-300 border-2 border-accent/20 hover:border-primary/40 bg-white ${isListView ? 'flex flex-row' : ''} overflow-hidden`}>
        <div className={`relative ${isListView ? 'w-64 flex-shrink-0' : 'w-full h-64'}`}>
          <Image
            src={vet.photo || "/default-vet-avatar.svg"}
            alt={vet.name}
            fill
            className={`object-cover ${isListView ? 'rounded-l-lg' : 'rounded-t-lg'} group-hover:scale-110 transition-transform duration-500`}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300?text=Dr.+Vet";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {vet.isOnline && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-4 h-4 bg-green-500 rounded-full ring-4 ring-white shadow-lg animate-pulse"></div>
            </div>
          )}
          
          {vet.isAvailableNow && (
            <Badge className="absolute top-4 left-4 bg-primary text-white border-2 border-white shadow-lg z-10">
              <Zap className="w-3 h-3 mr-1" />
              Available Now
            </Badge>
          )}
          
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => router.push(`/vet-consultation/${vet._id}/book`)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
        
        <CardContent className={`p-6 ${isListView ? 'flex-1' : ''}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors titlefont">
                    Dr. {vet.name}
                  </h3>
                  {vet.isVerified && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="bg-accent/20 text-primary border-accent/30">
                        <Award className="w-3 h-3 mr-1" />
                        Verified Professional
                      </Badge>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 h-8 w-8 hover:bg-accent/20"
                  onClick={() => toggleFavorite(vet._id)}
                >
                  <Heart 
                    className={`h-5 w-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-primary">{vet.rating?.average?.toFixed(1) || "New"}</span>
                  <span className="text-secondary text-sm">
                    ({vet.rating?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {vet.specializations?.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-primary/30 text-primary bg-accent/10">
                    {spec}
                  </Badge>
                ))}
                {vet.specializations?.length > 3 && (
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-accent/10">
                    +{vet.specializations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Info Row */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-primary">
                <Stethoscope className="h-4 w-4 text-accent" />
                <span className="font-medium">{vet.yearsOfExperience || 0} years exp</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="font-medium">{vet.location?.city || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="h-4 w-4 text-accent" />
                <span className="font-medium">${vet.consultationFee || 0}/session</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-medium">{vet.responseTimeFormatted || "Quick"}</span>
              </div>
            </div>

            {/* Languages */}
            {vet.languages && vet.languages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Globe className="h-4 w-4 text-accent" />
                  <span className="font-medium">Languages:</span>
                  <span>{vet.languages.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Consultation Modes */}
            <div className="flex gap-2 flex-wrap">
              {vet.consultationModes?.includes("video") && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Video className="h-3 w-3 mr-1" />
                  Video
                </Badge>
              )}
              {vet.consultationModes?.includes("chat") && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Badge>
              )}
              {vet.consultationModes?.includes("audio") && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Phone className="h-3 w-3 mr-1" />
                  Audio
                </Badge>
              )}
            </div>

            {/* Next Available Slot */}
            {vet.nextAvailableSlot && (
              <div className="bg-accent/10 border-2 border-accent/20 p-3 rounded-lg">
                <div className="text-sm text-primary">
                  <span className="font-bold">Next available:</span>
                  <span className="ml-2">
                    {new Date(vet.nextAvailableSlot.date).toLocaleDateString()} at {vet.nextAvailableSlot.time}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline"
                className="flex-1 border-2 border-primary/30 text-primary hover:bg-primary hover:text-white"
                onClick={() => router.push(`/vet-consultation/${vet._id}`)}
              >
                View Profile
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
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

      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-primary via-primary/95 to-primary text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(60, 78, 89, 1) 0%, rgba(60, 78, 89, 0.95) 50%, rgba(60, 78, 89, 1) 100%), radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.15), transparent 70%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.2), transparent 50%)`,
        }}></div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
                    <HeartHandshake className="w-5 h-5 text-accent" />
                    <span className="text-sm font-semibold">Professional Pet Care</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight titlefont">
                    Complete Pet Care
                    <span className="block text-accent mt-2">
                      At Your Fingertips
                    </span>
                  </h1>
                  
                  <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                    Connect with certified veterinarians, professional trainers, and groomers. 
                    Everything your pet needs - from health to training to grooming.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-accent">800+</div>
                    <div className="text-sm text-white/80">Pet Professionals</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-accent">24/7</div>
                    <div className="text-sm text-white/80">Available</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-accent">75k+</div>
                    <div className="text-sm text-white/80">Happy Pets</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-primary px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => document.getElementById('find-vets')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Find a Vet Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold transition-all duration-300"
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
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                      <Video className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-semibold text-white mb-2">Video Calls</h3>
                      <p className="text-white/80 text-sm">Face-to-face consultations with HD quality</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                      <MessageCircle className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-semibold text-white mb-2">Live Chat</h3>
                      <p className="text-white/80 text-sm">Instant messaging with file sharing</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                      <Phone className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-semibold text-white mb-2">Audio Calls</h3>
                      <p className="text-white/80 text-sm">Crystal clear voice consultations</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                      <Shield className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-semibold text-white mb-2">Secure & Private</h3>
                      <p className="text-white/80 text-sm">HIPAA compliant consultations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Find Veterinarians Section */}
      <div id="find-vets" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-primary">Find Your Perfect Match</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 titlefont">
              Find Your Perfect Pet Professional
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              Browse our network of certified veterinarians, trainers, and groomers to book your service today
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-accent/20 p-8 mb-12">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
              <Input
                placeholder="Search for vets, trainers, groomers by name, specialization, or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-accent/30 focus:border-primary focus:ring-primary/20 rounded-xl"
              />
            </div>

            {/* Filter Toggle and Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-2 border-primary/30 text-primary hover:bg-primary/5"
                data-filter-toggle
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
                  className={filters.availability === "online" ? "bg-primary text-white" : "border-primary/30 text-primary"}
                >
                  Online Now
                </Button>
                <Button
                  variant={filters.availability === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("availability", filters.availability === "available" ? "" : "available")}
                  className={filters.availability === "available" ? "bg-primary text-white" : "border-primary/30 text-primary"}
                >
                  Available Today
                </Button>
                <Button
                  variant={filters.minRating >= 4 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("minRating", filters.minRating >= 4 ? 0 : 4)}
                  className={filters.minRating >= 4 ? "bg-primary text-white" : "border-primary/30 text-primary"}
                >
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  4+ Rating
                </Button>
              </div>

              {/* Clear Filters */}
              {(filters.search || filters.specialization || filters.location || filters.availability || filters.minRating > 0 || filters.maxFee < 200) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-accent">
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div ref={filtersRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-accent/5 rounded-xl border-2 border-accent/20">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange("specialization", e.target.value)}
                    className="w-full p-3 border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white text-primary font-medium"
                  >
                    <option value="">All Specializations</option>
                    {availableFilters.specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="w-full p-3 border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white text-primary font-medium"
                  >
                    <option value="">All Locations</option>
                    {availableFilters.locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Max Fee */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Max Fee: ${filters.maxFee}
                  </label>
                  <input
                    type="range"
                    min={availableFilters.priceRange.minFee}
                    max={availableFilters.priceRange.maxFee}
                    value={filters.maxFee}
                    onChange={(e) => handleFilterChange("maxFee", parseInt(e.target.value))}
                    className="w-full h-2 bg-accent/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, #3c4e59 0%, #3c4e59 ${(filters.maxFee / availableFilters.priceRange.maxFee) * 100}%, #dccdb9 ${(filters.maxFee / availableFilters.priceRange.maxFee) * 100}%, #dccdb9 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-secondary mt-1">
                    <span>${availableFilters.priceRange.minFee}</span>
                    <span>${availableFilters.priceRange.maxFee}</span>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="w-full p-3 border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-white text-primary font-medium"
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
          <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border-2 border-accent/20">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-primary titlefont">
                {pagination.totalVets} Pet Professionals Found
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-primary text-white" : "border-primary/30 text-primary"}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-primary text-white" : "border-primary/30 text-primary"}
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
                <Card key={i} className="animate-pulse border-2 border-accent/20">
                  <div className="h-64 bg-accent/20 rounded-t-lg"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-accent/20 rounded w-3/4"></div>
                    <div className="h-4 bg-accent/20 rounded w-1/2"></div>
                    <div className="h-4 bg-accent/20 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-red-200 p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary mb-2">Oops! Something went wrong</h3>
              <p className="text-secondary mb-6">{error}</p>
              <Button onClick={fetchVets} className="bg-primary hover:bg-primary/90 text-white">
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Vet Grid/List */}
          {!loading && !error && (
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
          {!loading && !error && vets.length === 0 && (
            <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-accent/20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-primary mb-2 titlefont">
                No professionals found
              </h3>
              <p className="text-secondary mb-6">
                Try adjusting your filters or search terms to find vets, trainers, or groomers
              </p>
              <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90 text-white">
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="border-2 border-primary/30 text-primary disabled:opacity-50"
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
                      className={pageNum === pagination.currentPage ? "bg-primary text-white" : "border-primary/30 text-primary"}
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
                className="border-2 border-primary/30 text-primary disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
