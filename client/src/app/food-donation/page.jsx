"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Utensils,
  MapPin,
  Upload,
  X,
  CheckCircle,
  Loader2,
  Navigation,
  Phone,
  Mail,
  Clock,
  Image as ImageIcon,
  Trash2,
  Plus,
  Crosshair,
  Map,
  Sparkles,
  Zap,
  Heart,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Package,
  User,
  Eye,
  MessageCircle,
  Share2,
  AlertCircle,
  TrendingUp,
  Award,
  Gift,
  ShoppingBag,
  Filter,
  Search,
  Star,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getToken } from "../../../actions/userActions";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";

export default function FoodDonationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("browse");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    foodName: "",
    foodType: "dry_food",
    quantity: "",
    unit: "kg",
    expiryDate: "",
    description: "",
    contactInfo: {
      phone: "",
      email: "",
      preferredContact: "app",
    },
    availability: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      pickupTime: "",
    },
  });

  // Location and media state
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [address, setAddress] = useState("");
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    { id: 1, title: "Food Details", icon: Utensils },
    { id: 2, title: "Photos", icon: ImageIcon },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Contact Info", icon: Phone },
    { id: 5, title: "Review & Submit", icon: CheckCircle },
  ];

  const foodTypes = [
    { value: "dry_food", label: "Dry Food", icon: Package },
    { value: "wet_food", label: "Wet Food", icon: Utensils },
    { value: "treats", label: "Treats", icon: Gift },
    { value: "supplements", label: "Supplements", icon: Award },
    { value: "raw_food", label: "Raw Food", icon: Heart },
    { value: "other", label: "Other", icon: Package },
  ];

  const units = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "packets", label: "Packets" },
    { value: "boxes", label: "Boxes" },
    { value: "cans", label: "Cans" },
    { value: "pieces", label: "Pieces" },
  ];

  useEffect(() => {
    initializeAuth();
    fetchDonations();
    getCurrentLocation();
  }, []);

  const initializeAuth = async () => {
    try {
      const userToken = await getToken("userToken");
      if (userToken) {
        setToken(userToken);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });

      // Get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "FurEver Food Donation App v1.0",
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        if (data?.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    } catch (error) {
      console.error("Location error:", error);
    }
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: "available",
        limit: "20",
      });

      if (userLocation) {
        params.append("lat", userLocation.latitude.toString());
        params.append("lng", userLocation.longitude.toString());
        params.append("radius", "50");
      }

      const response = await axios.get(`/api/food-donations?${params}`);
      if (response.data.success) {
        setDonations(response.data.data.donations || []);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load food donations");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = async (files) => {
    const fileArray = Array.from(files);
    const newPhotos = [];

    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newPhotos.push({
          file,
          preview: e.target.result,
        });
        setPhotos((prev) => [...prev, ...newPhotos]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationCapture = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    try {
      toast.loading("Getting your location...", { id: "location-loading" });
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      toast.dismiss("location-loading");
      toast.success("Location captured successfully!");

      // Get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "FurEver Food Donation App v1.0",
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        if (data?.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    } catch (error) {
      toast.dismiss("location-loading");
      toast.error("Failed to get location. Please try again.");
    }
  };

  const handleManualLocationSubmit = async () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    setLocation({ latitude: lat, longitude: lng });
    setAddress(manualLocation.address || `${lat}, ${lng}`);
    setShowLocationModal(false);
    toast.success("Location set successfully!");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.foodName.trim()) errors.foodName = "Food name is required";
    if (!formData.quantity || parseFloat(formData.quantity) <= 0)
      errors.quantity = "Valid quantity is required";
    if (!location) errors.location = "Location is required";
    if (!formData.contactInfo.phone.trim())
      errors.phone = "Phone number is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token) {
      toast.error("Please login to donate food");
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);

      // Upload photos first
      const uploadedUrls = [];
      for (const photo of photos) {
        if (photo.preview) {
          try {
            // Upload to Cloudinary
            const uploadResponse = await axios.post("/api/food-donations/upload-image", {
              base64: photo.preview,
            });
            if (uploadResponse.data.url) {
              uploadedUrls.push(uploadResponse.data.url);
            }
          } catch (uploadError) {
            console.error("Photo upload failed:", uploadError);
            // Fallback to base64 if upload fails
            uploadedUrls.push(photo.preview);
          }
        }
      }

      const donationData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        images: uploadedUrls,
        location: {
          address: address || manualLocation.address,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };

      const response = await axios.post("/api/food-donations", donationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Food donation posted successfully!");
        setActiveTab("browse");
        fetchDonations();
        // Reset form
        setFormData({
          foodName: "",
          foodType: "dry_food",
          quantity: "",
          unit: "kg",
          expiryDate: "",
          description: "",
          contactInfo: {
            phone: "",
            email: "",
            preferredContact: "app",
          },
          availability: {
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            pickupTime: "",
          },
        });
        setPhotos([]);
        setLocation(null);
        setAddress("");
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      toast.error(
        error.response?.data?.error || "Failed to submit donation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserve = async (donationId) => {
    if (!token) {
      toast.error("Please login to reserve food");
      router.push("/login");
      return;
    }

    try {
      const response = await axios.put(
        `/api/food-donations/${donationId}`,
        { action: "reserve" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Food reserved successfully!");
        fetchDonations();
      }
    } catch (error) {
      console.error("Error reserving donation:", error);
      toast.error(
        error.response?.data?.error || "Failed to reserve food. Please try again."
      );
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      available: { label: "Available", color: "bg-green-100 text-green-800" },
      reserved: { label: "Reserved", color: "bg-yellow-100 text-yellow-800" },
      picked_up: { label: "Picked Up", color: "bg-blue-100 text-blue-800" },
      expired: { label: "Expired", color: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
    };
    return configs[status] || configs.available;
  };

  const getFoodTypeLabel = (type) => {
    return foodTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Utensils className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold titlefont mb-2">
                  Food Donation
                </h1>
                <p className="text-white/80 text-lg">
                  Help feed stray animals in your community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-14 bg-white/95 backdrop-blur-md border-2 border-accent/20 p-1 rounded-xl mb-6">
            <TabsTrigger
              value="browse"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Donations
            </TabsTrigger>
            <TabsTrigger
              value="donate"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Donate Food
            </TabsTrigger>
          </TabsList>

          {/* Browse Donations Tab */}
          <TabsContent value="browse" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : donations.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
                <CardContent className="p-16 text-center">
                  <Utensils className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    No Donations Available
                  </h3>
                  <p className="text-secondary mb-6">
                    Be the first to donate food for stray animals!
                  </p>
                  <Button
                    onClick={() => setActiveTab("donate")}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Donate Food
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => {
                  const statusBadge = getStatusBadge(donation.status);
                  const foodType = foodTypes.find(
                    (t) => t.value === donation.foodType
                  );
                  const TypeIcon = foodType?.icon || Package;

                  return (
                    <Card
                      key={donation._id}
                      className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      {donation.images && donation.images.length > 0 && (
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={donation.images[0]}
                            alt={donation.foodName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-accent/20 p-2 rounded-lg">
                              <TypeIcon className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-primary">
                                {donation.foodName}
                              </CardTitle>
                              <p className="text-sm text-secondary">
                                {getFoodTypeLabel(donation.foodType)}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-secondary mt-3">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-accent" />
                            <span className="font-semibold text-primary">
                              {donation.quantity} {donation.unit}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 space-y-4">
                        {donation.description && (
                          <p className="text-secondary text-sm line-clamp-2">
                            {donation.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span className="truncate">
                            {donation.location.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <User className="w-4 h-4 text-accent" />
                          <span>{donation.donor?.name || "Anonymous"}</span>
                        </div>
                        {donation.expiryDate && (
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <Calendar className="w-4 h-4 text-accent" />
                            <span>
                              Expires: {format(new Date(donation.expiryDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(donation.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {donation.status === "available" && (
                          <Button
                            onClick={() => handleReserve(donation._id)}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Reserve Food
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Donate Food Tab */}
          <TabsContent value="donate">
            <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  Donate Food for Stray Animals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-primary text-white border-primary"
                              : isCompleted
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-secondary text-secondary border-accent/30"
                          }`}
                        >
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <p
                          className={`text-xs mt-2 text-center ${
                            isActive ? "text-primary font-bold" : "text-secondary"
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Step 1: Food Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Food Name *
                      </label>
                      <Input
                        name="foodName"
                        value={formData.foodName}
                        onChange={handleInputChange}
                        placeholder="e.g., Pedigree Dog Food"
                        className="border-accent/30 focus:border-primary"
                        required
                      />
                      {formErrors.foodName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.foodName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Food Type *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {foodTypes.map((type) => {
                          const TypeIcon = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  foodType: type.value,
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                formData.foodType === type.value
                                  ? "border-primary bg-primary/10"
                                  : "border-accent/20 hover:border-accent/40"
                              }`}
                            >
                              <TypeIcon
                                className={`w-6 h-6 mx-auto mb-2 ${
                                  formData.foodType === type.value
                                    ? "text-primary"
                                    : "text-secondary"
                                }`}
                              />
                              <p
                                className={`text-sm font-semibold ${
                                  formData.foodType === type.value
                                    ? "text-primary"
                                    : "text-secondary"
                                }`}
                              >
                                {type.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-primary mb-2 block">
                          Quantity *
                        </label>
                        <Input
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="10"
                          className="border-accent/30 focus:border-primary"
                          required
                          min="1"
                        />
                        {formErrors.quantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.quantity}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-bold text-primary mb-2 block">
                          Unit *
                        </label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border-2 border-accent/30 rounded-md focus:outline-none focus:border-primary"
                        >
                          {units.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Expiry Date (Optional)
                      </label>
                      <Input
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Description (Optional)
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Additional details about the food..."
                        rows={4}
                        className="border-accent/30 focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Photos */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Photos (Optional)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-accent/30"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          handlePhotoUpload(e.dataTransfer.files);
                        }}
                      >
                        <ImageIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                        <p className="text-secondary mb-2">
                          Drag and drop photos here, or
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-accent/30"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Browse Files
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <div className="relative h-32 w-full rounded-lg overflow-hidden border-2 border-accent/20">
                              <Image
                                src={photo.preview}
                                alt={`Photo ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Pickup Location *
                      </label>
                      {location ? (
                        <div className="p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-semibold text-primary">
                                  {address || "Location set"}
                                </p>
                                <p className="text-sm text-secondary">
                                  {location.latitude.toFixed(6)},{" "}
                                  {location.longitude.toFixed(6)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLocation(null);
                                setAddress("");
                              }}
                              className="border-accent/30"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            type="button"
                            onClick={handleLocationCapture}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-14"
                          >
                            <Navigation className="w-5 h-5 mr-2" />
                            Use Current Location
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLocationModal(true)}
                            className="w-full border-accent/30 h-14"
                          >
                            <Map className="w-5 h-5 mr-2" />
                            Enter Location Manually
                          </Button>
                        </div>
                      )}
                      {formErrors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Info */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Phone Number *
                      </label>
                      <Input
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="border-accent/30 focus:border-primary"
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Email (Optional)
                      </label>
                      <Input
                        name="contactInfo.email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Preferred Contact Method
                      </label>
                      <select
                        name="contactInfo.preferredContact"
                        value={formData.contactInfo.preferredContact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-accent/30 rounded-md focus:outline-none focus:border-primary"
                      >
                        <option value="app">In-App Message</option>
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">
                        Available Pickup Time (Optional)
                      </label>
                      <Input
                        name="availability.pickupTime"
                        value={formData.availability.pickupTime}
                        onChange={handleInputChange}
                        placeholder="e.g., 9 AM - 5 PM, Monday to Friday"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="p-6 bg-accent/10 rounded-xl border-2 border-accent/20">
                      <h3 className="font-bold text-primary text-lg mb-4">
                        Review Your Donation
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary">Food Name:</span>
                          <span className="font-semibold text-primary">
                            {formData.foodName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Type:</span>
                          <span className="font-semibold text-primary">
                            {getFoodTypeLabel(formData.foodType)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Quantity:</span>
                          <span className="font-semibold text-primary">
                            {formData.quantity} {formData.unit}
                          </span>
                        </div>
                        {location && (
                          <div className="flex justify-between">
                            <span className="text-secondary">Location:</span>
                            <span className="font-semibold text-primary text-right max-w-xs truncate">
                              {address || "Location set"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-secondary">Contact:</span>
                          <span className="font-semibold text-primary">
                            {formData.contactInfo.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentStep > 1) setCurrentStep(currentStep - 1);
                    }}
                    disabled={currentStep === 1}
                    className="border-accent/30"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (currentStep < 5) setCurrentStep(currentStep + 1);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Donation
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Manual Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-2xl max-w-md w-full">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Enter Location Manually
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationModal(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-primary mb-2 block">
                  Address
                </label>
                <Input
                  value={manualLocation.address}
                  onChange={(e) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter full address"
                  className="border-accent/30 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">
                    Latitude
                  </label>
                  <Input
                    value={manualLocation.latitude}
                    onChange={(e) =>
                      setManualLocation((prev) => ({
                        ...prev,
                        latitude: e.target.value,
                      }))
                    }
                    placeholder="e.g., 40.7128"
                    className="border-accent/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">
                    Longitude
                  </label>
                  <Input
                    value={manualLocation.longitude}
                    onChange={(e) =>
                      setManualLocation((prev) => ({
                        ...prev,
                        longitude: e.target.value,
                      }))
                    }
                    placeholder="e.g., -74.0060"
                    className="border-accent/30 focus:border-primary"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualLocationSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Set Location
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

