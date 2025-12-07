"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Shield,
  RefreshCw,
  Save,
  X,
  Eye,
  Star,
  Calendar,
  Award,
  PawPrint,
  Stethoscope
} from "lucide-react";
import toast from "react-hot-toast";
import { getAuthenticatedUser } from "../../../../actions/loginActions";

const TRAINING_SPECIALTIES = [
  "Basic Obedience",
  "Advanced Obedience", 
  "Puppy Training",
  "Behavioral Modification",
  "Aggression Training",
  "Anxiety Training",
  "Service Dog Training",
  "Trick Training",
  "Agility Training",
  "Guard Dog Training",
  "Therapy Dog Training",
  "Socialization",
  "Leash Training",
  "House Training",
  "Clicker Training"
];

const TRAINING_MODES = ["video", "in_person", "group_video"];
const PET_TYPES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    certificationNumber: "",
    trainingSpecialties: [],
    yearsOfExperience: "",
    sessionFee: "",
    groupSessionFee: "",
    currency: "USD",
    bio: "",
    languages: ["English"],
    trainingModes: ["video"],
    petTypesSupported: ["Dog"],
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    certifications: [],
    isVerified: true,
    isActive: true,
    approvalStatus: "approved"
  });

  useEffect(() => {
    checkAdminAccess();
    fetchTrainers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getAuthenticatedUser();
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Admin access required");
        router.push("/login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trainer/admin");
      const data = await response.json();
      
      if (data.success) {
        setTrainers(data.data);
      } else {
        toast.error("Failed to fetch trainers");
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      trainingSpecialties: prev.trainingSpecialties.includes(specialty)
        ? prev.trainingSpecialties.filter(s => s !== specialty)
        : [...prev.trainingSpecialties, specialty]
    }));
  };

  const handleModeToggle = (mode) => {
    setFormData(prev => ({
      ...prev,
      trainingModes: prev.trainingModes.includes(mode)
        ? prev.trainingModes.filter(m => m !== mode)
        : [...prev.trainingModes, mode]
    }));
  };

  const handlePetTypeToggle = (petType) => {
    setFormData(prev => ({
      ...prev,
      petTypesSupported: prev.petTypesSupported.includes(petType)
        ? prev.petTypesSupported.filter(p => p !== petType)
        : [...prev.petTypesSupported, petType]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingTrainer 
        ? `/api/trainer/admin/${editingTrainer._id}`
        : "/api/trainer/admin";
      
      const method = editingTrainer ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingTrainer ? "Trainer updated successfully!" : "Trainer added successfully!");
        setShowAddForm(false);
        setEditingTrainer(null);
        resetForm();
        fetchTrainers();
      } else {
        toast.error(data.message || "Failed to save trainer");
      }
    } catch (error) {
      console.error("Error saving trainer:", error);
      toast.error("Failed to save trainer");
    }
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      password: "", // Don't pre-fill password
      certificationNumber: trainer.certificationNumber || "",
      trainingSpecialties: trainer.trainingSpecialties || [],
      yearsOfExperience: trainer.yearsOfExperience || "",
      sessionFee: trainer.sessionFee || "",
      groupSessionFee: trainer.groupSessionFee || "",
      currency: trainer.currency || "USD",
      bio: trainer.bio || "",
      languages: trainer.languages || ["English"],
      trainingModes: trainer.trainingModes || ["video"],
      petTypesSupported: trainer.petTypesSupported || ["Dog"],
      location: trainer.location || {
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
      },
      certifications: trainer.certifications || [],
      isVerified: trainer.isVerified ?? true,
      isActive: trainer.isActive ?? true,
      approvalStatus: trainer.approvalStatus || "approved"
    });
    setShowAddForm(true);
  };

  const handleDelete = async (trainerId) => {
    if (!window.confirm("Are you sure you want to delete this trainer? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/trainer/admin/${trainerId}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Trainer deleted successfully");
        fetchTrainers();
      } else {
        toast.error(data.message || "Failed to delete trainer");
      }
    } catch (error) {
      console.error("Error deleting trainer:", error);
      toast.error("Failed to delete trainer");
    }
  };

  const handleStatusChange = async (trainerId, newStatus) => {
    try {
      const response = await fetch(`/api/trainer/admin/${trainerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ approvalStatus: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchTrainers();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      certificationNumber: "",
      trainingSpecialties: [],
      yearsOfExperience: "",
      sessionFee: "",
      groupSessionFee: "",
      currency: "USD",
      bio: "",
      languages: ["English"],
      trainingModes: ["video"],
      petTypesSupported: ["Dog"],
      location: {
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
      },
      certifications: [],
      isVerified: true,
      isActive: true,
      approvalStatus: "approved"
    });
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = !searchQuery || 
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.certificationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || trainer.approvalStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-primary font-semibold">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold titlefont">Trainer Management</h1>
                <p className="text-white/80 text-sm mt-1">Manage and add pet trainers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/admin/vets")}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Manage Vets
              </Button>
              <Button
                onClick={fetchTrainers}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={() => {
                  resetForm();
                  setEditingTrainer(null);
                  setShowAddForm(!showAddForm);
                }}
                className="bg-accent hover:bg-accent/90 text-primary font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                {showAddForm ? "Cancel" : "Add New Trainer"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8 bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
              <CardTitle className="text-2xl font-bold">
                {editingTrainer ? "Edit Trainer" : "Add New Trainer"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary border-b-2 border-accent/20 pb-2">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Phone *</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        {editingTrainer ? "New Password (leave blank to keep current)" : "Password *"}
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required={!editingTrainer}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Certification Number *</label>
                      <Input
                        value={formData.certificationNumber}
                        onChange={(e) => handleInputChange("certificationNumber", e.target.value)}
                        required
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Years of Experience *</label>
                      <Input
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                        required
                        min="0"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary border-b-2 border-accent/20 pb-2">Professional Details</h3>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Training Specialties *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {TRAINING_SPECIALTIES.map(specialty => (
                        <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.trainingSpecialties.includes(specialty)}
                            onChange={() => handleSpecialtyToggle(specialty)}
                            className="w-4 h-4 text-primary border-accent/30 rounded"
                          />
                          <span className="text-sm text-primary">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Session Fee *</label>
                      <div className="flex gap-2">
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange("currency", e.target.value)}
                          className="border border-accent/30 rounded-lg px-3 focus:border-primary"
                        >
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <Input
                          type="number"
                          value={formData.sessionFee}
                          onChange={(e) => handleInputChange("sessionFee", e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="border-accent/30 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Group Session Fee (Optional)</label>
                      <Input
                        type="number"
                        value={formData.groupSessionFee}
                        onChange={(e) => handleInputChange("groupSessionFee", e.target.value)}
                        min="0"
                        step="0.01"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Training Modes *</label>
                      <div className="flex gap-4">
                        {TRAINING_MODES.map(mode => (
                          <label key={mode} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.trainingModes.includes(mode)}
                              onChange={() => handleModeToggle(mode)}
                              className="w-4 h-4 text-primary border-accent/30 rounded"
                            />
                            <span className="text-sm text-primary capitalize">{mode.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Pet Types Supported *</label>
                      <div className="flex gap-4 flex-wrap">
                        {PET_TYPES.map(petType => (
                          <label key={petType} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.petTypesSupported.includes(petType)}
                              onChange={() => handlePetTypeToggle(petType)}
                              className="w-4 h-4 text-primary border-accent/30 rounded"
                            />
                            <span className="text-sm text-primary">{petType}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={3}
                      className="border-accent/30 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary border-b-2 border-accent/20 pb-2">Location</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Address</label>
                      <Input
                        value={formData.location.address}
                        onChange={(e) => handleInputChange("location.address", e.target.value)}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">City</label>
                      <Input
                        value={formData.location.city}
                        onChange={(e) => handleInputChange("location.city", e.target.value)}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">State</label>
                      <Input
                        value={formData.location.state}
                        onChange={(e) => handleInputChange("location.state", e.target.value)}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Country</label>
                      <Input
                        value={formData.location.country}
                        onChange={(e) => handleInputChange("location.country", e.target.value)}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Zip Code</label>
                      <Input
                        value={formData.location.zipCode}
                        onChange={(e) => handleInputChange("location.zipCode", e.target.value)}
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary border-b-2 border-accent/20 pb-2">Status</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isVerified}
                          onChange={(e) => handleInputChange("isVerified", e.target.checked)}
                          className="w-4 h-4 text-primary border-accent/30 rounded"
                        />
                        <span className="text-sm font-semibold text-primary">Verified</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange("isActive", e.target.checked)}
                          className="w-4 h-4 text-primary border-accent/30 rounded"
                        />
                        <span className="text-sm font-semibold text-primary">Active</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Approval Status</label>
                      <select
                        value={formData.approvalStatus}
                        onChange={(e) => handleInputChange("approvalStatus", e.target.value)}
                        className="w-full border border-accent/30 rounded-lg px-3 py-2 focus:border-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold h-12"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {editingTrainer ? "Update Trainer" : "Add Trainer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTrainer(null);
                      resetForm();
                    }}
                    className="h-12"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  placeholder="Search by name, email, or certification number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-accent/30 focus:border-primary"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-accent/30 rounded-lg px-4 py-2 focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Trainers List */}
        <div className="grid gap-6">
          {filteredTrainers.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
              <CardContent className="p-16 text-center">
                <GraduationCap className="w-16 h-16 mx-auto text-accent mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-2">No Trainers Found</h3>
                <p className="text-secondary mb-6">Get started by adding your first trainer</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Trainer
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTrainers.map((trainer) => (
              <Card key={trainer._id} className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-primary">{trainer.name}</h3>
                            <Badge className={
                              trainer.approvalStatus === "approved" ? "bg-green-100 text-green-800" :
                              trainer.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                              trainer.approvalStatus === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {trainer.approvalStatus}
                            </Badge>
                            {trainer.isVerified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {trainer.isActive && (
                              <Badge className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-secondary mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-accent" />
                              <span>{trainer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-accent" />
                              <span>{trainer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-accent" />
                              <span>Cert: {trainer.certificationNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-accent" />
                              <span>{trainer.yearsOfExperience} years experience</span>
                            </div>
                            {trainer.location?.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent" />
                                <span>{trainer.location.city}, {trainer.location.state}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-accent" />
                              <span>{trainer.currency} {trainer.sessionFee}</span>
                            </div>
                          </div>

                          {trainer.trainingSpecialties && trainer.trainingSpecialties.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {trainer.trainingSpecialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {trainer.bio && (
                            <p className="text-secondary text-sm mb-4 line-clamp-2">{trainer.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(trainer)}
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:border-primary"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(trainer._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <select
                        value={trainer.approvalStatus}
                        onChange={(e) => handleStatusChange(trainer._id, e.target.value)}
                        className="text-xs border border-accent/30 rounded px-2 py-1 focus:border-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

