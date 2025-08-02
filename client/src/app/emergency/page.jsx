"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Plus,
  Filter,
  Eye,
  Clock,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Download,
  RefreshCw,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Zap,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from "date-fns";
import { getToken, getUserByToken } from "../../../actions/userActions";

export default function EmergencyDashboard() {
  // Data state
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    severity: "all",
    dateRange: "all",
    animalType: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    myReports: false,
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const router = useRouter();

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      const token = await getToken("userToken");
      if (token) {
        const response = await getUserByToken(token, "user");
        if (response.success) {
          setUser(response.user);
        }
      }
      await fetchEmergencies();
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Failed to load dashboard");
    }
  };

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/emergency");
      
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

  // Enhanced filtering and sorting
  const filteredEmergencies = useMemo(() => {
    let filtered = [...emergencies];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emergency => 
        emergency.title.toLowerCase().includes(searchLower) ||
        emergency.description.toLowerCase().includes(searchLower) ||
        emergency.animalType?.toLowerCase().includes(searchLower) ||
        emergency.reporter.name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(emergency => emergency.status === filters.status);
    }

    // Severity filter
    if (filters.severity !== "all") {
      filtered = filtered.filter(emergency => emergency.severity === filters.severity);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "week":
          startDate = subDays(now, 7);
          break;
        case "month":
          startDate = subDays(now, 30);
          break;
      }
      
      if (startDate) {
        filtered = filtered.filter(emergency => 
          new Date(emergency.createdAt) >= startDate
        );
      }
    }

    // Animal type filter
    if (filters.animalType !== "all") {
      filtered = filtered.filter(emergency => 
        emergency.animalType?.toLowerCase() === filters.animalType.toLowerCase()
      );
    }

    // My reports filter
    if (filters.myReports && user) {
      filtered = filtered.filter(emergency => emergency.reporter._id === user._id);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];
      
      if (filters.sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (filters.sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [emergencies, filters, user]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = emergencies.length;
    const pending = emergencies.filter(e => e.status === "pending").length;
    const inProgress = emergencies.filter(e => e.status === "in-progress").length;
    const resolved = emergencies.filter(e => e.status === "resolved").length;
    const critical = emergencies.filter(e => e.severity === "critical").length;
    
    const todayStart = startOfDay(new Date());
    const todayReports = emergencies.filter(e => 
      new Date(e.createdAt) >= todayStart
    ).length;
    
    const weekStart = subDays(new Date(), 7);
    const weekReports = emergencies.filter(e => 
      new Date(e.createdAt) >= weekStart
    ).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      critical,
      todayReports,
      weekReports,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    };
  }, [emergencies]);

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[severity] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.pending;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      severity: "all",
      dateRange: "all",
      animalType: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      myReports: false,
    });
  };

  const openLocationInMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Emergency Dashboard</h1>
                <p className="text-red-100 text-lg">
                  Real-time monitoring and response coordination
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
                onClick={() => router.push("/emergency/report")}
                className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Report Emergency
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Reports</p>
                  <p className="text-3xl font-bold">{analytics.total}</p>
                </div>
                <Activity className="h-8 w-8 text-red-200" />
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
                <Timer className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{analytics.inProgress}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold">{analytics.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Critical</p>
                  <p className="text-3xl font-bold">{analytics.critical}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Today</p>
                  <p className="text-3xl font-bold">{analytics.todayReports}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold">{analytics.weekReports}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{analytics.resolutionRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  variant="outline"
                  size="sm"
                >
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports, descriptions, animals..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange("severity", e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="flex-1 h-11 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="createdAt">Date</option>
                  <option value="severity">Severity</option>
                  <option value="status">Status</option>
                  <option value="title">Title</option>
                </select>
                
                <Button
                  onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc")}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {filters.sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* User Reports Toggle */}
            {user && (
              <div className="mt-4 pt-4 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.myReports}
                    onChange={(e) => handleFilterChange("myReports", e.target.checked)}
                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="font-medium text-gray-700">Show only my reports</span>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{filteredEmergencies.length}</span> of <span className="font-semibold">{emergencies.length}</span> reports
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {/* Export functionality */}}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Emergency Reports */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading emergency reports...</p>
          </div>
        ) : filteredEmergencies.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-16 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                No Emergency Reports Found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {filters.myReports 
                  ? "You haven't submitted any reports yet." 
                  : "No reports match your current filters. Try adjusting your search criteria."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/emergency/report")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report Emergency
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`
            ${viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }
          `}>
            {filteredEmergencies.map((emergency) => (
              <Card 
                key={emergency._id} 
                className={`
                  hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur cursor-pointer
                  ${emergency.severity === 'critical' ? 'ring-2 ring-red-500 shadow-red-100' : ''}
                  ${viewMode === "list" ? "hover:bg-gray-50" : "hover:-translate-y-1"}
                `}
                onClick={() => router.push(`/emergency/${emergency._id}`)}
              >
                <CardContent className="p-6">
                  <div className={`
                    ${viewMode === "grid" ? "space-y-4" : "flex gap-6 items-start"}
                  `}>
                    {/* Photos */}
                    {emergency.photos && emergency.photos.length > 0 && (
                      <div className={`
                        ${viewMode === "grid" ? "w-full" : "flex-shrink-0 w-32"}
                      `}>
                        <div className={`
                          ${viewMode === "grid" 
                            ? "grid grid-cols-3 gap-2" 
                            : "flex gap-1"
                          }
                        `}>
                          {emergency.photos.slice(0, viewMode === "grid" ? 3 : 2).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Emergency photo ${index + 1}`}
                              className={`
                                object-cover rounded-lg border
                                ${viewMode === "grid" ? "h-20 w-full" : "h-16 w-16"}
                              `}
                            />
                          ))}
                          {emergency.photos.length > (viewMode === "grid" ? 3 : 2) && (
                            <div className={`
                              bg-gray-200 rounded-lg border flex items-center justify-center text-sm text-gray-600 font-medium
                              ${viewMode === "grid" ? "h-20" : "h-16 w-16"}
                            `}>
                              +{emergency.photos.length - (viewMode === "grid" ? 3 : 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <h3 className={`
                          font-bold text-gray-800 flex-1 line-clamp-2
                          ${viewMode === "grid" ? "text-lg" : "text-xl"}
                        `}>
                          {emergency.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={`${getSeverityColor(emergency.severity)} border font-medium`}>
                            {emergency.severity}
                          </Badge>
                          <Badge className={`${getStatusColor(emergency.status)} border font-medium`}>
                            {emergency.status}
                          </Badge>
                        </div>
                      </div>

                      {emergency.animalType && (
                        <Badge variant="outline" className="mb-3">
                          {emergency.animalType}
                        </Badge>
                      )}

                      <p className={`
                        text-gray-700 mb-4
                        ${viewMode === "grid" ? "line-clamp-3" : "line-clamp-2"}
                      `}>
                        {emergency.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{emergency.reporter.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(emergency.createdAt), { addSuffix: true })}</span>
                        </div>

                        {emergency.location && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLocationInMaps(
                                emergency.location.latitude,
                                emergency.location.longitude
                              );
                            }}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <MapPin className="h-4 w-4" />
                            <span>View Location</span>
                          </button>
                        )}

                        {emergency.contactInfo?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{emergency.contactInfo.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={`
                      ${viewMode === "grid" ? "mt-4" : "flex-shrink-0"}
                    `}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/emergency/${emergency._id}`);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 