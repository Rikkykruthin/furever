"use client";
import React, { useState, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import axios from "axios";

const ImageUploader = ({ 
  image, 
  onUploadSuccess, 
  onUploadError, 
  onRemoveImage,
  className = "",
  iconClassName = "h-5 w-5",
  uploadEndpoint = "/api/post/upload-image"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Cloudinary upload handler
  const handleCloudinaryUpload = (result) => {
    console.log("Cloudinary upload successful:", result);
    const imageUrl = result.info.secure_url;
    onUploadSuccess({ info: { secure_url: imageUrl } });
    setUploadError("");
  };

  const handleCloudinaryError = (error) => {
    console.error("Cloudinary upload error:", error);
    setUploadError(`Upload failed: ${error.message || "Unknown error"}`);
    onUploadError?.(error);
  };

  // File upload handler (fallback)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Try Cloudinary first, then fallback
      let response;
      try {
        response = await axios.post(uploadEndpoint, { base64 });
      } catch (cloudinaryError) {
        console.log("Cloudinary upload failed, trying fallback:", cloudinaryError.message);
        // Try fallback upload
        response = await axios.post("/api/post/upload-image-fallback", { base64 });
      }
      
      if (response.data.url) {
        onUploadSuccess({ info: { secure_url: response.data.url } });
        setUploadError("");
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError(`Upload failed: ${error.response?.data?.error || error.message}`);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onRemoveImage?.();
    setUploadError("");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Cloudinary Upload Widget */}
      <CldUploadWidget
        uploadPreset="Furrever"
        onSuccess={handleCloudinaryUpload}
        onError={handleCloudinaryError}
        options={{
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          resourceType: "image",
          folder: "furever/community-posts"
        }}>
        {({ open }) => (
          <button
            type="button"
            onClick={open}
            disabled={isUploading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${className} ${
              isUploading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-gray-100"
            }`}>
            {isUploading ? (
              <Loader2 className={`${iconClassName} animate-spin`} />
            ) : (
              <ImageIcon className={iconClassName} />
            )}
            <span className="text-sm">
              {isUploading ? "Uploading..." : (image ? "Change" : "Add Photo")}
            </span>
          </button>
        )}
      </CldUploadWidget>

      {/* Fallback File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isUploading 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:bg-gray-100"
        }`}>
        <Upload className={iconClassName} />
        <span className="text-sm">Upload File</span>
      </button>

      {/* Remove Image Button */}
      {image && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
          <X className={iconClassName} />
          <span className="text-sm">Remove</span>
        </button>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="text-red-600 text-sm mt-1">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
