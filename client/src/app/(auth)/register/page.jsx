"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { registerAction } from "../../../../actions/registerActions";
import { 
  Shield, 
  Store, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  PawPrint, 
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Building2
} from "lucide-react";
import toast from "react-hot-toast";

// Dynamically import 3D Cat component with SSR disabled
const Cat3DScene = dynamic(
  () => import("@/components/Cat3DScene"),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }
);

const RegisterPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
    storeName: "", // For sellers
  });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (user.password.length >= 8) strength++;
    if (user.password.match(/[a-z]/) && user.password.match(/[A-Z]/)) strength++;
    if (user.password.match(/\d/)) strength++;
    if (user.password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  }, [user.password]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUser((prevUser) => ({ ...prevUser, userType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate seller requirements
    if (user.userType === "seller" && !user.storeName.trim()) {
      setError("Store name is required for seller accounts");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = user;

      const result = await registerAction(userData);

      if (!result.success) {
        setError(result.error || "Registration failed. Please try again.");
      } else {
        console.log("Registration successful");
        toast.success("Account created successfully!");
        
        // Redirect based on user role
        const userRole = result.user.role || result.user.userType;
        if (userRole === "admin") {
          router.push("/emergency/admin");
        } else if (userRole === "seller") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Registration failed", error);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-secondary";
    if (passwordStrength === 1) return "bg-accent/40";
    if (passwordStrength === 2) return "bg-accent/60";
    if (passwordStrength === 3) return "bg-accent/80";
    return "bg-primary";
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="mb-4 p-4 bg-accent/20 border-l-4 border-primary rounded-lg flex items-center gap-3 animate-slide-in-up">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-primary text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="name">
          <UserPlus className="w-4 h-4 text-accent" />
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="w-full relative z-10 bg-white border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 h-12 pl-4 pr-4"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="email">
          <Mail className="w-4 h-4 text-accent" />
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full relative z-10 bg-white border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 h-12 pl-4 pr-4"
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      {user.userType === "seller" && (
        <div className="space-y-2">
          <label className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="storeName">
            <Building2 className="w-4 h-4 text-accent" />
            Store Name
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Input
              type="text"
              id="storeName"
              name="storeName"
              value={user.storeName}
              onChange={handleInputChange}
              className="w-full relative z-10 bg-white border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 h-12 pl-4 pr-4"
              placeholder="My Pet Store"
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="password">
          <Lock className="w-4 h-4 text-accent" />
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            className="w-full relative z-10 bg-white border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 h-12 pl-4 pr-12"
            placeholder="Create a strong password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-accent hover:text-primary transition-colors z-20"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {user.password && (
          <div className="mt-2">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i <= passwordStrength ? getPasswordStrengthColor() : "bg-secondary"
                  }`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-secondary mt-1">
              {passwordStrength === 0 && "Enter a password"}
              {passwordStrength === 1 && "Weak password"}
              {passwordStrength === 2 && "Fair password"}
              {passwordStrength === 3 && "Good password"}
              {passwordStrength === 4 && "Strong password"}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="confirmPassword">
          <Lock className="w-4 h-4 text-accent" />
          Confirm Password
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleInputChange}
            className="w-full relative z-10 bg-white border-2 border-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 h-12 pl-4 pr-12"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-accent hover:text-primary transition-colors z-20"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {user.confirmPassword && user.password === user.confirmPassword && (
          <div className="flex items-center gap-2 text-primary text-sm mt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Passwords match</span>
          </div>
        )}
        {user.confirmPassword && user.password !== user.confirmPassword && (
          <div className="flex items-center gap-2 text-primary text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>Passwords do not match</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading || (user.password !== user.confirmPassword && user.confirmPassword !== "")}
        className="w-full bg-primary text-white py-6 rounded-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create {user.userType === 'seller' ? 'Seller' : 'User'} Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-primary hover:text-accent font-semibold underline decoration-2 underline-offset-2 transition-colors">
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-secondary via-white to-secondary/50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-accent/30 rounded-full blur-3xl transition-all duration-1000 ease-out opacity-50"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse opacity-30 delay-1000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-accent/40 rounded-full animate-float opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}
        ></div>
      ))}

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Side - Visual */}
          <div className={`hidden lg:flex flex-col items-center justify-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-primary rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden" style={{ width: '400px', height: '400px', minHeight: '400px' }}>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Cat3DScene />
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="titlefont text-4xl md:text-5xl font-bold text-primary">
                Join FurEver Today!
              </h1>
              <p className="text-lg text-secondary max-w-md">
                Become part of our community dedicated to helping animals and creating a better world for our furry friends.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Adopt', 'Volunteer', 'Donate', 'Connect'].map((item, i) => (
                <div key={i} className="px-4 py-2 bg-white rounded-full shadow-md border-2 border-primary">
                  <span className="text-sm font-semibold text-primary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={`w-full transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-accent/20 relative overflow-hidden">
              {/* Decorative overlay */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">FurEver</span>
                  </div>
                  <h2 className="titlefont text-3xl md:text-4xl font-bold text-primary mb-2">
                    Create Account
                  </h2>
                  <p className="text-secondary">Join our platform today</p>
                </div>

                <Tabs defaultValue="user" className="w-full" value={user.userType}>
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary p-1 rounded-xl">
                    <TabsTrigger
                      value="user"
                      onClick={() => handleUserTypeChange("user")}
                      className="flex items-center gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg text-primary"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">User</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="seller"
                      onClick={() => handleUserTypeChange("seller")}
                      className="flex items-center gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg text-primary"
                    >
                      <Store className="h-4 w-4" />
                      <span className="hidden sm:inline">Seller</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="user" className="mt-0">
                    {renderForm()}
                  </TabsContent>
                  
                  <TabsContent value="seller" className="mt-0">
                    <div className="bg-accent/20 p-4 rounded-xl mb-6 border-2 border-primary flex items-start gap-3">
                      <Store className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-primary font-semibold text-sm mb-1">Seller Account</p>
                        <p className="text-secondary text-xs">Manage your products, orders, and grow your pet business with us.</p>
                      </div>
                    </div>
                    {renderForm()}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
