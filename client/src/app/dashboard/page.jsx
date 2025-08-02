"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import SellerDashboard from "./sellerDashboard";
import UserDashboard from "./userDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticatedUser = await getAuthenticatedUser();
      
      console.log("Dashboard - Authenticated user:", authenticatedUser);
      
      if (!authenticatedUser) {
        console.log("Dashboard - No authenticated user, redirecting to login");
        router.push("/login");
        return;
      }

      setUser(authenticatedUser);
      
      // Redirect admin users to emergency admin dashboard
      console.log("Dashboard - User role:", authenticatedUser.role, "isAdmin:", authenticatedUser.isAdmin);
      if (authenticatedUser.role === "admin" || authenticatedUser.isAdmin) {
        console.log("Dashboard - Admin user detected, redirecting to /emergency/admin");
        router.push("/emergency/admin");
        return;
      } else {
        console.log("Dashboard - Non-admin user, staying on dashboard");
      }
      
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (user.role === "seller" || user.isSeller) {
    return <SellerDashboard user={user} />;
  }

  // Default to user dashboard
  return <UserDashboard user={user} />;
};

export default Dashboard;