"use client";

import React, { useEffect, useState } from "react";
import {
  CometChatMessageComposer,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatUIKit,
  UIKitSettingsBuilder,
  CometChatIncomingCall, // <-- Import Incoming Call component
  CometChatOutgoingCall, // <-- Import Outgoing Call component
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatSelector } from "../CometChatSelector/CometChatSelector";
import "./CometChatNoSSR.css";

// Constants for CometChat configuration
const COMETCHAT_CONSTANTS = {
  APP_ID: process.env.NEXT_PUBLIC_COMETCHAT_APP_ID,
  REGION: process.env.NEXT_PUBLIC_COMETCHAT_REGION,
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY,
};

// Validate environment variables
const validateCometChatConfig = () => {
  const missing = [];
  if (!COMETCHAT_CONSTANTS.APP_ID) missing.push('NEXT_PUBLIC_COMETCHAT_APP_ID');
  if (!COMETCHAT_CONSTANTS.REGION) missing.push('NEXT_PUBLIC_COMETCHAT_REGION');
  if (!COMETCHAT_CONSTANTS.AUTH_KEY) missing.push('NEXT_PUBLIC_COMETCHAT_AUTH_KEY');
  
  if (missing.length > 0) {
    console.error('Missing CometChat environment variables:', missing);
    return false;
  }
  return true;
};

// Functional component for CometChatNoSSR
const CometChatNoSSR = ({ currentUser }) => {
  const [isCometChatReady, setIsCometChatReady] = useState(false);
  const [error, setError] = useState(null);
  // State to store the logged-in user
  const [user, setUser] = useState(null);
  // State to store selected user or group
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  let isMounted = true;

  useEffect(() => {
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      console.log("CometChatNoSSR component unmounting. Logging out...");
      CometChat.logout()
        .then(() => {
          console.log("CometChat logout successful.");
        })
        .catch((error) => {
          console.error("CometChat logout failed:", error);
        });
    };
  }, []);

  useEffect(() => {
    let isComponentMounted = true; // Use a local variable for mount status within this effect
    const initCometChat = async () => {
      try {
        // Validate environment variables first
        if (!validateCometChatConfig()) {
          throw new Error(
            "CometChat configuration incomplete. Please check environment variables."
          );
        }

        // --- 1. Get Your Application's Current User ---
        console.log("User data in cometchat init:", currentUser);

        // Check if user is available before proceeding
        if (!currentUser || !currentUser._id) {
          throw new Error(
            "Application user not found. Cannot initialize chat."
          );
        }

        const UID = currentUser._id;
        const name = currentUser.name || UID;
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        const region = COMETCHAT_CONSTANTS.REGION;

        // Initialize UIKit settings
        const UIKitSettings = new UIKitSettingsBuilder()
          .setAppId(COMETCHAT_CONSTANTS.APP_ID)
          .setRegion(COMETCHAT_CONSTANTS.REGION)
          .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
          .subscribePresenceForAllUsers()
          .build();

        // Initialize CometChat if needed
        const initialized = await CometChat.isInitialized();
        // Always initialize UIKit for this component instance
        console.log("Initializing CometChat UI Kit...");
        await CometChatUIKit.init(UIKitSettings);
        console.log("UI Kit Initialization completed successfully");

        if (!initialized) {
          console.log("Initializing CometChat SDK...");
          const appSettings = new CometChat.AppSettingsBuilder()
            .subscribePresenceForAllUsers()
            .setRegion(region)
            .build();
          // SDK Init is implicitly handled by UIKit Init if not already done,
          // but calling CometChat.init might be necessary if specific SDK setup is needed before login.
          // For now, let's rely on UIKit's initialization.
          // await CometChat.init(COMETCHAT_CONSTANTS.APP_ID, appSettings);
          console.log(
            "CometChat SDK Initialization completed successfully (via UI Kit)."
          );
        } else {
          console.log("CometChat SDK was already initialized.");
        }

        // Check if user is already logged in
        let loggedInUser = await CometChat.getLoggedinUser();

        if (!loggedInUser) {
          console.log(`Attempting login for UID: ${UID}...`);
          try {
            loggedInUser = await CometChat.login(UID, authKey);
            console.log("Login Successful:", { loggedInUser });
          } catch (loginError) {
            console.warn("Login failed:", loginError);
            // Check if the error is because the user doesn't exist
            if (
              loginError?.code === "ERR_UID_NOT_FOUND" ||
              loginError?.message?.includes("not found")
            ) {
              console.log(
                `User UID ${UID} not found in CometChat. Attempting to create...`
              );
              try {
                const userToCreate = new CometChat.User(UID);
                userToCreate.setName(name || UID); // Use name, fallback to UID if name is not available
                const createdUser = await CometChat.createUser(
                  userToCreate,
                  authKey
                );
                console.log("User created successfully:", createdUser);

                // Try logging in again after successful creation
                console.log(`Retrying login for UID: ${UID}...`);
                loggedInUser = await CometChat.login(UID, authKey);
                console.log("Login successful after user creation:", {
                  loggedInUser,
                });
              } catch (creationError) {
                console.error(
                  "Failed to create user in CometChat:",
                  creationError
                );
                throw new Error(
                  `Failed to create or log in user ${UID}. Creation error: ${creationError.message}`
                );
              }
            } else {
              // Login failed for a reason other than user not found
              throw new Error(`CometChat login failed: ${loginError.message}`);
            }
          }
        } else {
          console.log("User already logged in:", loggedInUser);
        }

        // Set user state only if component is still mounted
        if (isComponentMounted) {
          setUser(loggedInUser);
          setIsCometChatReady(true);
        }
      } catch (err) {
        console.error("CometChat initialization error:", err);
        if (isComponentMounted) {
          setError(err.message);
        }
      }
    };

    initCometChat();

    // Cleanup for this effect
    return () => {
      isComponentMounted = false;
    };
  }, [currentUser]);

  if (error) {
    return <div className="chat-error">Error: {error}</div>;
  }

  return !isCometChatReady && !user ? (
    <div className="chat-loading">Loading chat interface...</div>
  ) : (
    <div className="conversations-with-messages">
      {/* Sidebar with conversation list */}
      <div className="conversations-wrapper">
        <CometChatSelector
          onSelectorItemClicked={(activeItem) => {
            let item = activeItem;
            // Extract the conversation participant
            if (activeItem instanceof CometChat.Conversation) {
              item = activeItem.getConversationWith();
            }
            // Update states based on the type of selected item
            if (item instanceof CometChat.User) {
              setSelectedUser(item);
              setSelectedGroup(undefined);
            } else if (item instanceof CometChat.Group) {
              setSelectedUser(undefined);
              setSelectedGroup(item);
            } else {
              setSelectedUser(undefined);
              setSelectedGroup(undefined);
            }
          }}
        />
      </div>

      {/* Message view section */}
      {selectedUser || selectedGroup ? (
        <div className="messages-wrapper">
          <CometChatMessageHeader user={selectedUser} group={selectedGroup} />
          <CometChatMessageList user={selectedUser} group={selectedGroup} />
          <CometChatMessageComposer user={selectedUser} group={selectedGroup} />
        </div>
      ) : (
        <div className="empty-conversation">Select Conversation to start</div>
      )}

      {/* Add Incoming and Outgoing Call Components */}
      <CometChatIncomingCall />
      {/* Disable outgoing call sound by setting URL to null */}
      <CometChatOutgoingCall />
    </div>
  );
};

export default CometChatNoSSR;
