"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Award, Check, Globe, Sun, Moon } from "lucide-react";

const t = {
  en: {
    back: "Back to Home",
    overview: "Program Overview",
    features: "Program Features",
    contactHelp: "Inquire About Program",
    logo: "RAS Academic Point",
    timelineLabel: "Program Timeline",
    statusLabel: "Program Status",
    activeStatus: "Active / Ongoing",
    upcomingStatus: "Upcoming Selection",
    close: "Close"
  },
  bn: {
    back: "হোমে ফিরে যান",
    overview: "প্রোগ্রাম পরিচিতি",
    features: "প্রোগ্রামের প্রধান দিক সমূহ",
    contactHelp: "প্রোগ্রাম সম্পর্কে অনুসন্ধান করুন",
    logo: "আরএএস একাডেমিক পয়েন্ট",
    timelineLabel: "প্রোগ্রাম সময়সীমা",
    statusLabel: "প্রোগ্রাম স্ট্যাটাস",
    activeStatus: "চলমান",
    upcomingStatus: "আসন্ন নির্বাচন",
    close: "বন্ধ করুন"
  }
};

const programData: Record<string, any> = {
  "prep": {
    nameEn: "Exam Preparation Program",
    nameBn: "পরীক্ষা প্রস্তুতি প্রোগ্রাম",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    descEn: "Maximize exam readiness with regular board-standard mock tests, weekly model exams, in-depth test paper analysis, and personal feedback reports for Class 8, Class 9, and SSC batches.",
    descBn: "অষ্টম শ্রেণী, নবম শ্রেণী এবং এসএসসি ব্যাচের জন্য বোর্ড-মানের মক টেস্ট, সাপ্তাহিক মডেল পরীক্ষা, বিস্তারিত টেস্ট পেপার বিশ্লেষণ এবং ব্যক্তিগত অগ্রগতি রিপোর্টের মাধ্যমে পরীক্ষার সর্বোচ্চ প্রস্তুতি নিশ্চিত করুন।",
    timelineEn: "Year-round (Intensive during Final Board Exams)",
    timelineBn: "সারা বছর জুড়ে (বোর্ড ফাইনাল পরীক্ষার সময় নিবিড়)",
    featuresEn: [
      "Board exam standard question patterns",
      "Detailed copy check with comments",
      "Solved paper discussions with expert teachers",
      "Special instructions for time management"
    ],
    featuresBn: [
      "বোর্ড পরীক্ষার মানসম্পন্ন প্রশ্নপত্র",
      "মন্তব্য সহ বিস্তারিত খাতা মূল্যায়ন",
      "অভিজ্ঞ শিক্ষকদের দ্বারা সমাধান ক্লাসের আলোচনা",
      "সময় ব্যবস্থাপনার জন্য বিশেষ নির্দেশনা"
    ],
    statusEn: "Active / Ongoing",
    statusBn: "চলমান"
  },
  "tour": {
    nameEn: "Annual Educational Tour",
    nameBn: "বার্ষিক শিক্ষাসফর",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    descEn: "We organize annual historic site explorations, visits to national science museums, and team-building retreats to build practical real-world knowledge, refresh student minds, and foster healthy social connection.",
    descBn: "বাস্তবিক জ্ঞান অর্জন, শিক্ষার্থীদের মনকে চাঙ্গা রাখা এবং সুসম্পর্ক গড়ে তোলার জন্য আমরা বার্ষিক ঐতিহাসিক স্থান ভ্রমণ, জাতীয় বিজ্ঞান জাদুঘর পরিদর্শন এবং টিম-বিল্ডিং ভ্রমণের আয়োজন করি।",
    timelineEn: "Annually during winter break (December/January)",
    timelineBn: "প্রতি বছর শীতকালীন ছুটির সময় (ডিসেম্বর/জানুয়ারি)",
    featuresEn: [
      "Visits to historic locations and museums",
      "Science exhibition & group quiz competitions",
      "Fully guided and secure transportation & fooding",
      "Builds practical real-world insight"
    ],
    featuresBn: [
      "ঐতিহাসিক স্থান ও জাদুঘর পরিদর্শন",
      "বিজ্ঞান প্রদর্শনী ও দলীয় কুইজ প্রতিযোগিতা",
      "সম্পূর্ণ নির্দেশিত ও নিরাপদ যাতায়াত এবং খাবার ব্যবস্থা",
      "বাস্তব ও প্রায়োগিক জ্ঞান বৃদ্ধি"
    ],
    statusEn: "Upcoming Selection",
    statusBn: "আসন্ন নির্বাচন"
  },
  "scholar": {
    nameEn: "Scholarship Program",
    nameBn: "মেধা বৃত্তি প্রোগ্রাম",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    descEn: "Aiming to promote academic excellence, we offer tuition fee waivers, merit achievements medals, and financial aids to the top academic scorers in our monthly evaluations as well as support for talented underprivileged children.",
    descBn: "একাডেমিক শ্রেষ্ঠত্বকে উৎসাহিত করার লক্ষ্যে আমরা আমাদের মাসিক মূল্যায়নের শীর্ষস্থান অধিকারীদের টিউশন ফি ছাড়, মেধা মেডেল এবং সুবিধাবঞ্চিত মেধাবী শিক্ষার্থীদের জন্য আর্থিক সহায়তা প্রদান করি।",
    timelineEn: "Annually evaluated (Enrollment in January)",
    timelineBn: "প্রতি বছর মূল্যায়ন করা হয় (জানুয়ারিতে আবেদন শুরু)",
    featuresEn: [
      "Up to 100% tuition fee waiver for toppers",
      "Achievement certificates & medal awards",
      "Special coaching privileges and guides",
      "Underprivileged student support fund"
    ],
    featuresBn: [
      "শীর্ষস্থান অধিকারীদের জন্য ১০০% পর্যন্ত টিউশন ফি ছাড়",
      "সাফল্য সনদ ও মেডেল প্রদান",
      "বিশেষ কোচিং সুবিধা ও নির্দেশিকা",
      "সুবিধাবঞ্চিত শিক্ষার্থী সহায়তা তহবিল"
    ],
    statusEn: "Active / Ongoing",
    statusBn: "চলমান"
  }
};

export default function ProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [isBengali, setIsBengali] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Read local storage preferences
    const storedLang = localStorage.getItem("isBengali");
    if (storedLang === "false") setIsBengali(false);

    const storedTheme = localStorage.getItem("isDarkMode");
    if (storedTheme === "true") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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

  const selectedProgram = programData[slug];

  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center text-text-main font-sans">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-brand-accent">Program Not Found</h1>
          <p className="text-text-mut text-sm">The program code requested does not exist.</p>
          <Link href="/" className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-5 py-2.5 rounded-xl transition">
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentLang = isBengali ? t.bn : t.en;

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? "dark" : ""} bg-bg-main text-text-main`}>
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-bg-surface/80 border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
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

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-bg-alt hover:bg-bg-hover text-text-sec border border-border-main cursor-pointer"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={toggleLanguage} 
              className="p-2 rounded-xl bg-bg-alt hover:bg-bg-hover text-brand-secondary border border-border-main flex items-center space-x-1.5 cursor-pointer text-xs font-bold"
            >
              <Globe size={16} />
              <span>{isBengali ? "English" : "বাংলা"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-secondary hover:text-brand-secondary/80 mb-8 transition">
          <ArrowLeft size={16} />
          <span>{currentLang.back}</span>
        </Link>

        {/* Hero Section */}
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden border border-border-main shadow-2xl mb-12">
          <img src={selectedProgram.image} alt={slug} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/50 to-transparent" />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 space-y-2 z-10">
            <span className="bg-brand-primary/20 border border-brand-primary/30 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl">
              Institution Program
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
              {isBengali ? selectedProgram.nameBn : selectedProgram.nameEn}
            </h1>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <div className="bg-bg-surface border border-border-main p-8 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-brand-primary dark:from-brand-secondary to-brand-secondary bg-clip-text text-transparent flex items-center gap-2">
                <BookOpen size={20} className="text-brand-primary dark:text-brand-secondary" />
                <span>{currentLang.overview}</span>
              </h2>
              <p className="text-sm text-text-sec leading-relaxed">
                {isBengali ? selectedProgram.descBn : selectedProgram.descEn}
              </p>
            </div>

            {/* Program Features */}
            <div className="bg-bg-surface border border-border-main p-8 rounded-2xl shadow-xl backdrop-blur-md space-y-5">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <Award size={20} className="text-brand-primary dark:text-brand-secondary" />
                <span>{currentLang.features}</span>
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-sec">
                {(isBengali ? selectedProgram.featuresBn : selectedProgram.featuresEn).map((feat: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="text-brand-primary dark:text-brand-secondary mr-2.5 mt-1 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Quick Specs */}
            <div className="bg-bg-surface border border-border-main p-6 rounded-2xl shadow-xl space-y-5">
              <div className="space-y-2 border-b border-border-main pb-4">
                <h4 className="text-[10px] font-bold text-text-mut uppercase tracking-widest">{currentLang.timelineLabel}</h4>
                <p className="text-sm font-semibold text-brand-secondary">{isBengali ? selectedProgram.timelineBn : selectedProgram.timelineEn}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-mut uppercase tracking-widest">{currentLang.statusLabel}</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedProgram.statusEn === "Active / Ongoing" ? "bg-success animate-pulse" : "bg-brand-secondary"}`}></span>
                  <p className="text-sm font-semibold text-text-sec">{isBengali ? selectedProgram.statusBn : selectedProgram.statusEn}</p>
                </div>
              </div>
            </div>

            {/* Inquire Card */}
            <div className="bg-gradient-to-tr from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 p-6 rounded-2xl shadow-xl space-y-5 text-center">
              <p className="text-xs text-text-sec leading-relaxed">
                {isBengali ? "এই প্রোগ্রামে অংশগ্রহণ বা যেকোনো তথ্যের জন্য আমাদের ভর্তি ডেস্কে যোগাযোগ করুন।" : "For participation details or requirements, feel free to inquire with our support desk."}
              </p>
              <Link 
                href="/#contact" 
                className="block w-full text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
              >
                {currentLang.contactHelp}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
