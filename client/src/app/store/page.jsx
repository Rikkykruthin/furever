"use client";

import {
  ShoppingCart,
  Star,
  Truck,
  LogOut,
  Home,
  CreditCard,
  Search,
  Filter,
  Sparkles,
  Heart,
  Zap,
  Award,
  TrendingUp,
  X,
  ChevronDown,
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal,
  Check,
  ArrowRight,
  Package,
  Shield,
  Clock,
  Percent,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { fetchProducts } from "../../../actions/storeActions";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import { buyNow, addToCart as addToCartAction, getCartSize } from "./functions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

import useProductStore from "@/lib/zustand";

export default function StorePage() {
  const [cartSize, setCartSize] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const searchRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addToCart = (productId, e) => {
    if (e) e.stopPropagation();
    addToCartAction(user._id, productId);
    getCartSize(user._id).then((size) => setCartSize(size));
    toast.success("Product added to cart!", {
      icon: "🛒",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const toggleWishlist = (productId, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast.success(
      wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist",
      {
        icon: wishlist.includes(productId) ? "💔" : "❤️",
      }
    );
  };

  const handleBuyNow = (product) => {
    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        ...product,
        quantity: 1,
      })
    );
    useProductStore(state => state.setProducts)(products);
    router.push("/store/checkout");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = products.filter((product) => {
      const inName = product.name.toLowerCase().includes(query);
      const inTags = product.tags.some((tag) => tag.toLowerCase().includes(query));
      return inName || inTags;
    });

    setFilteredSuggestions(suggestions.slice(0, 5)); // Limit suggestions
  };

  const handleSearchSelect = (product) => {
    localStorage.setItem("product", JSON.stringify(product));
    router.push(`/store/product`);
  };

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
    getAuthenticatedUser().then((currUser) => {
      setUser(currUser);
      if (currUser && currUser._id) {
        getCartSize(currUser._id).then(setCartSize);
      }
    }).catch(error => {
      console.error("Error getting authenticated user:", error);
    });
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) =>
        product.tags?.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) => {
        const inName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const inTags = product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return inName || inTags;
      });
    }

    // Filter by price range
    filtered = filtered.filter((product) => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter((product) => 
        Math.round(product.rating || 0) >= selectedRating
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange, selectedRating]);

  // Get unique categories from products
  const categories = ["all", ...new Set(products.flatMap((p) => p.tags || []))];

  // Get max price for range slider
  const maxPrice = Math.max(...products.map(p => p.price || 0), 10000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      {/* Enhanced Navbar */}
      <nav className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white p-4 shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Sparkles className="text-accent" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold titlefont bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              The Pet Store
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Enhanced Search */}
            <div className="relative" ref={searchRef}>
          <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
                  className="pl-10 pr-10 py-2 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-accent focus:bg-white/20 transition-all duration-300 w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            {filteredSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 mt-2 z-20 bg-white text-black border border-accent/20 w-full rounded-lg shadow-2xl max-h-64 overflow-auto">
                {filteredSuggestions.map((product) => (
                  <li
                    key={product._id}
                      className="p-3 hover:bg-accent/10 cursor-pointer border-b border-gray-100 last:border-0 transition-colors flex items-center gap-3"
                    onClick={() => handleSearchSelect(product)}
                  >
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">₹{product.price}</p>
                      </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            variant="ghost"
              className="text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-105"
            onClick={() => router.push("/dashboard")}
          >
              <Home className="mr-2" size={18} /> Home
          </Button>
          <Button
            variant="ghost"
              className="text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-105 relative"
            onClick={() => router.push("/store/cart")}
          >
              <ShoppingCart className="mr-2" size={18} />
              Cart
              {cartSize > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartSize}
                </span>
              )}
          </Button>
          <Button
            variant="ghost"
              className="text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-105"
            onClick={() => router.push("/store/orders")}
          >
              <CreditCard className="mr-2" size={18} /> Orders
          </Button>
          <Button 
            variant="ghost" 
              className="text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-105"
            onClick={async () => {
              try {
                // Clear cookies on server
                const { logoutAction } = await import("../../../actions/loginActions");
                await logoutAction();
                
                // Clear cookies on client side
                if (typeof window !== "undefined") {
                  const Cookies = (await import("js-cookie")).default;
                  Cookies.remove("userToken", { path: "/" });
                  Cookies.remove("sellerToken", { path: "/" });
                  Cookies.remove("adminToken", { path: "/" });
                  
                  // Also clear via API route
                  await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include"
                  });
                }
                
                router.push("/login");
                router.refresh();
              } catch (error) {
                console.error("Logout failed:", error);
                router.push("/login");
              }
            }}
          >
              <LogOut className="mr-2" size={18} /> Logout
          </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary text-white py-20 md:py-32 overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.4), transparent 60%)`,
          }}
        ></div>
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-sm font-semibold">Premium Pet Products</span>
            </div>
            <h2 className="titlefont text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent animate-gradient">
              Everything Your Pet Needs
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Discover premium food, toys, accessories, and more for your furry friends. 
              <br className="hidden md:block" />
              Quality products, trusted by pet lovers worldwide.
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <Truck className="text-accent" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Free Shipping</p>
                  <p className="text-xs text-white/70">On orders ₹500+</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <Award className="text-accent" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Premium Quality</p>
                  <p className="text-xs text-white/70">100% Guaranteed</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <Zap className="text-accent" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Fast Delivery</p>
                  <p className="text-xs text-white/70">3-5 Business Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sort Section */}
      <section className="max-w-7xl mx-auto px-4 py-6 sticky top-[73px] z-40 bg-white/90 backdrop-blur-md border-b border-accent/20 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side - Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-2 border-accent/30 hover:border-accent hover:bg-accent/10"
            >
              <SlidersHorizontal size={18} />
              Filters
              {showFilters && <Check size={16} className="text-accent" />}
            </Button>
            
            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-primary hidden md:inline">Categories:</span>
              <div className="flex gap-2 flex-wrap">
                {categories.slice(0, 8).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative overflow-hidden group ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-lg scale-105"
                        : "bg-secondary text-primary hover:bg-accent/20 hover:scale-105"
                    }`}
                  >
                    <span className="relative z-10">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    {selectedCategory === category && (
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - View Mode & Sort */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all duration-300 ${
                  viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-primary hover:bg-accent/20"
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all duration-300 ${
                  viewMode === "list" ? "bg-primary text-white shadow-md" : "text-primary hover:bg-accent/20"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-accent/20 bg-white text-primary focus:outline-none focus:border-accent transition-all duration-300 hover:border-accent/40 cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-accent/20 animate-slide-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block font-semibold text-primary mb-3">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block font-semibold text-primary mb-3">Minimum Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        selectedRating >= rating
                          ? "bg-accent text-primary scale-110"
                          : "bg-secondary text-gray-400 hover:bg-accent/20"
                      }`}
                    >
                      <Star size={20} fill={selectedRating >= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPriceRange([0, maxPrice]);
                    setSelectedRating(0);
                    setSelectedCategory("all");
                  }}
                  className="w-full border-2 border-accent/30 hover:border-accent hover:bg-accent/10"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Store Products */}
      <section className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-full mb-6">
              <Search className="text-accent" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-primary mb-3">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange([0, maxPrice]);
              setSelectedRating(0);
            }} className="bg-primary text-white">
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                </h3>
                <p className="text-gray-600">Showing all available products</p>
              </div>
            </div>
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-6"
            }>
              {filteredProducts.map((product, index) => (
              <Card
                key={product._id}
                  className={`group bg-white shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-accent/20 hover:border-accent/60 relative ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 0.03}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.6s ease-out ${index * 0.03}s, transform 0.6s ease-out ${index * 0.03}s`,
                  }}
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(product._id, e)}
                    className={`absolute top-4 right-4 z-30 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      wishlist.includes(product._id)
                        ? "bg-red-500 text-white shadow-lg scale-110"
                        : "bg-white/90 text-gray-600 hover:bg-white hover:scale-110"
                    }`}
                  >
                    <Heart size={20} fill={wishlist.includes(product._id) ? "currentColor" : "none"} />
                  </button>

                  {/* Image Container */}
                  <div 
                    className={`relative overflow-hidden cursor-pointer bg-gradient-to-br from-accent/10 to-transparent ${
                      viewMode === "list" ? "w-64 h-64 flex-shrink-0" : "h-64"
                    }`}
                onClick={() => {
                  localStorage.setItem("product", JSON.stringify(product));
                  router.push(`/store/product`);
                }}
              >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                      {product.rating >= 4.5 && (
                        <div className="bg-accent text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Star size={12} fill="currentColor" />
                          Top Rated
                        </div>
                      )}
                      {product.price < 500 && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Percent size={12} />
                          Best Deal
                        </div>
                      )}
                  </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 z-10 flex items-center justify-center gap-2">
                    <Button
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-primary hover:bg-accent hover:text-white scale-90 group-hover:scale-100"
                      onClick={(e) => {
                        e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                      >
                        <Eye className="mr-2" size={16} />
                        Quick View
                      </Button>
                    </div>
                  </div>

                  <CardContent className={`p-6 flex-1 ${viewMode === "list" ? "flex flex-col justify-between" : ""}`}>
                    <div>
                      <CardTitle className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </CardTitle>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-primary font-bold text-2xl mb-1">₹{product.price}</p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-gray-400 text-sm line-through">₹{product.originalPrice}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < Math.round(product.rating || 0) ? "#b59e7e" : "none"}
                              stroke="#b59e7e"
                              className="transition-all duration-300 group-hover:scale-110"
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1 font-semibold">({product.rating || 0})</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {product.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 bg-gradient-to-r from-accent/20 to-accent/10 text-primary rounded-full font-medium border border-accent/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Features */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          <span>In Stock</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={14} />
                          <span>Warranty</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Fast Delivery</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex gap-2 ${viewMode === "list" ? "flex-row" : "flex-col"}`}>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden"
                        onClick={(e) => addToCart(product._id, e)}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Add to Cart
                          <ShoppingCart className="ml-2" size={18} />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                    <Button
                        variant="outline"
                        className={`flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 group-hover:scale-105 ${
                          viewMode === "list" ? "" : "w-full"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                    >
                      Buy Now
                        <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
          </>
        )}
      </section>

      {/* Enhanced Promo Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="relative bg-gradient-to-br from-accent via-accent/90 to-accent/80 text-primary rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden group">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(60, 78, 89, 0.2), transparent 50%)`,
          }}></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Truck className="text-primary" size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold titlefont mb-4">
              Free Shipping on Orders Over ₹500!
            </h2>
            <p className="text-lg text-primary/80 mb-6 max-w-2xl mx-auto">
              Order now and receive your pet products within 3-5 business days. Fast, reliable delivery straight to your door.
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                <TrendingUp className="text-primary" size={18} />
                <span className="font-semibold">Best Prices</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                <Award className="text-primary" size={18} />
                <span className="font-semibold">Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                <Heart className="text-primary" size={18} />
                <span className="font-semibold">Pet Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-scale"
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <img
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">{quickViewProduct.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={20} 
                          fill={i < Math.round(quickViewProduct.rating || 0) ? "#b59e7e" : "none"}
                          stroke="#b59e7e"
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">({quickViewProduct.rating || 0} reviews)</span>
                  </div>
                  <p className="text-3xl font-bold text-primary mb-4">₹{quickViewProduct.price}</p>
                </div>
                
                {quickViewProduct.tags && (
                  <div className="flex gap-2 flex-wrap">
                    {quickViewProduct.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-accent/20 text-primary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                    onClick={(e) => {
                      addToCart(quickViewProduct._id, e);
                      setQuickViewProduct(null);
                    }}
                  >
                    Add to Cart
                    <ShoppingCart className="ml-2" size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => {
                      handleBuyNow(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
      )}
    </div>
  );
}