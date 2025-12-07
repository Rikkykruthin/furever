"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Navigation,
  Phone,
  Mail,
  Clock,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Crosshair,
  Map,
  Sparkles,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  ArrowLeft,
  FileText,
  Globe,
  Send,
  TrendingUp,
  Award
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getToken } from "../../../../actions/userActions";

export default function EmergencyReportPage() {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    animalType: "",
    contactInfo: {
      phone: "",
      preferredContact: "app",
    },
  });

  // Media and location state
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [address, setAddress] = useState("");

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
    address: ""
  });

  // Refs
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Steps configuration
  const steps = [
    { id: 1, title: "Emergency Details", icon: AlertTriangle },
    { id: 2, title: "Photos & Evidence", icon: Camera },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Contact Info", icon: Phone },
    { id: 5, title: "Review & Submit", icon: CheckCircle }
  ];

  useEffect(() => {
    setIsVisible(true);
    initializeAuth();
    checkLocationPermissions();
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [router]);

  // Check location permissions on page load
  const checkLocationPermissions = async () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log("Initial location permission status:", permissionStatus.state);
        
        // Listen for permission changes
        permissionStatus.addEventListener('change', () => {
          console.log("Location permission changed to:", permissionStatus.state);
        });
      }
    } catch (error) {
      console.log("Could not check location permissions:", error);
    }
  };

  const initializeAuth = async () => {
    try {
      const userToken = await getToken("userToken");
      if (userToken) {
        setToken(userToken);
      } else {
        toast.error("Authentication required");
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    }
  };

  // Enhanced location handling with better error handling and fallbacks
  const getCurrentLocation = useCallback(async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      toast.error("Location services are not supported by this browser. Please enter coordinates manually.");
      setLocationStatus("error");
      return;
    }

    // Check if we're on HTTPS (required for geolocation in most browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.error("Geolocation requires HTTPS");
      toast.error("Location services require a secure connection (HTTPS). Please enter coordinates manually.");
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    toast.loading("Getting your location...", { id: 'location-loading' });

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout
      maximumAge: 60000, // Cache for 1 minute
    };

    try {
      // First, check permissions
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log("Geolocation permission status:", permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          toast.dismiss('location-loading');
          toast.error("Location access is blocked. Please enable location permissions in your browser settings.");
          setLocationStatus("error");
          return;
        }
      }

      // Get position with promise wrapper for better error handling
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Geolocation success:", pos);
            resolve(pos);
          },
          (err) => {
            console.error("Geolocation error:", err);
            reject(err);
          },
          options
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      console.log("Location obtained:", { latitude, longitude, accuracy });

      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinates received");
      }

      setLocation({ latitude, longitude, accuracy });
      toast.dismiss('location-loading');
      toast.success("Location captured successfully!");
      setLocationStatus("success");
      
      // Get address with better error handling
      try {
        console.log("Fetching address for coordinates:", latitude, longitude);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
          { 
            headers: { 
              'User-Agent': 'FurEver Emergency App v1.0',
              'Accept': 'application/json'
            },
            timeout: 10000
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Reverse geocoding response:", data);
        
        let formattedAddress = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        // If we got a detailed address, format it nicely
        if (data?.address) {
          const addr = data.address;
          const parts = [
            addr.house_number,
            addr.road,
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.village,
            addr.state,
            addr.country
          ].filter(Boolean);
          
          if (parts.length > 0) {
            formattedAddress = parts.join(', ');
          }
        }
        
        setAddress(formattedAddress);
        console.log("Address set:", formattedAddress);
        
      } catch (geocodeError) {
        console.error("Reverse geocoding failed:", geocodeError);
        // Fallback to coordinates if reverse geocoding fails
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setAddress(fallbackAddress);
        toast("Address lookup failed, using coordinates", { icon: '⚠️' });
      }

    } catch (error) {
      console.error("Location error details:", error);
      toast.dismiss('location-loading');
      setLocationStatus("error");
      
      let errorMessage = "Unable to get your location. ";
      
      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += "Location unavailable. Please check your GPS/network connection.";
            break;
          case 3: // TIMEOUT
            errorMessage += "Location request timed out. Please check your network connection and try again.";
            break;
          default:
            errorMessage += "Please try again or enter coordinates manually.";
        }
      } else {
        errorMessage += error.message || "Please try again or enter coordinates manually.";
      }
      
      toast.error(errorMessage, { duration: 5000 });
    }
  }, []);

  // Handle manual location submission
  const handleManualLocationSubmit = async () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid numeric coordinates");
      return;
    }
    
    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    
    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    console.log("Setting manual location:", { lat, lng });
    
    toast.loading("Validating location...", { id: 'validate-location' });

    setLocation({ 
      latitude: lat, 
      longitude: lng, 
      accuracy: null,
      manual: true 
    });
    
    let finalAddress = manualLocation.address;
    
    // If no address provided, try reverse geocoding
    if (!finalAddress) {
      try {
        console.log("Attempting reverse geocoding for manual coordinates");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
          { 
            headers: { 
              'User-Agent': 'FurEver Emergency App v1.0',
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log("Manual location reverse geocoding response:", data);
          finalAddress = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } else {
          finalAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      } catch (error) {
        console.error("Reverse geocoding error for manual location:", error);
        finalAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    }
    
    setAddress(finalAddress);
    setLocationStatus("success");
    toast.dismiss('validate-location');
    setShowLocationModal(false);
    
    // Reset manual location form
    setManualLocation({
      latitude: "",
      longitude: "",
      address: ""
    });
    
    toast.success("Location set successfully! ✅");
    console.log("Manual location set:", { latitude: lat, longitude: lng, address: finalAddress });
  };

  // Test location permissions and capabilities
  const testLocationCapabilities = async () => {
    console.log("=== LOCATION CAPABILITY TEST ===");
    
    // Check basic support
    console.log("1. Geolocation supported:", !!navigator.geolocation);
    console.log("2. HTTPS:", window.location.protocol === 'https:');
    console.log("3. Localhost:", window.location.hostname === 'localhost');
    
    // Check permissions
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log("4. Permission status:", permissionStatus.state);
      } catch (error) {
        console.log("4. Cannot check permissions:", error.message);
      }
    } else {
      console.log("4. Permissions API not supported");
    }
    
    // Test basic geolocation
    if (navigator.geolocation) {
      console.log("5. Testing geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("5. ✅ Geolocation works:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          toast.success("Location test successful! You can use GPS.");
        },
        (error) => {
          console.log("5. ❌ Geolocation failed:", error);
          toast.error(`Location test failed: ${error.message}`);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }
    
    console.log("=== END TEST ===");
  };

  // Enhanced photo handling with drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload({ target: { files } });
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + photos.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    const newPhotos = [...photos, ...validFiles];
    setPhotos(newPhotos);

    const newUrls = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => {
      URL.revokeObjectURL(prev[index]?.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Enhanced camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera access denied or unavailable");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob && photos.length < 5) {
        const file = new File([blob], `emergency-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotos(prev => [...prev, file]);
        setPhotoUrls(prev => [...prev, {
          url: URL.createObjectURL(blob),
          name: file.name,
          size: file.size
        }]);
        toast.success("Photo captured successfully!");
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // Form validation
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) errors.title = "Title is required";
        if (!formData.description.trim()) errors.description = "Description is required";
        if (formData.description.length < 20) errors.description = "Please provide more details (min 20 characters)";
        break;
      case 2:
        if (photos.length === 0) errors.photos = "At least one photo is required";
        break;
      case 3:
        if (!location) errors.location = "Location is required";
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const uploadPhotos = async () => {
    const uploadedUrls = [];
    setUploadingPhoto(true);
    
    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });

        const response = await axios.post("/api/emergency/upload-image", { base64 });
        uploadedUrls.push(response.data.url);
        
        // Update progress
        toast.success(`Photo ${i + 1}/${photos.length} uploaded`);
      }
    } finally {
      setUploadingPhoto(false);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedPhotoUrls = await uploadPhotos();

      const emergencyData = {
        ...formData,
        photos: uploadedPhotoUrls,
        location: { ...location, address },
      };

      const response = await axios.post("/api/emergency", {
        emergencyData,
        token,
      });

      if (response.data.success) {
        toast.success("Emergency report submitted successfully!");
        router.push("/emergency");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.error || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-x-hidden">
      {/* Animated Background Elements */}
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
      {/* Enhanced Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl border-2 border-primary/20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10" style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(60, 78, 89, 0.3), transparent 70%)`,
            }}></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 border-2 border-primary/20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Submitting Report</h3>
              <p className="text-gray-600 mb-6">Please wait while we process your emergency report...</p>
              {uploadingPhoto && (
                <div className="mt-6">
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Uploading photos...</p>
                </div>
              )}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-primary" />
                <span>Your report is being securely processed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Manual Location Modal */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-scale"
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-primary/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Enter Location Manually</h3>
                  <p className="text-sm text-gray-600">Provide precise coordinates</p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Enter the exact coordinates where the emergency is located. Accurate location information is crucial for emergency response.
            </p>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-5 border-2 border-primary/20">
                <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  Latitude * <span className="text-gray-500 font-normal">(North-South position: -90 to 90)</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  value={manualLocation.latitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full h-14 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                />
                {manualLocation.latitude && (parseFloat(manualLocation.latitude) < -90 || parseFloat(manualLocation.latitude) > 90) && (
                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <p className="text-red-600 text-sm font-medium">Latitude must be between -90 and 90</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-5 border-2 border-primary/20">
                <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  Longitude * <span className="text-gray-500 font-normal">(East-West position: -180 to 180)</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  value={manualLocation.longitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full h-14 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                />
                {manualLocation.longitude && (parseFloat(manualLocation.longitude) < -180 || parseFloat(manualLocation.longitude) > 180) && (
                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <p className="text-red-600 text-sm font-medium">Longitude must be between -180 and 180</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-5 border-2 border-primary/20">
                <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Address or Description (Optional)
                </label>
                <Input
                  placeholder="e.g., 123 Main St, City, State or Near Central Park"
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full h-14 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => {
                  setShowLocationModal(false);
                  setManualLocation({ latitude: "", longitude: "", address: "" });
                }}
                variant="outline"
                className="flex-1 py-6 text-base border-2 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualLocationSubmit}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                disabled={!manualLocation.latitude || !manualLocation.longitude || 
                         parseFloat(manualLocation.latitude) < -90 || parseFloat(manualLocation.latitude) > 90 ||
                         parseFloat(manualLocation.longitude) < -180 || parseFloat(manualLocation.longitude) > 180}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Use This Location
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📍 How to get coordinates from Google Maps:</h4>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Open Google Maps in your browser</li>
                  <li>Right-click on the emergency location</li>
                  <li>Click the coordinates at the top of the menu</li>
                  <li>Copy and paste the numbers here</li>
                </ol>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">📱 On Mobile:</h4>
                <p className="text-green-700 text-sm">
                  Long-press on the location in Google Maps, then tap the coordinates that appear at the bottom.
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">🎯 Example coordinates:</h4>
                <p className="text-amber-700 text-sm font-mono">
                  New York: 40.7128, -74.0060<br />
                  Los Angeles: 34.0522, -118.2437<br />
                  London: 51.5074, -0.1278
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="bg-white/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/30 rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110"
              >
                <X className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={capturePhoto}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-full p-6 ring-4 ring-white/30 shadow-2xl transition-all duration-300 hover:scale-110 group relative overflow-hidden"
              >
                <span className="relative z-10">
                  <Camera className="h-8 w-8 group-hover:scale-110 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
              </Button>
            </div>
            
            {/* Camera info */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 shadow-lg">
              <p className="text-sm font-medium">Tap to capture • {5 - photos.length} photos remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div 
        className="bg-gradient-to-br from-primary via-primary/95 to-primary text-white shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(60, 78, 89, 1) 0%, rgba(60, 78, 89, 0.95) 50%, rgba(60, 78, 89, 1) 100%), radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.15), transparent 70%)`,
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.2), transparent 50%)`,
        }}></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl group hover:scale-105 transition-all duration-300">
              <AlertTriangle className="h-14 w-14 text-accent group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-sm font-semibold">Emergency Response System</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 titlefont bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
                Report Animal Emergency
              </h1>
              <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                Help us respond quickly by providing accurate information. Every second counts in saving lives.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-accent/20 p-2 rounded-lg group-hover:bg-accent/30 transition-colors">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-bold text-base">Fast Response</span>
                </div>
                <p className="text-xs text-white/80 ml-12">24/7 Emergency Support</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500/20 p-2 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Shield className="w-5 h-5 text-green-300" />
                  </div>
                  <span className="font-bold text-base">Secure & Private</span>
                </div>
                <p className="text-xs text-white/80 ml-12">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-accent/20 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-1">Progress</h2>
              <p className="text-sm text-gray-600">Complete each step to submit your report</p>
            </div>
            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-primary">Step {currentStep} of {steps.length}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between relative">
            {/* Progress Line Background */}
            <div className="absolute top-7 left-0 right-0 h-2 bg-gray-200 rounded-full -z-0"></div>
            {/* Progress Line Fill */}
            <div 
              className="absolute top-7 left-0 h-2 bg-gradient-to-r from-primary via-accent to-green-500 rounded-full transition-all duration-700 -z-0 shadow-lg"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isAccessible = currentStep >= step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`
                      flex flex-col items-center justify-center w-16 h-16 rounded-full border-3 transition-all duration-500 relative group cursor-pointer
                      ${isActive ? 'bg-gradient-to-br from-primary to-primary/80 border-primary text-white shadow-2xl scale-110 ring-4 ring-accent/30' : ''}
                      ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-105' : ''}
                      ${!isAccessible ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                      ${isAccessible && !isActive && !isCompleted ? 'bg-white border-accent/40 text-primary hover:border-accent hover:scale-105 shadow-md hover:shadow-lg' : ''}
                    `}
                    onClick={() => isAccessible && setCurrentStep(step.id)}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className={`h-7 w-7 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-accent/40 animate-ping opacity-75"></div>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`mt-4 text-center max-w-28 ${isActive ? 'font-bold text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    <p className="text-xs font-semibold leading-tight">{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Step Content */}
        <Card 
          className="shadow-2xl border-2 border-accent/20 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden relative group"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          {/* Card Header with Gradient */}
          <div className="bg-gradient-to-br from-primary via-primary/95 to-primary text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.3), transparent 70%)`,
            }}></div>
            <CardHeader className="pb-0 relative z-10">
              <div className="flex items-center gap-5">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  {React.createElement(steps[currentStep - 1]?.icon, { className: "h-8 w-8 text-accent" })}
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white mb-2 titlefont">
                    {steps[currentStep - 1]?.title}
                  </CardTitle>
                  <p className="text-white/90 text-base">
                    {currentStep === 1 && "Provide essential details about the emergency"}
                    {currentStep === 2 && "Upload photos to help responders understand the situation"}
                    {currentStep === 3 && "Pinpoint the exact location for quick response"}
                    {currentStep === 4 && "How can we reach you if needed?"}
                    {currentStep === 5 && "Review all information before submitting"}
                  </p>
                </div>
              </div>
            </CardHeader>
          </div>
          
          <CardContent className="p-8 space-y-6 relative z-10">
            
            {/* Step 1: Emergency Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slide-in-up">
                <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 border-2 border-accent/20">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-1">Emergency Information</h3>
                      <p className="text-sm text-gray-600">Provide clear and concise details</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-accent" />
                      Emergency Title *
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Injured dog found near Main Street"
                      className={`h-14 text-lg border-2 transition-all duration-300 ${
                        formErrors.title 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      } rounded-xl`}
                    />
                    {formErrors.title && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        <p className="text-red-600 font-medium">{formErrors.title}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-primary/30 transition-all duration-300 shadow-sm">
                  <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Detailed Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the emergency situation in detail:\n• Animal's condition and visible injuries\n• Immediate dangers or threats\n• Actions you've already taken\n• Any other relevant information..."
                    rows={8}
                    className={`resize-none text-base border-2 transition-all duration-300 rounded-xl ${
                      formErrors.description 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {formErrors.description ? (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <X className="w-4 h-4 text-red-600" />
                          <p className="text-red-600 text-sm font-medium">{formErrors.description}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Minimum 20 characters required
                        </p>
                      )}
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      formData.description.length < 20 ? 'bg-red-50 text-red-600' : 
                      formData.description.length > 450 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {formData.description.length}/500
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl p-6 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full h-14 text-base border-2 border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white font-medium hover:border-primary/50"
                    >
                      <option value="low">🟢 Low - Minor concern</option>
                      <option value="medium">🟡 Medium - Needs attention</option>
                      <option value="high">🟠 High - Urgent care needed</option>
                      <option value="critical">🔴 Critical - Life threatening</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-3">
                      Select the urgency level based on the animal's condition
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-accent" />
                      Animal Type
                    </label>
                    <Input
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleInputChange}
                      placeholder="e.g., Dog, Cat, Bird, Wildlife"
                      className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
                    />
                    <p className="text-xs text-gray-600 mt-3">
                      Specify the type of animal in distress
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Photos */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slide-in-up">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Camera className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-1">
                        Photos & Evidence *
                      </label>
                      <p className="text-sm text-gray-600">Visual evidence helps responders assess the situation quickly</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Upload Area */}
                  <div
                    className={`
                      border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-500 relative overflow-hidden group
                      ${dragActive ? 'border-primary bg-primary/5 scale-105 shadow-2xl' : 'border-gray-300 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5'}
                      ${formErrors.photos ? 'border-red-500 bg-red-50' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(60, 78, 89, 0.1), transparent 70%)`,
                    }}></div>
                    
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-primary/20">
                        <ImageIcon className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        {dragActive ? 'Drop Photos Here' : 'Add Photos'}
                      </h3>
                      <p className="text-gray-600 mb-8 text-lg">
                        Drag and drop photos here, or use the buttons below
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-4">
                        <Button
                          onClick={startCamera}
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                          disabled={photos.length >= 5}
                        >
                          <span className="relative z-10 flex items-center">
                            <Camera className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                            Take Photo
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Button>
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="border-2 border-primary/30 text-primary hover:bg-primary/5 px-8 py-6 text-base shadow-md hover:shadow-lg transition-all duration-300 rounded-xl hover:border-primary/50"
                          disabled={photos.length >= 5}
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-6">
                        Maximum 5 photos • Supported formats: JPG, PNG, WEBP
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {formErrors.photos && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2">
                      <X className="w-5 h-5 text-red-600" />
                      <p className="text-red-600 font-medium">{formErrors.photos}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Photo Preview */}
                {photoUrls.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border-2 border-accent/20 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Uploaded Photos ({photoUrls.length}/5)
                      </h4>
                      <Badge className="bg-green-100 text-green-800 border-2 border-green-300 font-semibold">
                        {photoUrls.length === 5 ? 'Maximum Reached' : `${5 - photoUrls.length} more allowed`}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {photoUrls.map((photo, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl">
                          <div className="aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={photo.url}
                              alt={`Emergency photo ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <Button
                              onClick={() => removePhoto(index)}
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-slide-in-up">
                <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border-2 border-primary/20">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <label className="block text-xl font-bold text-primary mb-1">
                        Emergency Location *
                      </label>
                      <p className="text-sm text-gray-600">Precise location helps responders reach quickly</p>
                    </div>
                  </div>
                  
                  {locationStatus === "idle" && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-primary/30">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 animate-pulse border-2 border-primary/20">
                        <Crosshair className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-3">
                        Location Required
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                        Precise location information is critical for emergency response teams to reach you quickly.
                      </p>
                      
                      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                        <Button
                          onClick={getCurrentLocation}
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white w-full py-6 text-base shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <Navigation className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                            Get My Current Location
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Button>
                        
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-gray-500 font-medium">or</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        
                        <Button
                          onClick={() => setShowLocationModal(true)}
                          variant="outline"
                          className="w-full py-6 text-base border-2 border-primary/30 text-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hover:border-primary/50"
                        >
                          <MapPin className="h-5 w-5 mr-2" />
                          Enter Coordinates Manually
                        </Button>
                      </div>
                      
                      <div className="mt-6 space-y-3 max-w-md mx-auto">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-800 text-sm">
                            <strong>🔒 Privacy:</strong> Your location is only used for emergency response and is not stored permanently.
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Button
                            onClick={testLocationCapabilities}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            🔧 Troubleshoot Location Issues
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {locationStatus === "loading" && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-primary/20">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-2">
                        Getting Your Location
                      </h3>
                      <p className="text-gray-600">
                        Please wait while we determine your precise coordinates...
                      </p>
                    </div>
                  )}

                  {locationStatus === "success" && location && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-start gap-6">
                        <div className="bg-green-500 p-4 rounded-2xl shadow-lg">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                            Location Captured Successfully
                            <Award className="w-5 h-5" />
                          </h3>
                          <div className="bg-white rounded-xl p-4 mb-4 border border-green-200">
                            <p className="text-green-800 font-semibold text-lg mb-1">{address}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-green-700 mt-3 pt-3 border-t border-green-100">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span className="font-medium">Latitude:</span> 
                                <span className="font-mono">{location.latitude.toFixed(6)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span className="font-medium">Longitude:</span> 
                                <span className="font-mono">{location.longitude.toFixed(6)}</span>
                              </div>
                              {location.accuracy && (
                                <div className="col-span-2 flex items-center gap-2">
                                  <Crosshair className="w-4 h-4" />
                                  <span className="font-medium">Accuracy:</span> 
                                  <span className="font-semibold">±{Math.round(location.accuracy)}m</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={getCurrentLocation}
                              variant="outline"
                              className="border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-xl"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Refresh Location
                            </Button>
                            <Button
                              onClick={() => setShowLocationModal(true)}
                              variant="outline"
                              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Manually
                            </Button>
                            <Button
                              onClick={() => window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Map className="h-4 w-4 mr-2" />
                              View on Map
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {locationStatus === "error" && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-start gap-6">
                        <div className="bg-red-100 p-4 rounded-xl border-2 border-red-200">
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-800 mb-3">
                            Unable to Get Location
                          </h3>
                          <p className="text-red-700 mb-4">
                            Location access failed. This could be due to:
                          </p>
                          <ul className="text-red-700 text-sm mb-6 list-disc list-inside space-y-2">
                            <li>Location permissions denied in browser</li>
                            <li>GPS/network connection issues</li>
                            <li>Browser security settings</li>
                          </ul>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={getCurrentLocation}
                              variant="outline"
                              className="border-2 border-primary/30 text-primary hover:bg-primary/5 rounded-xl"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                            <Button
                              onClick={() => setShowLocationModal(true)}
                              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Enter Manually
                            </Button>
                            <Button
                              onClick={() => window.open("https://www.google.com/maps", "_blank")}
                              variant="outline"
                              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl"
                            >
                              <Map className="h-4 w-4 mr-2" />
                              Open Maps
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.location}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-slide-in-up">
                <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border-2 border-primary/20">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-1">Contact Information</h3>
                      <p className="text-sm text-gray-600">Optional - Help us reach you if needed</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-accent" />
                        Phone Number (Optional)
                      </label>
                      <Input
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        type="tel"
                        className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>

                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-accent" />
                        Preferred Contact Method
                      </label>
                      <select
                        name="contactInfo.preferredContact"
                        value={formData.contactInfo.preferredContact}
                        onChange={handleInputChange}
                        className="w-full h-14 text-base border-2 border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white font-medium"
                      >
                        <option value="app">📱 Through App</option>
                        <option value="phone">📞 Phone Call</option>
                        <option value="email">📧 Email</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/10 border-2 border-primary/30 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-2 text-lg">🔒 Privacy Notice</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Your contact information will only be used by emergency responders and authorized personnel to coordinate rescue efforts. We respect your privacy and will not share this information for any other purpose.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-slide-in-up">
                <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border-2 border-primary/20 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <CheckCircle className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary">Review Your Emergency Report</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Title</span>
                      <p className="text-xl text-primary mt-3 font-semibold">{formData.title}</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Description</span>
                      <p className="text-gray-800 mt-3 leading-relaxed">{formData.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Severity</span>
                        <div className="mt-3">
                          <Badge className={`text-base px-4 py-2 ${
                            formData.severity === 'critical' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                            formData.severity === 'high' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                            formData.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                            'bg-green-100 text-green-800 border-2 border-green-300'
                          }`}>
                            {formData.severity.charAt(0).toUpperCase() + formData.severity.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      {formData.animalType && (
                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                          <span className="text-xs font-bold text-primary uppercase tracking-wide">Animal Type</span>
                          <p className="text-xl text-primary mt-3 font-semibold">{formData.animalType}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Photos</span>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-lg text-primary font-semibold">{photos.length} photo(s)</span>
                        {photoUrls.length > 0 && (
                          <div className="flex gap-2">
                            {photoUrls.slice(0, 3).map((photo, i) => (
                              <img key={i} src={photo.url} alt={`Preview ${i}`} className="w-14 h-14 object-cover rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all" />
                            ))}
                            {photoUrls.length > 3 && (
                              <div className="w-14 h-14 bg-primary/10 rounded-xl border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                +{photoUrls.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-sm">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Location</span>
                      <div className="flex items-start gap-3 mt-3">
                        <MapPin className="w-6 h-6 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-gray-800 leading-relaxed text-lg">{address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-xl border-2 border-amber-200">
                      <Shield className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 mb-2 text-lg">⚠️ Important Notice</h4>
                      <p className="text-amber-700 leading-relaxed">
                        By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False emergency reports may result in account suspension and legal consequences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t-2 border-gray-100">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="px-8 py-6 text-base border-2 border-gray-300 hover:bg-gray-50 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl text-gray-700 hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Next Step
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-10 py-6 text-base shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group relative overflow-hidden disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="relative z-10 flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center">
                      <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Submit Emergency Report
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 