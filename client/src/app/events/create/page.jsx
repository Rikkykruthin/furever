"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/../actions/userActions";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EventForm = () => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    image: "",
    eventDate: "",
    eventTime: "",
    location: "",
  });
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const userToken = await getToken("userToken");
      console.log("User token from cookies:", userToken);
      if (userToken) {
        setToken(userToken);
        setIsLoggedIn(true);
      } else {
        console.error("No token found");
        setMessage("Please log in to create an event.");
      }
    };

    fetchToken();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnUpload = (result) => {
    console.log("Upload successful:", result);
    const imageUrl = result.info.secure_url;
    setEventData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
    setImageUploaded(true);
    setMessage("Image uploaded successfully!");
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    setMessage(`Upload error: ${error.message || "Unknown error"}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setMessage("Please log in to create an event.");
      return;
    }
    if (!eventData.image) {
      setMessage("Please upload an image first!");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        ...eventData,
        eventDate: new Date(eventData.eventDate).toISOString(),
      };

      console.log("Submitting event data:", formattedData);

      const response = await axios.post("/api/event", {
        eventData: formattedData,
        token,
      });

      if (response.data.success) {
        setMessage("Event created successfully!");
        router.push("/events");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-secondary min-h-screen">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-primary titlefont">Add New Event</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {message && (
            <div
              className={`p-3 mb-4 rounded ${
                message.includes("Error") || message.includes("error")
                  ? "bg-destructive/10 text-destructive"
                  : "bg-accent/30 text-primary"
              }`}>
              {message}
            </div>
          )}

          {!isLoggedIn ? (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
              You need to be logged in to create an event.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-secondary">Event Title</label>
                <Input
                  type="text"
                  name="title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-secondary">Description</label>
                <Textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-secondary">Event Image</label>
                <ImageUploader
                  image={eventData.image}
                  onUploadSuccess={handleOnUpload}
                  onUploadError={handleUploadError}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-secondary">Event Date</label>
                <Input
                  type="date"
                  name="eventDate"
                  value={eventData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-secondary">Event Time</label>
                <Input
                  type="time"
                  name="eventTime"
                  value={eventData.eventTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-secondary">Location</label>
                <Input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={loading || !eventData.image}>
                  {loading ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
