"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  ArrowLeft,
  ExternalLink,
  Mail,
  Clock,
  Image as ImageIcon,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Timer,
  Navigation,
  Camera,
  Zap,
  Activity,
  Shield,
  Heart
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

export default function EmergencyDetailPage() {
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const router = useRouter();
  const params = useParams();
  const emergencyId = params.id;

  useEffect(() => {
    if (emergencyId) {
      fetchEmergencyDetail();
    }
  }, [emergencyId]);

  const fetchEmergencyDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/emergency");
      
      if (response.data.success) {
        const foundEmergency = response.data.emergencies.find(
          (e) => e._id === emergencyId
        );
        
        if (foundEmergency) {
          setEmergency(foundEmergency);
        } else {
          toast.error("Emergency report not found");
          router.push("/emergency");
        }
      }
    } catch (error) {
      console.error("Fetch emergency detail error:", error);
      toast.error("Failed to load emergency report");
      router.push("/emergency");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      low: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: Shield, 
        gradient: "from-green-500 to-green-600" 
      },
      medium: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: Timer, 
        gradient: "from-yellow-500 to-yellow-600" 
      },
      high: { 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: Zap, 
        gradient: "from-orange-500 to-orange-600" 
      },
      critical: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: AlertTriangle, 
        gradient: "from-red-500 to-red-600" 
      }
    };
    return configs[severity] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: Timer,
        gradient: "from-yellow-500 to-yellow-600"
      },
      "in-progress": { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: Activity,
        gradient: "from-blue-500 to-blue-600"
      },
      resolved: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: CheckCircle,
        gradient: "from-green-500 to-green-600"
      },
      closed: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: CheckCircle,
        gradient: "from-gray-500 to-gray-600"
      }
    };
    return configs[status] || configs.pending;
  };

  const openLocationInMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
  };

  const openImageModal = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
    setImageModalOpen(true);
  };

  const shareReport = async () => {
    const shareData = {
      title: `Emergency Report: ${emergency.title}`,
      text: emergency.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const downloadReport = () => {
    // Create a simple text report
    const reportText = `
EMERGENCY REPORT
================

Title: ${emergency.title}
Description: ${emergency.description}
Severity: ${emergency.severity}
Status: ${emergency.status}
Animal Type: ${emergency.animalType || 'Not specified'}
Reporter: ${emergency.reporter.name} (${emergency.reporter.email})
Location: ${emergency.location?.address || `${emergency.location?.latitude}, ${emergency.location?.longitude}`}
Reported: ${format(new Date(emergency.createdAt), 'PPpp')}
Contact: ${emergency.contactInfo?.phone || 'N/A'} (${emergency.contactInfo?.preferredContact})

Photos: ${emergency.photos?.length || 0} attached
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-report-${emergency._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading emergency report...</p>
        </div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-20 w-20 mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Emergency Report Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The emergency report you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => router.push("/emergency")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Emergency Reports
          </Button>
        </div>
      </div>
    );
  }

  const severityConfig = getSeverityConfig(emergency.severity);
  const statusConfig = getStatusConfig(emergency.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-full w-full">
            <img
              src={selectedImage}
              alt="Emergency photo"
              className="max-w-full max-h-full object-contain mx-auto rounded-lg"
            />
            
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(selectedImage, '_blank');
                }}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setImageModalOpen(false)}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                ✕
              </Button>
            </div>

            {/* Image Navigation */}
            {emergency.photos && emergency.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/50 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
                  {selectedImageIndex + 1} of {emergency.photos.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${severityConfig.gradient} text-white shadow-2xl`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => router.push("/emergency")}
                variant="ghost"
                className="text-white hover:bg-white/20 p-3 rounded-xl"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Emergency Report Details</h1>
                  <p className="text-white/90 text-lg">
                    Report ID: {emergency._id}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={shareReport}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={downloadReport}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Emergency Overview */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-start gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex-grow">{emergency.title}</h1>
              
              <div className="flex gap-3">
                <Badge className={`${severityConfig.color} border text-lg px-4 py-2 font-semibold`}>
                  <severityConfig.icon className="h-5 w-5 mr-2" />
                  {emergency.severity} severity
                </Badge>
                
                <Badge className={`${statusConfig.color} border text-lg px-4 py-2 font-semibold`}>
                  <statusConfig.icon className="h-5 w-5 mr-2" />
                  {emergency.status}
                </Badge>
              </div>
            </div>
            
            {emergency.animalType && (
              <Badge variant="outline" className="mb-6 text-base px-3 py-1">
                <Heart className="h-4 w-4 mr-2" />
                {emergency.animalType}
              </Badge>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 rounded-xl p-4">
                <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Reported</p>
                <p className="font-bold text-gray-800">
                  {formatDistanceToNow(new Date(emergency.createdAt), { addSuffix: true })}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(emergency.createdAt), "PPpp")}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <Camera className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Photos</p>
                <p className="font-bold text-gray-800">
                  {emergency.photos?.length || 0} attached
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <MapPin className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Location</p>
                <p className="font-bold text-gray-800">Coordinates provided</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos Gallery */}
        {emergency.photos && emergency.photos.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6" />
                Photo Evidence ({emergency.photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {emergency.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => openImageModal(photo, index)}
                  >
                    <img
                      src={photo}
                      alt={`Emergency photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl border shadow-md group-hover:shadow-lg transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle>Emergency Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {emergency.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location & Contact */}
          <div className="space-y-6">
            {/* Location */}
            {emergency.location && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="h-6 w-6" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emergency.location.address && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Address</p>
                        <p className="text-gray-800 text-lg">{emergency.location.address}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Latitude</p>
                        <p className="text-gray-800 font-mono">{emergency.location.latitude}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Longitude</p>
                        <p className="text-gray-800 font-mono">{emergency.location.longitude}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => openLocationInMaps(
                          emergency.location.latitude,
                          emergency.location.longitude
                        )}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Open in Maps
                      </Button>
                      
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${emergency.location.latitude}, ${emergency.location.longitude}`
                          );
                          toast.success("Coordinates copied!");
                        }}
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reporter Information */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-6 w-6" />
                  Reporter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-600 mb-1">Name</p>
                    <p className="text-gray-800 text-lg">{emergency.reporter.name}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-600 mb-1">Email</p>
                    <a 
                      href={`mailto:${emergency.reporter.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {emergency.reporter.email}
                    </a>
                  </div>
                  
                  {emergency.contactInfo?.phone && (
                    <div>
                      <p className="font-medium text-gray-600 mb-1">Phone</p>
                      <a 
                        href={`tel:${emergency.contactInfo.phone}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {emergency.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-600 mb-1">Preferred Contact</p>
                    <Badge variant="outline" className="capitalize">
                      {emergency.contactInfo?.preferredContact || "app"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6" />
              Emergency Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Emergency Report Submitted
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {format(new Date(emergency.createdAt), "PPpp")}
                  </p>
                  <p className="text-gray-700">
                    Report submitted by {emergency.reporter.name} with {emergency.severity} severity level.
                  </p>
                </div>
              </div>
              
              {emergency.updatedAt && emergency.updatedAt !== emergency.createdAt && (
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Status Updated
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {format(new Date(emergency.updatedAt), "PPpp")}
                    </p>
                    <p className="text-gray-700">
                      Current status: <span className="font-medium capitalize">{emergency.status}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 