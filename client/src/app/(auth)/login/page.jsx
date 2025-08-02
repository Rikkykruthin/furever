"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { loginAction } from "../../../../actions/loginActions";
import { Shield, Store, User } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
    userType: "user",
  });

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

    try {
      const result = await loginAction(user);

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
      } else {
        console.log("Login successful, result:", result);
        console.log("Login - User object:", result.user);
        // Redirect based on user role
        const userRole = result.user.role || result.user.userType;
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
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="email">
          Email Address
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={handleInputChange}
          className="w-full"
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="password">
          Password
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          value={user.password}
          onChange={handleInputChange}
          className="w-full"
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-800 text-white py-3 rounded-lg hover:bg-yellow-700 transition duration-300 disabled:bg-yellow-500 disabled:cursor-not-allowed font-medium">
        {loading ? "Signing in..." : `Sign in as ${user.userType === 'admin' ? 'Admin' : user.userType === 'seller' ? 'Seller' : 'User'}`}
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-yellow-800 hover:text-yellow-700 font-medium underline">
            Register here
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger
              value="user"
              onClick={() => handleUserTypeChange("user")}
              className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              User
            </TabsTrigger>
            <TabsTrigger
              value="seller"
              onClick={() => handleUserTypeChange("seller")}
              className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4" />
              Seller
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              onClick={() => handleUserTypeChange("admin")}
              className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-4">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="seller" className="space-y-4">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4">
            {renderForm()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
