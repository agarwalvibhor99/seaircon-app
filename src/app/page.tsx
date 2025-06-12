'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import React from "react";
import ContactForm from "@/components/ContactForm";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "glass";
  className?: string;
  onClick?: () => void;
}

const Button = ({ children, variant = "primary", className = "", ...props }: ButtonProps) => {
  const baseClasses = "relative overflow-hidden py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl group";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg backdrop-blur-sm",
    secondary: "bg-white/90 backdrop-blur-md text-slate-700 border border-cyan-200 hover:bg-white hover:border-cyan-300 hover:text-cyan-700",
    outline: "border-2 border-white/90 text-white hover:bg-white/20 backdrop-blur-sm",
    glass: "bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25"
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient";
}

const Card = ({ children, className = "", variant = "default" }: CardProps) => {
  const variants = {
    default: "bg-white/95 backdrop-blur-md border border-slate-200/50",
    glass: "bg-white/10 backdrop-blur-xl border border-white/20",
    gradient: "bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-md border border-slate-200/60"
  };

  return (
    <motion.div 
      className={`${variants[variant]} shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] ${className}`}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

// Enhanced Icons with modern design
const AirConditionerIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18v10H3V7zm0-4h18v2H3V3zm4 8h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
    <circle cx="5" cy="5" r="1" fill="currentColor"/>
    <circle cx="19" cy="5" r="1" fill="currentColor"/>
  </svg>
);

const MaintenanceIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const InstallationIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6"/>
  </svg>
);

const RepairIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
  </svg>
);

const TechnicalIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
  </svg>
);

const SmartIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 9l1.5 1.5L15 6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const AwardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
  </svg>
);

const VisionIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
  </svg>
);

const DaikinIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ToshibaIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM4 8.5L12 5l8 3.5v7L12 19l-8-3.5v-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CarrierIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8l1.41 1.41L12 10.83l2.59 2.58L16 12l-4-4-4 4z"/>
  </svg>
);

// Enhanced services data
const services = [
  {
    icon: <AirConditionerIcon />,
    title: "Central Air Conditioning",
    description: "Complete central AC systems for commercial, industrial, and large residential projects with energy-efficient solutions and smart controls.",
    features: ["VRF Systems", "Chiller Plants", "AHU Installation"]
  },
  {
    icon: <RepairIcon />,
    title: "Emergency Repair Services",
    description: "24/7 rapid response repair services for all AC brands. Our certified technicians ensure minimal downtime for your business operations.",
    features: ["24/7 Emergency Service", "All Brand Support", "Same Day Response"]
  },
  {
    icon: <MaintenanceIcon />,
    title: "Annual Maintenance Contracts",
    description: "Comprehensive AMC programs designed to maximize efficiency, extend equipment lifespan, and prevent costly breakdowns with regular inspections.",
    features: ["Preventive Maintenance", "Performance Optimization", "Cost Reduction"]
  },
  {
    icon: <TechnicalIcon />,
    title: "Custom HVAC Design",
    description: "Professional HVAC system design and engineering for commercial buildings, ensuring optimal climate control and maximum energy efficiency.",
    features: ["Custom Engineering", "Energy Analysis", "3D Design"]
  },
  {
    icon: <SmartIcon />,
    title: "Smart Control Solutions",
    description: "Advanced IoT-enabled climate control systems with remote monitoring, automated scheduling, and real-time energy optimization.",
    features: ["IoT Integration", "Remote Monitoring", "Energy Analytics"]
  },
  {
    icon: <InstallationIcon />,
    title: "Industrial HVAC Solutions",
    description: "Specialized HVAC solutions for industrial facilities, including process cooling, clean rooms, and large-scale climate control systems.",
    features: ["Industrial Grade", "Process Cooling", "Clean Room Systems"]
  }
];

const testimonials = [
  {
    quote: "SE Aircon's central air conditioning system for our corporate office has been exceptional. Their partnership with Daikin ensures top-quality equipment and service.",
    name: "Rajesh Kumar",
    role: "Facility Manager",
    company: "Tech Plaza, Mumbai"
  },
  {
    quote: "Their emergency repair service saved our data center during a critical situation. 33 years of experience really shows in their professional approach.",
    name: "Priya Sharma",
    role: "Operations Head",
    company: "DataFlow Solutions"
  },
  {
    quote: "The AMC program has reduced our HVAC costs significantly. SE Aircon's technical expertise and our sister company Rasair Engineers' exclusive Daikin partnership provides excellent support.",
    name: "Amit Patel",
    role: "Building Manager",
    company: "Commercial Complex, Bangalore"
  },
  {
    quote: "Outstanding service quality and cutting-edge Daikin technology. Their smart climate control system has transformed our building management.",
    name: "Sneha Reddy",
    role: "Property Director",
    company: "Corporate Tower, Hyderabad"
  }
];

const stats = [
  { number: "33+", label: "Years Experience", icon: <CalendarIcon /> },
  { number: "₹250M", label: "Projected Turnover", icon: <TrendingIcon /> },
  { number: "1000+", label: "Projects Completed", icon: "🏢" },
  { number: "24/7", label: "Support Available", icon: "❄️" }
];

const SplitACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9h18v6H3V9zm0 0V7a2 2 0 012-2h14a2 2 0 012 2v2M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/>
    <circle cx="7" cy="12" r="1" fill="currentColor"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const WindowACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16v12H4V6zm0 0V4a2 2 0 012-2h12a2 2 0 012 2v2M8 10h8M8 14h8"/>
    <circle cx="6" cy="8" r="1" fill="currentColor"/>
    <circle cx="18" cy="8" r="1" fill="currentColor"/>
  </svg>
);

const CassetteACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 6h12v12H6V6zm0 0l12 12M18 6L6 18"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const DuctableACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8h16M4 8v8h16V8M4 8l4-4h8l4 4M8 12h8M8 14h8"/>
  </svg>
);

const ChillerACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18v10H3V7zm0 0V5a2 2 0 012-2h14a2 2 0 012 2v2M7 11h10M7 13h10"/>
    <circle cx="5" cy="9" r="1" fill="currentColor"/>
    <circle cx="19" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const VRVACIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM12 8v8M8 12h8"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
    <circle cx="16" cy="10" r="1" fill="currentColor"/>
  </svg>
);

const WaterChillerIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6h18v12H3V6zm6 3v6m6-6v6M9 9h6"/>
    <circle cx="7" cy="8" r="1" fill="currentColor"/>
    <circle cx="17" cy="8" r="1" fill="currentColor"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 20h12"/>
  </svg>
);

const AirChillerIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6h18v8H3V6zm0 0V4a2 2 0 012-2h14a2 2 0 012 2v2M7 18v2M12 18v2M17 18v2"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
    <circle cx="16" cy="10" r="1" fill="currentColor"/>
  </svg>
);

const VRFSystemIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4h16v16H4V4zm4 4h8v8H8V8zm2 2v4m4-4v4"/>
    <circle cx="6" cy="6" r="1" fill="currentColor"/>
    <circle cx="18" cy="6" r="1" fill="currentColor"/>
    <circle cx="6" cy="18" r="1" fill="currentColor"/>
    <circle cx="18" cy="18" r="1" fill="currentColor"/>
  </svg>
);

const AHUIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 6h20v12H2V6zm4 3h12M6 12h12M6 15h12"/>
    <circle cx="4" cy="8" r="1" fill="currentColor"/>
    <circle cx="20" cy="8" r="1" fill="currentColor"/>
  </svg>
);

// Enhanced residential products data
const residentialProducts = [
  {
    icon: <SplitACIcon />,
    title: "Split Air Conditioner",
    description: "Elegant and efficient for individual rooms",
    features: ["Energy Star Rated", "Silent Operation", "Smart Controls"],
    applications: "Bedrooms, Living Rooms, Offices",
    capacity: "1.5 - 2.5 Ton"
  },
  {
    icon: <WindowACIcon />,
    title: "Window Air Conditioner", 
    description: "Classic plug-and-play cooling",
    features: ["Easy Installation", "Cost Effective", "Space Saving"],
    applications: "Small Rooms, Studios, Shops",
    capacity: "1 - 2 Ton"
  },
  {
    icon: <CassetteACIcon />,
    title: "Cassette Air Conditioner",
    description: "Discreet ceiling installation for uniform cooling",
    features: ["360° Air Flow", "Ceiling Mounted", "Even Distribution"],
    applications: "Restaurants, Retail Stores, Offices",
    capacity: "2 - 5 Ton"
  },
  {
    icon: <DuctableACIcon />,
    title: "Ductable Air Conditioner",
    description: "Centralized comfort with hidden ducts",
    features: ["Hidden Installation", "Multi-Zone", "Quiet Operation"],
    applications: "Large Homes, Boutiques, Clinics",
    capacity: "3 - 10 Ton"
  },
  {
    icon: <ChillerACIcon />,
    title: "Chiller Air Conditioner",
    description: "High-capacity cooling for mid-size commercial needs",
    features: ["High Efficiency", "Scalable", "Remote Monitoring"],
    applications: "Small Offices, IT Centers, Medical Facilities",
    capacity: "5 - 20 Ton"
  },
  {
    icon: <VRVACIcon />,
    title: "VRV Air Conditioner",
    description: "Versatile, scalable cooling for multi-room setups",
    features: ["Individual Control", "Energy Recovery", "Flexible Design"],
    applications: "Hotels, Apartments, Commercial Buildings",
    capacity: "8 - 50 Ton"
  }
];

// Enhanced building systems data
const buildingSystems = [
  {
    icon: <WaterChillerIcon />,
    title: "Water Cooled Chiller Plant",
    description: "Efficient for large industrial applications",
    features: ["High COP", "Low Operating Cost", "Robust Design"],
    applications: "Manufacturing, Data Centers, Hospitals",
    capacity: "50 - 1000 Ton",
    efficiency: "COP: 5.5 - 6.5"
  },
  {
    icon: <AirChillerIcon />,
    title: "Air Cooled Chiller Plant", 
    description: "Low-maintenance cooling without a water source",
    features: ["No Water Required", "Easy Maintenance", "Quick Installation"],
    applications: "Office Buildings, Shopping Malls, Industries",
    capacity: "20 - 500 Ton",
    efficiency: "COP: 3.2 - 4.2"
  },
  {
    icon: <VRFSystemIcon />,
    title: "VRF Systems",
    description: "Adaptive cooling with individual zone control",
    features: ["Zone Control", "Heat Recovery", "Energy Efficient"],
    applications: "Hotels, Offices, Residential Complexes",
    capacity: "8 - 100 Ton",
    efficiency: "SEER: 14 - 20"
  },
  {
    icon: <AHUIcon />,
    title: "Air Side AHUs",
    description: "Precise air handling for large infrastructures",
    features: ["Custom Design", "HEPA Filtration", "Variable Speed"],
    applications: "Clean Rooms, Pharmaceutical, Industrial",
    capacity: "5000 - 50000 CFM",
    efficiency: "Fan Efficiency: 85%+"
  }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState('residential');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 text-slate-800 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,165,233,0.12)_1px,transparent_0)] [background-size:24px_24px] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="bg-white/85 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-cyan-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">SE</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">SE Aircon Pvt Ltd</span>
                  <p className="text-sm text-slate-600 font-medium">Bringing Comfort to Life</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#home" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">Home</Link>
                <Link href="#about" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">About</Link>
                <Link href="#services" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">Services</Link>
                <Link href="#products" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">Products</Link>
                <Link href="#testimonials" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">Testimonials</Link>
                <Link href="#contact" className="text-slate-700 hover:text-cyan-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-cyan-50">Contact</Link>
                <Button variant="primary" className="ml-4">
                  Get Quote
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-700 hover:text-cyan-600 focus:outline-none transition-colors p-2"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {menuOpen && (
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-cyan-100/50 rounded-b-2xl">
                <Link href="#home" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="#about" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="#services" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>Services</Link>
                <Link href="#products" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>Products</Link>
                <Link href="#testimonials" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>Testimonials</Link>
                <Link href="#contact" className="block text-slate-700 hover:text-cyan-600 px-4 py-3 rounded-xl text-base font-medium transition-colors" onClick={() => setMenuOpen(false)}>Contact</Link>
                <div className="px-4 py-2">
                  <Button variant="primary" className="w-full">Get Quote</Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center py-20 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-300/8 to-blue-400/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/90 backdrop-blur-md border border-cyan-200 text-cyan-700 font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
              Bringing Comfort to Life Since 1990
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Professional HVAC
            </span>
            <br />
            <span className="text-slate-800">Solutions Provider</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-slate-600 font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            With 33 years of experience in the air conditioning industry, we provide top-notch HVAC solutions for residential, commercial, and industrial clients across India.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              variant="primary" 
              className="text-lg px-10 py-4 shadow-2xl"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Request Consultation
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-10 py-4"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Emergency Support
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-cyan-600 mb-2 flex justify-center">{typeof stat.icon === 'string' ? <span className="text-4xl">{stat.icon}</span> : stat.icon}</div>
                <div className="text-3xl font-bold text-cyan-600 mb-1">{stat.number}</div>
                <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                About SE Aircon Pvt Ltd
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Established in 1990 as Shubh Engineers, we are a rapidly expanding company with cutting-edge technology and an expanding business scope in the market.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="h-96">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/15 to-blue-600/15 relative">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                      <TechnicalIcon />
                    </div>
                    <span className="text-slate-800 text-lg font-bold">33 Years of Excellence</span>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full px-3 py-1">
                      <CarrierIcon />
                      <span className="ml-2 text-sm font-bold text-slate-800">Carrier Partner</span>
                    </div>
                    <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full px-3 py-1">
                      <ToshibaIcon />
                      <span className="ml-2 text-sm font-bold text-slate-800">Toshiba Partner</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-slate-800 mb-8">Our Legacy & Vision</h3>
              <div className="space-y-6">
                <p className="text-slate-600 leading-relaxed text-lg">
                  Established in 1990, S E Aircon Pvt. Ltd. (earlier known as Shubh Engineers) focuses exclusively on providing comprehensive air-conditioning solutions through sales and servicing of air conditioners and central air-conditioning projects.
                </p>
                <p className="text-slate-600 leading-relaxed text-lg">
                  As a group with a turnover of ₹200 million, we anticipate reaching ₹250 million in fiscal year 2023-24. Our operations are carried out in collaboration with our sister company, Rasair Engineers Pvt Ltd, which manages our exclusive channel partnership for Daikin Air Conditioning Pvt Ltd.
                </p>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                      <AwardIcon />
                      <span className="ml-2">Our Mission</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed text-lg">
                      To design, install, service, and maintain cost-effective, customized modern refrigeration and air conditioning services while developing long and healthy working relationships with our customers.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                      <VisionIcon />
                      <span className="ml-2">Our Vision</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed text-lg">
                      To be the leading provider of innovative HVAC solutions in India, setting industry standards for quality, efficiency, and customer satisfaction while contributing to sustainable climate control technologies.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Partnership Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card variant="glass" className="p-8 bg-gradient-to-r from-white/95 to-cyan-50/90">
              <div className="flex flex-col space-y-6">
                {/* First Row - Primary Partners */}
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <DaikinIcon />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-lg">Exclusive Channel Partner</h4>
                      <p className="text-slate-600 font-medium">Daikin Air Conditioning Pvt Ltd</p>
                    </div>
                  </div>
                  <div className="text-cyan-600 text-4xl font-bold">---</div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white font-bold text-xl">RE</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-lg">Sister Company</h4>
                      <p className="text-slate-600 font-medium">Rasair Engineers Pvt Ltd</p>
                      <p className="text-slate-500 text-sm">Exclusive Channel Partner - Daikin Air Conditioning</p>
                    </div>
                  </div>
                </div>
                
                {/* Second Row - Additional Partners */}
                <div className="border-t border-slate-200 pt-6">
                  <h5 className="text-lg font-semibold text-slate-800 text-center mb-4">Additional Technology Partners</h5>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <CarrierIcon />
                      </div>
                      <div className="text-left">
                        <h6 className="font-bold text-slate-800">Carrier Partner</h6>
                        <p className="text-slate-600 text-sm">Commercial HVAC Solutions</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <ToshibaIcon />
                      </div>
                      <div className="text-left">
                        <h6 className="font-bold text-slate-800">Toshiba Partner</h6>
                        <p className="text-slate-600 text-sm">Advanced AC Technology</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/60 to-blue-50/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Comprehensive HVAC Services
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              From residential units to large-scale industrial projects, we deliver complete air conditioning solutions
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} variant="gradient" className="group hover:shadow-3xl">
                <CardContent>
                  <div className="text-cyan-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-cyan-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed text-lg">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-slate-600 font-medium">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="secondary" className="w-full group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products & Solutions Section */}
      <section id="products" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/60 to-blue-50/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Section Header */}
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Products & Solutions
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Complete range of air conditioning solutions for every space and requirement
            </motion.p>
          </div>

          {/* Interactive Navigation Tabs */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-cyan-200/50 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveProductTab('residential')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                    activeProductTab === 'residential' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className="text-xl mr-2">❄️</span>
                    <span className="text-sm sm:text-base">Residential & Light Commercial</span>
                  </span>
                  {activeProductTab === 'residential' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveProductTab('building')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                    activeProductTab === 'building' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className="text-xl mr-2">🏢</span>
                    <span className="text-sm sm:text-base">Building Systems</span>
                  </span>
                  {activeProductTab === 'building' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Conditional Content Based on Active Tab */}
          {activeProductTab === 'residential' && (
            <motion.div
              key="residential"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Residential & Light Commercial Solutions */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <span className="text-4xl mb-4 block">❄️</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                    Residential & Light Commercial Solutions
                  </h3>
                  <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Cooling comfort tailored for homes, shops, and small businesses. Explore our smart, energy-efficient air conditioning systems designed for every space and style.
                  </p>
                </motion.div>
                <motion.div
                  className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 border border-cyan-200 text-slate-700 font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-xl mr-2">🌀</span>
                  Hover over each type to learn how it fits your space best!
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {residentialProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="gradient" className="group hover:shadow-3xl cursor-pointer h-full">
                      <CardContent className="relative overflow-hidden">
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 group-hover:from-cyan-500/10 group-hover:to-blue-600/10 transition-all duration-500"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              {product.icon}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                {product.capacity}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-cyan-600 transition-colors">
                            {product.title}
                          </h4>

                          <p className="text-slate-600 mb-4 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="mb-4">
                            <h5 className="font-semibold text-slate-700 mb-2 text-sm">Key Features:</h5>
                            <div className="space-y-1">
                              {product.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center text-sm text-slate-600">
                                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3"></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-slate-50 to-cyan-50 rounded-xl p-4 mb-4">
                            <h5 className="font-semibold text-slate-700 mb-1 text-sm">Best For:</h5>
                            <p className="text-slate-600 text-sm">{product.applications}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                              View Details
                            </Button>
                            <Button variant="primary" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                              Get Quote
                            </Button>
                          </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/5 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Residential CTA */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card variant="gradient" className="p-6 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="md:text-left mb-4 md:mb-0">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">Need Help Choosing?</h4>
                      <p className="text-slate-600 font-medium">Our experts will help you find the perfect cooling solution for your space.</p>
                    </div>
                    <Button variant="primary" className="px-8 py-3">
                      Get Free Consultation
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeProductTab === 'building' && (
            <motion.div
              key="building"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Building Systems & Services */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <span className="text-4xl mb-4 block">🏢</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                    Building Systems & Services
                  </h3>
                  <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Scalable solutions for industrial and large commercial spaces. From robust chiller plants to advanced variable refrigerant systems, we power smart buildings with sustainable, large-scale cooling systems.
                  </p>
                </motion.div>
                <motion.div
                  className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-slate-700 font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-xl mr-2">🔧</span>
                  Tap to view specs, applications, and custom service plans
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
                {buildingSystems.map((system, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card variant="gradient" className="group hover:shadow-3xl cursor-pointer h-full">
                      <CardContent className="relative overflow-hidden">
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 group-hover:from-blue-500/10 group-hover:to-indigo-600/10 transition-all duration-500"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              {system.icon}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {system.capacity}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                            {system.title}
                          </h4>

                          <p className="text-slate-600 mb-4 leading-relaxed">
                            {system.description}
                          </p>

                          <div className="mb-4">
                            <h5 className="font-semibold text-slate-700 mb-2 text-sm">Key Features:</h5>
                            <div className="space-y-1">
                              {system.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center text-sm text-slate-600">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 mb-4">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <h5 className="font-semibold text-slate-700 mb-1 text-sm">Efficiency:</h5>
                                <p className="text-slate-600 text-sm">{system.efficiency}</p>
                              </div>
                              <div>
                                <h5 className="font-semibold text-slate-700 mb-1 text-sm">Best For:</h5>
                                <p className="text-slate-600 text-sm">{system.applications}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                              Technical Specs
                            </Button>
                            <Button variant="primary" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                              Custom Quote
                            </Button>
                          </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </CardContent>
                    </Card>
                </motion.div>
              ))}
              </div>

              {/* Building Systems CTA */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card variant="gradient" className="p-6 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="md:text-left mb-4 md:mb-0">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">Large Scale Project?</h4>
                      <p className="text-slate-600 font-medium">Our engineering team specializes in custom industrial HVAC solutions.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="secondary" className="px-6 py-3">
                        Download Brochure
                      </Button>
                      <Button variant="primary" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                        Schedule Site Visit
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.2),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.2),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Client Success Stories
            </motion.h2>
            <motion.p
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Trusted by leading enterprises and organizations across India for over three decades
            </motion.p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card variant="glass" className="backdrop-blur-xl">
              <CardContent className="p-12">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed text-white">
                    &quot;{testimonials[currentTestimonial].quote}&quot;
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {testimonials[currentTestimonial].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <cite className="text-xl font-bold text-cyan-200">
                        {testimonials[currentTestimonial].name}
                      </cite>
                      <p className="text-cyan-300 font-medium">{testimonials[currentTestimonial].role}</p>
                      <p className="text-cyan-400 text-sm font-medium">{testimonials[currentTestimonial].company}</p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-white scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Ready to Experience Comfort?
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Connect with our HVAC experts for a comprehensive consultation and customized solution proposal
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-slate-800 mb-8">Get in Touch</h3>
              <div className="space-y-8">
                {[
                  {
                    icon: <PhoneIcon />,
                    title: "Phone Support",
                    content: "+91 9311885464",
                    // subtitle: "24/7 Emergency Support Available"
                  },
                  {
                    icon: <EmailIcon />,
                    title: "Business Inquiries",
                    content: "noida@seaircon.com",
                    subtitle: "Response within 2 hours"
                  },
                  {
                    icon: <LocationIcon />,
                    title: "Corporate Office",
                    content: "G-313, Sector 63",
                    subtitle: "Noida, UP 201301 - India"
                  }
                ].map((contact, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {contact.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{contact.title}</h4>
                      <p className="text-slate-700 font-bold">{contact.content}</p>
                      <p className="text-slate-600 text-sm font-medium">{contact.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">SE</span>
                </div>
                <div>
                                   <span className="text-2xl font-bold">SE Aircon Pvt Ltd</span>
                  <p className="text-cyan-200 text-sm font-medium">Bringing Comfort to Life</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4 font-medium">
                Leading provider of comprehensive air conditioning solutions with 33 years of industry expertise and Daikin partnership.
              </p>
              <div className="flex items-center text-sm text-cyan-200 font-medium">
                <CalendarIcon />
                <span className="ml-2">Est. 1990 | 33+ Years Experience</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-200">Our Services</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Central Air Conditioning</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Emergency Repair Services</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Annual Maintenance Contracts</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Industrial HVAC Solutions</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Custom System Design</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-200">Company</h3>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="#about" className="hover:text-white transition-colors font-medium">About Us</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors font-medium">Our Services</Link></li>
                <li><Link href="#testimonials" className="hover:text-white transition-colors font-medium">Client Stories</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors font-medium">Contact</Link></li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-200">Connect With Us</h3>
              <div className="space-y-4 text-slate-300">
                <p className="flex items-center font-medium">
                  <PhoneIcon />
                  <span className="ml-3">+91 9311885464</span>
                </p>
                <p className="flex items-center font-medium">
                  <EmailIcon />
                  <span className="ml-3">noida@seaircon.com</span>
                </p>
                <p className="flex items-start font-medium">
                  <LocationIcon />
                  <span className="ml-3">G-313, Sector 63<br />Noida, UP 201301 - India</span>
                </p>
                <div className="flex items-center pt-2">
                  <DaikinIcon />
                  <span className="ml-3 text-sm font-bold text-cyan-200">Daikin Exclusive Channel Partner</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center">
            <p className="text-slate-400 font-medium">
              &copy; 2025 SE Aircon Pvt Ltd. All rights reserved. | Transforming spaces with intelligent climate solutions since 1990.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
