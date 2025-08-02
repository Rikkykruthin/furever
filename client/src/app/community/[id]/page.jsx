"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PostCard from "@/components/pages/community/PostCard";
import PostForm from "@/components/pages/community/PostForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { getAuthenticatedUser } from "@/../actions/loginActions";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function CommunityInteriorPage() {
  const params = useParams();
  const communityId = params.id;
  const router = useRouter();

  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [posts, setPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setAuthStatus();
    fetchPosts();
  }, [communityId]);

  const setAuthStatus = async () => {
    if (typeof window !== "undefined") {
      try {
        const userToken = await getAuthenticatedUser();
        if (userToken) {
          setIsLoggedIn(true);
          setUser(userToken);
          setToken(userToken);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setIsLoggedIn(false);
      }
    }
  };

  const fetchPosts = async () => {
    if (!communityId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/post?communityId=${communityId}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
        if (data.communityName) {
          setCommunityName(data.communityName);
        }
        if (data.communityDescription) {
          setCommunityDescription(data.communityDescription);
        }

        if (data.posts && data.posts.length > 0) {
          for (const post of data.posts) {
            fetchCommentsForPost(post._id);
          }
        }
      } else {
        console.warn("No posts found:", data.message || data.error);
        if (data.error && data.error !== "No posts found for this community") {
          toast.error(data.error);
        }
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      const response = await fetch(`/api/comment?postId=${postId}`);
      const data = await response.json();

      if (data.success) {
        setCommentsMap((prevMap) => ({
          ...prevMap,
          [postId]: data.comments || [],
        }));
      } else {
        console.warn(
          `No comments found for post ${postId}:`,
          data.message || data.error
        );
      }
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
    }
  };

  const handleCreatePost = async (postData) => {
    if (!isLoggedIn) {
      toast.error("Please login to create a post");
      return;
    }

    try {
      const response = await axios.post("/api/post", {
        communityId,
        postData: {
          title: postData.title,
          content: postData.content,
          image: postData.image || "",
        },
        token,
      });
      const data = response.data;

      if (data.success) {
        toast.success("Post created successfully!");
        fetchPosts();
      } else {
        toast.error(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleComment = (postId) => {
    if (!isLoggedIn) {
      toast.error("Please login to comment");
      return;
    }
    setActivePostId(postId);
  };

  const handleCancelComment = () => {
    setActivePostId(null);
  };

  const handleSubmitComment = async (postId, commentText) => {
    if (!isLoggedIn) {
      toast.error("Please login to comment");
      return;
    }

    if (!commentText || commentText.trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/api/comment", {
        postId,
        commentText: commentText.trim(),
        token,
      });
      const data = response.data;

      if (data.success) {
        toast.success("Comment posted successfully!");
        fetchCommentsForPost(postId);
        setActivePostId(null);
      } else {
        toast.error(data.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      {/* Community Header */}
      <div className="px-4 py-3 border-b sticky top-0 bg-white z-10 md:hidden">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-3 text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-primary">
            {communityName}
          </h1>
        </div>
      </div>

      {/* Community Info (Desktop) */}
      <div className="hidden md:block py-6 px-4 border-b">
        <h1 className="text-2xl font-bold text-primary">{communityName}</h1>
        {communityDescription && (
          <p className="text-secondary mt-1">{communityDescription}</p>
        )}
        <p className="text-sm text-secondary mt-2">
          Join the discussion and share your thoughts!
        </p>
      </div>

      {/* Create Post Form */}
      <div className="px-4 py-3">
        {isLoggedIn ? (
          <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <PostForm onSubmit={handleCreatePost} />
          </div>
        ) : (
          <Alert className="mb-4 border-accent border bg-white/90 rounded-xl">
            <AlertDescription className="text-primary flex items-center justify-between py-2">
              <span className="font-medium">
                Login to create posts and join discussions
              </span>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Posts Feed */}
      <div className="px-4 divide-y">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="py-4">
              <PostCard
                post={post}
                comments={commentsMap[post._id] || []}
                commentCount={post.commentCount}
                onComment={handleComment}
                isCommenting={activePostId === post._id}
                onCancelComment={handleCancelComment}
                onSubmitComment={(commentText) =>
                  handleSubmitComment(post._id, commentText)
                }
                currentUser={user}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-primary mb-2">
              No posts yet
            </p>
            <p className="text-secondary max-w-xs mx-auto">
              Be the first to start a conversation in this community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityInteriorPage;
