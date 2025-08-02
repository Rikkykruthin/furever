"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  PawPrint,
  Utensils,
  Scissors,
  Home,
  Phone,
  ArrowRight,
  Clock,
  User,
  Info,
  Camera,
  BarChart3,
  Truck,
  Wallet,
  TrendingUp,
  Users,
  Shield,
  Award,
  Target,
  Activity,
  CheckCircle,
  Star,
  Globe,
  Zap,
  FileText,
  MessageCircle,
  PieChart,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Eye,
  ThumbsUp,
  Share2,
  Download
} from "lucide-react";

export default function StreetAnimalsPage() {
  // Enhanced state management
  const [counters, setCounters] = useState({
    animalsHelped: 0,
    emergencyResponses: 0,
    vaccinations: 0,
    adoptions: 0,
    foodServed: 0,
    volunteers: 0
  });

  const [isVisible, setIsVisible] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartAnimation, setChartAnimation] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Refs for intersection observer
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const chartsRef = useRef(null);
  const servicesRef = useRef(null);

  // Enhanced animation counter with staggered effects
  useEffect(() => {
    const targets = {
      animalsHelped: 12450,
      emergencyResponses: 2780,
      vaccinations: 8925,
      adoptions: 945,
      foodServed: 15680,
      volunteers: 420
    };

    const duration = 3000; // 3 seconds for smoother animation
    const steps = 120; // More steps for smoother animation
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      // Easing function for smooth animation
      const progress = easeOutExpo(currentStep / steps);
      
      setCounters({
        animalsHelped: Math.floor(targets.animalsHelped * progress),
        emergencyResponses: Math.floor(targets.emergencyResponses * progress),
        vaccinations: Math.floor(targets.vaccinations * progress),
        adoptions: Math.floor(targets.adoptions * progress),
        foodServed: Math.floor(targets.foodServed * progress),
        volunteers: Math.floor(targets.volunteers * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Easing function for smooth animations
  const easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
            
            if (entry.target.id === 'charts-section') {
              setTimeout(() => setChartAnimation(true), 300);
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    const elements = [heroRef, statsRef, chartsRef, servicesRef];
    elements.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Floating animation keyframes
  const floatingAnimation = `
    @keyframes floating {
      0% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(1deg); }
      66% { transform: translateY(-5px) rotate(-1deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    .floating { animation: floating 6s ease-in-out infinite; }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
    }
    .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

    @keyframes slide-up {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .slide-up { animation: slide-up 0.8s ease-out forwards; }

    @keyframes fade-in-scale {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .fade-in-scale { animation: fade-in-scale 0.6s ease-out forwards; }
  `;

  // Enhanced data with more interactive features
  const emergencyServices = [
    {
      id: 1,
      name: "Emergency Rescue",
      description: "24/7 emergency response for injured, trapped, or distressed street animals with GPS tracking and real-time updates",
      icon: <AlertTriangle className="h-8 w-8" />,
      color: "from-slate-600 to-slate-700",
      textColor: "text-slate-700",
      bgColor: "bg-slate-50",
      link: "/emergency/report",
      stats: "2,780+ rescues",
      responseTime: "< 15 min",
      successRate: "94%",
      badge: "🚨"
    },
    {
      id: 2,
      name: "Medical Care",
      description: "Free veterinary treatment, surgery, and rehabilitation with state-of-the-art medical facilities",
      icon: <Heart className="h-8 w-8" />,
      color: "from-emerald-600 to-emerald-700",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      link: "/street-animals/medical",
      stats: "8,925+ treatments",
      responseTime: "Same day",
      successRate: "89%",
      badge: "💊"
    },
    {
      id: 3,
      name: "Food & Water",
      description: "Regular feeding programs, nutrition plans, and clean water distribution across 50+ locations",
      icon: <Utensils className="h-8 w-8" />,
      color: "from-amber-600 to-amber-700",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      link: "/street-animals/feeding",
      stats: "15,680+ meals served",
      responseTime: "Daily",
      successRate: "100%",
      badge: "🍽️"
    }
  ];

  // Enhanced data sets for multiple pie charts
  const animalCategoryData = [
    { category: "Dogs", count: 2847, percentage: 42, color: "#1e293b", icon: "🐕", avgAge: "2.5 years", healthStatus: "Good", adoptionRate: "78%", trend: "↗ +12%" },
    { category: "Cats", count: 1923, percentage: 28, color: "#475569", icon: "🐱", avgAge: "1.8 years", healthStatus: "Excellent", adoptionRate: "85%", trend: "↗ +8%" },
    { category: "Puppies", count: 1356, percentage: 20, color: "#64748b", icon: "🐶", avgAge: "3 months", healthStatus: "Good", adoptionRate: "92%", trend: "↗ +15%" },
    { category: "Kittens", count: 542, percentage: 8, color: "#94a3b8", icon: "🐾", avgAge: "2 months", healthStatus: "Good", adoptionRate: "95%", trend: "↗ +18%" },
    { category: "Others", count: 135, percentage: 2, color: "#cbd5e1", icon: "🦆", avgAge: "Various", healthStatus: "Fair", adoptionRate: "65%", trend: "↗ +5%" }
  ];

  const regionalDistributionData = [
    { category: "North District", count: 1854, percentage: 35, color: "#059669", icon: "🏙️", activeCenters: 8, avgResponseTime: "12 min", trend: "↗ +14%" },
    { category: "South District", count: 1467, percentage: 28, color: "#0d9488", icon: "🏘️", activeCenters: 6, avgResponseTime: "15 min", trend: "↗ +9%" },
    { category: "East District", count: 1203, percentage: 23, color: "#14b8a6", icon: "🌆", activeCenters: 5, avgResponseTime: "18 min", trend: "↗ +7%" },
    { category: "West District", count: 743, percentage: 14, color: "#2dd4bf", icon: "🏞️", activeCenters: 4, avgResponseTime: "22 min", trend: "↗ +11%" }
  ];

  const healthStatusData = [
    { category: "Excellent", count: 2156, percentage: 38, color: "#16a34a", icon: "💚", recoveryTime: "1-2 weeks", cost: "$45", trend: "↗ +8%" },
    { category: "Good", count: 1834, percentage: 32, color: "#22c55e", icon: "💛", recoveryTime: "2-4 weeks", cost: "$85", trend: "→ 0%" },
    { category: "Fair", count: 1287, percentage: 23, color: "#84cc16", icon: "🧡", recoveryTime: "4-8 weeks", cost: "$145", trend: "↘ -5%" },
    { category: "Critical", count: 426, percentage: 7, color: "#eab308", icon: "❤️", recoveryTime: "8+ weeks", cost: "$350", trend: "↘ -12%" }
  ];

  const ageGroupData = [
    { category: "Newborn (0-3m)", count: 956, percentage: 18, color: "#8b5cf6", icon: "🍼", adoptionRate: "95%", careLevel: "Intensive", trend: "↗ +22%" },
    { category: "Young (3m-1y)", count: 1523, percentage: 29, color: "#a855f7", icon: "🌱", adoptionRate: "88%", careLevel: "Moderate", trend: "↗ +15%" },
    { category: "Adult (1-5y)", count: 1834, percentage: 35, color: "#c084fc", icon: "🐾", adoptionRate: "72%", careLevel: "Standard", trend: "↗ +8%" },
    { category: "Senior (5-10y)", count: 756, percentage: 14, color: "#d8b4fe", icon: "👴", adoptionRate: "45%", careLevel: "Special", trend: "↗ +3%" },
    { category: "Elderly (10+y)", count: 234, percentage: 4, color: "#e9d5ff", icon: "🦴", adoptionRate: "25%", careLevel: "Palliative", trend: "→ 0%" }
  ];

  const rescueMethodData = [
    { category: "Emergency Calls", count: 2156, percentage: 41, color: "#dc2626", icon: "🚨", responseTime: "12 min", successRate: "94%", trend: "↗ +16%" },
    { category: "Street Patrols", count: 1523, percentage: 29, color: "#ea580c", icon: "🚶", responseTime: "45 min", successRate: "87%", trend: "↗ +8%" },
    { category: "Community Reports", count: 945, percentage: 18, color: "#f59e0b", icon: "📱", responseTime: "2-4 hours", successRate: "91%", trend: "↗ +12%" },
    { category: "Partner Shelters", count: 567, percentage: 11, color: "#fbbf24", icon: "🏠", responseTime: "Same day", successRate: "96%", trend: "↗ +7%" },
    { category: "Veterinary Referrals", count: 112, percentage: 2, color: "#fcd34d", icon: "⚕️", responseTime: "1-2 days", successRate: "98%", trend: "↗ +5%" }
  ];

  const seasonalPatternsData = [
    { category: "Spring", count: 1456, percentage: 32, color: "#10b981", icon: "🌸", birthRate: "High", adoptionRate: "85%", trend: "↗ +18%" },
    { category: "Summer", count: 1234, percentage: 27, color: "#f59e0b", icon: "☀️", birthRate: "Peak", adoptionRate: "78%", trend: "↗ +12%" },
    { category: "Autumn", count: 1087, percentage: 24, color: "#ef4444", icon: "🍂", birthRate: "Medium", adoptionRate: "82%", trend: "↗ +9%" },
    { category: "Winter", count: 756, percentage: 17, color: "#3b82f6", icon: "❄️", birthRate: "Low", adoptionRate: "88%", trend: "↗ +6%" }
  ];

  const fundingAllocationData = [
    { category: "Medical Care", count: 450000, percentage: 35, color: "#059669", icon: "🏥", details: "Surgeries, treatments, vaccines", efficiency: "98%", trend: "↗ +8%" },
    { category: "Food & Nutrition", count: 320000, percentage: 25, color: "#0891b2", icon: "🥘", details: "Daily meals, supplements", efficiency: "95%", trend: "↗ +5%" },
    { category: "Shelter Operations", count: 230000, percentage: 18, color: "#7c3aed", icon: "🏠", details: "Facilities, utilities, maintenance", efficiency: "92%", trend: "↗ +3%" },
    { category: "Staff & Training", count: 180000, percentage: 14, color: "#dc2626", icon: "👥", details: "Salaries, education programs", efficiency: "90%", trend: "↗ +2%" },
    { category: "Equipment & Supplies", count: 103000, percentage: 8, color: "#ea580c", icon: "🧰", details: "Tools, medicine, transport", efficiency: "94%", trend: "↗ +6%" }
  ];

  // Enhanced monthly data with more metrics
  const monthlyData = [
    { month: "Jan", rescued: 890, adopted: 67, vaccinated: 1240, donated: 45000, volunteers: 89 },
    { month: "Feb", rescued: 1120, adopted: 89, vaccinated: 1580, donated: 52000, volunteers: 94 },
    { month: "Mar", rescued: 980, adopted: 76, vaccinated: 1320, donated: 48000, volunteers: 87 },
    { month: "Apr", rescued: 1340, adopted: 102, vaccinated: 1890, donated: 67000, volunteers: 103 },
    { month: "May", rescued: 1560, adopted: 134, vaccinated: 2100, donated: 78000, volunteers: 118 },
    { month: "Jun", rescued: 1680, adopted: 156, vaccinated: 2240, donated: 85000, volunteers: 134 }
  ];

  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.rescued, d.adopted, d.vaccinated)));

  // Enhanced success metrics with icons
  const successMetrics = [
    { 
      label: "Rescue Success Rate", 
      percentage: 94, 
      color: "bg-slate-600",
      icon: "🚨",
      improvement: "+3%",
      target: 95
    },
    { 
      label: "Adoption Rate", 
      percentage: 78, 
      color: "bg-emerald-600",
      icon: "🏠", 
      improvement: "+5%",
      target: 85
    },
    { 
      label: "Recovery Rate", 
      percentage: 89, 
      color: "bg-amber-600",
      icon: "💊",
      improvement: "+7%", 
      target: 92
    },
    { 
      label: "Volunteer Retention", 
      percentage: 85, 
      color: "bg-violet-600",
      icon: "👥",
      improvement: "+2%",
      target: 90
    }
  ];

  // Real-time impact data
  const realTimeStats = [
    { label: "Active Rescues", value: 23, icon: "🚑", color: "text-red-600", bgColor: "bg-red-50" },
    { label: "Animals in Care", value: 156, icon: "🏥", color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Adoptions Today", value: 7, icon: "❤️", color: "text-pink-600", bgColor: "bg-pink-50" },
    { label: "Volunteers Online", value: 42, icon: "👨‍💼", color: "text-green-600", bgColor: "bg-green-50" }
  ];

  // Impact stories data
  const impactStories = [
    {
      id: 1,
      title: "Max's Miraculous Recovery",
      description: "Rescued from severe injury, now healthy and adopted",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop",
      category: "Medical",
      date: "2 days ago",
      likes: 234,
      shares: 45
    },
    {
      id: 2, 
      title: "Luna's New Beginning",
      description: "From street cat to beloved family member",
      image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=200&fit=crop",
      category: "Adoption",
      date: "1 week ago", 
      likes: 189,
      shares: 32
    },
    {
      id: 3,
      title: "Community Feeding Drive",
      description: "500+ meals distributed in East District",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop",
      category: "Feeding",
      date: "3 days ago",
      likes: 156,
      shares: 28
    }
  ];

  // Quarterly impact data
  const quarterlyImpact = [
    { quarter: "Q1 2024", animals: 2890, budget: 95000, volunteers: 89 },
    { quarter: "Q2 2024", animals: 3240, budget: 108000, volunteers: 102 },
    { quarter: "Q3 2024", animals: 3680, budget: 125000, volunteers: 118 },
    { quarter: "Q4 2024", animals: 4120, budget: 142000, volunteers: 134 }
  ];

  const volunteerPrograms = [
    {
      id: 1,
      name: "Street Animal Care",
      description: "Daily feeding, health monitoring, and basic care for street animals",
      icon: <PawPrint className="h-6 w-6" />,
      volunteers: 156,
      commitment: "2-3 hours/week",
      color: "slate"
    },
    {
      id: 2,
      name: "Emergency Response",
      description: "First aid and rescue operations for injured or distressed animals", 
      icon: <AlertTriangle className="h-6 w-6" />,
      volunteers: 89,
      commitment: "On-call basis",
      color: "emerald"
    },
    {
      id: 3,
      name: "Adoption Support",
      description: "Help with adoption events, home visits, and follow-up care",
      icon: <Home className="h-6 w-6" />,
      volunteers: 124,
      commitment: "4-6 hours/week",
      color: "amber"
    },
    {
      id: 4,
      name: "Awareness Campaigns",
      description: "Community education and awareness programs about animal welfare",
      icon: <MessageCircle className="h-6 w-6" />,
      volunteers: 67,
      commitment: "Flexible",
      color: "violet"
    }
  ];

  const achievementBadges = [
    { icon: "🏆", title: "Excellence Award", subtitle: "2024 Animal Welfare Board", color: "bg-amber-100 border-amber-200" },
    { icon: "⭐", title: "5-Star Rating", subtitle: "Community Trust Score", color: "bg-slate-100 border-slate-200" },
    { icon: "📋", title: "Certified NGO", subtitle: "Government Registered", color: "bg-emerald-100 border-emerald-200" },
    { icon: "🎯", title: "95% Success", subtitle: "Rescue & Recovery Rate", color: "bg-violet-100 border-violet-200" }
  ];

  // Enhanced interactive pie chart component
  const PieChart = ({ data = [], size = 200 }) => {
    const [hoveredSlice, setHoveredSlice] = useState(null);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="text-center text-slate-500">
            <div className="text-sm">No data available</div>
          </div>
        </div>
      );
    }

    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2;
    
    let currentAngle = -90;
    
    return (
      <div className="relative group">
        <style>{floatingAnimation}</style>
        <svg width={size} height={size} className="transform -rotate-90 floating">
          {data.map((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const isHovered = hoveredSlice === index;
            const extendedRadius = isHovered ? radius + 5 : radius;
            
            // Extended coordinates for hover effect
            const extendedX1 = centerX + extendedRadius * Math.cos((currentAngle * Math.PI) / 180);
            const extendedY1 = centerY + extendedRadius * Math.sin((currentAngle * Math.PI) / 180);
            const extendedX2 = centerX + extendedRadius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const extendedY2 = centerY + extendedRadius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${isHovered ? extendedX1 : x1} ${isHovered ? extendedY1 : y1}`,
              `A ${extendedRadius} ${extendedRadius} 0 ${largeArcFlag} 1 ${isHovered ? extendedX2 : x2} ${isHovered ? extendedY2 : y2}`,
              'Z'
            ].join(' ');
            
            const result = (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-300 cursor-pointer"
                  style={{ 
                    filter: isHovered ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                    transformOrigin: `${centerX}px ${centerY}px`
                  }}
                  onMouseEnter={() => setHoveredSlice(index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Add percentage labels */}
                {item.percentage > 5 && (
                  <text
                    x={centerX + (radius * 0.7) * Math.cos(((currentAngle + angle/2) * Math.PI) / 180)}
                    y={centerY + (radius * 0.7) * Math.sin(((currentAngle + angle/2) * Math.PI) / 180)}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="transform rotate-90"
                  >
                    {item.percentage}%
                  </text>
                )}
              </g>
            );
            
            currentAngle += angle;
            return result;
          })}
          
          {/* Enhanced center circle with gradient */}
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#f8fafc" />
            </radialGradient>
          </defs>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.4}
            fill="url(#centerGradient)"
            className="drop-shadow-lg"
          />
        </svg>
        
        {/* Enhanced center text with animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-700 transition-all duration-300">
              {data.reduce((sum, item) => sum + (item.count || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Total Animals</div>
            {hoveredSlice !== null && (
              <div className="text-xs text-slate-400 mt-1 fade-in-scale">
                {data[hoveredSlice]?.category}
              </div>
            )}
          </div>
        </div>

        {/* Interactive tooltip */}
        {hoveredSlice !== null && (
          <div className="absolute top-0 right-0 bg-white rounded-lg shadow-xl p-3 border z-10 fade-in-scale">
            <div className="text-sm font-semibold text-slate-800">
              {data[hoveredSlice]?.category}
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Count: {data[hoveredSlice]?.count?.toLocaleString()}</div>
              <div>Percentage: {data[hoveredSlice]?.percentage}%</div>
              <div>Trend: <span className="text-green-600">{data[hoveredSlice]?.trend}</span></div>
              <div>Adoption Rate: {data[hoveredSlice]?.adoptionRate}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <style>{floatingAnimation}</style>
      
      {/* Enhanced Hero Section */}
      <section 
        ref={heroRef}
        id="hero-section"
        className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white py-20 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/95 to-transparent"></div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full floating"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/3 rounded-full floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-white/4 rounded-full floating" style={{animationDelay: '4s'}}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className={`lg:w-1/2 space-y-8 ${isVisible['hero-section'] ? 'slide-up' : 'opacity-0'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Impact Dashboard
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Compassionate Care
                  <span className="block text-amber-300 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                    for Every Paw
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-200 leading-relaxed">
                  Building a community where street animals receive the love, medical care, and forever homes they deserve through 
                  <span className="font-semibold text-amber-300"> data-driven rescue operations</span>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-6">
                <Button size="lg" className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 pulse-glow">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Report Emergency
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <Heart className="mr-2 h-5 w-5" /> Support Our Mission
                </Button>
              </div>

              {/* Enhanced Quick Stats with animations */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-amber-300 mb-1">{counters.animalsHelped.toLocaleString()}+</div>
                  <div className="text-sm text-slate-300">Lives Saved</div>
                  <div className="text-xs text-green-400 mt-1">+12% this month</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-amber-300 mb-1">{counters.emergencyResponses.toLocaleString()}</div>
                  <div className="text-sm text-slate-300">Emergency Calls</div>
                  <div className="text-xs text-green-400 mt-1">&lt; 15 min response</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-amber-300 mb-1">{counters.adoptions}</div>
                  <div className="text-sm text-slate-300">Happy Homes</div>
                  <div className="text-xs text-green-400 mt-1">78% success rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-amber-300 mb-1">{counters.volunteers}</div>
                  <div className="text-sm text-slate-300">Volunteers</div>
                  <div className="text-xs text-green-400 mt-1">42 active now</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <Image 
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Street animal rescue"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-white text-lg font-semibold bg-black/20 backdrop-blur-sm rounded-lg p-3 hover:bg-black/30 transition-all duration-300">
                    Every rescue is a step toward a more compassionate world
                  </div>
                </div>
                
                {/* Floating stats overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg">
                    <div className="text-lg font-bold text-slate-800">23</div>
                    <div className="text-xs text-slate-600">Active Rescues</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg">
                    <div className="text-lg font-bold text-emerald-600">7</div>
                    <div className="text-xs text-slate-600">Adoptions Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Impact Dashboard */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-500" />
              Live Impact Dashboard
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Updated 2 minutes ago
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(realTimeStats || []).map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`${stat.bgColor} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(achievementBadges || []).map((badge, index) => (
              <div key={index} className={`text-center p-6 rounded-xl ${badge.color} border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-4xl mb-3">{badge.icon}</div>
                <div className="font-bold text-slate-800">{badge.title}</div>
                <div className="text-sm text-slate-600">{badge.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Recent Success Stories</h2>
            <p className="text-xl text-slate-600">Real stories of hope, recovery, and new beginnings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(impactStories || []).map((story) => (
              <Card key={story.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white">
                <div className="relative h-48">
                  <Image 
                    src={story.image} 
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-slate-700">
                      {story.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{story.title}</h3>
                  <p className="text-slate-600 mb-4">{story.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{story.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {story.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {story.shares}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section ref={chartsRef} id="charts-section" className="py-20 bg-gradient-to-br from-slate-50 to-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Impact Analytics</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive data insights into our rescue operations, success rates, and community impact across different animal categories.
            </p>
          </div>

          {/* Tab Navigation for Data Views */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg border">
              <div className="flex gap-1">
                {['overview', 'trends', 'performance'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-slate-600 text-white shadow-md' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Statistics Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ${chartAnimation ? 'slide-up' : 'opacity-0'}`}>
            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:scale-105 transition-transform duration-300">
              <div className="mb-4">
                <Heart className="h-16 w-16 mx-auto text-white/80" />
              </div>
              <div className="text-5xl font-bold mb-2">{counters.animalsHelped.toLocaleString()}</div>
              <div className="text-xl opacity-90">Animals Rescued & Treated</div>
              <div className="text-sm opacity-75 mt-2">Since 2020</div>
            </Card>

            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:scale-105 transition-transform duration-300">
              <div className="mb-4">
                <Home className="h-16 w-16 mx-auto text-white/80" />
              </div>
              <div className="text-5xl font-bold mb-2">{counters.adoptions}</div>
              <div className="text-xl opacity-90">Forever Homes Found</div>
              <div className="text-sm opacity-75 mt-2">Successful placements</div>
            </Card>

            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white hover:scale-105 transition-transform duration-300">
              <div className="mb-4">
                <Utensils className="h-16 w-16 mx-auto text-white/80" />
              </div>
              <div className="text-5xl font-bold mb-2">{counters.foodServed.toLocaleString()}</div>
              <div className="text-xl opacity-90">Meals Provided</div>
              <div className="text-sm opacity-75 mt-2">Daily feeding programs</div>
            </Card>
          </div>

          {/* Beautiful Dashboard Section */}
          <div className="space-y-12 mb-16">
            {/* Dashboard Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Analytics Dashboard</h3>
              <p className="text-lg text-slate-600">Comprehensive insights into our rescue operations and impact</p>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary Chart - Animal Categories */}
              <Card className="lg:col-span-2 p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-3xl">🐾</span>
                    Animal Categories
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Distribution of rescued animals by species
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <PieChart data={animalCategoryData || []} size={280} />
                    </div>
                    <div className="space-y-3 w-full">
                      {(animalCategoryData || []).map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-semibold text-slate-700">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-800">{item.count.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Status Chart */}
              <Card className="p-6 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🏥</span>
                    Health Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <PieChart data={healthStatusData || []} size={200} />
                    <div className="space-y-2 w-full">
                      {(healthStatusData || []).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-slate-700">{item.category}</span>
                          </div>
                          <span className="font-semibold text-slate-800">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Dashboard Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Regional Distribution */}
              <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-2xl">🗺️</span>
                    Regional Operations
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Rescue distribution across districts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <PieChart data={regionalDistributionData || []} size={220} />
                    </div>
                    <div className="space-y-3 w-full">
                      {(regionalDistributionData || []).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium text-slate-700 text-sm">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-800 text-sm">{item.count.toLocaleString()}</div>
                            <div className="text-xs text-emerald-600">{item.avgResponseTime}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Allocation */}
              <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    Budget Allocation
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Annual funding distribution ($1.28M)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <PieChart data={fundingAllocationData || []} size={220} />
                    </div>
                    <div className="space-y-3 w-full">
                      {(fundingAllocationData || []).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <div className="font-medium text-slate-700 text-sm">{item.category}</div>
                              <div className="text-xs text-slate-500">{item.efficiency} efficient</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-800 text-sm">${(item.count / 1000).toFixed(0)}K</div>
                            <div className="text-xs text-slate-500">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Original Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

            {/* Enhanced Bar Chart */}
            <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-slate-600" />
                  Monthly Operations (2024)
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Rescue, adoption, and vaccination trends by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(monthlyData || []).map((data, index) => (
                    <div key={index} className="space-y-3 hover:bg-slate-50 p-3 rounded-lg transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 w-12">{data.month}</span>
                        <div className="flex-1 mx-4 space-y-3">
                          {/* Rescued Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Rescued</span>
                              <span className="text-sm font-semibold text-slate-700">{data.rescued}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-slate-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(data.rescued / maxValue) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          {/* Adopted Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Adopted</span>
                              <span className="text-sm font-semibold text-slate-700">{data.adopted}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(data.adopted / maxValue) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          {/* Vaccinated Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Vaccinated</span>
                              <span className="text-sm font-semibold text-slate-700">{data.vaccinated}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-amber-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(data.vaccinated / maxValue) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Success Rates */}
            <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Target className="h-6 w-6 text-slate-600" />
                  Success Metrics
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Key performance indicators across all operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(successMetrics || []).map((metric, index) => (
                    <div 
                      key={index} 
                      className="space-y-2 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredMetric(index)}
                      onMouseLeave={() => setHoveredMetric(null)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{metric.icon}</span>
                          <span className="font-semibold text-slate-700">{metric.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-800">{metric.percentage}%</span>
                          <div className="text-xs text-green-600">{metric.improvement}</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                          className={`${metric.color} h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative`}
                          style={{ width: `${metric.percentage}%` }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        {/* Target line */}
                        <div 
                          className="absolute top-0 w-0.5 h-4 bg-slate-400 opacity-50"
                          style={{ left: `${metric.target}%` }}
                        ></div>
                      </div>
                      {hoveredMetric === index && (
                        <div className="text-xs text-slate-500">
                          Target: {metric.target}% | Current: {metric.percentage}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Impact */}
            <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-slate-600" />
                  Quarterly Growth
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Expansion of operations and volunteer base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(quarterlyImpact || []).map((quarter, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="font-semibold text-slate-700">{quarter.quarter}</div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-slate-800">{quarter.animals.toLocaleString()}</div>
                          <div className="text-slate-500">Animals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-emerald-600">${quarter.budget.toLocaleString()}</div>
                          <div className="text-slate-500">Budget</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-amber-600">{quarter.volunteers}</div>
                          <div className="text-slate-500">Volunteers</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section ref={servicesRef} id="services-section" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Emergency Response Services</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Round-the-clock support for animals in crisis. Our rapid response team ensures no call for help goes unanswered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(emergencyServices || []).map((service) => (
              <Card key={service.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group bg-white">
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <CardContent className="p-8 relative">
                  <div className={`${service.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={service.textColor}>
                      {service.icon}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-2xl">{service.badge}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{service.name}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  {/* Enhanced service metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <div className="font-semibold text-slate-800">{service.responseTime}</div>
                      <div className="text-slate-500">Response Time</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <div className="font-semibold text-slate-800">{service.successRate}</div>
                      <div className="text-slate-500">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className={`text-sm font-semibold ${service.textColor}`}>
                      {service.stats}
                    </div>
                    <Button className={`bg-gradient-to-r ${service.color} text-white rounded-lg px-6 hover:shadow-lg transition-all`}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Programs */}
      <section className="py-20 bg-gradient-to-br from-slate-100 to-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Volunteer Opportunities</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join a dedicated community of animal lovers making a tangible difference in the lives of street animals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {(volunteerPrograms || []).map((program) => (
              <Card key={program.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
                <CardContent className="p-6">
                  <div className={`bg-${program.color}-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-${program.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                    {program.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{program.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{program.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Active volunteers:</span>
                      <span className={`font-semibold text-${program.color}-600`}>{program.volunteers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Commitment:</span>
                      <span className="font-semibold text-slate-700">{program.commitment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-slate-700 hover:bg-slate-800 text-white px-12 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Users className="mr-2 h-5 w-5" />
              Join Our Volunteer Network
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-slate-800 to-slate-700 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-full floating"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/3 rounded-full floating" style={{animationDelay: '3s'}}></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Every Action Creates Impact
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Whether reporting an emergency, volunteering your time, or making a donation, 
              your contribution becomes part of a larger movement creating lasting change for street animals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report Emergency
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg rounded-lg transition-all hover:scale-105">
                <Heart className="mr-2 h-5 w-5" />
                Make a Donation
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg rounded-lg transition-all hover:scale-105">
                <Users className="mr-2 h-5 w-5" />
                Volunteer With Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 