// seller dashboard
"use client";
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";

import axios from "axios";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  ShoppingCart,
  Users,
  PackagePlus,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { logout } from "@/lib/userutils";

export default function SellerDashboard() {

  const router = useRouter();

  const [products, setProducts] = useState([]);

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white p-5 hidden md:block">
        <h2 className="text-2xl font-bold text-center titlefont">Seller Dashboard</h2>
        <Separator className="my-4 bg-white/30" />
        <ul className="space-y-4">
          <li className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors duration-200 p-2 rounded-md">
            <Users className="w-5 h-5" /> Customer Requests
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors duration-200 p-2 rounded-md">
            <ShoppingCart className="w-5 h-5" /> Orders & Sales
          </li>
          <li 
            className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors duration-200 p-2 rounded-md"
            onClick={() => router.push("/dashboard/add-product")}
          >
            <PackagePlus className="w-5 h-5" /> Add Product
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors duration-200 p-2 rounded-md">
            <BarChart className="w-5 h-5" /> Analytics
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Navbar */}
        <nav className="flex justify-between items-center bg-primary text-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl font-bold titlefont">Seller Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-accent text-primary hover:bg-accent/90"
              onClick={() => router.push("/dashboard/add-product")}
            >
              <PlusCircle className="w-4 h-4" /> Add Product
            </Button>
            <Avatar>
              <AvatarImage src="/profile.jpg" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={async () => {
                try {
                  // Clear cookies on server - redirect() will throw NEXT_REDIRECT error
                  const { logoutAction } = await import("../../../actions/loginActions");
                  await logoutAction();
                  
                  // This code should never execute because redirect() throws
                  // But if it does, handle client-side cleanup as fallback
                  logout();
                  router.push("/login");
                  router.refresh();
                  toast.success("Logout successful");
                } catch (error) {
                  // redirect() throws NEXT_REDIRECT error - this is expected behavior
                  // Check if it's a redirect error (NEXT_REDIRECT) or actual error
                  if (error && typeof error === 'object' && 'digest' in error && error.digest?.startsWith('NEXT_REDIRECT')) {
                    // This is the expected redirect - do nothing, let it redirect
                    logout(); // Still clear client-side state
                    return;
                  }
                  
                  // Actual error occurred - handle client-side logout as fallback
                  console.error("Logout failed:", error);
                  logout();
                  router.push("/login");
                }
              }}
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </nav>

        {/* Tabs for Dashboard Sections */}
        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="bg-primary text-white space-x-3 transition-all duration-300">
            <TabsTrigger value="products">Your Products</TabsTrigger>
            <TabsTrigger value="requests">Customer Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Section */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Products</CardTitle>
                  <Button
                    variant="outline" 
                    className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => router.push("/dashboard/add-product")}
                  >
                    <PlusCircle className="w-4 h-4" /> Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  List of all your uploaded products.
                </p>
                {/* Product List Goes Here */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Customer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage customer inquiries & requests.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View your sales performance.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
