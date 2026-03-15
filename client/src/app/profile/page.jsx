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
  Plus,
  Bell,
  Lock,
  User,
  Briefcase,
  Link as LinkIcon
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
      admin: { icon: Shield, color: "bg-slate-900 dark:bg-slate-100", textColor: "text-white dark:text-slate-900", text: "Administrator" },
      seller: { icon: Briefcase, color: "bg-blue-600 dark:bg-blue-500", textColor: "text-white", text: "Seller" },
      user: { icon: User, color: "bg-emerald-600 dark:bg-emerald-500", textColor: "text-white", text: "Member" }
    };
    const config = roleConfig[user.role] || roleConfig.user;
    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${config.color} ${config.textColor} rounded-md text-sm font-medium`}>
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
      }
      router.push("/login");
      router.refresh();
    } catch (error) {
      if (error && typeof error === 'object' && 'digest' in error && error.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        const Cookies = (await import("js-cookie")).default;
        Cookies.remove("userToken", { path: "/" });
        Cookies.remove("sellerToken", { path: "/" });
        Cookies.remove("adminToken", { path: "/" });
      }
      router.push("/login");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
      confirmed: { label: "Confirmed", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
      cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
      in_progress: { label: "In Progress", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" }
    };
    return statusConfig[status] || { label: status, color: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "Delivered", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      pending: { label: "Processing", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
      failed: { label: "Failed", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" }
    };
    return statusConfig[status] || { label: "Processing", color: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-alabaster-grey-50 dark:bg-ink-black-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-prussian-blue-600 dark:text-prussian-blue-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-alabaster-grey-50 dark:bg-ink-black-950 pb-20">
      {/* Professional Header Section */}
      <div className="relative bg-white dark:bg-ink-black-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50"></div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg">
                  {user.profilePicture ? (
                    <AvatarImage src={user.profilePicture} className="object-cover" />
                  ) : (
                    <AvatarImage src={getDefaultAvatar()} />
                  )}
                  <AvatarFallback className="text-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-prussian-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-prussian-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {getRoleBadge()}
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Member since {formatDate(user.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setActiveTab("edit");
                        }}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleLogout}
                        className="border-slate-300 dark:border-slate-700 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bio Preview */}
                {user.bio && !isEditing && (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Profile Completion */}
          {profileCompletion < 100 && !isEditing && (
            <Card className="mb-6 border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Complete Your Profile</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Add more information to enhance your profile</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profileCompletion}%</div>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          {!isEditing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAppointments}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalSpent.toFixed(0)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedAppointments}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs Navigation */}
          {!isEditing && (
            <Card className="border-slate-200 dark:border-slate-800">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-auto bg-slate-50 dark:bg-slate-900/50 p-1 grid grid-cols-4">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <Activity className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <Calendar className="w-4 h-4 mr-2" />
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* About Section */}
                      {user.bio && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            About
                          </h3>
                          <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-6">
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {user.bio}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Contact & Social */}
                      {(user.phone || user.location || user.website || user.linkedin || user.twitter || user.instagram) && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Contact Information
                          </h3>
                          <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.phone && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="text-slate-700 dark:text-slate-300">{user.phone}</span>
                                  </div>
                                )}
                                {user.location && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="text-slate-700 dark:text-slate-300">{user.location}</span>
                                  </div>
                                )}
                                {user.website && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <LinkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" 
                                      className="text-blue-600 dark:text-blue-400 hover:underline">
                                      {user.website}
                                    </a>
                                  </div>
                                )}
                                {user.linkedin && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Linkedin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" 
                                      className="text-blue-600 dark:text-blue-400 hover:underline">
                                      LinkedIn
                                    </a>
                                  </div>
                                )}
                                {user.twitter && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Twitter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                                      className="text-blue-600 dark:text-blue-400 hover:underline">
                                      @{user.twitter.replace('@', '')}
                                    </a>
                                  </div>
                                )}
                                {user.instagram && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Instagram className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                                      className="text-blue-600 dark:text-blue-400 hover:underline">
                                      @{user.instagram.replace('@', '')}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Link href="/vet-consultation">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <Stethoscope className="w-5 h-5" />
                              <span className="text-sm">Book Vet</span>
                            </Button>
                          </Link>
                          <Link href="/store">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <ShoppingBag className="w-5 h-5" />
                              <span className="text-sm">Shop</span>
                            </Button>
                          </Link>
                          <Link href="/emergency/report">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm">Emergency</span>
                            </Button>
                          </Link>
                          <Link href="/community">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm">Community</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Achievements */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Achievements
                        </h3>
                        <Card className="border-slate-200 dark:border-slate-800">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-3">
                              {['First Order', 'Loyal Member', 'Community Star', 'Pet Lover', 'Top Supporter', 'Verified'].map((badge, idx) => (
                                <div key={idx} className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                                    <Star className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                  </div>
                                  <span className="text-xs text-center text-slate-600 dark:text-slate-400 leading-tight">{badge}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Activity Stats */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Activity
                        </h3>
                        <Card className="border-slate-200 dark:border-slate-800">
                          <CardContent className="p-6 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Profile Views</span>
                              <span className="font-semibold text-slate-900 dark:text-white">1,234</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Connections</span>
                              <span className="font-semibold text-slate-900 dark:text-white">89</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Badges</span>
                              <span className="font-semibold text-slate-900 dark:text-white">6</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="p-6">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <ShoppingBag className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Orders Yet</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Start shopping for your pet's needs</p>
                      <Link href="/store">
                        <Button>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Browse Store
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => {
                        const statusBadge = getOrderStatusBadge(order.paymentStatus);
                        return (
                          <Card key={order._id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                {order.productImage && (
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
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
                                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{order.productName || "Product"}</h4>
                                      <p className="text-sm text-slate-500 dark:text-slate-400">Order #{order._id?.slice(-8)}</p>
                                    </div>
                                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="text-slate-600 dark:text-slate-400">
                                      <span className="font-semibold text-slate-900 dark:text-white text-lg">${order.totalAmount || order.priceAtPurchase || 0}</span>
                                      {order.items?.[0]?.quantity && (
                                        <span className="ml-2">× {order.items[0].quantity}</span>
                                      )}
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400">
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
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Appointments</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Book your first consultation with a veterinarian</p>
                      <Link href="/vet-consultation">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appointment) => {
                        const statusBadge = getStatusBadge(appointment.status);
                        const Icon = appointment.consultationType === "video" ? Video :
                                     appointment.consultationType === "audio" ? PhoneCall :
                                     MessageSquare;
                        
                        return (
                          <Card key={appointment._id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                  <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        Dr. {appointment.vet?.name || "Veterinarian"}
                                      </h4>
                                      <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {appointment.petDetails?.name && `${appointment.petDetails.name} • `}
                                        {format(new Date(appointment.scheduledDate), "MMM dd, yyyy")} at {appointment.scheduledTime?.startTime}
                                      </p>
                                    </div>
                                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Icon className="w-4 h-4" />
                                      <span className="capitalize">{appointment.consultationType}</span>
                                    </div>
                                    {appointment.timeUntilAppointment && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{appointment.timeUntilAppointment}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push("/vet-consultation")}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View Details
                                    </Button>
                                    {appointment.canJoin && (
                                      <Button
                                        size="sm"
                                        onClick={() => router.push("/vet-consultation")}
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
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Settings</h3>
                      <div className="space-y-3">
                        <Card className="border-slate-200 dark:border-slate-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates about your orders and appointments</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Enable</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-slate-200 dark:border-slate-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Privacy</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Control who can see your profile</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Manage</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-slate-200 dark:border-slate-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Security</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Change password and security settings</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Update</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("overview");
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">Profile Picture URL</label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                      {updatedProfile.profilePicture ? (
                        <AvatarImage src={updatedProfile.profilePicture} />
                      ) : (
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-lg">
                          {getInitials(updatedProfile.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      name="profilePicture"
                      value={updatedProfile.profilePicture}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">Full Name *</label>
                  <Input
                    name="name"
                    value={updatedProfile.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">Bio</label>
                  <Textarea
                    name="bio"
                    value={updatedProfile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your love for animals, and what you're passionate about..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </label>
                      <Input
                        name="phone"
                        value={updatedProfile.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location
                      </label>
                      <Input
                        name="location"
                        value={updatedProfile.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Website
                      </label>
                      <Input
                        name="website"
                        value={updatedProfile.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </label>
                      <Input
                        name="linkedin"
                        value={updatedProfile.linkedin}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <Twitter className="w-4 h-4" /> Twitter
                      </label>
                      <Input
                        name="twitter"
                        value={updatedProfile.twitter}
                        onChange={handleInputChange}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                        <Instagram className="w-4 h-4" /> Instagram
                      </label>
                      <Input
                        name="instagram"
                        value={updatedProfile.instagram}
                        onChange={handleInputChange}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("overview");
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={updating}
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
        </div>
      </div>
    </div>
  );
}
