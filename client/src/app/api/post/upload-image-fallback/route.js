import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { base64 } = await request.json();

    if (!base64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create buffer from base64
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `community-post-${timestamp}.jpg`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'community-posts');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Write file
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/community-posts/${filename}`;
    
    return NextResponse.json({ 
      url: publicUrl,
      filename: filename 
    });
    
  } catch (error) {
    console.error("Fallback Image Upload Failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}



