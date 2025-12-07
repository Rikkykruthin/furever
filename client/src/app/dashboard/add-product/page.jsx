"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { logout } from "@/lib/userutils";
import Link from "next/link";
import { getAuthenticatedUser } from "../../../../actions/loginActions";
import axios from "axios";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    tags: "",
    images: [],
  });

  const [images, setImages] = useState([]); // files
  const [previewUrls, setPreviewUrls] = useState([]); // preview

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error("You can upload up to 10 images only");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    console.log(images);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    if (form.images) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
  };

  useEffect(() => {
    try {
      getAuthenticatedUser().then((user) => {
        setUser(user);
      });
      console.log(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
      router.push("/login");
    }
  }, []);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Step 1: Upload images to Cloudinary
    let uploadedImageUrls = [];

    try {
      const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Step 1: Upload each image to Cloudinary via your API
      for (const image of images) {
        const base64 = await readFileAsBase64(image);
        const res = await axios.post("/api/product/upload-image", { base64 });
        uploadedImageUrls.push(res.data.url); // adjust based on your response
      }
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      toast.error("Failed to upload images");
      setLoading(false);
      return;
    }

    console.log("Uploaded image URLs to Cloudinary:");

    // Step 2: Send form + user + image URLs
    try {
      const formPayload = {
        user,
        product: {
          ...form,
          images: uploadedImageUrls,
        },
      };

      console.log("Form Payload:", formPayload);

      const res = await axios.post("/api/product", formPayload);
      toast.success("Product submitted successfully!");

      // Reset form and state
      setForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        tags: "",
      });
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      setLoading(false);
      return;
    } finally {
      setForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        tags: "",
      });
      setImages([]);
      setPreviewUrls([]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Navbar */}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="text-white text-xl font-semibold animate-pulse">
            Loading... <br />
            Please wait!
          </div>
        </div>
      )}

      <nav className="flex justify-between items-center bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-bold titlefont">Add Product</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:bg-primary/80">
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="text-white hover:bg-primary/80"
            onClick={async () => {
              try {
                // Clear cookies on server
                const { logoutAction } = await import("../../../../actions/loginActions");
                await logoutAction();
                
                // Clear cookies on client side
                logout();
                
                router.push("/login");
                router.refresh();
                toast.success("Logout successful");
              } catch (error) {
                console.error("Logout failed:", error);
                router.push("/login");
              }
            }}
          >
            Logout
          </Button>
          <Avatar>
            <AvatarImage src="/profile.jpg" alt="Profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      {/* Product Form */}
      <div className="p-6">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-primary">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              encType="multipart/form-data"
            >
              <Input
                type="text"
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Textarea
                name="description"
                placeholder="Product Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              <Input
                type="number"
                name="price"
                placeholder="Prize (for 1 nos)"
                value={form.price}
                onChange={handleChange}
                required
              />
              <Input
                type="number"
                name="quantity"
                placeholder="Quantity (kg)"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="tags"
                placeholder="Tags (comma-separated)"
                value={form.tags}
                onChange={handleChange}
              />

              <div>
                <p className="mb-2 font-medium text-sm text-secondary">Product Images (up to 10)</p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="bg-white"
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-medium text-sm text-secondary">Image Previews</p>
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative h-24 border rounded overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Add Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
