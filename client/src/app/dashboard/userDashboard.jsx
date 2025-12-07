"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingBag,
  Calendar,
  Stethoscope,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Eye,
  MapPin,
  Phone,
  Mail,
  Star,
  Heart,
  Activity,
  Zap,
  Award,
  Sparkles,
  PawPrint,
  MessageCircle,
  CreditCard,
  Bell,
  Settings,
  User,
  Home,
  Store,
  Video,
  PhoneCall,
  MessageSquare,
  XCircle,
  ChevronRight
} from "lucide-react";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";

export default function UserDashboard({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedConsultations: 0,
    totalSpent: 0,
    favoriteVets: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = user || await getAuthenticatedUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch all data in parallel
      const [ordersRes, appointmentsRes, upcomingRes] = await Promise.all([
        fetch(`/api/orders?userId=${currentUser._id}`).catch(() => ({ ok: false })),
        fetch(`/api/appointments?userId=${currentUser._id}&limit=5`).catch(() => ({ ok: false })),
        fetch(`/api/appointments?userId=${currentUser._id}&upcoming=true&limit=3`).catch(() => ({ ok: false }))
      ]);

      // Process orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.status === 200 && ordersData.data) {
          setRecentOrders(ordersData.data.slice(0, 5));
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.data.length,
            totalSpent: ordersData.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
          }));
        }
      }

      // Process appointments
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsData.success && appointmentsData.data) {
          const appointments = appointmentsData.data.appointments || [];
          setStats(prev => ({
            ...prev,
            totalAppointments: appointments.length,
            completedConsultations: appointments.filter(a => a.status === "completed").length
          }));
        }
      }

      // Process upcoming appointments
      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();
        if (upcomingData.success && upcomingData.data) {
          const upcoming = upcomingData.data.appointments || [];
          setUpcomingAppointments(upcoming);
          setStats(prev => ({
            ...prev,
            upcomingAppointments: upcoming.length
          }));
        }
      }

      // Build activity feed
      buildActivityFeed();

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const buildActivityFeed = () => {
    const activities = [];
    
    recentOrders.forEach(order => {
      activities.push({
        type: "order",
        title: "Order Placed",
        description: `Order #${order._id?.slice(-8)}`,
        date: order.boughtAt || order.createdAt,
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100"
      });
    });

    upcomingAppointments.forEach(appointment => {
      activities.push({
        type: "appointment",
        title: "Appointment Scheduled",
        description: `Consultation with Dr. ${appointment.vet?.name || "Veterinarian"}`,
        date: appointment.scheduledDate,
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentActivity(activities.slice(0, 10));
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
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-accent/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-primary font-semibold text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold titlefont">
                  Welcome back, {user?.name || "User"}! 👋
                </h1>
                <p className="text-white/80 text-sm mt-1">Here's what's happening with your account</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/profile")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/store")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Store className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                  <p className="text-xs text-secondary mt-1">All time purchases</p>
                </div>
                <div className="bg-accent/20 p-4 rounded-xl">
                  <ShoppingBag className="w-8 h-8 text-accent" />
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
                <div className="bg-blue-100 p-4 rounded-xl">
                  <Calendar className="w-8 h-8 text-blue-600" />
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
                  <p className="text-xs text-secondary mt-1">On products & services</p>
                </div>
                <div className="bg-green-100 p-4 rounded-xl">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-primary">{stats.completedConsultations}</p>
                  <p className="text-xs text-secondary mt-1">Consultations done</p>
                </div>
                <div className="bg-emerald-100 p-4 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/vet-consultation">
                <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Stethoscope className="w-6 h-6" />
                  <span className="text-sm font-semibold">Book Vet</span>
                </Button>
              </Link>
              <Link href="/store">
                <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="text-sm font-semibold">Shop Now</span>
                </Button>
              </Link>
              <Link href="/emergency/report">
                <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-sm font-semibold">Emergency</span>
                </Button>
              </Link>
              <Link href="/community">
                <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-semibold">Community</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Upcoming Appointments
                </CardTitle>
                <Link href="/vet-consultation">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Plus className="w-4 h-4 mr-1" />
                    Book
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-secondary font-medium mb-2">No upcoming appointments</p>
                  <p className="text-secondary text-sm mb-4">Book your first consultation with a veterinarian</p>
                  <Link href="/vet-consultation">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => {
                    const statusBadge = getStatusBadge(appointment.status);
                    const Icon = appointment.consultationType === "video" ? Video :
                                 appointment.consultationType === "audio" ? PhoneCall :
                                 MessageSquare;
                    
                    return (
                      <div
                        key={appointment._id}
                        className="p-4 bg-accent/5 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Stethoscope className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-primary mb-1">
                                Dr. {appointment.vet?.name || "Veterinarian"}
                              </h4>
                              <p className="text-sm text-secondary">
                                {appointment.petDetails?.name && `${appointment.petDetails.name} • `}
                                {format(new Date(appointment.scheduledDate), "MMM dd, yyyy")} at {appointment.scheduledTime?.startTime}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-secondary">
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
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/vet-consultation`)}
                            className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {appointment.canJoin && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/vet-consultation`)}
                              className="flex-1 bg-primary hover:bg-primary/90 text-white"
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Join Now
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-accent via-accent/90 to-accent text-primary p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Recent Orders
                </CardTitle>
                <Link href="/store">
                  <Button variant="outline" size="sm" className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                    View Store
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-secondary font-medium mb-2">No orders yet</p>
                  <p className="text-secondary text-sm mb-4">Start shopping for your pet's needs</p>
                  <Link href="/store">
                    <Button className="bg-accent hover:bg-accent/90 text-primary">
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
                      <div
                        key={order._id}
                        className="p-4 bg-accent/5 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          {order.productImage && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-accent/10 flex-shrink-0">
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
                                <h4 className="font-bold text-primary truncate">
                                  {order.productName || "Product"}
                                </h4>
                                <p className="text-xs text-secondary">
                                  Order #{order._id?.slice(-8)}
                                </p>
                              </div>
                              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-secondary">
                                <span className="font-semibold text-primary">${order.totalAmount || order.priceAtPurchase || 0}</span>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                <p className="text-secondary font-medium">No recent activity</p>
                <p className="text-secondary text-sm mt-1">Your activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-accent/5 rounded-xl border-2 border-accent/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className={`${activity.bgColor} p-3 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-primary mb-1">{activity.title}</h4>
                        <p className="text-sm text-secondary mb-2">{activity.description}</p>
                        <p className="text-xs text-secondary">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
