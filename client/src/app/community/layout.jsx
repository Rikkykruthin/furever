"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Compass, Home, Search, Settings } from "lucide-react";
import CreateCommunityModal from "@/components/pages/community/CommunityForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/../actions/loginActions";
import CommunityCard from "@/components/pages/community/CommunityCard";
import axios from "axios";
import Link from "next/link";

export default function CommunityLayout({ children }) {
  const [communities, setCommunities] = useState([]);
  const [user, setUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    if (typeof window !== "undefined") {
      try {
        const authenticatedUser = await getAuthenticatedUser();
        if (authenticatedUser) {
          setIsLoggedIn(true);
          setUser(authenticatedUser);
          setToken(authenticatedUser.token);
        } else {
          console.log("No authenticated user found");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setIsLoggedIn(false);
      }

      await fetchCommunities();
    }
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/community");
      const data = await response.json();

      if (data.success) {
        setCommunities(data.communities);
      } else {
        toast.error(data.error || "Failed to fetch communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (communityData) => {
    try {
      if (!isLoggedIn) {
        toast.error("Please login to create a community");
        router.push("/login");
        return;
      }

      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      const response = await axios.post(
        "/api/community",
        {
          communityData,
          token,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Community created successfully!");
        fetchCommunities();
        setIsCreateModalOpen(false);
      } else {
        toast.error(data.error || "Failed to create community");
      }
    } catch (error) {
      console.error("Error creating community:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.error || "Failed to create community");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top navigation bar (mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Communities</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-primary">
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/search")}
            className="text-primary">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-grow">
        {/* Left sidebar - only visible on desktop */}
        <div className="hidden md:flex flex-col w-64 border-r h-screen sticky top-0 bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h1 className="text-xl font-bold text-primary mb-6">
                Communities
              </h1>

              <div className="flex flex-col space-y-6 mb-8">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center text-primary hover:text-accent">
                  <Home className="w-5 h-5 mr-2" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center text-primary hover:text-accent">
                  <Search className="w-5 h-5 mr-2" />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => router.push("/community")}
                  className="flex items-center text-accent font-medium">
                  <Compass className="w-5 h-5 mr-2" />
                  <span>Communities</span>
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center text-primary hover:text-accent">
                  <Settings className="w-5 h-5 mr-2" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-secondary">
                  YOUR COMMUNITIES
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-accent hover:text-accent/80">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable communities list */}
            <div className="overflow-y-auto flex-grow px-4 pb-20">
              {communities.length > 0 ? (
                communities.map((community) => (
                  <div
                    key={community._id}
                    onClick={() => router.push(`/community/${community._id}`)}
                    className="flex items-center py-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors px-2">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-3">
                      {community.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-medium text-primary truncate">
                        {community.name}
                      </h3>
                      <p className="text-xs text-secondary truncate">
                        {community.admin?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-secondary">
                  <p>No communities found</p>
                </div>
              )}
            </div>

            {/* Fixed profile section at bottom */}
            {isLoggedIn && (
              <div className="p-4 border-t fixed w-64 border border-r-1 bottom-0 left-0 right-0 bg-white">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-secondary truncate">
                      {user?.email || "Email"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow max-w-2xl mx-auto w-full">{children}</div>
      </div>

      {/* Bottom navigation (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3">
        <button onClick={() => router.push("/")} className="text-primary p-1">
          <Home className="w-6 h-6" />
        </button>
        <button onClick={() => router.push("/")} className="text-primary p-1">
          <Search className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.push("/community")}
          className="text-accent p-1">
          <Compass className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="text-primary p-1">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
            {user?.name?.charAt(0) || "U"}
          </div>
        </button>
      </div>

      {/* Create Community Modal */}
      {isCreateModalOpen && (
        <CreateCommunityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCommunity}
        />
      )}
    </div>
  );
}
