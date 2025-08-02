"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { registerAction } from "../../../../actions/registerActions";
import { Shield, Store, User } from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
    storeName: "", // For sellers
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

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Full Name
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          value={user.name}
          onChange={handleInputChange}
          className="w-full"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
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

      {user.userType === "seller" && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storeName">
            Store Name
          </label>
          <Input
            type="text"
            id="storeName"
            name="storeName"
            value={user.storeName}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter your store name"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
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

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={user.confirmPassword}
          onChange={handleInputChange}
          className="w-full"
          placeholder="Confirm your password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-800 text-white py-3 rounded-lg hover:bg-yellow-700 transition duration-300 disabled:bg-yellow-500 disabled:cursor-not-allowed font-medium">
        {loading ? "Creating Account..." : `Create ${user.userType === 'seller' ? 'Seller' : 'User'} Account`}
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-yellow-800 hover:text-yellow-700 font-medium underline">
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our platform today</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
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
          </TabsList>
          
          <TabsContent value="user" className="space-y-4">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="seller" className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-blue-800 text-sm flex items-center gap-2">
                <Store className="h-4 w-4" />
                Seller account for managing products and orders
              </p>
            </div>
            {renderForm()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterPage;
