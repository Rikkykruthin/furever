// cart/size route / api

import { db } from "../../../../../db/actions";
import { NextResponse } from "next/server";

// export async function POST(request) {}

export async function POST(request) {
    try {
        const data = await request.json();
        const { userId } = data;
        
        if (!userId) {
            console.log("No userId provided to /api/cart/size");
            return NextResponse.json({ 
                status: 400, 
                message: "userId is required",
                data: 0 
            }, { status: 400 });
        }
        
        const result = await db.getCartSize(userId);
        
        return NextResponse.json({ 
            status: 200, 
            message: "success", 
            data: result 
        });
    } catch (error) {
        console.error("Error in /api/cart/size:", error.message);
        
        return NextResponse.json(
            {
                status: 500,
                statusText: "Internal Server Error",
                message: error.message,
                data: 0
            },
            {
                status: 500,
            }
        );
    }
}