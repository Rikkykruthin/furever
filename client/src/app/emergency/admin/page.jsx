"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Save,
  X,
  Eye,
  MessageSquare,
  Activity,
  Users,
  BarChart3,
  Archive,
  Trash2,
  Settings,
  Bell,
  History,
  Stethoscope,
  GraduationCap
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";
import { getToken, getUserByToken } from "../../../../actions/userActions";

export default function EmergencyAdminPage() {
  // Data state
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and UI state
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    severity: "all",
    assignee: "all",
    dateRange: "all",
  });

  const [editingReport, setEditingReport] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    priority: "",
    assignedTo: "",
    adminNotes: "",
    resolution: ""
  });

  const router = useRouter();

  // Status and priority options
  const statusOptions = [
    { value: "pending", label: "🟡 Pending Review", color: "bg-yellow-100 text-yellow-800" },
    { value: "approved", label: "🟢 Approved", color: "bg-green-100 text-green-800" },
    { value: "in-progress", label: "🔵 In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "investigating", label: "🔍 Investigating", color: "bg-purple-100 text-purple-800" },
    { value: "resolved", label: "✅ Resolved", color: "bg-green-100 text-green-800" },
    { value: "closed", label: "⚫ Closed", color: "bg-gray-100 text-gray-800" },
    { value: "rejected", label: "❌ Rejected", color: "bg-red-100 text-red-800" },
    { value: "duplicate", label: "🔄 Duplicate", color: "bg-orange-100 text-orange-800" }
  ];

  const priorityOptions = [
    { value: "low", label: "🟢 Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "🟡 Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "🟠 High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "🔴 Critical", color: "bg-red-100 text-red-800" },
    { value: "urgent", label: "🚨 Urgent", color: "bg-red-100 text-red-800" }
  ];

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      const token = await getToken("userToken") || await getToken("adminToken");
      if (token) {
        const response = await getUserByToken(token);
        if (response.success) {
          setUser(response.user);
          // Check if user has admin role
          if (response.user.role !== "admin" && !response.user.isAdmin) {
            toast.error("Admin access required");
            router.push("/emergency");
            return;
          }
        } else {
          console.error("Failed to get user by token:", response.message);
          toast.error("Authentication failed: " + response.message);
          router.push("/login");
          return;
        }
      } else {
        toast.error("Authentication required");
        router.push("/login");
        return;
      }
      await fetchEmergencies();
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Failed to load admin dashboard");
      router.push("/emergency");
    }
  };

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const token = await getToken("userToken") || await getToken("adminToken");
      const response = await axios.get(`/api/emergency/update?token=${token}`);
      
      if (response.data.success) {
        setEmergencies(response.data.emergencies);
      }
    } catch (error) {
      console.error("Fetch emergencies error:", error);
      toast.error("Failed to load emergency reports");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchEmergencies();
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  // Filter emergencies
  const filteredEmergencies = useMemo(() => {
    let filtered = [...emergencies];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emergency => 
        emergency.title.toLowerCase().includes(searchLower) ||
        emergency.description.toLowerCase().includes(searchLower) ||
        emergency.reporter.name.toLowerCase().includes(searchLower) ||
        emergency._id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(emergency => emergency.status === filters.status);
    }

    if (filters.severity !== "all") {
      filtered = filtered.filter(emergency => emergency.severity === filters.severity);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [emergencies, filters]);

  // Analytics
  const analytics = useMemo(() => {
    const total = emergencies.length;
    const pending = emergencies.filter(e => e.status === "pending").length;
    const approved = emergencies.filter(e => e.status === "approved").length;
    const inProgress = emergencies.filter(e => e.status === "in-progress").length;
    const resolved = emergencies.filter(e => e.status === "resolved").length;
    const critical = emergencies.filter(e => e.severity === "critical").length;

    return { total, pending, approved, inProgress, resolved, critical };
  }, [emergencies]);

  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      const token = await getToken("userToken") || await getToken("adminToken");
      const response = await axios.put("/api/emergency/update", {
        emergencyId,
        updates: { status: newStatus },
        token
      });

      if (response.data.success) {
        const updatedEmergencies = emergencies.map(emergency => 
          emergency._id === emergencyId ? response.data.emergency : emergency
        );
        setEmergencies(updatedEmergencies);
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const startEditing = (emergency) => {
    setEditingReport(emergency._id);
    setUpdateData({
      status: emergency.status,
      priority: emergency.severity,
      assignedTo: emergency.assignedTo || "",
      adminNotes: emergency.adminNotes || "",
      resolution: emergency.resolution || ""
    });
  };

  const saveChanges = async (emergencyId) => {
    try {
      const token = await getToken("userToken") || await getToken("adminToken");
      const response = await axios.put("/api/emergency/update", {
        emergencyId,
        updates: {
          status: updateData.status,
          severity: updateData.priority,
          assignedTo: updateData.assignedTo,
          adminNotes: updateData.adminNotes,
          resolution: updateData.resolution
        },
        token
      });

      if (response.data.success) {
        // Update local state with the updated emergency
        const updatedEmergencies = emergencies.map(emergency => 
          emergency._id === emergencyId ? response.data.emergency : emergency
        );
        setEmergencies(updatedEmergencies);
        setEditingReport(null);
        toast.success("Emergency report updated successfully");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update emergency report");
    }
  };

  const cancelEditing = () => {
    setEditingReport(null);
    setUpdateData({
      status: "",
      priority: "",
      assignedTo: "",
      adminNotes: "",
      resolution: ""
    });
  };

  const archiveEmergency = async (emergencyId) => {
    if (window.confirm("Are you sure you want to archive this emergency report?")) {
      try {
        const token = await getToken("userToken") || await getToken("adminToken");
        const response = await axios.put("/api/emergency/update", {
          emergencyId,
          updates: { 
            status: "closed", 
            archived: true,
            adminNotes: "Report archived by admin"
          },
          token
        });

        if (response.data.success) {
          const updatedEmergencies = emergencies.map(emergency => 
            emergency._id === emergencyId ? response.data.emergency : emergency
          );
          setEmergencies(updatedEmergencies);
          toast.success("Emergency report archived successfully");
        }
      } catch (error) {
        console.error("Archive error:", error);
        toast.error(error.response?.data?.error || "Failed to archive emergency report");
      }
    }
  };

  const deleteEmergency = async (emergencyId) => {
    if (window.confirm("Are you sure you want to permanently delete this emergency report? This action cannot be undone.")) {
      try {
        const token = await getToken("userToken") || await getToken("adminToken");
        const response = await axios.delete("/api/emergency/update", {
          data: {
            emergencyId,
            token
          }
        });

        if (response.data.success) {
          const updatedEmergencies = emergencies.filter(emergency => emergency._id !== emergencyId);
          setEmergencies(updatedEmergencies);
          toast.success("Emergency report deleted successfully");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error.response?.data?.error || "Failed to delete emergency report");
      }
    }
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const getPriorityConfig = (priority) => {
    return priorityOptions.find(option => option.value === priority) || priorityOptions[1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur">
                <Shield className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Emergency Admin Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  Manage and coordinate emergency response operations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/vets")}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Manage Vets
              </Button>
              <Button
                onClick={() => router.push("/admin/trainers")}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Manage Trainers
              </Button>
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={refreshing}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => router.push("/emergency")}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Reports</p>
                  <p className="text-3xl font-bold">{analytics.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{analytics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold">{analytics.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{analytics.inProgress}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold">{analytics.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Critical</p>
                  <p className="text-3xl font-bold">{analytics.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Admin Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports, users, IDs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 h-11"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <Button
                onClick={() => setFilters({ search: "", status: "all", severity: "all", assignee: "all", dateRange: "all" })}
                variant="outline"
                className="h-11"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Reports List */}
        <div className="space-y-4">
          {filteredEmergencies.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-16 text-center">
                <Shield className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                  No Emergency Reports Found
                </h3>
                <p className="text-gray-500 mb-8">
                  No reports match your current filters or there are no reports to manage.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEmergencies.map((emergency) => {
              const statusConfig = getStatusConfig(emergency.status);
              const priorityConfig = getPriorityConfig(emergency.severity);
              const isEditing = editingReport === emergency._id;

              return (
                <Card key={emergency._id} className="shadow-lg border-0 bg-white/90 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-2 h-20 rounded-full bg-gradient-to-b from-red-500 to-orange-500"></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {emergency.title}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                ID: {emergency._id} • Reported {formatDistanceToNow(new Date(emergency.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Badge className={`${statusConfig.color} border font-medium`}>
                                {statusConfig.label}
                              </Badge>
                              <Badge className={`${priorityConfig.color} border font-medium`}>
                                {priorityConfig.label}
                              </Badge>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                  <select
                                    value={updateData.status}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                  >
                                    {statusOptions.map(option => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                  <select
                                    value={updateData.priority}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, priority: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                  >
                                    {priorityOptions.map(option => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                <Textarea
                                  value={updateData.adminNotes}
                                  onChange={(e) => setUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                                  placeholder="Add internal notes, updates, or instructions..."
                                  rows={3}
                                  className="w-full"
                                />
                              </div>

                              {(updateData.status === "resolved" || updateData.status === "closed") && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details</label>
                                  <Textarea
                                    value={updateData.resolution}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, resolution: e.target.value }))}
                                    placeholder="Describe how this emergency was resolved..."
                                    rows={2}
                                    className="w-full"
                                  />
                                </div>
                              )}

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => saveChanges(emergency._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button
                                  onClick={cancelEditing}
                                  variant="outline"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-gray-700 line-clamp-2">
                                {emergency.description}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium">{emergency.reporter.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-600" />
                                  <span>{emergency.location?.address || "Location provided"}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-600" />
                                  <span>{format(new Date(emergency.createdAt), "MMM dd, yyyy HH:mm")}</span>
                                </div>
                              </div>

                              {emergency.adminNotes && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-blue-800 text-sm">
                                    <strong>Admin Notes:</strong> {emergency.adminNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => startEditing(emergency)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                            title="Edit emergency report"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            onClick={() => router.push(`/emergency/${emergency._id}`)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                            title="View full details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            onClick={() => archiveEmergency(emergency._id)}
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                            title="Archive emergency report"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() => deleteEmergency(emergency._id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            title="Permanently delete emergency report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        {statusOptions.slice(0, 4).map(option => (
                          <Button
                            key={option.value}
                            onClick={() => handleStatusUpdate(emergency._id, option.value)}
                            variant={emergency.status === option.value ? "default" : "outline"}
                            size="sm"
                            className={emergency.status === option.value ? option.color : ""}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 