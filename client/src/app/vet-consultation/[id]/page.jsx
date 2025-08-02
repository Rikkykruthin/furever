"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Video, 
  MessageCircle, 
  Phone,
  Calendar,
  Award,
  Users,
  Stethoscope,
  Heart,
  Share2,
  ChevronLeft,
  CheckCircle,
  Globe,
  GraduationCap,
  FileText,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

export default function VetProfilePage() {
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchVetProfile();
    }
  }, [id]);

  const fetchVetProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vet/${id}?includeReviews=true&includeStats=true`);
      const data = await response.json();

      if (data.success) {
        setVet(data.data);
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching vet profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-slate-300"
        }`}
      />
    ));
  };

  const AvailabilityCalendar = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Available Time Slots</h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date, index) => {
            const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1].toLowerCase();
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-slate-500 mb-1">
                  {daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </div>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`w-full h-12 flex flex-col p-1 ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="text-xs">{date.getDate()}</span>
                  <span className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Time Slots for Selected Date */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">
            Available slots for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {vet?.availableSlots?.find(slot => 
            new Date(slot.date).toDateString() === selectedDate.toDateString()
          ) ? (
            <div className="grid grid-cols-3 gap-2">
              {vet.availableSlots
                .find(slot => new Date(slot.date).toDateString() === selectedDate.toDateString())
                ?.slots?.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => router.push(`/vet-consultation/${id}/book?date=${selectedDate.toISOString().split('T')[0]}&time=${slot.startTime}`)}
                  >
                    {slot.startTime}
                  </Button>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No available slots for this date</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <Image
              src={review.user?.avatar || "/default-avatar.svg"}
              alt={review.user?.name || "User"}
              fill
              className="object-cover rounded-full"
            />
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{review.user?.name || "Anonymous"}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-700">{review.review}</p>
            
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {review.vetResponse?.message && (
              <div className="bg-blue-50 p-4 rounded-lg mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Dr. {vet?.name} responded:</span>
                </div>
                <p className="text-blue-700 text-sm">{review.vetResponse.message}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpfulVotes?.helpful || 0})
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ThumbsDown className="h-4 w-4 mr-1" />
                Not helpful ({review.helpfulVotes?.notHelpful || 0})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vet profile...</p>
        </div>
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Vet not found</h2>
          <p className="text-slate-600 mb-4">The veterinarian profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/vet-consultation")}>
            Back to Vet Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
              <CardContent className="p-6 -mt-16 relative">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-2 shadow-lg">
                      <Image
                        src={vet.photo || "/default-vet-avatar.svg"}
                        alt={vet.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    {vet.isOnline && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full ring-4 ring-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-800">
                          Dr. {vet.name}
                        </h1>
                        {vet.isVerified && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(vet.rating?.average || 0)}
                          <span className="font-medium ml-2">
                            {vet.rating?.average?.toFixed(1) || "New"}
                          </span>
                          <span className="text-slate-500">
                            ({vet.rating?.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vet.specializations?.map((spec, index) => (
                          <Badge key={index} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope className="h-4 w-4" />
                        <span>{vet.yearsOfExperience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vet.location?.city || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${vet.consultationFee}/session</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>{vet.responseTimeFormatted || "Quick response"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Dr. {vet.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {vet.bio || "No bio available."}
                    </p>
                  </CardContent>
                </Card>

                {/* Languages & Consultation Modes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {vet.languages?.map((lang, index) => (
                          <Badge key={index} variant="secondary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Consultation Modes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {vet.consultationModes?.includes("video") && (
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-blue-600" />
                            <span>Video Consultation</span>
                          </div>
                        )}
                        {vet.consultationModes?.includes("audio") && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-green-600" />
                            <span>Audio Call</span>
                          </div>
                        )}
                        {vet.consultationModes?.includes("chat") && (
                          <div className="flex items-center gap-3">
                            <MessageCircle className="h-5 w-5 text-purple-600" />
                            <span>Text Chat</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats */}
                {vet.detailedStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Statistics (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {vet.detailedStats.totalAppointments}
                          </div>
                          <div className="text-sm text-slate-600">Consultations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {vet.detailedStats.completedAppointments}
                          </div>
                          <div className="text-sm text-slate-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {Math.round(vet.detailedStats.averageSessionDuration)}m
                          </div>
                          <div className="text-sm text-slate-600">Avg Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            ${vet.detailedStats.totalRevenue}
                          </div>
                          <div className="text-sm text-slate-600">Revenue</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review._id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No reviews yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="education">
                <div className="space-y-6">
                  {/* Degrees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vet.degrees && vet.degrees.length > 0 ? (
                        <div className="space-y-4">
                          {vet.degrees.map((degree, index) => (
                            <div key={index} className="border-l-4 border-blue-600 pl-4">
                              <h4 className="font-medium">{degree.degree}</h4>
                              <p className="text-slate-600">{degree.institution}</p>
                              <p className="text-sm text-slate-500">{degree.year}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No education information available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vet.certifications && vet.certifications.length > 0 ? (
                        <div className="space-y-4">
                          {vet.certifications.map((cert, index) => (
                            <div key={index} className="border-l-4 border-green-600 pl-4">
                              <h4 className="font-medium">{cert.certification}</h4>
                              <p className="text-slate-600">{cert.issuingBody}</p>
                              <p className="text-sm text-slate-500">Issued: {cert.year}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No certifications listed</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Book an Appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AvailabilityCalendar />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    ${vet.consultationFee}
                  </div>
                  <div className="text-sm text-slate-600">per session</div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => router.push(`/vet-consultation/${id}/book`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  
                  {vet.isAvailableNow && (
                    <Button variant="outline" className="w-full" size="lg">
                      <Video className="h-4 w-4 mr-2" />
                      Instant Consultation
                    </Button>
                  )}
                </div>
                
                {vet.nextAvailableSlot && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">Next available slot:</div>
                      <div>
                        {new Date(vet.nextAvailableSlot.date).toLocaleDateString()} at {vet.nextAvailableSlot.time}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Patients</span>
                  <span className="font-medium">{vet.stats?.totalPatients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Consultations</span>
                  <span className="font-medium">{vet.stats?.totalConsultations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Response Time</span>
                  <span className="font-medium">{vet.responseTimeFormatted || "Quick"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Follow-up Rate</span>
                  <span className="font-medium">{vet.stats?.followUpRate || 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 