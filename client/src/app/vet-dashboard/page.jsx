"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  Video,
  MessageCircle,
  Phone,
  Settings,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Download,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthenticatedUser } from "../../../actions/loginActions";

export default function VetDashboardPage() {
  const [vet, setVet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    status: "all",
    date: "today",
    search: ""
  });

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // First, get authenticated user to verify vet role
      const userResponse = await getAuthenticatedUser();
      if (!userResponse.success || userResponse.user.role !== "vet") {
        router.push("/login");
        return;
      }

      // Fetch vet profile, appointments, and stats
      const [vetResponse, appointmentsResponse, statsResponse] = await Promise.all([
        fetch(`/api/vet/${userResponse.user._id}?includeStats=true`),
        fetch(`/api/appointments?vetId=${userResponse.user._id}&limit=20`),
        fetch(`/api/vet/${userResponse.user._id}/stats`)
      ]);

      const [vetData, appointmentsData, statsData] = await Promise.all([
        vetResponse.json(),
        appointmentsResponse.json(),
        statsResponse.json()
      ]);

      if (vetData.success) setVet(vetData.data);
      if (appointmentsData.success) setAppointments(appointmentsData.data.appointments);
      if (statsData.success) setStats(statsData.data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "scheduled": "bg-blue-100 text-blue-800",
      "confirmed": "bg-green-100 text-green-800", 
      "in_progress": "bg-yellow-100 text-yellow-800",
      "completed": "bg-emerald-100 text-emerald-800",
      "cancelled": "bg-red-100 text-red-800",
      "no_show": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      "Low": "bg-green-100 text-green-800",
      "Medium": "bg-yellow-100 text-yellow-800", 
      "High": "bg-orange-100 text-orange-800",
      "Emergency": "bg-red-100 text-red-800"
    };
    return colors[urgency] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (dateString, timeString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${timeString}`;
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AppointmentCard = ({ appointment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                <Image
                  src={appointment.user?.avatar || "/default-avatar.svg"}
                  alt={appointment.user?.name || "User"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold">{appointment.user?.name}</h4>
                <p className="text-sm text-slate-600">
                  {appointment.petDetails?.name} - {appointment.petDetails?.species}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(appointment.scheduledDate, appointment.scheduledTime.startTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {appointment.consultationType === "video" && <Video className="h-4 w-4" />}
                  {appointment.consultationType === "audio" && <Phone className="h-4 w-4" />}
                  {appointment.consultationType === "chat" && <MessageCircle className="h-4 w-4" />}
                  <span className="capitalize">{appointment.consultationType}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status.replace("_", " ")}
                </Badge>
                <Badge className={getUrgencyColor(appointment.petDetails?.urgencyLevel)}>
                  {appointment.petDetails?.urgencyLevel}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-700 line-clamp-2">
                {appointment.reason}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <Button size="sm" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {appointment.status === "confirmed" && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Video className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={vet?.photo || "/default-vet-avatar.svg"}
                  alt={vet?.name || "Vet"}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome back, Dr. {vet?.name}
                </h1>
                <p className="text-slate-600">
                  {vet?.specializations?.join(", ")} • {vet?.yearsOfExperience} years experience
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments || 0}
            icon={Calendar}
            trend="+12% from yesterday"
            color="blue"
          />
          <StatCard
            title="Total Patients"
            value={vet?.stats?.totalPatients || 0}
            icon={Users}
            trend="+5% this month"
            color="green"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue || 0}`}
            icon={DollarSign}
            trend="+8% from last month"
            color="purple"
          />
          <StatCard
            title="Average Rating"
            value={vet?.rating?.average?.toFixed(1) || "0.0"}
            icon={Star}
            trend={`${vet?.rating?.totalReviews || 0} reviews`}
            color="yellow"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Set Availability
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Create Prescription
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Download className="h-6 w-6" />
                    Export Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments
                    .filter(apt => {
                      const today = new Date().toDateString();
                      const aptDate = new Date(apt.scheduledDate).toDateString();
                      return aptDate === today;
                    })
                    .slice(0, 5)
                    .map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))
                  }
                  
                  {appointments.filter(apt => {
                    const today = new Date().toDateString();
                    const aptDate = new Date(apt.scheduledDate).toDateString();
                    return aptDate === today;
                  }).length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search appointments..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <select
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
              
              {appointments.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      No appointments found
                    </h3>
                    <p className="text-slate-600">
                      Appointments will appear here once patients book consultations with you.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Patient Management
                </h3>
                <p className="text-slate-600 mb-4">
                  View and manage your patient records and history.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Patient
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Analytics & Reports
                </h3>
                <p className="text-slate-600 mb-4">
                  View detailed analytics about your practice performance.
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 