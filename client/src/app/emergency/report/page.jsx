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
  Map
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
    initializeAuth();
    checkLocationPermissions();
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Submitting Report</h3>
            <p className="text-gray-600">Please wait while we process your emergency report...</p>
            {uploadingPhoto && (
              <div className="mt-4 bg-gray-100 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Enter Location Manually</h3>
            <p className="text-gray-600 mb-4">
              Enter the exact coordinates where the emergency is located. Accurate location information is crucial for emergency response.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude * <span className="text-gray-500">(North-South position: -90 to 90)</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  value={manualLocation.latitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full"
                />
                {manualLocation.latitude && (parseFloat(manualLocation.latitude) < -90 || parseFloat(manualLocation.latitude) > 90) && (
                  <p className="text-red-500 text-sm mt-1">Latitude must be between -90 and 90</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude * <span className="text-gray-500">(East-West position: -180 to 180)</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  value={manualLocation.longitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full"
                />
                {manualLocation.longitude && (parseFloat(manualLocation.longitude) < -180 || parseFloat(manualLocation.longitude) > 180) && (
                  <p className="text-red-500 text-sm mt-1">Longitude must be between -180 and 180</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address or Description (Optional)
                </label>
                <Input
                  placeholder="e.g., 123 Main St, City, State or Near Central Park"
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowLocationModal(false);
                  setManualLocation({ latitude: "", longitude: "", address: "" });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualLocationSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!manualLocation.latitude || !manualLocation.longitude || 
                         parseFloat(manualLocation.latitude) < -90 || parseFloat(manualLocation.latitude) > 90 ||
                         parseFloat(manualLocation.longitude) < -180 || parseFloat(manualLocation.longitude) > 180}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use This Location
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
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
                className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30 rounded-full p-4"
              >
                <X className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={capturePhoto}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 ring-4 ring-white/30"
              >
                <Camera className="h-8 w-8" />
              </Button>
            </div>
            
            {/* Camera info */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg">
              <p className="text-sm">Tap to capture • {5 - photos.length} photos remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Emergency Report</h1>
              <p className="text-red-100">Report animal emergencies with precise details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isAccessible = currentStep >= step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-red-600 border-red-600 text-white shadow-lg scale-110' : ''}
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${!isAccessible ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                    ${isAccessible && !isActive && !isCompleted ? 'bg-white border-red-200 text-red-600 hover:border-red-300' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-800">
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Emergency Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Emergency Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief, clear description of the emergency"
                    className={`h-12 ${formErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide comprehensive details about the emergency situation, animal condition, immediate dangers, and any actions already taken..."
                    rows={6}
                    className={`resize-none ${formErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.description.length}/500 characters • Minimum 20 characters required
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full h-12 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">🟢 Low - Minor concern</option>
                      <option value="medium">🟡 Medium - Needs attention</option>
                      <option value="high">🟠 High - Urgent care needed</option>
                      <option value="critical">🔴 Critical - Life threatening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Animal Type
                    </label>
                    <Input
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleInputChange}
                      placeholder="e.g., Dog, Cat, Bird, Wildlife"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Photos */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Photos & Evidence * (Maximum 5 photos)
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    className={`
                      border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                      ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'}
                      ${formErrors.photos ? 'border-red-500 bg-red-50' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Add Photos
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Drag and drop photos here, or use the buttons below
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        onClick={startCamera}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={photos.length >= 5}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={photos.length >= 5}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
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
                    <p className="text-red-500 text-sm mt-2">{formErrors.photos}</p>
                  )}
                </div>

                {/* Photo Preview */}
                {photoUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Uploaded Photos ({photoUrls.length}/5)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photoUrls.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Emergency photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Button
                              onClick={() => removePhoto(index)}
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {photo.name}
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
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Emergency Location *
                  </label>
                  
                  {locationStatus === "idle" && (
                    <div className="text-center py-8">
                      <Crosshair className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Emergency Location Required
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Precise location information is critical for emergency response teams to reach you quickly.
                      </p>
                      
                      <div className="space-y-3">
                        <Button
                          onClick={getCurrentLocation}
                          className="bg-red-600 hover:bg-red-700 text-white w-full max-w-xs"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Get My Current Location
                        </Button>
                        
                        <div className="text-gray-400">or</div>
                        
                        <Button
                          onClick={() => setShowLocationModal(true)}
                          variant="outline"
                          className="w-full max-w-xs"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
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
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Getting Your Location
                      </h3>
                      <p className="text-gray-500">
                        Please wait while we determine your precise coordinates...
                      </p>
                    </div>
                  )}

                  {locationStatus === "success" && location && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 mb-2">
                            Location Captured Successfully
                          </h3>
                          <p className="text-green-700 mb-3">{address}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-green-600 mb-4">
                            <div>
                              <span className="font-medium">Latitude:</span> {location.latitude.toFixed(6)}
                            </div>
                            <div>
                              <span className="font-medium">Longitude:</span> {location.longitude.toFixed(6)}
                            </div>
                            {location.accuracy && (
                              <div className="col-span-2">
                                <span className="font-medium">Accuracy:</span> ±{Math.round(location.accuracy)}m
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={getCurrentLocation}
                              variant="outline"
                              size="sm"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Refresh Location
                            </Button>
                            <Button
                              onClick={() => setShowLocationModal(true)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Manually
                            </Button>
                            <Button
                              onClick={() => window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')}
                              variant="outline"
                              size="sm"
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
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-800 mb-2">
                            Unable to Get Location
                          </h3>
                          <p className="text-red-700 mb-4">
                            Location access failed. This could be due to:
                          </p>
                          <ul className="text-red-700 text-sm mb-4 list-disc list-inside space-y-1">
                            <li>Location permissions denied in browser</li>
                            <li>GPS/network connection issues</li>
                            <li>Browser security settings</li>
                          </ul>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={getCurrentLocation}
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                            <Button
                              onClick={() => setShowLocationModal(true)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              size="sm"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Enter Manually
                            </Button>
                            <Button
                              onClick={() => window.open("https://www.google.com/maps", "_blank")}
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
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
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      name="contactInfo.preferredContact"
                      value={formData.contactInfo.preferredContact}
                      onChange={handleInputChange}
                      className="w-full h-12 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="app">📱 Through App</option>
                      <option value="phone">📞 Phone Call</option>
                      <option value="email">📧 Email</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Privacy Notice</h4>
                  <p className="text-blue-700 text-sm">
                    Your contact information will only be used by emergency responders and authorized personnel to coordinate rescue efforts. We respect your privacy and will not share this information for any other purpose.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Review Your Emergency Report</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-600">Title:</span>
                      <p className="text-gray-800">{formData.title}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="text-gray-800">{formData.description}</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <span className="font-medium text-gray-600">Severity:</span>
                        <Badge className={`ml-2 ${
                          formData.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          formData.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          formData.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {formData.severity}
                        </Badge>
                      </div>
                      
                      {formData.animalType && (
                        <div>
                          <span className="font-medium text-gray-600">Animal:</span>
                          <span className="ml-2 text-gray-800">{formData.animalType}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Photos:</span>
                      <span className="ml-2 text-gray-800">{photos.length} photo(s)</span>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Location:</span>
                      <p className="text-gray-800">{address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important Notice</h4>
                  <p className="text-amber-700 text-sm">
                    By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False emergency reports may result in account suspension and legal consequences.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="px-6"
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  className="bg-red-600 hover:bg-red-700 text-white px-6"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Submit Emergency Report
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 