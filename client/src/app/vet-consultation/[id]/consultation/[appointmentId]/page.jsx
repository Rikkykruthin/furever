"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Send,
  Upload,
  Camera,
  FileImage,
  Clock,
  Users,
  Settings,
  Maximize,
  Minimize,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Heart,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "../../../../../../actions/loginActions";

export default function ConsultationPage() {
  const [appointment, setAppointment] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultationActive, setConsultationActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Video/Audio states
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Consultation notes
  const [vetNotes, setVetNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [prescriptionNeeded, setPrescriptionNeeded] = useState(false);
  
  const { id: vetId, appointmentId } = useParams();
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    fetchAppointmentAndUser();
  }, [appointmentId]);

  useEffect(() => {
    if (consultationActive) {
      startSessionTimer();
    } else {
      stopSessionTimer();
    }
    
    return () => stopSessionTimer();
  }, [consultationActive]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAppointmentAndUser = async () => {
    try {
      setLoading(true);
      const [appointmentResponse, userResponse] = await Promise.all([
        fetch(`/api/appointments/${appointmentId}`),
        getAuthenticatedUser()
      ]);
      
      const appointmentData = await appointmentResponse.json();
      
      if (appointmentData.success) {
        setAppointment(appointmentData.data);
        setMessages(appointmentData.data.consultation?.messages || []);
        setVetNotes(appointmentData.data.consultation?.vetNotes || "");
        setDiagnosis(appointmentData.data.consultation?.diagnosis || "");
        setRecommendations(appointmentData.data.consultation?.recommendations || "");
        
        // Check if consultation is already in progress
        if (appointmentData.data.status === "in_progress") {
          setConsultationActive(true);
        }
      } else {
        console.error("Failed to fetch appointment:", appointmentData.message);
        // Handle appointment not found or other errors
        if (appointmentData.message === "Appointment not found") {
          router.push("/vet-consultation");
        }
      }
      
      if (userResponse) {
        setUser(userResponse);
      } else {
        console.error("Failed to get authenticated user");
        // Redirect to login if user is not authenticated
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      // Show error message to user
      alert("Failed to load consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startConsultation = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/start`, {
        method: "POST"
      });
      
      if (response.ok) {
        setConsultationActive(true);
        // Update appointment status
        setAppointment(prev => ({ ...prev, status: "in_progress" }));
      }
    } catch (error) {
      console.error("Error starting consultation:", error);
    }
  };

  const endConsultation = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vetNotes,
          diagnosis,
          recommendations,
          actualDuration: sessionTime,
          prescriptionNeeded
        })
      });
      
      if (response.ok) {
        setConsultationActive(false);
        // Update appointment status
        setAppointment(prev => ({ ...prev, status: "completed" }));
        // Redirect to summary page
        router.push(`/vet-consultation/${vetId}/consultation/${appointmentId}/summary`);
      }
    } catch (error) {
      console.error("Error ending consultation:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message = {
      sender: user?.role === "vet" ? "vet" : "user",
      message: newMessage,
      timestamp: new Date(),
      messageType: "text"
    };
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    // Send to backend
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        // If failed, remove the optimistic message and show error
        setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
        console.error("Failed to send message");
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
      alert("Failed to send message. Please check your connection.");
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload images or PDF files.`);
        continue;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      const message = {
        sender: user?.role === "vet" ? "vet" : "user",
        message: `Shared ${file.type.startsWith("image/") ? "an image" : "a file"}: ${file.name}`,
        timestamp: new Date(),
        messageType: file.type.startsWith("image/") ? "image" : "file",
        fileUrl: URL.createObjectURL(file)
      };
      
      // Optimistically add to UI
      setMessages(prev => [...prev, message]);
      
      // Send to backend
      try {
        const response = await fetch(`/api/appointments/${appointmentId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(message)
        });
        
        if (!response.ok) {
          // Remove optimistic message on error
          setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
      }
    }
  };

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  const isVideoConsultation = appointment?.consultationType === "video";
  const isAudioConsultation = appointment?.consultationType === "audio";
  const isChatConsultation = appointment?.consultationType === "chat";

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={appointment?.vet?.photo || "/default-vet-avatar.svg"}
                  alt={appointment?.vet?.name || "Vet"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-white font-semibold">
                  Dr. {appointment?.vet?.name}
                </h1>
                <p className="text-slate-400 text-sm">
                  {appointment?.petDetails?.name} - {appointment?.consultationType} consultation
                </p>
              </div>
            </div>
            
            {consultationActive && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                </div>
                <Badge className={`
                  ${connectionQuality === "excellent" ? "bg-green-600" : ""}
                  ${connectionQuality === "good" ? "bg-yellow-600" : ""}
                  ${connectionQuality === "fair" ? "bg-orange-600" : ""}
                  ${connectionQuality === "poor" ? "bg-red-600" : ""}
                `}>
                  {connectionQuality} connection
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-slate-700"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video/Content Area */}
        <div className="flex-1 flex flex-col">
          {(isVideoConsultation || isAudioConsultation) && (
            <div className="flex-1 bg-slate-800 relative">
              {/* Video Container */}
              <div className="h-full flex items-center justify-center">
                {isVideoConsultation ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 h-full w-full">
                    {/* Vet Video */}
                    <div className="bg-slate-700 rounded-lg overflow-hidden relative">
                      <div className="aspect-video bg-slate-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Dr. {appointment?.vet?.name}</p>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/50 text-white">Vet</Badge>
                      </div>
                    </div>
                    
                    {/* User Video */}
                    <div className="bg-slate-700 rounded-lg overflow-hidden relative">
                      <div className="aspect-video bg-slate-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>You</p>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/50 text-white">You</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Phone className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Audio Consultation</h3>
                    <p className="text-slate-400">Connected via voice call</p>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              {consultationActive && (isVideoConsultation || isAudioConsultation) && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-4 bg-black/50 rounded-full px-6 py-3 backdrop-blur">
                    {isVideoConsultation && (
                      <Button
                        variant={isVideoOn ? "secondary" : "destructive"}
                        size="lg"
                        className="rounded-full w-12 h-12 p-0"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                      >
                        {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                      </Button>
                    )}
                    
                    <Button
                      variant={isAudioOn ? "secondary" : "destructive"}
                      size="lg"
                      className="rounded-full w-12 h-12 p-0"
                      onClick={() => setIsAudioOn(!isAudioOn)}
                    >
                      {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="lg"
                      className="rounded-full w-12 h-12 p-0"
                      onClick={endConsultation}
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Start Consultation Button */}
          {!consultationActive && (
            <div className="flex-1 bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to Start</h2>
                  <p className="text-slate-400">
                    Your consultation with Dr. {appointment?.vet?.name} is ready to begin
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button
                    size="lg"
                    onClick={startConsultation}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    Start {appointment?.consultationType === "video" ? "Video" : 
                           appointment?.consultationType === "audio" ? "Audio" : "Chat"} Consultation
                  </Button>
                  
                  <div className="text-sm text-slate-400">
                    Duration: 30 minutes | Fee: ${appointment?.payment?.amount}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-96 bg-white border-l border-slate-300 flex flex-col">
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Consultation Chat</h3>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "vet" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "vet"
                      ? "bg-slate-100 text-slate-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {message.messageType === "image" ? (
                    <div>
                      <Image
                        src={message.fileUrl}
                        alt="Shared image"
                        width={200}
                        height={150}
                        className="rounded mb-2"
                      />
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ) : (
                    <p>{message.message}</p>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-2 mb-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Vet Notes Panel (only visible to vets) */}
        {user?.role === "vet" && consultationActive && (
          <div className="w-80 bg-white border-l border-slate-300 flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-semibold">Consultation Notes</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Observations</label>
                <Textarea
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="Record your observations..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Diagnosis</label>
                <Textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Recommendations</label>
                <Textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Treatment recommendations..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prescription"
                  checked={prescriptionNeeded}
                  onChange={(e) => setPrescriptionNeeded(e.target.checked)}
                />
                <label htmlFor="prescription" className="text-sm">
                  Prescription needed
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 