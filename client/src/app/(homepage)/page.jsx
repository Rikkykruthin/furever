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
import { Home, Heart, Calendar, ArrowRight, PawPrint, Sparkles, TrendingUp, Users, MapPin, AlertTriangle, Star, Zap, Shield, Award } from "lucide-react";

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

      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-accent via-primary to-accent z-50 transition-all duration-150"
        style={{
          width: typeof window !== 'undefined' ? `${Math.min((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%` : '0%',
        }}
      ></div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="relative bg-gradient-to-br from-secondary via-secondary to-accent/20 py-20 md:py-32 overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.15), transparent 50%)`,
          }}
        >
          {/* Enhanced decorative background elements */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) translateY(-50%) translateX(50%)`,
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px) translateY(50%) translateX(-50%)`,
            }}
          ></div>
          
          {/* Animated floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent/30 rounded-full pointer-events-none animate-float"
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/40 to-accent/20 rounded-full text-primary mb-4 shadow-sm backdrop-blur-sm animate-fade-in-scale hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  <span className="text-sm font-medium tracking-wide">Making a difference together</span>
                </div>
                <h1 className="titlefont text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  <span 
                    className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-slide-in-up inline-block"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'rotate-gradient 5s ease infinite',
                    }}
                  >
                  Helping Paws & Creating Smiles
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed relative">
                  <span className="relative z-10">
                  A platform dedicated to street animal welfare and creating a
                  vibrant pet-loving community. Together, we can make a
                  difference in their lives.
                  </span>
                  <span 
                    className="absolute -left-4 top-0 text-6xl text-accent/10 font-serif select-none pointer-events-none"
                    style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
                  >
                    "
                  </span>
                </p>
                <div className="flex flex-wrap gap-4 pt-6">
                  <Button
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                    Report Emergency
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary/5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 px-8 group relative overflow-hidden backdrop-blur-sm">
                    <span className="relative z-10 flex items-center">
                    Adopt a Pet
                      <Heart className="ml-2 w-4 h-4 group-hover:scale-110 group-hover:fill-current transition-all" />
                    </span>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-3 group">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 border-[3px] border-white flex items-center justify-center text-xs font-bold text-white shadow-md hover:scale-110 transition-transform duration-300 hover:z-10 relative cursor-pointer group/avatar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <span className="relative z-10">{i}</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-white/0 group-hover/avatar:from-white/30 group-hover/avatar:to-white/10 transition-all duration-300"></div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-accent/20 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <p className="text-sm text-muted-foreground relative z-10">
                      <span className="font-bold text-primary text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">500+</span> animals helped this month
                    </p>
                    <div className="flex items-center gap-1 mt-1 relative z-10">
                      <TrendingUp className="w-3 h-3 text-green-600 animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">+12% from last month</span>
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

        {/* Street Animal Welfare Section */}
        <section 
          data-animate-on-scroll
          className="py-20 bg-white relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(245, 243, 240, 0.3) ${50 + scrollY * 0.01}%, transparent 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"></div>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #3c4e59 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
                <Heart className="text-accent w-6 h-6" fill="currentColor" />
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              </div>
              <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-primary">
                Street Animal Welfare
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
                Help us make a difference in the lives of street animals through
                our emergency services and welfare programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {emergencyServices.map((service, index) => (
                <Link 
                  key={service.id}
                  href={service.name === "Injury Reporting" ? "/emergency/report" : `/street-animals/${service.id}`}
                  className="block"
                >
                <Card
                  className="group transition-all duration-500 hover:shadow-2xl border-0 overflow-hidden bg-white hover:-translate-y-2 mb-4 relative cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
                  }}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity duration-500 -z-0"></div>
                  
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 group-hover:from-black/80 transition-all duration-500"></div>
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-125"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1 group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="w-3 h-3 animate-pulse" />
                        Emergency
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 z-20">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        <Heart className="text-red-500 w-5 h-5 group-hover:fill-current transition-all duration-300" />
                  </div>
                    </div>
                  </div>
                  <CardContent className="pt-6 pb-6 relative z-10">
                    <CardTitle className="text-xl mb-3 text-primary group-hover:text-accent transition-colors duration-300 flex items-center gap-2">
                      {service.name}
                      <Zap className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </CardTitle>
                    <CardDescription className="text-secondary-foreground mb-6 leading-relaxed">
                      {service.description}
                    </CardDescription>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-accent flex items-center gap-2 p-0 group-hover:gap-3 transition-all duration-300 font-semibold hover:bg-accent/10 rounded-lg px-3 py-2">
                      Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link href="/street-animals">
                <Button className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                  View All Street Animal Services
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pet Services Section */}
        <section 
          data-animate-on-scroll
          className="py-20 bg-gradient-to-b from-secondary/50 via-white to-secondary/30 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.1), transparent 70%)`,
          }}
        >
          <div 
            className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
            }}
          ></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full mb-3">
                  <PawPrint className="w-4 h-4 text-accent" />
                  <span className="text-accent font-semibold text-sm">For Pet Owners</span>
                </div>
                <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold text-primary mt-2">
                  Pet Owner Services
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-accent to-transparent mt-4"></div>
              </div>
              <Link href="/pet-services">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary/5 mt-6 md:mt-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {petServices.map((service, index) => (
                <Card
                  key={service.id}
                  className="group overflow-hidden transition-all duration-500 hover:shadow-2xl bg-white border border-accent/20 hover:border-accent/40 hover:-translate-y-2 mb-4 relative"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:via-accent/5 group-hover:to-accent/10 transition-all duration-500 rounded-lg -z-0"></div>
                  
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 group-hover:animate-pulse" />
                  </div>
                    </div>
                    {/* Badge overlay */}
                    <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                        Popular
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-6 pb-6 relative z-10">
                    <CardTitle className="text-primary text-xl mb-2 group-hover:text-accent transition-colors duration-300 flex items-center gap-2">
                      {service.name}
                      <Shield className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </CardTitle>
                    <p className="text-muted-foreground mt-2 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Button className="bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg w-full transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                      <span className="relative z-10 flex items-center justify-center">
                      Explore
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How You Can Help */}
        <section 
          data-animate-on-scroll
          className="py-24 bg-gradient-to-br from-primary via-primary/95 to-primary text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(60, 78, 89, 1) 0%, rgba(60, 78, 89, 0.95) 50%, rgba(60, 78, 89, 1) 100%), radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.1), transparent 70%)`,
          }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b')] bg-cover bg-center opacity-5"></div>
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transition-all duration-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
            }}
          ></div>
          {/* Animated particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full pointer-events-none animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Join Our Mission</span>
              </div>
              <h2 className="titlefont text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                How You Can Help
              </h2>
              <p className="text-lg md:text-xl mb-4 text-white/90 leading-relaxed">
                There are many ways to make a difference in the lives of animals
                in need. Choose how you'd like to contribute.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
              <div className="group bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-white/10 hover:border-white/30 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/20 group-hover:to-red-500/10 transition-all duration-500 rounded-2xl"></div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                  <Heart className="text-white" size={32} fill="currentColor" />
                </div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Donate</h3>
                <p className="text-white/80 leading-relaxed relative z-10">
                  Support our work with funds that go directly to animal care and rescue operations.
                </p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-white/10 hover:border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all duration-500 rounded-2xl"></div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                  <Calendar className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Volunteer</h3>
                <p className="text-white/80 leading-relaxed relative z-10">
                  Give your time and skills to help animals in need through our regular volunteer programs.
                </p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-white/10 hover:border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/20 group-hover:to-green-500/10 transition-all duration-500 rounded-2xl"></div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                  <Home className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Foster</h3>
                <p className="text-white/80 leading-relaxed relative z-10">
                  Provide a temporary home for animals waiting for adoption. All supplies provided.
                </p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-white/10 hover:border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:to-purple-500/10 transition-all duration-500 rounded-2xl"></div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                  <PawPrint className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Adopt</h3>
                <p className="text-white/80 leading-relaxed relative z-10">
                  Give a forever home to an animal in need of love and care. Change a life forever.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-accent to-accent/90 text-white hover:from-accent/90 hover:to-accent shadow-xl hover:shadow-2xl px-12 py-6 text-lg transition-all duration-300 hover:scale-105">
                Get Involved Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section 
          id="stats"
          ref={statsRef}
          data-animate-on-scroll
          className="py-20 bg-gradient-to-b from-white via-secondary/30 to-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,205,185,0.1),transparent_50%)] pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="titlefont text-3xl md:text-4xl font-bold text-primary mb-3 animate-slide-in-up">Our Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-scale">Numbers that tell our story of compassion and care</p>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
              <div className="group text-center p-6 md:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20 hover:border-accent/40 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/0 group-hover:from-red-50/50 group-hover:to-red-50/30 transition-all duration-500 rounded-2xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
                  <Heart className="text-red-600 w-8 h-8" fill="currentColor" />
              </div>
                <h3 className="text-primary titlefont text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative z-10">
                  {counters.rescued}+
                </h3>
                <p className="text-secondary font-semibold text-lg relative z-10">Animals Rescued</p>
              </div>
              <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20 hover:border-accent/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-green-50/30 transition-all duration-500 rounded-2xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
                  <Home className="text-green-600 w-8 h-8" />
              </div>
                <h3 className="text-primary titlefont text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative z-10">
                  {counters.adopted}+
                </h3>
                <p className="text-secondary font-semibold text-lg relative z-10">Adoptions</p>
              </div>
              <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20 hover:border-accent/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-blue-50/30 transition-all duration-500 rounded-2xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
                  <Users className="text-blue-600 w-8 h-8" />
                </div>
                <h3 className="text-primary titlefont text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative z-10">
                  {counters.volunteers}+
                </h3>
                <p className="text-secondary font-semibold text-lg relative z-10">Volunteers</p>
              </div>
              <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20 hover:border-accent/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-50/0 group-hover:from-purple-50/50 group-hover:to-purple-50/30 transition-all duration-500 rounded-2xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
                  <MapPin className="text-purple-600 w-8 h-8" />
                </div>
                <h3 className="text-primary titlefont text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative z-10">
                  {counters.shelters}+
                </h3>
                <p className="text-secondary font-semibold text-lg relative z-10">Partner Shelters</p>
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
      </main>

      {/* Footer */}
      <footer 
        className="bg-gradient-to-br from-primary via-primary/95 to-primary text-white py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(60, 78, 89, 1) 0%, rgba(60, 78, 89, 0.95) 50%, rgba(60, 78, 89, 1) 100%), radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 205, 185, 0.05), transparent 70%)`,
        }}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b')] bg-cover bg-center opacity-5"></div>
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(${mousePosition.x * 0.05}deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(${90 + mousePosition.x * 0.05}deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="titlefont text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <PawPrint size={24} className="text-accent" />
                </div>
                <span className="bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">FurEver</span>
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Dedicated to improving the lives of animals and creating a
                community of pet lovers.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm group relative overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </a>
                <a
                  href="#"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm group relative overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </a>
                <a
                  href="#"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm group relative overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
                    <path d="M22 4S17.5 8.5 12 8.5 2 4 2 4m20 16.5S17.5 16 12 16s-10 4.5-10 4.5"></path>
                    <path d="M22 4c0 0-7.5 8-10 8s-10-8-10-8"></path>
                    <path d="M2 20.5C2 15 7 8.5 12 8.5s10 6.5 10 12"></path>
                  </svg>
                  <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Street Animals
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/report-emergency"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Report Emergency
                  </Link>
                </li>
                <li>
                  <Link
                    href="/food-donation"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Food Donation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sterilization-drives"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Sterilization Drives
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shelter-locations"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Shelter Locations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/volunteer"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Volunteer
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-accent" />
                Pet Services
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/adoption"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Adoption
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vet-services"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Veterinary Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pet-store"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pet Store
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lost-found"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Lost & Found
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pet-events"
                    className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pet Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                Subscribe
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Stay updated with our newsletter for events, adoption drives and
                more.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                />
                <Button className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Subscribe
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-10 bg-white/20" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/60 text-sm flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-accent" />
              © {new Date().getFullYear()} FurEver. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-white/60 hover:text-white transition-all duration-300 hover:scale-105">
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/60 hover:text-white transition-all duration-300 hover:scale-105">
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-white/60 hover:text-white transition-all duration-300 hover:scale-105">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}