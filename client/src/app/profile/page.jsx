"use client";

import React, { useState, useEffect } from "react";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  PawPrint, 
  Mail, 
  Calendar, 
  Loader2, 
  LogOut, 
  Edit2, 
  X, 
  Check,
  Heart,
  Home,
  ShoppingBag,
  MessageCircle,
  Award,
  TrendingUp,
  Shield,
  Camera,
  Sparkles,
  Star,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Package,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  CreditCard,
  Activity,
  Eye,
  Video,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  Plus,
  Bell,
  Lock,
  User,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import toastHot from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    bio: "",
    profilePicture: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: ""
  });
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user && activeTab !== "edit") {
      fetchTabData();
    }
  }, [user, activeTab]);

  const fetchUserData = async () => {
    try {
      const userData = await getAuthenticatedUser();
      if (!userData) {
        router.push("/login");
        return;
      }
      setUser(userData);
      setUpdatedProfile({
        name: userData.name || "",
        bio: userData.bio || "",
        profilePicture: userData.profilePicture || "",
        phone: userData.phone || "",
        location: userData.location || "",
        website: userData.website || "",
        linkedin: userData.linkedin || "",
        twitter: userData.twitter || "",
        instagram: userData.instagram || ""
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toastHot.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    if (!user) return;

    try {
      if (activeTab === "orders") {
        const ordersRes = await fetch(`/api/orders?userId=${user._id}`).catch(() => ({ ok: false }));
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.status === 200 && ordersData.data) {
            setRecentOrders(ordersData.data);
            setStats(prev => ({
              ...prev,
              totalOrders: ordersData.data.length,
              totalSpent: ordersData.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            }));
          }
        }
      } else if (activeTab === "appointments") {
        const appointmentsRes = await fetch(`/api/appointments?userId=${user._id}&limit=20`).catch(() => ({ ok: false }));
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          if (appointmentsData.success && appointmentsData.data) {
            const apps = appointmentsData.data.appointments || [];
            setAppointments(apps);
            setStats(prev => ({
              ...prev,
              totalAppointments: apps.length,
              upcomingAppointments: apps.filter(a => ["scheduled", "confirmed"].includes(a.status)).length,
              completedAppointments: apps.filter(a => a.status === "completed").length
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tab data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);
      const response = await axios.put('/api/user/profile', updatedProfile);
      
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          ...updatedProfile
        }));
        setIsEditing(false);
        setActiveTab("overview");
        toastHot.success("Profile updated successfully!");
      } else {
        toastHot.error(response.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toastHot.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    const fields = ['name', 'bio', 'profilePicture', 'phone', 'location'];
    fields.forEach(field => {
      if (user[field]) completed++;
    });
    return Math.round((completed / fields.length) * 100);
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const roleConfig = {
      admin: { icon: Shield, color: "from-purple-500 to-purple-600", text: "Admin" },
      seller: { icon: ShoppingBag, color: "from-blue-500 to-blue-600", text: "Seller" },
      user: { icon: PawPrint, color: "from-accent to-accent/80", text: "Member" }
    };
    const config = roleConfig[user.role] || roleConfig.user;
    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r ${config.color} text-white rounded-full text-sm font-semibold shadow-lg`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getDefaultAvatar = () => {
    if (!user) return "/default-avatar.svg";
    const idLastChar = user._id ? user._id.slice(-1) : user.name?.length.toString().slice(-1) || "0";
    const num = parseInt(idLastChar, 10) % 3;
    if (num === 0) return "/default-avatar.svg";
    if (num === 1) return "/default-avatar-2.svg";
    return "/default-avatar-3.svg";
  };

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import("../../../actions/loginActions");
      await logoutAction();
      
      if (typeof window !== "undefined") {
        const Cookies = (await import("js-cookie")).default;
        Cookies.remove("userToken", { path: "/" });
        Cookies.remove("sellerToken", { path: "/" });
        Cookies.remove("adminToken", { path: "/" });
        
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });
      }
      
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
      confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
      completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
      in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-800" }
    };
    return statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "Delivered", color: "bg-green-100 text-green-800" },
      pending: { label: "Processing", color: "bg-yellow-100 text-yellow-800" },
      failed: { label: "Failed", color: "bg-red-100 text-red-800" }
    };
    return statusConfig[status] || { label: "Processing", color: "bg-gray-100 text-gray-800" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-primary font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 pb-20">
      {/* Cover Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary via-primary/90 to-accent/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            {/* Avatar */}
            <div className="relative group mb-4 md:mb-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-accent via-primary to-accent rounded-full opacity-75 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10"></div>
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl relative z-10 bg-white">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} className="object-cover" />
                ) : (
                  <AvatarImage src={getDefaultAvatar()} />
                )}
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 z-20 border-2 border-white">
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-white text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 flex-wrap">
                <h1 className="titlefont text-2xl md:text-3xl lg:text-4xl font-bold break-words">{user.name}</h1>
                <div className="flex-shrink-0">{getRoleBadge()}</div>
              </div>
              <p className="text-white/90 flex items-center gap-2 justify-center md:justify-start mb-1 text-sm md:text-base break-all">
                <Mail className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{user.email}</span>
              </p>
              <p className="text-white/80 text-xs md:text-sm flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="w-4 h-4 flex-shrink-0" /> Member since {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("edit");
                  }}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 shadow-lg whitespace-nowrap"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="bg-red-500/20 backdrop-blur-md hover:bg-red-500/30 text-white border border-red-500/30 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Spacer */}
          <div className="h-24 md:h-32"></div>
          
          {/* Profile Completion Card */}
          {profileCompletion < 100 && !isEditing && (
            <Card className="mb-6 bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/20 rounded-full flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary text-lg">Complete Your Profile</h3>
                      <p className="text-sm text-secondary">Add more information to help others know you better</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-primary titlefont">{profileCompletion}%</div>
                    <div className="w-32 h-3 bg-accent/20 rounded-full mt-2 overflow-hidden mx-auto md:mx-0">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary text-sm font-medium mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-accent/20 p-3 rounded-xl">
                      <ShoppingBag className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary text-sm font-medium mb-1">Appointments</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalAppointments}</p>
                      <p className="text-xs text-secondary mt-1">{stats.upcomingAppointments} upcoming</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Stethoscope className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary text-sm font-medium mb-1">Total Spent</p>
                      <p className="text-3xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <CreditCard className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary text-sm font-medium mb-1">Completed</p>
                      <p className="text-3xl font-bold text-primary">{stats.completedAppointments}</p>
                      <p className="text-xs text-secondary mt-1">Consultations</p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs Navigation */}
          {!isEditing && (
            <Card className="mb-6 bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full h-14 bg-secondary/50 p-1 rounded-none">
                    <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Activity className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Package className="w-4 h-4 mr-2" />
                      Orders ({stats.totalOrders})
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Appointments ({stats.totalAppointments})
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6 space-y-6">
                    {/* About Section */}
                    <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <PawPrint className="w-5 h-5" />
                          About Me
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-secondary leading-relaxed text-lg">
                          {user.bio || (
                            <span className="italic text-secondary/60">
                              No bio provided yet. Click "Edit Profile" to add one!
                            </span>
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Contact & Social */}
                    {(user.phone || user.location || user.website || user.linkedin || user.twitter || user.instagram) && (
                      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Contact & Social
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.phone && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-primary font-medium">{user.phone}</span>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-primary font-medium">{user.location}</span>
                              </div>
                            )}
                            {user.website && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-medium">
                                  {user.website}
                                </a>
                              </div>
                            )}
                            {user.linkedin && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Linkedin className="w-5 h-5 text-primary" />
                                </div>
                                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-medium">
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                            {user.twitter && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Twitter className="w-5 h-5 text-primary" />
                                </div>
                                <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-medium">
                                  @{user.twitter.replace('@', '')}
                                </a>
                              </div>
                            )}
                            {user.instagram && (
                              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Instagram className="w-5 h-5 text-primary" />
                                </div>
                                <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-medium">
                                  @{user.instagram.replace('@', '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Link href="/vet-consultation">
                            <Button className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <Stethoscope className="w-5 h-5" />
                              <span className="text-sm font-semibold">Book Vet</span>
                            </Button>
                          </Link>
                          <Link href="/store">
                            <Button className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <ShoppingBag className="w-5 h-5" />
                              <span className="text-sm font-semibold">Shop</span>
                            </Button>
                          </Link>
                          <Link href="/emergency/report">
                            <Button className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <AlertCircle className="w-5 h-5" />
                              <span className="text-sm font-semibold">Emergency</span>
                            </Button>
                          </Link>
                          <Link href="/community">
                            <Button className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-semibold">Community</span>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="p-6">
                    {recentOrders.length === 0 ? (
                      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                        <CardContent className="p-16 text-center">
                          <ShoppingBag className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                          <h3 className="text-2xl font-bold text-primary mb-2">No Orders Yet</h3>
                          <p className="text-secondary mb-6">Start shopping for your pet's needs</p>
                          <Link href="/store">
                            <Button className="bg-primary hover:bg-primary/90 text-white">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Browse Store
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order) => {
                          const statusBadge = getOrderStatusBadge(order.paymentStatus);
                          return (
                            <Card key={order._id} className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  {order.productImage && (
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-accent/10 flex-shrink-0 border-2 border-accent/20">
                                      <Image
                                        src={order.productImage}
                                        alt={order.productName || "Product"}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-bold text-primary text-lg mb-1">{order.productName || "Product"}</h4>
                                        <p className="text-sm text-secondary">Order #{order._id?.slice(-8)}</p>
                                      </div>
                                      <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="text-secondary">
                                        <span className="font-bold text-primary text-lg">${order.totalAmount || order.priceAtPurchase || 0}</span>
                                        {order.items?.[0]?.quantity && (
                                          <span className="ml-2">× {order.items[0].quantity}</span>
                                        )}
                                      </div>
                                      <span className="text-secondary">
                                        {format(new Date(order.boughtAt || order.createdAt), "MMM dd, yyyy")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Appointments Tab */}
                  <TabsContent value="appointments" className="p-6">
                    {appointments.length === 0 ? (
                      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                        <CardContent className="p-16 text-center">
                          <Calendar className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                          <h3 className="text-2xl font-bold text-primary mb-2">No Appointments</h3>
                          <p className="text-secondary mb-6">Book your first consultation with a veterinarian</p>
                          <Link href="/vet-consultation">
                            <Button className="bg-primary hover:bg-primary/90 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Book Appointment
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => {
                          const statusBadge = getStatusBadge(appointment.status);
                          const Icon = appointment.consultationType === "video" ? Video :
                                       appointment.consultationType === "audio" ? PhoneCall :
                                       MessageSquare;
                          
                          return (
                            <Card key={appointment._id} className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                                    <Stethoscope className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h4 className="font-bold text-primary text-lg mb-1">
                                          Dr. {appointment.vet?.name || "Veterinarian"}
                                        </h4>
                                        <p className="text-sm text-secondary">
                                          {appointment.petDetails?.name && `${appointment.petDetails.name} • `}
                                          {format(new Date(appointment.scheduledDate), "MMM dd, yyyy")} at {appointment.scheduledTime?.startTime}
                                        </p>
                                      </div>
                                      <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                                      <div className="flex items-center gap-1">
                                        <Icon className="w-4 h-4 text-accent" />
                                        <span className="capitalize">{appointment.consultationType}</span>
                                      </div>
                                      {appointment.timeUntilAppointment && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-4 h-4 text-accent" />
                                          <span>{appointment.timeUntilAppointment}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push("/vet-consultation")}
                                        className="border-primary/30 text-primary hover:bg-primary/5"
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                      </Button>
                                      {appointment.canJoin && (
                                        <Button
                                          size="sm"
                                          onClick={() => router.push("/vet-consultation")}
                                          className="bg-primary hover:bg-primary/90 text-white"
                                        >
                                          <Video className="w-4 h-4 mr-1" />
                                          Join Now
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="p-6">
                    <div className="space-y-6">
                      <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Account Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-accent" />
                              <div>
                                <p className="font-semibold text-primary">Email Notifications</p>
                                <p className="text-sm text-secondary">Receive updates about your orders and appointments</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-primary/30">
                              Enable
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
                            <div className="flex items-center gap-3">
                              <Lock className="w-5 h-5 text-accent" />
                              <div>
                                <p className="font-semibold text-primary">Privacy</p>
                                <p className="text-sm text-secondary">Control who can see your profile</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-primary/30">
                              Manage
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-accent" />
                              <div>
                                <p className="font-semibold text-primary">Security</p>
                                <p className="text-sm text-secondary">Change password and security settings</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-primary/30">
                              Update
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Edit2 className="w-6 h-6" />
                    Edit Profile
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("overview");
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">Profile Picture URL</label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 border-2 border-accent">
                      {updatedProfile.profilePicture ? (
                        <AvatarImage src={updatedProfile.profilePicture} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {getInitials(updatedProfile.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      name="profilePicture"
                      value={updatedProfile.profilePicture}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border-accent/30 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">Full Name *</label>
                  <Input
                    name="name"
                    value={updatedProfile.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="text-lg border-accent/30 focus:border-primary"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">Bio</label>
                  <Textarea
                    name="bio"
                    value={updatedProfile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your love for animals, and what you're passionate about..."
                    rows={5}
                    className="resize-none border-accent/30 focus:border-primary"
                  />
                </div>

                <Separator className="bg-accent/20" />

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </label>
                      <Input
                        name="phone"
                        value={updatedProfile.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location
                      </label>
                      <Input
                        name="location"
                        value={updatedProfile.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Website
                      </label>
                      <Input
                        name="website"
                        value={updatedProfile.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-accent/20" />

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </label>
                      <Input
                        name="linkedin"
                        value={updatedProfile.linkedin}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/username"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <Twitter className="w-4 h-4" /> Twitter
                      </label>
                      <Input
                        name="twitter"
                        value={updatedProfile.twitter}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block flex items-center gap-2">
                        <Instagram className="w-4 h-4" /> Instagram
                      </label>
                      <Input
                        name="instagram"
                        value={updatedProfile.instagram}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className="border-accent/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("overview");
                    }}
                    disabled={updating}
                    className="px-8 h-12 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={updating}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 h-12 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sidebar - Only show when not editing */}
          {!isEditing && (
            <div className="lg:col-span-1 space-y-6 mt-6 lg:mt-0">
              {/* Quick Stats */}
              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                    <span className="text-secondary text-sm font-medium">Profile Views</span>
                    <span className="font-bold text-primary text-lg">1,234</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                    <span className="text-secondary text-sm font-medium">Connections</span>
                    <span className="font-bold text-primary text-lg">89</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300">
                    <span className="text-secondary text-sm font-medium">Badges Earned</span>
                    <span className="font-bold text-primary text-lg">5</span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {['First Adoption', 'Volunteer Hero', 'Community Star', 'Animal Lover', 'Top Contributor', 'Pet Parent'].map((badge, idx) => (
                      <div key={idx} className="flex flex-col items-center p-3 bg-accent/10 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                          <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="text-xs text-center text-primary font-semibold leading-tight">{badge}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
