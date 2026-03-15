"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { loginAction } from "../../../../actions/loginActions";
import { cn } from "@/lib/utils";
import {
  Shield,
  Store,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getGoogleAuthUrl } from "../../../../actions/googleAuthActions";
import DogLoader from "@/components/DogLoader";

const BottomGradient = () => {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
    userType: "user",
  });
  const [googleLoading, setGoogleLoading] = useState(false);

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

      if (user.userType === "admin") {
        setError("Admin accounts cannot sign in via Google. Please use email and password.");
        setGoogleLoading(false);
        return;
      }

      const result = await getGoogleAuthUrl(user.userType);

      if (result.success && result.authUrl) {
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

      await new Promise(resolve => setTimeout(resolve, 100));

      router.refresh();

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
    <form onSubmit={handleSubmit} className="my-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <LabelInputContainer className="mb-4">
        <Label htmlFor="email">Email Address</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          required
        />
      </LabelInputContainer>

      <LabelInputContainer className="mb-4">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </LabelInputContainer>

      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Signing in...
          </span>
        ) : (
          <>
            Sign in as {user.userType === 'admin' ? 'Admin' : user.userType === 'seller' ? 'Seller' : 'User'} &rarr;
          </>
        )}
        <BottomGradient />
      </button>

      <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

      <button
        className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading || user.userType === "admin"}
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Connecting...
            </span>
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
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Continue with Google
            </span>
          </>
        )}
        <BottomGradient />
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Left Side - Dog Animation */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="mb-8">
              <DogLoader />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome Back!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                Sign in to continue your journey in helping animals and building our community.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome to FurEver
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Sign in to your account to continue
              </p>

              <Tabs defaultValue="user" className="w-full mt-6" value={user.userType}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger
                    value="user"
                    onClick={() => handleUserTypeChange("user")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    User
                  </TabsTrigger>
                  <TabsTrigger
                    value="seller"
                    onClick={() => handleUserTypeChange("seller")}
                    className="flex items-center gap-2"
                  >
                    <Store className="h-4 w-4" />
                    Seller
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    onClick={() => handleUserTypeChange("admin")}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                  {renderForm()}
                </TabsContent>

                <TabsContent value="seller">
                  {renderForm()}
                </TabsContent>

                <TabsContent value="admin">
                  {renderForm()}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
