"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loginAction } from "../../../../actions/loginActions";
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
  AlertCircle
} from "lucide-react";
import { getGoogleAuthUrl } from "../../../../actions/googleAuthActions";

// Dynamically import 3D Dog component with SSR disabled
const Dog3DScene = dynamic(
  () => import("@/components/Dog3DScene"),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }
);

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState({
    email: "",
    password: "",
    userType: "user",
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUser((prevUser) => ({ ...prevUser, userType: type }));
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      
      // Admin cannot sign in via Google
      if (user.userType === "admin") {
        setError("Admin accounts cannot sign in via Google. Please use email and password.");
        setGoogleLoading(false);
        return;
      }

      const result = await getGoogleAuthUrl(user.userType);
      
      if (result.success && result.authUrl) {
        // Redirect to Google OAuth
        window.location.href = result.authUrl;
      } else {
        setError(result.error || "Failed to initiate Google login. Please try again.");
        setGoogleLoading(false);
      }
    } catch (error) {
      setError("Failed to initiate Google login. Please try again.");
      setGoogleLoading(false);
      console.error("Google login error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAction(user);

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Login successful, result:", result);
      
      // Wait a moment to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh the router to ensure cookies are read
      router.refresh();
      
      // Redirect based on user role
      const userRole = result.user?.role || result.user?.userType;
      console.log("Login - User role:", userRole);
      
      if (userRole === "admin") {
        console.log("Login - Redirecting admin to /emergency/admin");
        router.push("/emergency/admin");
      } else if (userRole === "seller") {
        console.log("Login - Redirecting seller to /dashboard");
        router.push("/dashboard");
      } else {
        console.log("Login - Redirecting regular user to /dashboard");
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
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
        <label
          className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2"
          htmlFor="email">
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
      
      <div className="space-y-2">
        <label
          className="block text-primary text-sm font-semibold mb-2 flex items-center gap-2"
          htmlFor="password">
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
            placeholder="Enter your password"
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
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-6 rounded-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in as {user.userType === 'admin' ? 'Admin' : user.userType === 'seller' ? 'Seller' : 'User'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </Button>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-primary hover:text-accent font-semibold underline decoration-2 underline-offset-2 transition-colors">
            Register here
          </button>
        </p>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-accent/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-secondary">Or continue with</span>
        </div>
      </div>

      {/* Google Login Button */}
      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading || user.userType === "admin"}
        className="w-full bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 py-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {googleLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting to Google...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </Button>
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse opacity-30 delay-1000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
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
                  <Dog3DScene />
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="titlefont text-4xl md:text-5xl font-bold text-primary">
                Welcome Back!
              </h1>
              <p className="text-lg text-secondary max-w-md">
                Sign in to continue your journey in helping animals and building our community.
              </p>
            </div>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={`w-full transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-accent/20 relative overflow-hidden">
              {/* Decorative overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">FurEver</span>
                  </div>
                  <h2 className="titlefont text-3xl md:text-4xl font-bold text-primary mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-secondary">Sign in to your account</p>
                </div>

                <Tabs defaultValue="user" className="w-full" value={user.userType}>
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary p-1 rounded-xl">
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
                    <TabsTrigger
                      value="admin"
                      onClick={() => handleUserTypeChange("admin")}
                      className="flex items-center gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg text-primary"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="user" className="mt-0">
                    {renderForm()}
                  </TabsContent>
                  
                  <TabsContent value="seller" className="mt-0">
                    {renderForm()}
                  </TabsContent>
                  
                  <TabsContent value="admin" className="mt-0">
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

export default LoginPage;
