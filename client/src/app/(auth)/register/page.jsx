"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { registerAction } from "../../../../actions/registerActions";
import { cn } from "@/lib/utils";
import {
  Store,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import DogLoader2 from "@/components/DogLoader2";

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

const RegisterPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
    storeName: "",
  });

  useEffect(() => {
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
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-400";
    if (passwordStrength === 2) return "bg-yellow-400";
    if (passwordStrength === 3) return "bg-blue-400";
    return "bg-green-500";
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
        <Label htmlFor="name">Full Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={user.name}
          onChange={handleInputChange}
          placeholder="John Doe"
          required
        />
      </LabelInputContainer>

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

      {user.userType === "seller" && (
        <LabelInputContainer className="mb-4">
          <Label htmlFor="storeName">Store Name</Label>
          <Input
            type="text"
            id="storeName"
            name="storeName"
            value={user.storeName}
            onChange={handleInputChange}
            placeholder="My Pet Store"
            required
          />
        </LabelInputContainer>
      )}

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
        {user.password && (
          <div className="mt-2">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${i <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200 dark:bg-gray-700"
                    }`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {passwordStrength === 0 && "Enter a password"}
              {passwordStrength === 1 && "Weak password"}
              {passwordStrength === 2 && "Fair password"}
              {passwordStrength === 3 && "Good password"}
              {passwordStrength === 4 && "Strong password"}
            </p>
          </div>
        )}
      </LabelInputContainer>

      <LabelInputContainer className="mb-8">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {user.confirmPassword && user.password === user.confirmPassword && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Passwords match</span>
          </div>
        )}
        {user.confirmPassword && user.password !== user.confirmPassword && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>Passwords do not match</span>
          </div>
        )}
      </LabelInputContainer>

      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
        disabled={loading || (user.password !== user.confirmPassword && user.confirmPassword !== "")}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Creating Account...
          </span>
        ) : (
          <>
            Create {user.userType === 'seller' ? 'Seller' : 'User'} Account &rarr;
          </>
        )}
        <BottomGradient />
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
          >
            Sign in here
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
              <DogLoader2 />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Join FurEver Today!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                Become part of our community dedicated to helping animals and creating a better world for our furry friends.
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
                Create your account to get started
              </p>

              <Tabs defaultValue="user" className="w-full mt-6" value={user.userType}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
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
                </TabsList>

                <TabsContent value="user">
                  {renderForm()}
                </TabsContent>

                <TabsContent value="seller">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Store className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-900 dark:text-blue-200 font-medium text-sm mb-1">Seller Account</p>
                        <p className="text-blue-700 dark:text-blue-300 text-xs">Manage your products, orders, and grow your pet business with us.</p>
                      </div>
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
  );
};

export default RegisterPage;
