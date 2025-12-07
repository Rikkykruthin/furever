"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Scissors, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Heart,
  Search,
  Filter,
  ChevronDown,
  Clock,
  DollarSign,
  Star,
  Award,
  Grid3X3,
  List,
  Home,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PetGroomingPage() {
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    location: "",
    serviceType: "",
    petType: "",
    petSize: "",
    minRating: 0,
    maxPrice: 200,
    sortBy: "rating",
    sortOrder: "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    specializations: [],
    locations: [],
    serviceTypes: [],
    petTypes: [],
    petSizes: [],
    priceRange: { minPrice: 0, maxPrice: 200, avgPrice: 75 }
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalGroomers: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchGroomers();
  }, [filters, pagination.currentPage]);

  const fetchGroomers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: 12
      });

      const response = await fetch(`/api/groomer?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setGroomers(data.data.groomers);
        setPagination(data.data.pagination);
        setAvailableFilters(data.data.filters);
      }
    } catch (error) {
      console.error("Error fetching groomers:", error);
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
      serviceType: "",
      petType: "",
      petSize: "",
      minRating: 0,
      maxPrice: 200,
      sortBy: "rating",
      sortOrder: "desc"
    });
  };

  const GroomerCard = ({ groomer, isListView = false }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md ${isListView ? 'flex flex-row' : ''}`}>
      <div className={`relative ${isListView ? 'w-48 flex-shrink-0' : 'w-full h-48'}`}>
        <img
          src={groomer.photo || "/default-avatar.svg"}
          alt={groomer.name}
          className={`w-full h-full object-cover ${isListView ? 'rounded-l-lg' : 'rounded-t-lg'} group-hover:scale-105 transition-transform duration-300`}
        />
        {groomer.isOnline && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
        )}
        {groomer.isAvailableNow && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white">
            Available Now
          </Badge>
        )}
      </div>
      
      <CardContent className={`p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">
                {groomer.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{groomer.rating?.average?.toFixed(1) || "New"}</span>
                <span className="text-slate-500 text-sm">
                  ({groomer.rating?.totalReviews || 0} reviews)
                </span>
              </div>
              {groomer.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {groomer.groomingSpecialties?.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {groomer.groomingSpecialties?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{groomer.groomingSpecialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              <span>{groomer.yearsOfExperience} years exp</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{groomer.location?.city || "Mobile Service"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>From ${groomer.basePrice || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{groomer.responseTimeFormatted || "Quick"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {groomer.serviceTypes?.includes("in_salon") && (
              <Badge variant="secondary" className="text-xs">
                <Home className="h-3 w-3 mr-1" />
                Salon
              </Badge>
            )}
            {groomer.serviceTypes?.includes("mobile") && (
              <Badge variant="secondary" className="text-xs">
                <Car className="h-3 w-3 mr-1" />
                Mobile
              </Badge>
            )}
          </div>

          {groomer.salon?.name && (
            <div className="bg-pink-50 p-3 rounded-lg">
              <div className="text-sm text-pink-800">
                <span className="font-medium">Salon:</span>
                <span className="ml-2">{groomer.salon.name}</span>
              </div>
            </div>
          )}

          {groomer.nextAvailableSlot && (
            <div className="bg-emerald-50 p-3 rounded-lg">
              <div className="text-sm text-emerald-800">
                <span className="font-medium">Next available:</span>
                <span className="ml-2">
                  {new Date(groomer.nextAvailableSlot.date).toLocaleDateString()} at {groomer.nextAvailableSlot.time}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-pink-600 hover:bg-pink-700"
              onClick={() => router.push(`/pet-grooming/${groomer._id}`)}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push(`/pet-grooming/${groomer._id}/book`)}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Book Service
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
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-pink-700/30 border border-pink-500/40 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
              <Scissors className="w-4 h-4 text-pink-300" />
              <span className="text-sm font-medium text-pink-200">Professional Pet Grooming</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Premium Pet Grooming
              <span className="block text-pink-300">
                Services
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Keep your pet looking and feeling their best with our professional grooming services. 
              From basic baths to full spa treatments - your pet deserves the best care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Grooming Service
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-300 text-white hover:bg-slate-700 hover:border-slate-400 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <MapPin className="mr-2 w-5 h-5" />
                Find Groomers Near Me
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Find Groomers Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Find Your Perfect Pet Groomer
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse our network of certified pet groomers and book your grooming service today
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for groomers by name, specialization, or location..."
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
                  variant={filters.serviceType === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("serviceType", filters.serviceType === "mobile" ? "" : "mobile")}
                >
                  Mobile Service
                </Button>
                <Button
                  variant={filters.serviceType === "in_salon" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("serviceType", filters.serviceType === "in_salon" ? "" : "in_salon")}
                >
                  Salon Service
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange("specialization", e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">All Locations</option>
                    {availableFilters.locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pet Type
                  </label>
                  <select
                    value={filters.petType}
                    onChange={(e) => handleFilterChange("petType", e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">All Pet Types</option>
                    {availableFilters.petTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Price: ${filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min={availableFilters.priceRange.minPrice}
                    max={availableFilters.priceRange.maxPrice}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", parseInt(e.target.value))}
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
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="rating">Rating</option>
                    <option value="experience">Experience</option>
                    <option value="price">Price</option>
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
                {pagination.totalGroomers} Groomers Found
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

          {/* Groomer Grid/List */}
          {!loading && (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {groomers.map((groomer) => (
                <GroomerCard 
                  key={groomer._id} 
                  groomer={groomer} 
                  isListView={viewMode === "list"} 
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && groomers.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                No groomers found
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

      {/* CTA Section */}
      <div className="py-20 bg-slate-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Pamper Your Pet?
            </h2>
            <p className="text-xl mb-8 text-slate-300">
              Book professional grooming services and keep your pet looking and feeling their absolute best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg font-semibold"
              >
                Book Grooming Service
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-400 text-white hover:bg-slate-700 hover:border-slate-300 px-8 py-4 text-lg font-semibold"
              >
                View Our Groomers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}