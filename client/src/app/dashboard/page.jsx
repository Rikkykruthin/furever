"use client";
import React, { useState, useEffect } from "react";
import { getAuthenticatedUser } from "../../../actions/loginActions";
import SellerDashboard from "./sellerDashboard";
import UserDashboard from "./userDashboard";

const page = () => {
  
  return (
    <>
        <SellerDashboard />
    </>
  );
};

export default page;