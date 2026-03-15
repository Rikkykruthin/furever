"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, Heart, Calendar, ArrowRight, PawPrint, Sparkles, TrendingUp, Users, MapPin, AlertTriangle, Star, Zap, Shield, Award, Stethoscope, ShoppingCart, Scissors, GraduationCap, Phone } from "lucide-react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import CrazyFooter from "@/components/CrazyFooter";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [counters, setCounters] = useState({ rescued: 0, adopted: 0, volunteers: 0, shelters: 0 });
  const [isInView, setIsInView] = useState({});
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers = [];
    const targets = document.querySelectorAll('[data-animate-on-scroll]');
    
    targets.forEach((target) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in-view');
              setIsInView((prev) => ({ ...prev, [entry.target.id]: true }));
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(target);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // Animated counters
  useEffect(() => {
    const targetValues = { rescued: 500, adopted: 350, volunteers: 200, shelters: 50 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const animateCounter = (key, target) => {
      let current = 0;
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);
    };

    if (isInView.stats) {
      Object.keys(targetValues).forEach((key) => {
        animateCounter(key, targetValues[key]);
      });
    }
  }, [isInView.stats]);
  const emergencyServices = [
    {
      id: 1,
      name: "Injury Reporting",
      description: "Report injured street animals for immediate assistance",
      image:
        "https://media.istockphoto.com/id/529121160/photo/sad-labrator-with-broken-leg.jpg?s=612x612&w=0&k=20&c=NfNrf2dDIKlZpIM1xX4t7BabbUfAcxl6bOBVUoVOjRU=",
    },
    {
      id: 2,
      name: "Food Donation",
      description: "Donate leftover pet-friendly food for street animals",
      image:
        "https://www.petplate.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fheader.22e20ba9.png&w=3840&q=75",
    },
    {
      id: 3,
      name: "Shelter Locator",
      description: "Find nearby shelters for rescued or injured animals",
      image:
        "https://m.media-amazon.com/images/I/613qBuu65qL.jpg",
    },
  ];

  const petServices = [
    {
      id: 1,
      name: "Pet Adoption",
      description: "Find your perfect furry companion",
      image:
        "https://images.pexels.com/photos/1904103/pexels-photo-1904103.jpeg?cs=srgb&dl=pexels-helenalopes-1904103.jpg&fm=jpg",
    },
    {
      id: 2,
      name: "Veterinary Appointments",
      description: "Book online or in-person vet consultations",
      image:
        "https://future-mbbs.com/wp-content/uploads/2024/09/shutterstock_2391795695-scaled.jpg",
    },
    {
      id: 3,
      name: "Pet Store",
      description: "Premium food, toys and accessories for your pets",
      image:
        "https://img.lovepik.com/photo/50180/8045.jpg_wh860.jpg",
    },
  ];

  const successStories = [
    {
      id: 1,
      name: "Rocky",
      text: "From street dog to loving home - Rocky was rescued after an injury report on FurEver and now lives with a wonderful family.",
      image:
        "https://www.nylabone.com/-/media/project/oneweb/nylabone/images/dog101/10-intelligent-dog-breeds/golden-retriever-tongue-out.jpg?h=430&w=710&hash=7FEB820D235A44B76B271060E03572C7",
    },
    {
      id: 2,
      name: "Bella",
      text: "After being spotted through our Lost & Found feature, Bella was reunited with her family within hours of going missing.",
      image:
        "https://hips.hearstapps.com/hmg-prod/images/best-guard-dogs-1650302456.jpeg?crop=0.754xw:1.00xh;0.0651xw,0&resize=1200:*",
    },
    {
      id: 3,
      name: "Max",
      text: "Through our sterilization drive, Max and 50 other street dogs received proper healthcare and vaccination, improving their quality of life.",
      image:
        "https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFyZ2UlMjBkb2d8ZW58MHx8MHx8fDA%3D",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Floating Action Button */}
      <div 
        className="fixed bottom-8 right-8 z-50 group"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
        }}
      >
        <Button 
          size="lg"
          className="rounded-full w-16 h-16 p-0 bg-gradient-to-br from-accent to-accent/80 shadow-2xl hover:shadow-[0_0_30px_rgba(181,158,126,0.6)] transition-all duration-300 hover:scale-110 relative overflow-hidden"
        >
          <Heart className="w-6 h-6 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" fill="currentColor" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        </Button>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="relative bg-white dark:bg-black py-20 md:py-32 overflow-hidden"
        >
          {/* Enhanced decorative background elements */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) translateY(-50%) translateX(50%)`,
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px) translateY(50%) translateX(-50%)`,
            }}
          ></div>
          
          {/* Animated floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-500/30 rounded-full pointer-events-none animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className={`md:w-1/2 space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-gray-900 rounded-full text-blue-700 dark:text-blue-300 mb-4 shadow-sm backdrop-blur-sm animate-fade-in-scale hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span className="text-sm font-medium tracking-wide">Making a difference together</span>
                </div>
                <h1 className="titlefont text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight">
                  <span 
                    className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent animate-slide-in-up inline-block"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'rotate-gradient 5s ease infinite',
                    }}
                  >
                  Helping Paws & Creating Smiles
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 max-w-lg leading-relaxed relative font-medium">
                  <span className="relative z-10">
                  A platform dedicated to street animal welfare and creating a
                  vibrant pet-loving community. Together, we can make a
                  difference in their lives.
                  </span>
                  <span 
                    className="absolute -left-4 top-0 text-6xl text-blue-100 dark:text-gray-800 font-serif select-none pointer-events-none"
                    style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
                  >
                    "
                  </span>
                </p>
                <div className="flex flex-wrap gap-4 pt-6">
                  <Button
                    size="lg"
                    className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                    Report Emergency
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 px-8 group relative overflow-hidden backdrop-blur-sm">
                    <span className="relative z-10 flex items-center">
                    Adopt a Pet
                      <Heart className="ml-2 w-4 h-4 group-hover:scale-110 group-hover:fill-current transition-all" />
                    </span>
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-3 group">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 border-[3px] border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-md hover:scale-110 transition-transform duration-300 hover:z-10 relative cursor-pointer group/avatar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <span className="relative z-10">{i}</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-white/0 group-hover/avatar:from-white/30 group-hover/avatar:to-white/10 transition-all duration-300"></div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/50 dark:from-gray-800/0 dark:via-gray-700/50 to-blue-50/0 dark:to-gray-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 relative z-10 font-medium">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">500+</span> animals helped this month
                    </p>
                    <div className="flex items-center gap-1 mt-1 relative z-10">
                      <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400 animate-pulse" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12% from last month</span>
                </div>
              </div>
                </div>
              </div>
              <div className={`md:w-1/2 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <div className="relative group">
                  <div 
                    className="absolute -inset-4 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                    style={{
                      transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
                    }}
                  ></div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 group-hover:from-black/50 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Image
                    src="https://static.independent.co.uk/2022/08/22/15/iStock-1204163981%20%281%29.jpg"
                    alt="Happy dog with owner"
                    width={800}
                    height={600}
                    priority
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                    {/* Overlay effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-primary/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                </div>
                </div>
                {/* Floating badge - positioned to not overlap */}
                <div className="absolute -top-4 right-4 md:top-4 md:right-4 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg hidden md:flex items-center gap-2 animate-float z-20">
                  <PawPrint className="text-accent" size={20} />
                  <span className="text-xs font-semibold text-primary whitespace-nowrap">Trusted Platform</span>
                </div>
                {/* Info card - positioned to not overlap */}
                <div className="absolute -bottom-4 left-4 md:-bottom-8 md:-left-8 bg-white p-4 md:p-5 rounded-xl shadow-2xl hidden md:block transform hover:scale-105 transition-transform duration-300 border border-accent/20 z-20 max-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                      <Heart className="text-red-500" size={20} fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-primary truncate">Waiting for love</p>
                      <p className="text-xs text-muted-foreground">50+ pets need homes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-gradient-to-b from-secondary to-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
                <Star className="text-accent w-6 h-6 fill-accent" />
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              </div>
              <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-primary">
                Success Stories
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
                Real stories of hope, love, and second chances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {successStories.map((story, index) => (
                <div 
                  key={story.id} 
                  className="group bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20 hover:border-accent/40 relative overflow-hidden mb-4"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.8s ease-out ${index * 0.15}s, transform 0.8s ease-out ${index * 0.15}s`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300 shadow-lg">
                      <Image
                        src={story.image}
                        alt={story.name}
                            width={80}
                            height={80}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300">{story.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star 
                              key={i} 
                              className="w-3 h-3 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform duration-300" 
                              style={{ animationDelay: `${i * 0.05}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary-foreground leading-relaxed relative">
                      <span className="text-4xl text-accent/20 font-serif absolute -top-2 -left-2">"</span>
                      <span className="relative z-10">{story.text}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
                <Heart className="text-accent w-6 h-6" fill="currentColor" />
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              </div>
              <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-primary">
                What Our Community Says
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
                Hear from pet owners and animal lovers who have experienced the difference
              </p>
            </div>
            <AnimatedTestimonials
              testimonials={[
                {
                  quote: "FurEver helped me find the perfect companion. The adoption process was smooth and the staff was incredibly supportive. My life has changed for the better!",
                  name: "Sarah Johnson",
                  designation: "Pet Parent",
                  src: "https://cdn.britannica.com/37/91837-050-2CC301F9/Children-pet-dog.jpg"
                },
                {
                  quote: "I reported an injured street dog through the platform and within hours, help arrived. The emergency response team was professional and caring. Thank you for saving lives!",
                  name: "Michael Chen",
                  designation: "Community Volunteer",
                  src: "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?cs=srgb&dl=pexels-helenalopes-2253275.jpg&fm=jpg"
                },
                {
                  quote: "The vet consultation service is amazing! I could get expert advice for my cat without leaving home. The veterinarians are knowledgeable and truly care about animals.",
                  name: "Emily Rodriguez",
                  designation: "Cat Owner",
                  src: "https://www.interflora.in/blog/wp-content/uploads/2024/06/Variety-of-colorful-Pet-friendly-flowers.jpg"
                },
                {
                  quote: "As a volunteer, I've seen firsthand the impact FurEver has on street animals. The food donation program and sterilization drives are making a real difference in our community.",
                  name: "David Thompson",
                  designation: "Animal Welfare Volunteer",
                  src: "https://headsupfortails.com/cdn/shop/articles/MAIN_2.jpg?v=1707734431"
                }
              ]}
              autoplay={true}
            />
          </div>
        </section>

        {/* World Map Section */}
        <section className="py-20 bg-white dark:bg-black relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto text-center mb-12">
              <div className="flex items-center gap-4 mb-6 justify-center">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
                <MapPin className="text-accent w-6 h-6" />
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              </div>
              <p className="font-bold text-xl md:text-4xl dark:text-white text-black mb-4">
                Global{" "}
                <span className="text-neutral-400">
                  {"Pet Community".split("").map((word, idx) => (
                    <motion.span
                      key={idx}
                      className="inline-block"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.04 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              </p>
              <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
                Connect with pet lovers worldwide. Our platform brings together animal welfare advocates, 
                pet owners, and volunteers from every corner of the globe.
              </p>
            </div>
            <WorldMap
              dots={[
                {
                  start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                  end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
                },
                {
                  start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                  end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                },
                {
                  start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                  end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 }, // London
                  end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                },
              ]}
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm rounded-xl p-6 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-2xl text-primary dark:text-white mb-1">50K+</h3>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm rounded-xl p-6 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-2xl text-primary dark:text-white mb-1">120+</h3>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm rounded-xl p-6 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" />
                </div>
                <h3 className="font-bold text-2xl text-primary dark:text-white mb-1">1M+</h3>
                <p className="text-sm text-muted-foreground">Animals Helped</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          data-animate-on-scroll
          className="py-20 bg-gradient-to-br from-accent/30 via-secondary/50 to-accent/20 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.2), transparent 60%)`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,205,185,0.3),transparent_50%)] pointer-events-none"></div>
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(${mousePosition.x * 0.1}deg, #3c4e59 1px, transparent 1px), linear-gradient(${90 + mousePosition.x * 0.1}deg, #3c4e59 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-gradient-to-br from-white to-secondary/50 rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 text-center max-w-5xl mx-auto border border-accent/30 relative overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500">
              <div 
                className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000"
                style={{
                  transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) translateY(-50%) translateX(50%)`,
                }}
              ></div>
              <div 
                className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-1000"
                style={{
                  transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px) translateY(50%) translateX(-50%)`,
                }}
              ></div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-primary">Join Us Today</span>
                </div>
                <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                  Ready to Make a Difference?
                </h2>
                <p className="text-secondary-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Join our community of animal lovers today and help us create a better world for our furry friends.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl px-10 py-6 text-lg transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                  Become a Volunteer
                      <Users className="ml-2 w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </Button>
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 shadow-md hover:shadow-lg px-10 py-6 text-lg transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden backdrop-blur-sm">
                    <span className="relative z-10 flex items-center">
                  Make a Donation
                      <Heart className="ml-2 w-5 h-5 group-hover/btn:scale-110 group-hover/btn:fill-current transition-all duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Bento Grid Section */}
        <section 
          data-animate-on-scroll
          className="py-20 bg-gray-50 dark:bg-gray-950 relative overflow-hidden"
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-400 dark:via-blue-500 to-transparent"></div>
                <PawPrint className="text-blue-500 dark:text-blue-400 w-6 h-6" />
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-400 dark:via-blue-500 to-transparent"></div>
              </div>
              <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-black dark:text-white">
                Our Services
              </h2>
              <p className="text-center text-slate-800 dark:text-slate-200 max-w-2xl mx-auto text-lg font-medium">
                Comprehensive care and support for pets and street animals
              </p>
            </div>

            <BentoGrid className="max-w-7xl mx-auto">
              {/* Emergency Reporting - Large with image */}
              <BentoGridItem
                title="Emergency Reporting"
                description="Report injured street animals for immediate assistance. Our 24/7 response team ensures quick action."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://media.istockphoto.com/id/529121160/photo/sad-labrator-with-broken-leg.jpg?s=612x612&w=0&k=20&c=NfNrf2dDIKlZpIM1xX4t7BabbUfAcxl6bOBVUoVOjRU="
                      alt="Emergency"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
                className="md:col-span-2"
              />

              {/* Vet Consultation with image */}
              <BentoGridItem
                title="Vet Consultation"
                description="Book online or in-person veterinary appointments with certified professionals."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://future-mbbs.com/wp-content/uploads/2024/09/shutterstock_2391795695-scaled.jpg"
                      alt="Vet"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
              />

              {/* Pet Store with image */}
              <BentoGridItem
                title="Pet Store"
                description="Premium food, toys, and accessories for your beloved pets."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://img.lovepik.com/photo/50180/8045.jpg_wh860.jpg"
                      alt="Store"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
              />

              {/* Pet Training with image */}
              <BentoGridItem
                title="Pet Training"
                description="Professional training programs to help your pet learn and grow."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://images.pexels.com/photos/1904103/pexels-photo-1904103.jpeg?cs=srgb&dl=pexels-helenalopes-1904103.jpg&fm=jpg"
                      alt="Training"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
              />

              {/* Pet Grooming with image */}
              <BentoGridItem
                title="Pet Grooming"
                description="Expert grooming services to keep your pet looking and feeling great."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
                      alt="Grooming"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
              />

              {/* Food Donation - Large with image */}
              <BentoGridItem
                title="Food Donation"
                description="Donate leftover pet-friendly food for street animals. Every contribution makes a difference in their lives."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://www.petplate.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fheader.22e20ba9.png&w=3840&q=75"
                      alt="Food"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
                className="md:col-span-2"
              />

              {/* Shelter Locator with image */}
              <BentoGridItem
                title="Shelter Locator"
                description="Find nearby shelters for rescued or injured animals in your area."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group">
                    <Image
                      src="https://m.media-amazon.com/images/I/613qBuu65qL.jpg"
                      alt="Shelter"
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
              />
            </BentoGrid>

            <div className="text-center mt-16">
              <Link href="/street-animals">
                <Button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Explore All Services
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Crazy Footer */}
      <CrazyFooter />
    </div>
  );
}