"use client";
import React, { useEffect, useState } from "react";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Dynamically import CometChat component with SSR disabled
const CometChatNoSSR = dynamic(
  () => import("@/components/CometChat/CometChatNoSSR/CometChatNoSSR"),
  { ssr: false }
);

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticatedUser = await getAuthenticatedUser();
      
      console.log("Chat - Authenticated user:", authenticatedUser);
      
      if (!authenticatedUser) {
        console.log("Chat - No authenticated user, please login");
        setError("Please log in to access chat");
        setLoading(false);
        return;
      }

      console.log("Chat - Authentication successful for user:", authenticatedUser);
      setUser(authenticatedUser);
      setLoading(false);
      
    } catch (error) {
      console.error("Chat auth check failed:", error);
      setError("Authentication failed: " + error.message);
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Authenticating user...</p>
          <p className="text-sm text-gray-400 mt-2">Setting up your chat experience</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Authentication Error</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">
              You need to be logged in to access the chat feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a 
                href="/login" 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Go to Login
              </a>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render chat component when user is authenticated
  return (
    <div className="chat-container">
      {user ? (
        <CometChatNoSSR currentUser={user} />
      ) : (
        <div className="chat-unauthorized">
          Please log in to access the chat feature
        </div>
      )}
    </div>
  );
};

export default Page;
