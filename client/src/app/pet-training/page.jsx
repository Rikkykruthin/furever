"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Star, 
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Clock,
  DollarSign,
  Video,
  Users,
  Award,
  Grid3X3,
  List,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PetTrainingPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    location: "",
    trainingMode: "",
    minRating: 0,
    maxFee: 200,
    sortBy: "rating",
    sortOrder: "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    specializations: [],
    locations: [],
    trainingModes: ["video", "in_person", "group_video"],
    priceRange: { minFee: 0, maxFee: 200, avgFee: 50 }
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTrainers: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchTrainers();
  }, [filters, pagination.currentPage]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: 12
      });

      const response = await fetch(`/api/trainer?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setTrainers(data.data.trainers);
        setPagination(data.data.pagination);
        setAvailableFilters(data.data.filters);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
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
      trainingMode: "",
      minRating: 0,
      maxFee: 200,
      sortBy: "rating",
      sortOrder: "desc"
    });
  };

  const TrainerCard = ({ trainer, isListView = false }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md ${isListView ? 'flex flex-row' : ''}`}>
      <div className={`relative ${isListView ? 'w-48 flex-shrink-0' : 'w-full h-48'}`}>
        <img
          src={trainer.photo || "/default-avatar.svg"}
          alt={trainer.name}
          className={`w-full h-full object-cover ${isListView ? 'rounded-l-lg' : 'rounded-t-lg'} group-hover:scale-105 transition-transform duration-300`}
        />
        {trainer.isOnline && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
        )}
        {trainer.isAvailableNow && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white">
            Available Now
          </Badge>
        )}
      </div>
      
      <CardContent className={`p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                {trainer.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{trainer.rating?.average?.toFixed(1) || "New"}</span>
                <span className="text-slate-500 text-sm">
                  ({trainer.rating?.totalReviews || 0} reviews)
                </span>
              </div>
              {trainer.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {trainer.trainingSpecialties?.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {trainer.trainingSpecialties?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{trainer.trainingSpecialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>{trainer.yearsOfExperience} years exp</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{trainer.location?.city || "Remote"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>${trainer.sessionFee}/session</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{trainer.responseTimeFormatted || "Quick"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {trainer.trainingModes?.includes("video") && (
              <Badge variant="secondary" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            {trainer.trainingModes?.includes("in_person") && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                In-Person
              </Badge>
            )}
            {trainer.trainingModes?.includes("group_video") && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Group
              </Badge>
            )}
          </div>

          {trainer.nextAvailableSlot && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-800">
                <span className="font-medium">Next available:</span>
                <span className="ml-2">
                  {new Date(trainer.nextAvailableSlot.date).toLocaleDateString()} at {trainer.nextAvailableSlot.time}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => router.push(`/pet-training/${trainer._id}`)}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push(`/pet-training/${trainer._id}/book`)}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Book Session
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
            <div className="inline-flex items-center gap-2 bg-orange-700/30 border border-orange-500/40 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
              <GraduationCap className="w-4 h-4 text-orange-300" />
              <span className="text-sm font-medium text-orange-200">Professional Pet Training</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Expert Pet Training
              <span className="block text-orange-300">
                Virtual Sessions
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Transform your pet's behavior with professional trainers through personalized video sessions. 
              From basic obedience to advanced skills - we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Training Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowDemoVideo(true)}
                className="border-2 border-slate-300 text-white hover:bg-slate-700 hover:border-slate-400 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Find Trainers Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Find Your Perfect Pet Trainer
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse our network of certified pet trainers and book your training session today
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for trainers by name, specialization, or location..."
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
                  variant={filters.trainingMode === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("trainingMode", filters.trainingMode === "video" ? "" : "video")}
                >
                  Video Sessions
                </Button>
                <Button
                  variant={filters.trainingMode === "in_person" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("trainingMode", filters.trainingMode === "in_person" ? "" : "in_person")}
                >
                  In-Person
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
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                {pagination.totalTrainers} Trainers Found
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

          {/* Trainer Grid/List */}
          {!loading && (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {trainers.map((trainer) => (
                <TrainerCard 
                  key={trainer._id} 
                  trainer={trainer} 
                  isListView={viewMode === "list"} 
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && trainers.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                No trainers found
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
              Ready to Start Training Your Pet?
            </h2>
            <p className="text-xl mb-8 text-slate-300">
              Connect with certified pet trainers and see real results in your pet's behavior and obedience.
            </p>
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Book Your First Session
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {showDemoVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDemoVideo(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDemoVideo(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6 text-slate-800" />
            </button>

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/XQRgci18tvY?autoplay=1"
                title="Pet Training Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>

            {/* Video Info */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Pet Training Demo
              </h3>
              <p className="text-slate-600">
                Watch how our professional trainers work with pets through virtual sessions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}