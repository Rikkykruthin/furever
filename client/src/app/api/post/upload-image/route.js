import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(req) {
  try {
    const { base64 } = await req.json();

    if (!base64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400 }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(base64, {
      folder: "furever/community-posts", // Dedicated folder for community post images
      transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Limit size for optimization
        { quality: "auto" }, // Auto quality optimization
        { fetch_format: "auto" } // Auto format optimization
      ]
    });

    return new Response(
      JSON.stringify({ 
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Community Post Image Upload Failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload community post image" }),
      { status: 500 }
    );
  }
}



