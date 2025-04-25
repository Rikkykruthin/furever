"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/event");
        if (response.data.success) {
          setEvents(response.data.events);
        } else {
          setError("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("An error occurred while fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isDialogOpen]);

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-secondary min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary titlefont">Latest Events</h1>

        <Link href="/events/create">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Create New Event
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 bg-accent/30 rounded-lg">
          <p className="text-xl text-primary">No upcoming events found</p>
          <p className="mt-2 text-secondary">Be the first to create an event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 truncate text-primary">
                  {event.title}
                </h2>
                <p className="text-secondary mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-secondary">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-accent" />
                    <span>
                      {format(new Date(event.eventDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    <span>{event.eventTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-accent" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
                  onClick={() => {
                    // Handle view event details
                    console.log("View event:", event._id);
                  }}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
