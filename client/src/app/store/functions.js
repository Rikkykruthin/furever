'use client';

// buy now and add to cart functions here
// [errMessage, setErrorMessage]

import React, { useState, useEffect, useRef } from "react";

// navigator router
import { useRouter } from "next/navigation";
import axios from "axios";

import { toast } from "react-hot-toast";

export const buyNow = (product) => {};

export const addToCart = (userId, productId) => {
  try {
    axios.post("/api/cart", {
        userId,
        productId
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = (userId, productId) => {};

export const clearCart = (userId) => {};

export const getCartSize = async (userId) => {
  if (!userId) {
    console.log("No userId provided to getCartSize client function");
    return 0;
  }
  
  try {
    const response = await axios.post("/api/cart/size", { userId });
    if (response.data && typeof response.data.data === 'number') {
      return response.data.data;
    }
    return 0;
  } catch (error) {
    console.error("Error getting cart size:", error.message);
    return 0;
  }
};
