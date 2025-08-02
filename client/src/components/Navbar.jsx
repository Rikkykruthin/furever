"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Heart,
  User,
  Menu,
  X,
  ShoppingBag,
  PawPrint,
  MessageCircle,
  Users,
  AlertTriangle,
  Shield,
  LogOut,
  Calendar,
  ChevronDown,
  Stethoscope,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getToken, getUserByToken } from "../../actions/userActions";
import { logoutAction } from "../../actions/loginActions";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for any type of token
      const userToken = await getToken("userToken");
      const sellerToken = await getToken("sellerToken");
      const adminToken = await getToken("adminToken");
      
      console.log("Navbar - Tokens found:", { userToken: !!userToken, sellerToken: !!sellerToken, adminToken: !!adminToken });
      
      const token = userToken || sellerToken || adminToken;
      
      if (token) {
        const response = await getUserByToken(token);
        if (response.success) {
          console.log("Navbar - User authenticated:", response.user);
          setUser(response.user);
        } else {
          console.log("Navbar - Authentication failed:", response);
        }
      } else {
        console.log("Navbar - No tokens found");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderUserNav = () => {
    if (!user) {
      return (
        <Link
          href="/login"
          className="flex items-center gap-1 hover:text-accent transition-colors">
          <User size={18} /> Login
        </Link>
      );
    }

    return (
      <>
        {/* Role-specific navigation */}
        {user.role === "admin" && (
          <Link
            href="/emergency/admin"
            className="flex items-center gap-1 hover:text-accent transition-colors">
            <Shield size={18} /> Admin
          </Link>
        )}
        {user.role === "seller" && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-accent transition-colors">
            <ShoppingBag size={18} /> Seller Dashboard
          </Link>
        )}
        
        <Link
          href="/profile"
          className="flex items-center gap-1 hover:text-accent transition-colors">
          <User size={18} /> Profile
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 hover:text-accent transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </>
    );
  };

  return (
    <div>
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PawPrint size={28} />
              <Link href="/" className="titlefont text-2xl font-bold">
                FurEver
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              {/* Community */}
              <Link
                href="/community"
                className="flex items-center gap-1 hover:text-accent transition-colors">
                <Users size={18} /> Community
              </Link>

              {/* Chat */}
              <Link
                href="/chat"
                className="flex items-center gap-1 hover:text-accent transition-colors">
                <MessageCircle size={18} /> Chat
              </Link>

              {/* Pet Store */}
              <Link
                href="/store"
                className="flex items-center gap-1 hover:text-accent transition-colors">
                <ShoppingBag size={18} /> Pet Store
              </Link>

              {/* Pet Services Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer">
                  <Stethoscope size={18} /> Pet Services <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black border shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/vet-consultation" className="flex items-center gap-2 w-full">
                      <Stethoscope size={16} />
                      Vet Consultation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/events" className="flex items-center gap-2 w-full">
                      <Calendar size={16} />
                      Events
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Street Services Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer">
                  <MapPin size={18} /> Street Services <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black border shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/emergency" className="flex items-center gap-2 w-full">
                      <AlertTriangle size={16} />
                      Emergency Reporting
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/street-animals" className="flex items-center gap-2 w-full">
                      <Heart size={16} />
                      Street Animals
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User-specific navigation */}
              {renderUserNav()}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 flex flex-col space-y-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                <Home size={18} /> Home
              </Link>

              {/* Community */}
              <Link
                href="/community"
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                <Users size={18} /> Community
              </Link>

              {/* Chat */}
              <Link
                href="/chat"
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                <MessageCircle size={18} /> Chat
              </Link>

              {/* Pet Store */}
              <Link
                href="/store"
                className="flex items-center gap-2 hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag size={18} /> Pet Store
              </Link>

              {/* Pet Services */}
              <div className="flex flex-col space-y-2 pl-4 border-l-2 border-accent">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Stethoscope size={16} /> Pet Services
                </span>
                <Link
                  href="/vet-consultation"
                  className="flex items-center gap-2 hover:text-accent transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Stethoscope size={16} /> Vet Consultation
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-2 hover:text-accent transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Calendar size={16} /> Events
                </Link>
              </div>

              {/* Street Services */}
              <div className="flex flex-col space-y-2 pl-4 border-l-2 border-accent">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <MapPin size={16} /> Street Services
                </span>
                <Link
                  href="/emergency"
                  className="flex items-center gap-2 hover:text-accent transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}>
                  <AlertTriangle size={16} /> Emergency Reporting
                </Link>
                <Link
                  href="/street-animals"
                  className="flex items-center gap-2 hover:text-accent transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Heart size={16} /> Street Animals
                </Link>
              </div>
              
              {/* User-specific mobile navigation */}
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link
                      href="/emergency/admin"
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}>
                      <Shield size={18} /> Admin Dashboard
                    </Link>
                  )}
                  {user.role === "seller" && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}>
                      <ShoppingBag size={18} /> Seller Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}>
                    <User size={18} /> Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 hover:text-accent transition-colors text-left">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}>
                  <User size={18} /> Login
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
