"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sun, Moon, Bell, User, Video, Globe, ChevronLeft, ChevronRight, 
  Mail, Phone, MapPin, ArrowRight, Clock, Menu, X, Award, BookOpen, 
  HelpCircle, LogOut, Check, ChevronDown, MessageSquare, Shield, BookOpenCheck, LayoutDashboard, FileText,
  Target, Heart
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import clsx from "clsx";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { createEnrollmentCheckoutSession } from "../lib/payment.api";

// English and Bengali Translations
const t = {
  en: {
    logo: "RAS Academic Point",
    home: "Home",
    classes: "Classes",
    programs: "Programs",
    services: "Services",
    gallery: "Gallery",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",
    dashboard: "Dashboard",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    langBn: "Bengali",
    langEn: "English",
    heroCTA1: "Explore Classes",
    heroCTA2: "Contact Us",
    explorePortals: "Access Our Portals",
    portalsSub: "Choose your workspace to manage classes, results, and support sessions.",
    studentPortal: "Student Portal",
    studentPortalDesc: "Join classrooms, book 1-to-1 help sessions, and view your exam results.",
    teacherPortal: "Teacher Portal",
    teacherPortalDesc: "Manage schedules, call queued students, and record exam marks.",
    guardianPortal: "Guardian Portal",
    guardianPortalDesc: "Track your child's attendance rate, results, and pay tuition fees.",
    signUpCTA: "Sign Up Here",
    enterPortal: "Enter Portal",
    ourClasses: "Our Classes",
    filterAll: "All Classes",
    classCardDetails: "View Course Details",
    classFeatures: "Key Course Features:",
    teachersFeature: "Experienced Teachers",
    examsFeature: "Monthly Prep Exams",
    materialsFeature: "Digital Study Materials",
    trackingFeature: "Real-time Tracking",
    ourPrograms: "Our Programs",
    learnMore: "Learn More",
    ourServices: "Our Services",
    servicesSub: "Comprehensive tools for student advancement and parent feedback.",
    skillVideos: "Skill Development Videos",
    skillSub: "Master presentation, time management, and critical thinking.",
    watchVideo: "Watch Video",
    ourGallery: "Our Campus Gallery",
    gallerySub: "Glimpses of student achievements, educational tours, and interactive learning.",
    contactUs: "Contact Us",
    contactSub: "Have questions? Write to us or visit our academic branch.",
    addressLabel: "Address",
    addressVal: "House 45, Road 12, Sector 4, Uttara, Dhaka, Bangladesh",
    phoneLabel: "Phone",
    emailLabel: "Email",
    hoursLabel: "Office Hours",
    hoursVal: "Saturday - Thursday: 09:00 AM - 08:00 PM",
    formName: "Full Name",
    formEmail: "Email Address",
    formPhone: "Phone Number",
    formMsg: "Your Message",
    sendMsg: "Send Message",
    submitting: "Submitting...",
    successMsg: "Thank you! Your message has been sent successfully.",
    notLoggedIn: "Please log in to access this portal section.",
    notifications: "Notifications",
    noNotifications: "No new notifications.",
    markRead: "Mark all as read",
    close: "Close",
    enrollNow: "Enroll Now",
    enterClass: "Enter Class",
    knowDetails: "Know Details"
  },
  bn: {
    logo: "রাস একাডেমিক পয়েন্ট",
    home: "হোম",
    classes: "ক্লাস সমূহ",
    programs: "প্রোগ্রাম সমূহ",
    services: "সেবা সমূহ",
    gallery: "গ্যালারি",
    contact: "যোগাযোগ",
    login: "লগইন",
    register: "নিবন্ধন",
    logout: "লগআউট",
    profile: "প্রোফাইল",
    dashboard: "ড্যাশবোর্ড",
    themeLight: "লাইট মোড",
    themeDark: "ডার্ক মোড",
    langBn: "বাংলা",
    langEn: "ইংরেজি",
    heroCTA1: "ক্লাস সমূহ দেখুন",
    heroCTA2: "যোগাযোগ করুন",
    explorePortals: "আমাদের পোর্টাল সমূহ",
    portalsSub: "ক্লাস, রেজাল্ট এবং সাপোর্ট সেশন পরিচালনা করতে আপনার পোর্টালটি নির্বাচন করুন।",
    studentPortal: "শিক্ষার্থী পোর্টাল",
    studentPortalDesc: "ক্লাসরুমে যোগ দিন, ওয়ান-টু-ওয়ান সাহায্য বুক করুন এবং পরীক্ষার ফলাফল দেখুন।",
    teacherPortal: "শিক্ষক পোর্টাল",
    teacherPortalDesc: "সময়সূচী পরিচালনা করুন, লাইভ সাপোর্ট কল শুরু করুন এবং পরীক্ষার নম্বর লিখুন।",
    guardianPortal: "অভিভাবক পোর্টাল",
    guardianPortalDesc: "আপনার সন্তানের উপস্থিতি, ফলাফল ট্র্যাক করুন এবং টিউশন ফি প্রদান করুন।",
    signUpCTA: "এখানে নিবন্ধন করুন",
    enterPortal: "পোর্টালে প্রবেশ করুন",
    ourClasses: "আমাদের ক্লাস সমূহ",
    filterAll: "সকল ক্লাস",
    classCardDetails: "বিস্তারিত দেখুন",
    classFeatures: "কোর্সের মূল বৈশিষ্ট্য সমূহ:",
    teachersFeature: "অভিজ্ঞ শিক্ষক মণ্ডলী",
    examsFeature: "মাসিক প্রস্তুতি পরীক্ষা",
    materialsFeature: "ডিজিটাল স্টাডি ম্যাটেরিয়ালস",
    trackingFeature: "রিয়েল-টাইম ট্র্যাকিং",
    ourPrograms: "আমাদের প্রোগ্রাম সমূহ",
    learnMore: "বিস্তারিত জানুন",
    ourServices: "আমাদের সেবা সমূহ",
    servicesSub: "শিক্ষার্থীদের অগ্রগতি এবং অভিভাবকদের ফিডব্যাকের জন্য সমন্বিত টুলস।",
    skillVideos: "দক্ষতা উন্নয়ন মূলক ভিডিও",
    skillSub: "প্রেজেন্টেশন, সময় ব্যবস্থাপনা এবং সমালোচনামূলক চিন্তা আয়ত্ত করুন।",
    watchVideo: "ভিডিওটি দেখুন",
    ourGallery: "ক্যাম্পাস গ্যালারি",
    gallerySub: "শিক্ষার্থীদের কৃতিত্ব, শিক্ষাসফর এবং ইন্টারঅ্যাক্টিভ ক্লাসের কিছু মুহূর্ত।",
    contactUs: "যোগাযোগ করুন",
    contactSub: "কোনো প্রশ্ন আছে? আমাদের লিখুন অথবা সরাসরি আমাদের শাখায় চলে আসুন।",
    addressLabel: "ঠিকানা",
    addressVal: "বাসা ৪৫, রোড ১২, সেক্টর ৪, উত্তরা, ঢাকা, বাংলাদেশ",
    phoneLabel: "ফোন",
    emailLabel: "ইমেইল",
    hoursLabel: "অফিস সময়",
    hoursVal: "শনিবার - বৃহস্পতিবার: সকাল ০৯:০০ - রাত ০৮:০০ টা",
    formName: "আপনার নাম",
    formEmail: "ইমেইল ঠিকানা",
    formPhone: "ফোন নম্বর",
    formMsg: "আপনার বার্তা",
    sendMsg: "বার্তা পাঠান",
    submitting: "পাঠানো হচ্ছে...",
    successMsg: "ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।",
    notLoggedIn: "দয়া করে এই পোর্টালটি ব্যবহার করতে লগইন করুন।",
    notifications: "নোটিফিকেশন সমূহ",
    noNotifications: "কোনো নতুন নোটিফিকেশন নেই।",
    markRead: "পঠিত হিসেবে চিহ্নিত করুন",
    close: "বন্ধ করুন",
    enrollNow: "ভর্তি হোন",
    enterClass: "ক্লাসে প্রবেশ করুন",
    knowDetails: "বিস্তারিত জানুন"
  }
};

const classData = [
  {
    id: "class-8",
    nameEn: "Class 8 Academic Program",
    nameBn: "অষ্টম শ্রেণী একাডেমিক প্রোগ্রাম",
    filter: "Class 8",
    image: "/classeight.png?w=600&auto=format&fit=crop&q=80",
    descEn: "Complete curriculum preparation for school finals and foundation development.",
    descBn: "স্কুল ফাইনাল এবং মৌলিক মেধা বিকাশের জন্য সম্পূর্ণ সিলেবাস প্রস্তুতি।",
    subjectsEn: "Mathematics, Science, English, ICT, Bangla",
    subjectsBn: "গণিত, বিজ্ঞান, ইংরেজি, আইসিটি, বাংলা",
    scheduleEn: "Mon, Wed, Fri - 04:00 PM to 06:00 PM",
    scheduleBn: "সোম, বুধ, শুক্র - বিকাল ০৪:০০ থেকে সন্ধ্যা ০৬:০০",
    beamColor: "#3b82f6",
    bgClass: "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20",
    priceEn: "2,000 BDT",
    priceBn: "২,০০০ টাকা",
    amount: 2000
  },
  {
    id: "class-9",
    nameEn: "Class 9 Science & Commerce",
    nameBn: "নবম শ্রেণী বিজ্ঞান ও ব্যবসায় শিক্ষা",
    filter: "Class 9",
    image: "/classnine.png?w=600&auto=format&fit=crop&q=80",
    descEn: "Core concepts building in Physics, Chemistry, Biology, Math and Business studies.",
    descBn: "পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, গণিত এবং ব্যবসায় শিক্ষার মূল ধারণা গঠন।",
    subjectsEn: "Physics, Chemistry, Higher Math, Biology, Accounting",
    subjectsBn: "পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান, হিসাববিজ্ঞান",
    scheduleEn: "Sat, Sun, Tue - 03:30 PM to 05:30 PM",
    scheduleBn: "শনি, রবি, মঙ্গল - দুপুর ০৩:৩০ থেকে বিকাল ০৫:৩০",
    beamColor: "#f97316",
    bgClass: "bg-orange-50/40 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/20",
    priceEn: "2,500 BDT",
    priceBn: "২,৫০০ টাকা",
    amount: 2500
  },
  {
    id: "ssc-batch",
    nameEn: "SSC Special Target Batch",
    nameBn: "এসএসসি স্পেশাল টার্গেট ব্যাচ",
    filter: "SSC Batch",
    image: "/ssc.png?w=600&auto=format&fit=crop&q=80",
    descEn: "Intensive model test program, test paper solving, and target GPA 5.00 guides.",
    descBn: "নিবিড় মডেল টেস্ট প্রোগ্রাম, টেস্ট পেপার সলভিং এবং গোল্ডেন জিপিএ-৫ গাইডলাইন।",
    subjectsEn: "All Board Compulsory & Group Subjects",
    subjectsBn: "সকল বোর্ড আবশ্যিক এবং গ্রুপ ভিত্তিক বিষয় সমূহ",
    scheduleEn: "Daily Class & Exams - 02:00 PM to 05:00 PM",
    scheduleBn: "প্রতিদিন ক্লাস ও পরীক্ষা - দুপুর ০২:০০ থেকে বিকাল ০৫:০০",
    beamColor: "#10b981",
    bgClass: "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20",
    priceEn: "3,000 BDT",
    priceBn: "৩,০০০ টাকা",
    amount: 3000
  }
];

const programData = [
  {
    id: "prep",
    nameEn: "Exam Preparation Program",
    nameBn: "পরীক্ষা প্রস্তুতি প্রোগ্রাম",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    descEn: "Regular mock tests and board question solving batches to maximize exam readiness.",
    descBn: "পরীক্ষার প্রস্তুতি বাড়ানোর জন্য নিয়মিত মক টেস্ট এবং বোর্ড প্রশ্ন সমাধান ব্যাচ।"
  },
  {
    id: "tour",
    nameEn: "Annual Educational Tour",
    nameBn: "বার্ষিক শিক্ষাসফর",
    image: "https://www.bracu.ac.bd/sites/default/files/news-image/Study%20tours%20of%20Curzon%20Hall%2C%20Institute%20of%20Fine%20Arts%20and%20Panam%20Nagar%20by%20ARC%20101%20students%202.jpg?w=600&auto=format&fit=crop&q=80",
    descEn: "Exploring historic sites and museums to build practical knowledge and refresh minds.",
    descBn: "বাস্তব জ্ঞান অর্জন এবং মন সতেজ করতে ঐতিহাসিক স্থান ও জাদুঘর ভ্রমণ।"
  },
  {
    id: "scholar",
    nameEn: "Scholarship Program",
    nameBn: "মেধা বৃত্তি প্রোগ্রাম",
    image: "https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Nob2xhcnNoaXAlMjBleGFtfGVufDB8fDB8fHww?w=600&auto=format&fit=crop&q=80",
    descEn: "Waving fees and awarding financial assistance to top scorers and underprivileged talents.",
    descBn: "শীর্ষ স্কোরার এবং সুবিধাবঞ্চিত মেধাবীদের জন্য সম্পূর্ণ ফ্রি পড়ার ব্যবস্থা এবং আর্থিক পুরষ্কার।"
  }
];

const serviceData = [
  { id: "teacher", icon: Award, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80", titleEn: "Best Teacher Panel", titleBn: "সেরা শিক্ষক মন্ডলী", descEn: "Highly experienced mentors.", descBn: "দক্ষ ও অভিজ্ঞ শিক্ষক মন্ডলী।" },
  { id: "support", icon: Clock, image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80", titleEn: "Daily Support Sessions", titleBn: "প্রতিদিনের সাপোর্ট সেশন", descEn: "Live queue doubt solving daily.", descBn: "লাইভ কিউতে প্রতিদিন ডাউট সলভিং।" },
  { id: "one-one", icon: HelpCircle, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80", titleEn: "1-to-1 Support Session", titleBn: "১:১ সাপোর্ট সেশন", descEn: "Private slots bookable directly.", descBn: "সরাসরি বুকিং যোগ্য প্রাইভেট স্লট।" },
  { id: "monitor", icon: Shield, image: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&auto=format&fit=crop&q=80", titleEn: "Guardian Monitoring Panel", titleBn: "অভিভাবক মনিটরিং প্যানেল", descEn: "Track ward's attendance and grades.", descBn: "সন্তানের উপস্থিতি ও ফলাফল মনিটরিং।" },
  { id: "progress", icon: BookOpenCheck, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80", titleEn: "Online Progress Tracking", titleBn: "অনলাইন প্রগ্রেস ট্র্যাকিং", descEn: "Interactive visual attendance graphs.", descBn: "উন্নতি পর্যবেক্ষণে ভিজ্যুয়াল চার্ট।" },
  { id: "result", icon: FileText, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80", titleEn: "Online Result Card", titleBn: "অনলাইন রেজাল্ট কার্ড", descEn: "Check written, MCQ & practical scores.", descBn: "লিখিত, এমসিকিউ ও প্র্যাক্টিক্যাল নম্বর দেখুন।" },
  { id: "doubt", icon: MessageSquare, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80", titleEn: "Doubt Solving Support", titleBn: "প্রশ্ন সমাধান সাপোর্ট", descEn: "Submit questions to online teachers.", descBn: "অনলাইন শিক্ষকদের কাছে সমস্যা জমা দিন।" },
  { id: "resources", icon: BookOpen, image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80", titleEn: "Digital Resources", titleBn: "ডিজিটাল রিসোর্স সমূহ", descEn: "Access lectures and materials.", descBn: "লেকচার শিট ও স্টাডি মেটেরিয়ালস।" }
];

const videoData = [
  { id: "v1", titleEn: "Public Speaking & Confidence", titleBn: "পাবলিক স্পিকিং ও আত্মবিশ্বাস", descEn: "Learn to project your voice and deliver speeches with confidence.", descBn: "কণ্ঠস্বর নিয়ন্ত্রণ এবং আত্মবিশ্বাসের সাথে বক্তৃতা দিতে শিখুন।", embedId: "tshb1kZ1XgM" },
  { id: "v2", titleEn: "Time Management Hacks", titleBn: "সময় ব্যবস্থাপনার কৌশল", descEn: "Optimize your study schedules and minimize daily procrastination.", descBn: "পড়ার রুটিন অপ্টিমাইজ করুন এবং অলসতা দূর করার হ্যাকস শিখুন।", embedId: "iA7h55_Xg4c" }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80"
];

const heroSlides = [
  {
    image: "/rasAcademicBanner.png?w=1200&auto=format&fit=crop&q=80",
    titleEn: "Empowering Students for Academic Excellence",
    titleBn: "পড়ো তোমার প্রভুর নামে",
    descEn: "RAS Academic Point is a leading coaching center specializing in Class 8, Class 9, and SSC preparation.",
    descBn: "রাস একাডেমিক পয়েন্ট ক্লাস ৮, ক্লাস ৯ এবং এসএসসি প্রস্তুতির জন্য একটি শীর্ষস্থানীয় প্রতিষ্ঠান।"
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop&q=80",
    titleEn: "Daily Doubt Solving & Live Support Sessions",
    titleBn: "প্রতিদিনের ডাউট সলভিং এবং লাইভ সাপোর্ট সেশন",
    descEn: "Get real-time guidance from expert teachers with interactive queues.",
    descBn: "ইন্টারেক্টিভ কিউ সহ অভিজ্ঞ শিক্ষকদের কাছ থেকে রিয়েল-টাইম প্রশ্ন সমাধান।"
  },
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
    titleEn: "Live Parent Monitoring Dashboard",
    titleBn: "অভিভাবকদের জন্য লাইভ মনিটরিং ড্যাশবোর্ড",
    descEn: "Track attendance, exam grades, and payments transparently.",
    descBn: "স্বচ্ছতার সাথে উপস্থিতি, পরীক্ষার গ্রেড এবং টিউশন ফি পেমেন্ট ট্র্যাক করুন।"
  }
];

const steps = [
  {
    step: 1,
    titleEn: "Set Clear Goals",
    titleBn: "লক্ষ্য নির্ধারণ",
    descEn: "Define specific, measurable, and realistic academic targets.",
    descBn: "আপনার পড়াশোনা এবং পরীক্ষার জন্য সুনির্দিষ্ট ও বাস্তবসম্মত লক্ষ্য নির্ধারণ করুন।",
    icon: Target,
  },
  {
    step: 2,
    titleEn: "Study Consistently",
    titleBn: "নিয়মিত পড়াশোনা",
    descEn: "Set aside dedicated study hours every single day.",
    descBn: "প্রতিদিন নির্দিষ্ট সময় মনোযোগ দিয়ে পড়াশোনা করুন।",
    icon: BookOpen,
  },
  {
    step: 3,
    titleEn: "Practice & Revise Regularly",
    titleBn: "অনুশীলন ও পুনরাবৃত্তি",
    descEn: "Reinforce your learning by solving test papers frequently.",
    descBn: "পঠিত বিষয় বারবার রিভিশন ও প্র্যাকটিস করুন।",
    icon: FileText,
  },
  {
    step: 4,
    titleEn: "Manage Time Effectively",
    titleBn: "সময় ব্যবস্থাপনা",
    descEn: "Balance study sessions, rest, and exam schedules wisely.",
    descBn: "পড়ালেখা ও বিশ্রামের সময় সঠিকভাবে বন্টন করুন।",
    icon: Clock,
  },
  {
    step: 5,
    titleEn: "Maintain Health & Focus",
    titleBn: "সুস্থ শরীর ও মন",
    descEn: "Stay physically active, sleep well, and keep a positive mindset.",
    descBn: "পর্যাপ্ত ঘুম, পুষ্টিকর খাবার ও মানসিক প্রশান্তি বজায় রাখুন।",
    icon: Heart,
  },
  {
    step: 6,
    titleEn: "Achievement",
    titleBn: "সাফল্য অর্জন",
    descEn: "Reach your destination with target GPA 5.0 and success.",
    descBn: "পরীক্ষায় কাঙ্ণ্ডিত জিপিএ ৫ এবং চমৎকার ফলাফল লাভ।",
    icon: Award,
  }
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Refs and States for 5 Steps Roadmap animation
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement | null>(null);
  const mobilePathRef = useRef<SVGPathElement | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isInView, setIsInView] = useState(false);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (loading) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("IntersectionObserver entry isIntersecting:", entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [loading]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [isProcessingEnroll, setIsProcessingEnroll] = useState<string | null>(null);

  const handleEnroll = async (classId: string, amount: number) => {
    if (!token || !user) {
      toast.error(isBengali ? "ভর্তি হতে দয়া করে প্রথমে লগইন করুন।" : "Please log in first to enroll.");
      router.push(`/login?redirect=enroll&classId=${classId}`);
      return;
    }

    if (user.role !== "STUDENT") {
      toast.error(isBengali ? "শুধুমাত্র শিক্ষার্থীরা কোর্সে ভর্তি হতে পারবে।" : "Only students can enroll in courses.");
      return;
    }

    try {
      setIsProcessingEnroll(classId);
      const data = await createEnrollmentCheckoutSession(classId, amount);
      if (data.checkoutUrl) {
        toast.loading(isBengali ? "পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে..." : "Redirecting to secure payment portal...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(isBengali ? "পেমেন্ট সেশন তৈরি করতে ব্যর্থ হয়েছে।" : "Failed to create checkout session.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || (isBengali ? "সার্ভার ত্রুটি ঘটেছে।" : "Internal server error occurred."));
    } finally {
      setIsProcessingEnroll(null);
    }
  };

  useEffect(() => {
    if (isInView) {
      animate(0, 1, {
        duration: 6,
        times: [0, 0.85, 1],
        ease: ["easeOut", "easeIn"],
        onUpdate: (v) => {
          progress.set(v);
          
          // Desktop updates
          const d0 = getPointAt(desktopPathRef, v, 0, { x: 200, y: 100 });
          const d1 = getPointAt(desktopPathRef, v, 0.02, { x: 200, y: 100 });
          const d2 = getPointAt(desktopPathRef, v, 0.045, { x: 200, y: 100 });
          desktopX.set(d0.x);
          desktopY.set(d0.y);
          desktopTrailX1.set(d1.x);
          desktopTrailY1.set(d1.y);
          desktopTrailX2.set(d2.x);
          desktopTrailY2.set(d2.y);

          // Mobile updates
          const m0 = getPointAt(mobilePathRef, v, 0, { x: 100, y: 100 });
          const m1 = getPointAt(mobilePathRef, v, 0.02, { x: 100, y: 100 });
          const m2 = getPointAt(mobilePathRef, v, 0.045, { x: 100, y: 100 });
          mobileX.set(m0.x);
          mobileY.set(m0.y);
          mobileTrailX1.set(m1.x);
          mobileTrailY1.set(m1.y);
          mobileTrailX2.set(m2.x);
          mobileTrailY2.set(m2.y);
        },
        onComplete: () => {
          setIsCompleted(true);
        }
      });
    }
  }, [isInView]);

  // True path-following lookup: real SVG geometry via getTotalLength + getPointAtLength
  const getPointAt = (
    pathRef: React.RefObject<SVGPathElement | null>,
    value: number,
    lag: number,
    fallback: { x: number; y: number }
  ) => {
    try {
      const path = pathRef.current;
      if (!path) {
        return fallback;
      }
      const length = path.getTotalLength();
      if (!length) {
        return fallback;
      }
      const t = Math.min(1, Math.max(0, value - lag));
      const pt = path.getPointAtLength(t * length);
      return pt;
    } catch (e) {
      return fallback;
    }
  };

  // Desktop dot + trail
  const desktopX = useMotionValue(200);
  const desktopY = useMotionValue(100);
  const desktopTrailX1 = useMotionValue(200);
  const desktopTrailY1 = useMotionValue(100);
  const desktopTrailX2 = useMotionValue(200);
  const desktopTrailY2 = useMotionValue(100);

  // Mobile dot + trail
  const mobileX = useMotionValue(100);
  const mobileY = useMotionValue(100);
  const mobileTrailX1 = useMotionValue(100);
  const mobileTrailY1 = useMotionValue(100);
  const mobileTrailX2 = useMotionValue(100);
  const mobileTrailY2 = useMotionValue(100);

  // Localization and theme states
  const [isBengali, setIsBengali] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Class filters state
  const [classFilter, setClassFilter] = useState("All");

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState([
    { id: 1, textEn: "Admission open for Class 8 & 9 batch 2026!", textBn: "২০২৬ সালের ৮ম ও ৯ম শ্রেণীর ব্যাচে ভর্তি চলছে!", unread: true },
    { id: 2, textEn: "Final model test schedule published.", textBn: "ফাইনাল মডেল টেস্টের সময়সূচী প্রকাশ করা হয়েছে।", unread: true },
    { id: 3, textEn: "Next educational tour registration deadline is Friday.", textBn: "পরবর্তী শিক্ষাসফরের নিবন্ধনের শেষ সময় শুক্রবার।", unread: false }
  ]);

  // Profile and Register dropdown states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);

  // Selected Detail Modal states (fallback overlays)
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Contact form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Carousel timer ref
  const slideTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Read local storage settings
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const storedLang = localStorage.getItem("isBengali");
    if (storedLang === "false") setIsBengali(false);

    const storedTheme = localStorage.getItem("isDarkMode");
    if (storedTheme === "true") setIsDarkMode(true);

    setLoading(false);

    // Auto-carousel transition
    startSlideTimer();

    return () => {
      stopSlideTimer();
    };
  }, []);

  useEffect(() => {
    if (loading || !token || !user) return;

    const params = new URLSearchParams(window.location.search);
    const enrollClassId = params.get("enroll");
    if (enrollClassId) {
      const match = classData.find(c => c.id === enrollClassId);
      if (match) {
        // Remove parameter from URL first to prevent loop on reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        handleEnroll(match.id, match.amount);
      }
    }
  }, [loading, token, user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const startSlideTimer = () => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  const stopSlideTimer = () => {
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
    }
  };

  const handleNextSlide = () => {
    stopSlideTimer();
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    startSlideTimer();
  };

  const handlePrevSlide = () => {
    stopSlideTimer();
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    startSlideTimer();
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setShowProfileMenu(false);
    toast.success(isBengali ? "সফলভাবে লগআউট করা হয়েছে।" : "Logged out successfully!");
    router.push("/");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone || !formMsg) {
      return toast.error(isBengali ? "সবগুলো তথ্য পূরণ করুন।" : "Please fill in all form fields.");
    }
    setIsFormSubmitting(true);
    setTimeout(() => {
      setIsFormSubmitting(false);
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormMsg("");
      toast.success(isBengali ? t.bn.successMsg : t.en.successMsg);
    }, 1500);
  };

  const handleEnterPortal = (targetRole: string) => {
    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (user.role === targetRole) {
      router.push("/dashboard");
    } else {
      toast.error(
        isBengali 
          ? `আপনি ${user.role} হিসেবে লগইন আছেন। এই পোর্টালে প্রবেশ করতে পারবেন না।` 
          : `You are logged in as ${user.role}. You cannot access the ${targetRole} Portal.`
      );
    }
  };

  const handleServiceClick = (serviceId: string) => {
    if (!token || !user) {
      toast.error(isBengali ? t.bn.notLoggedIn : t.en.notLoggedIn);
      router.push("/login");
      return;
    }

    if (serviceId === "support") {
      router.push("/dashboard/support");
    } else if (serviceId === "one-one") {
      if (user.role === "STUDENT") {
        router.push("/dashboard/student/booking");
      } else if (user.role === "TEACHER") {
        router.push("/dashboard/teacher/booking");
      } else {
        toast.error(
          isBengali 
            ? "শুধুমাত্র ছাত্র-ছাত্রী এবং শিক্ষকগণ ১:১ সাপোর্ট সেশন ব্যবহার করতে পারবেন।" 
            : "Only students and teachers can access 1-to-1 support sessions."
        );
      }
    } else if (serviceId === "result") {
      router.push("/dashboard/results");
    } else if (serviceId === "monitor") {
      if (user.role === "GUARDIAN") {
        router.push("/dashboard/guardian");
      } else {
        toast.error(
          isBengali 
            ? "শুধুমাত্র অভিভাবকগণ অভিভাবক প্যানেল ব্যবহার করতে পারবেন।" 
            : "Only guardians can access the Guardian Monitoring Panel."
        );
      }
    } else {
      router.push("/dashboard");
    }
  };

  const handleMarkAllRead = () => {
    setNotifList(notifList.map(n => ({ ...n, unread: false })));
  };

  const toggleLanguage = () => {
    const nextLang = !isBengali;
    setIsBengali(nextLang);
    localStorage.setItem("isBengali", String(nextLang));
  };

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem("isDarkMode", String(nextTheme));
  };

  const unreadCount = notifList.filter(n => n.unread).length;
  const currentLang = isBengali ? t.bn : t.en;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center text-text-main">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-sec font-medium">Loading website...</p>
        </div>
      </div>
    );
  }

  // Filtered classes
  const filteredClasses = classData.filter(c => classFilter === "All" || c.filter === classFilter);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "dark" : ""} bg-bg-main text-text-main`}>
      <Toaster position="top-center" />
      
      {/* Styles for Infinite Loop Marquee & Border Beam */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .border-beam-card {
          position: relative;
          z-index: 0;
        }
        .border-beam-glow {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2.5px;
          background: transparent;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          z-index: 10;
          overflow: hidden;
        }
        .border-beam-glow::after {
          content: "";
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 70%,
            var(--beam-color, #10b981) 85%,
            transparent 98%,
            transparent 100%
          );
          animation: spin 6s linear infinite;
        }
      `}} />

      {/* 1. HEADER SECTION (Sticky glassmorphic navbar) */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-bg-surface/80 border-border-main">
        <div className="w-full px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center space-x-2.5">
              <img 
                src="/RAS Academic.png" 
                alt="RAS Academic Logo" 
                className="h-10 w-auto object-contain dark:brightness-110" 
              />
              <span className="text-lg md:text-xl font-black bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
                {currentLang.logo}
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 text-sm font-semibold flex-1">
            <a href="#" className="hover:text-hover-menu transition-colors">{currentLang.home}</a>
            <a href="#classes" className="hover:text-hover-menu transition-colors">{currentLang.classes}</a>
            <a href="#programs" className="hover:text-hover-menu transition-colors">{currentLang.programs}</a>
            <a href="#services" className="hover:text-hover-menu transition-colors">{currentLang.services}</a>
            <a href="#gallery" className="hover:text-hover-menu transition-colors">{currentLang.gallery}</a>
            <a href="#contact" className="hover:text-hover-menu transition-colors">{currentLang.contact}</a>
          </nav>

          {/* Header Controls */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Dark/Light mode toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-bg-alt hover:bg-bg-hover text-text-sec border border-border-main cursor-pointer"
              title={isDarkMode ? currentLang.themeLight : currentLang.themeDark}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage} 
              className="p-2 rounded-xl bg-bg-alt hover:bg-bg-hover text-brand-secondary border border-border-main flex items-center space-x-1.5 cursor-pointer text-xs font-bold"
            >
              <Globe size={16} />
              <span>{isBengali ? "English" : "বাংলা"}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2 rounded-xl bg-bg-alt hover:bg-bg-hover text-text-sec border border-border-main cursor-pointer relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-brand-accent rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-bg-surface border border-border-main rounded-2xl p-4 shadow-2xl z-50 animate-scaleIn">
                  <div className="flex justify-between items-center border-b border-border-main pb-2.5 mb-3">
                    <span className="font-bold text-sm text-text-main">{currentLang.notifications}</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-brand-secondary hover:text-brand-secondary/80 font-semibold cursor-pointer">
                        {currentLang.markRead}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifList.length === 0 ? (
                      <p className="text-xs text-text-mut italic text-center py-4">{currentLang.noNotifications}</p>
                    ) : (
                      notifList.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-lg text-xs border ${n.unread ? "bg-brand-primary/5 border-brand-primary/10 font-medium text-text-main" : "bg-bg-alt border-border-main text-text-mut"}`}>
                          <p>{isBengali ? n.textBn : n.textEn}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {token && user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 px-3.5 py-2 rounded-xl text-brand-primary dark:text-brand-secondary font-semibold text-sm cursor-pointer transition"
                >
                  <User size={16} />
                  <span className="hidden sm:inline truncate max-w-[90px]">{user.name}</span>
                  <ChevronDown size={14} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-bg-surface border border-border-main rounded-2xl p-2 shadow-2xl z-50 animate-scaleIn">
                    <div className="p-3 border-b border-border-main mb-1.5">
                      <p className="font-bold text-sm text-text-main truncate">{user.name}</p>
                      <p className="text-[10px] text-text-mut uppercase tracking-widest font-bold mt-0.5">{user.role}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setShowProfileMenu(false)} className="flex items-center space-x-2 p-2.5 text-text-sec hover:text-brand-secondary hover:bg-bg-hover rounded-lg text-sm transition font-medium">
                      <LayoutDashboard size={16} />
                      <span>{currentLang.dashboard}</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-2 p-2.5 text-brand-accent hover:bg-brand-accent/10 rounded-lg text-sm transition text-left cursor-pointer font-medium">
                      <LogOut size={16} />
                      <span>{currentLang.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="bg-bg-alt hover:bg-bg-hover text-text-main border border-border-main font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md">
                  {currentLang.login}
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setShowRegisterMenu(!showRegisterMenu)}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{currentLang.register}</span>
                    <ChevronDown size={14} />
                  </button>
                  {showRegisterMenu && (
                    <div className="absolute right-0 mt-3 w-48 bg-bg-surface border border-border-main rounded-2xl p-2 shadow-2xl z-50 animate-scaleIn">
                      <Link 
                        href="/signup?role=STUDENT" 
                        onClick={() => setShowRegisterMenu(false)} 
                        className="block p-2.5 text-text-sec hover:text-brand-secondary hover:bg-bg-hover rounded-lg text-sm transition font-medium"
                      >
                       {isBengali ? "শিক্ষার্থী নিবন্ধন" : "Student Register"}
                      </Link>
                      <Link 
                        href="/signup?role=TEACHER" 
                        onClick={() => setShowRegisterMenu(false)} 
                        className="block p-2.5 text-text-sec hover:text-brand-secondary hover:bg-bg-hover rounded-lg text-sm transition font-medium"
                      >
                       {isBengali ? "শিক্ষক নিবন্ধন" : "Teacher Register"}
                      </Link>
                      <Link 
                        href="/signup?role=GUARDIAN" 
                        onClick={() => setShowRegisterMenu(false)} 
                        className="block p-2.5 text-text-sec hover:text-brand-secondary hover:bg-bg-hover rounded-lg text-sm transition font-medium"
                      >
                       {isBengali ? "অভিভাবক নিবন্ধন" : "Guardian Register"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SLIDER SECTION */}
      <section className="relative h-[480px] md:h-[580px] bg-bg-main overflow-hidden border-b border-border-main">
        {heroSlides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Slide Image Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-all duration-[5000ms]"
              style={{ 
                backgroundImage: `url('${slide.image}')`,
                transform: idx === currentSlide ? 'scale(1)' : 'scale(1.05)' 
              }}
            />
            {/* Theme Brand Gradient Overlay */}
            <div 
              className="absolute inset-0 opacity-80" 
              style={{
                background: isDarkMode 
                  ? "linear-gradient(135deg, #081A12 0%, #0F462D 50%, #1A2433 100%)" 
                  : "linear-gradient(135deg, #0F462D 0%, #1A6B4A 50%, #39A4D1 100%)"
              }}
            />

            {/* Slide Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
              <div className="max-w-2xl space-y-6 animate-fadeIn">
                <span className="inline-block bg-brand-primary/20 border border-brand-primary/30 text-white px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest shadow-inner">
                  RAS Academic Point
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  {isBengali ? slide.titleBn : slide.titleEn}
                </h1>
                <p className="text-slate-255 text-base md:text-lg drop-shadow-sm max-w-xl">
                  {isBengali ? slide.descBn : slide.descEn}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <a href="#classes" className="bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold px-6 py-3.5 rounded-xl text-sm transition shadow-lg transform hover:scale-[1.02]">
                    {currentLang.heroCTA1}
                  </a>
                  <a href="#contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition">
                    {currentLang.heroCTA2}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button onClick={handlePrevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-25 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/10 transition cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleNextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-25 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/10 transition cursor-pointer">
          <ChevronRight size={20} />
        </button>
      </section>

      {/* 3. PORTALS SECTION (Teacher, Student, Guardian Connection Panel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
            {currentLang.explorePortals}
          </h2>
          <p className="text-text-sec text-sm max-w-lg mx-auto">
            {currentLang.portalsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Portal Card */}
          <div className="group bg-bg-surface border border-border-main hover:border-brand-secondary/50 rounded-2xl flex flex-col justify-between transition duration-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/5 rounded-full blur-2xl"></div>
            
            {/* Hero Image */}
            <div className="h-[220px] overflow-hidden relative">
              <img 
                src="https://img.magnific.com/premium-photo/photograph-12-15-age-indian-school-girl-boys-students-holding-books-clear-facial-features-white-background-ar-32-style-raw-v-6-job-id-52618d9f8589484b87c969cc439d417e_939033-131154.jpg?w=360?w=600&auto=format&fit=crop&q=80" 
                alt="Student Portal" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute top-3 left-3 bg-brand-secondary/20 border border-brand-secondary/30 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg backdrop-blur-md">
                Student
              </div>
            </div>

            {/* Title & Description */}
            <div className="p-6 h-[140px] flex flex-col justify-center">
              <h3 className="font-bold text-lg text-text-main group-hover:text-brand-secondary transition">{currentLang.studentPortal}</h3>
              <p className="text-xs text-text-mut mt-2 leading-relaxed">{currentLang.studentPortalDesc}</p>
            </div>

            {/* View Details Button */}
            <div className="px-6 pb-5 h-[60px] flex items-center gap-2">
              <button 
                onClick={() => handleEnterPortal("STUDENT")} 
                className="flex-1 text-center bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
              >
                {currentLang.enterPortal}
              </button>
              <Link href="/signup?role=STUDENT" className="flex-1 text-center bg-bg-alt hover:bg-bg-hover text-text-sec py-2.5 rounded-lg text-xs border border-border-main transition">
                {currentLang.signUpCTA}
              </Link>
            </div>
          </div>

          {/* Teacher Portal Card */}
          <div className="group bg-bg-surface border border-border-main hover:border-brand-primary/50 rounded-2xl flex flex-col justify-between transition duration-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl"></div>
            
            {/* Hero Image */}
            <div className="h-[220px] overflow-hidden relative">
              <img 
                src="https://i0.wp.com/pecpte.com/wp-content/uploads/2025/02/PTE-One-to-One-Coaching-in-Dhaka.jpg?resize=840%2C430&ssl=1?w=600&auto=format&fit=crop&q=80" 
                alt="Teacher Portal" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute top-3 left-3 bg-brand-primary/20 border border-brand-primary/30 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg backdrop-blur-md">
                Teacher
              </div>
            </div>

            {/* Title & Description */}
            <div className="p-6 h-[140px] flex flex-col justify-center">
              <h3 className="font-bold text-lg text-text-main group-hover:text-brand-primary transition">{currentLang.teacherPortal}</h3>
              <p className="text-xs text-text-mut mt-2 leading-relaxed">{currentLang.teacherPortalDesc}</p>
            </div>

            {/* View Details Button */}
            <div className="px-6 pb-5 h-[60px] flex items-center gap-2">
              <button 
                onClick={() => handleEnterPortal("TEACHER")} 
                className="flex-1 text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
              >
                {currentLang.enterPortal}
              </button>
              <Link href="/signup?role=TEACHER" className="flex-1 text-center bg-bg-alt hover:bg-bg-hover text-text-sec py-2.5 rounded-lg text-xs border border-border-main transition">
                {currentLang.signUpCTA}
              </Link>
            </div>
          </div>

          {/* Guardian Portal Card */}
          <div className="group bg-bg-surface border border-border-main hover:border-slate-blue/50 rounded-2xl flex flex-col justify-between transition duration-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/5 dark:bg-slate-800/5 rounded-full blur-2xl"></div>
            
            {/* Hero Image */}
            <div className="h-[220px] overflow-hidden relative">
              <img 
                src="https://thumbs.dreamstime.com/b/astonished-father-son-celebrating-online-success-using-laptop-home-father-son-astonished-receiving-good-news-using-170471281.jpg?w=600&auto=format&fit=crop&q=80" 
                alt="Guardian Portal" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute top-3 left-3 bg-slate-blue/20 border border-slate-blue/30 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg backdrop-blur-md">
                Guardian
              </div>
            </div>

            {/* Title & Description */}
            <div className="p-6 h-[140px] flex flex-col justify-center">
              <h3 className="font-bold text-lg text-text-main group-hover:text-slate-blue transition">{currentLang.guardianPortal}</h3>
              <p className="text-xs text-text-mut mt-2 leading-relaxed">{currentLang.guardianPortalDesc}</p>
            </div>

            {/* View Details Button */}
            <div className="px-6 pb-5 h-[60px] flex items-center gap-2">
              <button 
                onClick={() => handleEnterPortal("GUARDIAN")} 
                className="flex-1 text-center bg-brand-secondary hover:bg-brand-secondary-hover text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
              >
                {currentLang.enterPortal}
              </button>
              <Link href="/signup?role=GUARDIAN" className="flex-1 text-center bg-bg-alt hover:bg-bg-hover text-text-sec py-2.5 rounded-lg text-xs border border-border-main transition">
                {currentLang.signUpCTA}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLASSES SECTION */}
      <section id="classes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-main">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
              {currentLang.ourClasses}
            </h2>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "Class 8", "Class 9", "SSC Batch"].map((f) => (
              <button 
                key={f}
                onClick={() => setClassFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition border cursor-pointer ${
                  classFilter === f 
                    ? "bg-brand-primary hover:bg-brand-primary-hover text-white border-brand-primary shadow-md"
                    : "bg-bg-surface dark:bg-bg-alt border-border-main hover:border-brand-primary text-text-sec"
                }`}
              >
                {f === "All" ? currentLang.filterAll : f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((c) => (
            <div 
              key={c.id} 
              className={`rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300 shadow-lg group relative border-beam-card border ${c.bgClass || "bg-bg-surface dark:bg-bg-alt border-border-main"}`}
              style={{ '--beam-color': c.beamColor } as React.CSSProperties}
            >
              <div className="border-beam-glow" />
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img src={c.image} alt={c.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-bg-main/80 border border-border-main text-brand-primary dark:text-brand-secondary text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg">
                    {c.filter}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-lg text-text-main">{isBengali ? c.nameBn : c.nameEn}</h3>
                  <p className="text-xs text-text-mut leading-relaxed">{isBengali ? c.descBn : c.descEn}</p>
                  
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-bold text-text-mut uppercase tracking-widest">{currentLang.classFeatures}</p>
                    <ul className="text-xs text-text-sec space-y-1 font-medium pl-1">
                      <li className="flex items-center"><Check size={12} className="text-brand-primary dark:text-brand-secondary mr-1.5" />{currentLang.teachersFeature}</li>
                      <li className="flex items-center"><Check size={12} className="text-brand-primary dark:text-brand-secondary mr-1.5" />{currentLang.examsFeature}</li>
                      <li className="flex items-center"><Check size={12} className="text-brand-primary dark:text-brand-secondary mr-1.5" />{currentLang.materialsFeature}</li>
                      <li className="flex items-center"><Check size={12} className="text-brand-primary dark:text-brand-secondary mr-1.5" />{currentLang.trackingFeature}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                {user?.role === "STUDENT" && (user.enrolledClassIds || []).includes(c.id) ? (
                  <Link 
                    href="/dashboard/student"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    {currentLang.enterClass}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleEnroll(c.id, c.amount)}
                      disabled={isProcessingEnroll === c.id}
                      className="flex-1 text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 font-sans"
                    >
                      {isProcessingEnroll === c.id ? (isBengali ? "প্রসেসিং..." : "Processing...") : currentLang.enrollNow}
                    </button>
                    <Link 
                      href={`/classes/${c.id}`}
                      className="flex-1 text-center bg-bg-alt hover:bg-bg-hover text-text-sec font-bold py-2.5 rounded-xl text-xs border border-border-main transition cursor-pointer flex items-center justify-center"
                    >
                      {currentLang.knowDetails}
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROGRAMS SECTION */}
      <section id="programs" className="bg-bg-alt border-t border-border-main py-16 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
              {currentLang.ourPrograms}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programData.map((p) => (
              <div key={p.id} className="bg-bg-surface border border-border-main rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand-primary/40 transition shadow-lg">
                <div>
                  <div className="h-44 overflow-hidden">
                    <img src={p.image} alt={p.nameEn} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-lg text-text-main">{isBengali ? p.nameBn : p.nameEn}</h3>
                    <p className="text-xs text-text-mut leading-relaxed">{isBengali ? p.descBn : p.descEn}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link 
                    href={`/programs/${p.id}`}
                    className="block w-full text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    {currentLang.learnMore}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SERVICES SECTION (Grid format, redirecting portals) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-main">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
            {currentLang.ourServices}
          </h2>
          <p className="text-text-sec text-sm max-w-lg mx-auto">
            {currentLang.servicesSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceData.map((s) => (
            <div 
              key={s.id} 
              onClick={() => handleServiceClick(s.id)}
              className="group bg-bg-surface border border-border-main hover:border-brand-secondary/50 rounded-2xl flex flex-col justify-between transition duration-200 shadow-xl overflow-hidden relative cursor-pointer"
            >
              {/* Hero Image */}
              <div className="h-[220px] overflow-hidden relative">
                <img 
                  src={s.image} 
                  alt={s.titleEn} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-3 left-3 bg-brand-secondary/20 border border-brand-secondary/30 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg backdrop-blur-md">
                  Service
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-6 h-[140px] flex flex-col justify-center">
                <h3 className="font-bold text-base text-text-main group-hover:text-brand-secondary transition leading-snug">
                  {isBengali ? s.titleBn : s.titleEn}
                </h3>
                <p className="text-xs text-text-mut mt-2 leading-relaxed">
                  {isBengali ? s.descBn : s.descEn}
                </p>
              </div>

              
            </div>
          ))}
        </div>
      </section>

      {/* 5 STEPS FOR BETTER RESULT SECTION */}
      <section ref={containerRef} className="relative bg-bg-alt border-t border-border-main py-20 overflow-hidden animate-fadeIn">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-20 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-16 relative z-10">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-brand-secondary/10 dark:bg-brand-secondary/20 text-brand-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              {isBengali ? "সফলতার রোডম্যাপ" : "Success Roadmap"}
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-emerald-500 bg-clip-text text-transparent"
            >
              {isBengali ? "ভালো রেজাল্ট করার ৫ টি ধাপ" : "5 Steps for Better Result"}
            </motion.h2>
            
            <p className="text-text-sec text-sm max-w-lg mx-auto">
              {isBengali 
                ? "আমাদের ৫টি বৈজ্ঞানিক ধাপ অনুসরণ করে পড়াশোনায় কাঙ্ক্ষিত লক্ষ্য ও সর্বোত্তম ফলাফল অর্জন করো।" 
                : "Follow our 5 proven scientific steps to achieve your target academic results and excellence."}
            </p>
          </div>

          {/* Roadmap Container */}
          <div className="relative mt-12 min-h-[1200px] md:min-h-[600px]">
            
            {/* 1a. DESKTOP SVG BACKGROUND PATHS */}
            <svg 
              className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0" 
              viewBox="0 0 800 600" 
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="roadmap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#39a4d1" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Unlit background path */}
              <path
                d="M 200 100 L 560 100 Q 600 100 600 140 L 600 260 Q 600 300 560 300 L 240 300 Q 200 300 200 340 L 200 460 Q 200 500 240 500 L 600 500"
                stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Soft Glow path */}
              <motion.path
                d="M 200 100 L 560 100 Q 600 100 600 140 L 600 260 Q 600 300 560 300 L 240 300 Q 200 300 200 340 L 200 460 Q 200 500 240 500 L 600 500"
                stroke="url(#roadmap-gradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: progress, opacity: 0.35 }}
              />

              {/* Active path */}
              <motion.path
                ref={desktopPathRef}
                d="M 200 100 L 560 100 Q 600 100 600 140 L 600 260 Q 600 300 560 300 L 240 300 Q 200 300 200 340 L 200 460 Q 200 500 240 500 L 600 500"
                stroke="url(#roadmap-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: progress }}
              />
            </svg>

            {/* 2a. MOBILE SVG BACKGROUND PATHS */}
            <svg 
              className="block md:hidden absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0" 
              viewBox="0 0 200 1200" 
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="roadmap-gradient-mobile" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#39a4d1" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Unlit background path */}
              <path
                d="M 100 100 L 100 1100"
                stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Soft Glow path */}
              <motion.path
                d="M 100 100 L 100 1100"
                stroke="url(#roadmap-gradient-mobile)"
                strokeWidth="14"
                strokeLinecap="round"
                style={{ pathLength: progress, opacity: 0.35 }}
              />

              {/* Active path */}
              <motion.path
                ref={mobilePathRef}
                d="M 100 100 L 100 1100"
                stroke="url(#roadmap-gradient-mobile)"
                strokeWidth="6"
                strokeLinecap="round"
                style={{ pathLength: progress }}
              />
            </svg>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-6 md:grid-rows-3 h-[1200px] md:h-[600px] gap-y-0 relative z-10">
              {steps.map((item, idx) => {
                const IconComponent = item.icon;
                const isAchievement = item.step === 6;
                
                return (
                  <div
                    key={item.step}
                    className={clsx(
                      "w-full h-full flex items-center justify-center px-4 md:px-8 transition-all duration-700",
                      // Grid position classes for S-path layout on desktop and standard on mobile
                      idx === 0 && "col-start-1 row-start-1 md:col-start-1 md:row-start-1",
                      idx === 1 && "col-start-1 row-start-2 md:col-start-2 md:row-start-1",
                      idx === 2 && "col-start-1 row-start-3 md:col-start-2 md:row-start-2",
                      idx === 3 && "col-start-1 row-start-4 md:col-start-1 md:row-start-2",
                      idx === 4 && "col-start-1 row-start-5 md:col-start-1 md:row-start-3",
                      idx === 5 && "col-start-1 row-start-6 md:col-start-2 md:row-start-3",
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className={clsx(
                        "relative p-5 rounded-2xl border transition-all duration-500 w-full max-w-[380px] h-[130px] flex flex-col justify-center",
                        isAchievement
                          ? isCompleted
                            ? "bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-[1.03]"
                            : "bg-bg-surface/80 border-dashed border-border-main"
                          : "bg-bg-surface/80 hover:bg-bg-surface border-border-main hover:border-brand-primary/40 shadow-md hover:shadow-xl"
                      )}
                    >
                      {/* Card Content Layout */}
                      <div className="flex items-start space-x-4">
                        {/* Icon & Step Number */}
                        <div className={clsx(
                          "p-3 rounded-xl flex-shrink-0 relative",
                          isAchievement
                            ? isCompleted
                              ? "bg-emerald-500 text-white animate-bounce"
                              : "bg-bg-alt text-text-mut"
                            : "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary"
                        )}>
                          <IconComponent size={20} />
                          <span className="absolute -top-2 -right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-brand-accent text-white shadow-md">
                            0{item.step}
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-1.5">
                          <h3 className={clsx(
                            "font-extrabold text-base transition-colors duration-300",
                            isAchievement && isCompleted 
                              ? "text-emerald-500 dark:text-emerald-400" 
                              : "text-text-main"
                          )}>
                            {isBengali ? item.titleBn : item.titleEn}
                          </h3>
                          <p className="text-[11px] text-text-sec leading-relaxed">
                            {isBengali ? item.descBn : item.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Achievement Cup animation */}
                      {isAchievement && isCompleted && (
                        <div className="absolute top-2.5 right-2.5 text-emerald-500 animate-pulse">
                          <motion.span 
                            initial={{ scale: 0.8 }} 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-lg"
                          >
                            🏆
                          </motion.span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* 1b. DESKTOP SVG FOREGROUND DOT & RIPPLES */}
            <svg 
              className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20" 
              viewBox="0 0 800 600" 
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <radialGradient id="dot-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glowing Moving Dot */}
              <g style={{ pointerEvents: "none" }}>
                {/* Soft glowing trail behind the dot */}
                <motion.circle 
                  cx={desktopTrailX2} 
                  cy={desktopTrailY2} 
                  r="5" 
                  fill="#10b981" 
                  initial={{ opacity: 0.12 }}
                  animate={{ opacity: isCompleted ? 0 : 0.12 }} 
                  transition={{ duration: 0.5 }}
                  filter="url(#glow-filter)" 
                />
                <motion.circle 
                  cx={desktopTrailX1} 
                  cy={desktopTrailY1} 
                  r="7" 
                  fill="#10b981" 
                  initial={{ opacity: 0.22 }}
                  animate={{ opacity: isCompleted ? 0 : 0.22 }} 
                  transition={{ duration: 0.5 }}
                  filter="url(#glow-filter)" 
                />

                <motion.circle cx={desktopX} cy={desktopY} r="16" fill="#10b981" opacity="0.4" filter="url(#glow-filter)" />
                <motion.circle cx={desktopX} cy={desktopY} r="10" fill="url(#dot-gradient)" />
                <motion.circle cx={desktopX} cy={desktopY} r="4" fill="#ffffff" />
              </g>

              {/* Pulse ripples at completion */}
              {isCompleted && (
                <motion.circle
                  cx={600}
                  cy={500}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  fill="#10b981"
                  fillOpacity="0.25"
                  animate={{
                    r: [10, 25, 35, 10],
                    opacity: [0.8, 0.4, 0, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 2,
                    ease: "easeOut"
                  }}
                />
              )}
            </svg>

            {/* 2b. MOBILE SVG FOREGROUND DOT & RIPPLES */}
            <svg 
              className="block md:hidden absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20" 
              viewBox="0 0 200 1200" 
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <radialGradient id="dot-gradient-mobile" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <filter id="glow-filter-mobile" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glowing Moving Dot */}
              <g style={{ pointerEvents: "none" }}>
                <motion.circle 
                  cx={mobileTrailX2} 
                  cy={mobileTrailY2} 
                  r="5" 
                  fill="#10b981" 
                  initial={{ opacity: 0.12 }}
                  animate={{ opacity: isCompleted ? 0 : 0.12 }} 
                  transition={{ duration: 0.5 }}
                  filter="url(#glow-filter-mobile)" 
                />
                <motion.circle 
                  cx={mobileTrailX1} 
                  cy={mobileTrailY1} 
                  r="7" 
                  fill="#10b981" 
                  initial={{ opacity: 0.22 }}
                  animate={{ opacity: isCompleted ? 0 : 0.22 }} 
                  transition={{ duration: 0.5 }}
                  filter="url(#glow-filter-mobile)" 
                />

                <motion.circle cx={mobileX} cy={mobileY} r="16" fill="#10b981" opacity="0.4" filter="url(#glow-filter-mobile)" />
                <motion.circle cx={mobileX} cy={mobileY} r="10" fill="url(#dot-gradient-mobile)" />
                <motion.circle cx={mobileX} cy={mobileY} r="4" fill="#ffffff" />
              </g>

              {/* Pulse ripples at completion */}
              {isCompleted && (
                <motion.circle
                  cx={100}
                  cy={1100}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  fill="#10b981"
                  fillOpacity="0.25"
                  animate={{
                    r: [10, 25, 35, 10],
                    opacity: [0.8, 0.4, 0, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 2,
                    ease: "easeOut"
                  }}
                />
              )}
            </svg>
          </div>
        </div>
      </section>

      {/* 8. GALLERY SECTION (Continuous Horizontal Auto-Scroll) */}
      <section id="gallery" className="py-16 border-t border-border-main overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
              {currentLang.ourGallery}
            </h2>
            <p className="text-text-sec text-sm max-w-lg mx-auto">
              {currentLang.gallerySub}
            </p>
          </div>
        </div>

        {/* Continuous loop marquee container */}
        <div className="relative w-full flex items-center overflow-hidden py-4 bg-bg-alt">
          <div className="animate-marquee gap-6">
            {/* Render images twice for infinite scroll seamless transition */}
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(img)}
                className="w-56 h-40 rounded-xl overflow-hidden cursor-pointer shadow-lg border border-border-main hover:border-brand-primary/60 transition flex-shrink-0"
              >
                <img src={img} alt="Campus Event" className="w-full h-full object-cover hover:scale-105 transition duration-350" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION (Form with full validation & styled Google Map) */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-main">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent">
            {currentLang.contactUs}
          </h2>
          <p className="text-text-sec text-sm max-w-lg mx-auto">
            {currentLang.contactSub}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <div className="bg-bg-surface border border-border-main p-8 rounded-2xl shadow-xl backdrop-blur-md">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-text-sec text-xs font-semibold mb-1.5">{currentLang.formName}</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-bg-alt border border-border-main focus:border-brand-primary focus:outline-none rounded-xl text-text-main text-sm transition"
                  required 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-sec text-xs font-semibold mb-1.5">{currentLang.formEmail}</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full px-4 py-2.5 bg-bg-alt border border-border-main focus:border-brand-primary focus:outline-none rounded-xl text-text-main text-sm transition"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-text-sec text-xs font-semibold mb-1.5">{currentLang.formPhone}</label>
                  <input 
                    type="tel" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full px-4 py-2.5 bg-bg-alt border border-border-main focus:border-brand-primary focus:outline-none rounded-xl text-text-main text-sm transition"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-text-sec text-xs font-semibold mb-1.5">{currentLang.formMsg}</label>
                <textarea 
                  value={formMsg}
                  onChange={(e) => setFormMsg(e.target.value)}
                  placeholder="Write your questions here..."
                  className="w-full h-32 px-4 py-3 bg-bg-alt border border-border-main focus:border-brand-primary focus:outline-none rounded-xl text-text-main text-sm transition resize-none"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isFormSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-xl transition duration-150 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isFormSubmitting ? currentLang.submitting : currentLang.sendMsg}
              </button>
            </form>
          </div>

          {/* Contact Details & Styled Google Map */}
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-main p-6 rounded-2xl space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <MapPin className="text-brand-secondary mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold text-text-sec">{currentLang.addressLabel}</h4>
                  <p className="text-text-mut mt-0.5">{currentLang.addressVal}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start space-x-3">
                  <Phone className="text-brand-secondary mt-0.5" size={16} />
                  <div>
                    <h4 className="font-bold text-text-sec">{currentLang.phoneLabel}</h4>
                    <p className="text-text-mut mt-0.5">+880 1712-345678</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="text-brand-secondary mt-0.5" size={16} />
                  <div>
                    <h4 className="font-bold text-text-sec">{currentLang.emailLabel}</h4>
                    <p className="text-text-mut mt-0.5">info@rasacademic.com</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs border-t border-border-main pt-3">
                <Clock className="text-brand-secondary mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold text-text-sec">{currentLang.hoursLabel}</h4>
                  <p className="text-text-mut mt-0.5">{currentLang.hoursVal}</p>
                </div>
              </div>
            </div>

            {/* Mock Vector Google Map with rich layout */}
            <div className="h-64 rounded-2xl overflow-hidden border border-border-main relative bg-bg-alt flex flex-col justify-end">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              {/* Mock roads & marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-3xl animate-bounce">📍</span>
                <span className="px-2 py-1 bg-bg-surface border border-border-main text-[9px] font-bold rounded-md shadow-2xl text-brand-primary dark:text-brand-secondary mt-1">
                  RAS Academic Branch
                </span>
              </div>
              <div className="relative p-4 bg-bg-surface/90 border-t border-border-main backdrop-blur-sm text-[10px] text-text-sec font-medium flex justify-between items-center">
                <span>Latitude: 23.8759° N, Longitude: 90.3795° E</span>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-brand-secondary font-bold hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER SECTION */}
      <footer className="bg-brand-footer border-t border-border-main py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs text-white/80">
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-3">RAS Academic</h4>
              <p className="leading-relaxed">Providing high-standard tuition, daily support slots, and live progress indicators.</p>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-brand-secondary transition">Home</a></li>
                <li><a href="#classes" className="hover:text-brand-secondary transition">Classes</a></li>
                <li><a href="#programs" className="hover:text-brand-secondary transition">Programs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-3">Services</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="hover:text-brand-secondary transition">Doubt Queue</a></li>
                <li><a href="#services" className="hover:text-brand-secondary transition">1:1 Session</a></li>
                <li><a href="#services" className="hover:text-brand-secondary transition">Monitoring</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-3">Social Connect</h4>
              <div className="flex space-x-3 text-white/80">
                <a href="https://facebook.com" className="hover:text-brand-secondary">Facebook</a>
                <span>|</span>
                <a href="https://youtube.com" className="hover:text-brand-secondary">YouTube</a>
                <span>|</span>
                <a href="https://instagram.com" className="hover:text-brand-secondary">Instagram</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-[10px] text-white/50">
            <p>&copy; {new Date().getFullYear()} {currentLang.logo}. All Rights Reserved.</p>
            <p className="mt-1">Developed by Riya Das, Lead Software Engineer.</p>
          </div>
        </div>
      </footer>

      {/* --- INTERACTIVE MODALS --- */}

      {/* Skill Video Modal Overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-bg-surface border border-border-main rounded-2xl overflow-hidden shadow-2xl relative animate-scaleIn">
            <div className="flex justify-between items-center p-4 bg-bg-surface border-b border-border-main text-text-sec">
              <h3 className="text-sm font-bold truncate pr-6">{isBengali ? selectedVideo.titleBn : selectedVideo.titleEn}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-text-mut hover:text-text-main cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1`} 
                title={selectedVideo.titleEn}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fadeIn" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-border-main shadow-2xl animate-scaleIn">
            <img src={selectedImage} alt="Fullscreen View" className="object-contain w-full h-full select-none" />
          </div>
        </div>
      )}
    </div>
  );
}
