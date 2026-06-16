"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Award, Check, Globe, Sun, Moon } from "lucide-react";

const t = {
  en: {
    back: "Back to Home",
    overview: "Class Overview",
    subjects: "Subjects Covered",
    schedule: "Class Schedule",
    features: "Course Features",
    admission: "Admission Information",
    admissionDesc: "Admission is open. Monthly Tuition: 1500 BDT. Contact our help desk to register.",
    teacherInfo: "Teacher Information",
    teacherDesc: "Classes are conducted by top-tier graduates from BUET, DMC, and DU with over 5+ years of coaching experience.",
    contactHelp: "Contact Admission Desk",
    logo: "RAS Academic Point",
    feature1: "Experienced Teachers",
    feature2: "Monthly Prep Exams",
    feature3: "Digital Study Materials",
    feature4: "Real-time Progress Tracking"
  },
  bn: {
    back: "হোমে ফিরে যান",
    overview: "কোর্স পরিচিতি",
    subjects: "প্রধান বিষয় সমূহ",
    schedule: "ক্লাসের সময়সূচী",
    features: "কোর্সের মূল বৈশিষ্ট্য সমূহ",
    admission: "ভর্তি সংক্রান্ত তথ্য",
    admissionDesc: "ভর্তি চলছে। মাসিক টিউশন ফি: ১৫০০ টাকা। রেজিষ্ট্রেশন করতে হেল্প ডেস্কে যোগাযোগ করুন।",
    teacherInfo: "শিক্ষক মণ্ডলী",
    teacherDesc: "বুয়েট, ডিএমসি এবং ঢাবির সেরা গ্রাজুয়েটদের দ্বারা ক্লাস পরিচালিত হয় যাদের ৫ বছরের বেশি শিক্ষকতার অভিজ্ঞতা রয়েছে।",
    contactHelp: "ভর্তি ডেস্কে যোগাযোগ করুন",
    logo: "আরএএস একাডেমিক পয়েন্ট",
    feature1: "অভিজ্ঞ শিক্ষক মণ্ডলী",
    feature2: "মাসিক প্রস্তুতি পরীক্ষা",
    feature3: "ডিজিটাল স্টাডি ম্যাটেরিয়ালস",
    feature4: "রিয়েল-টাইম প্রগ্রেস ট্র্যাকিং"
  }
};

const classData: Record<string, any> = {
  "class-8": {
    nameEn: "Class 8 Academic Program",
    nameBn: "অষ্টম শ্রেণী একাডেমিক প্রোগ্রাম",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
    descEn: "Complete curriculum preparation for school final exams and core logic/foundation development in Math & Science.",
    descBn: "স্কুল ফাইনাল পরীক্ষা এবং গণিত ও বিজ্ঞানের মূল লজিক ও ভিত্তি বিকাশের জন্য সম্পূর্ণ সিলেবাস প্রস্তুতি।",
    subjectsEn: "Mathematics, Science, English, ICT, Bangla",
    subjectsBn: "গণিত, বিজ্ঞান, ইংরেজি, আইসিটি, বাংলা",
    scheduleEn: "Mon, Wed, Fri - 04:00 PM to 06:00 PM",
    scheduleBn: "সোম, বুধ, শুক্র - বিকাল ০৪:০০ থেকে সন্ধ্যা ০৬:০০"
  },
  "class-9": {
    nameEn: "Class 9 Science & Commerce",
    nameBn: "নবম শ্রেণী বিজ্ঞান ও ব্যবসায় শিক্ষা",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80",
    descEn: "Core concepts building in Physics, Chemistry, Biology, Math and Business/Accounting studies for future board examinations.",
    descBn: "ভবিষ্যত বোর্ড পরীক্ষার জন্য পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, গণিত এবং ব্যবসায়/হিসাববিজ্ঞানের মূল ধারণা গঠন।",
    subjectsEn: "Physics, Chemistry, Higher Math, Biology, Accounting",
    subjectsBn: "পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান, হিসাববিজ্ঞান",
    scheduleEn: "Sat, Sun, Tue - 03:30 PM to 05:30 PM",
    scheduleBn: "শনি, রবি, মঙ্গল - দুপুর ০৩:৩০ থেকে বিকাল ০৫:৩০"
  },
  "ssc-batch": {
    nameEn: "SSC Special Target Batch",
    nameBn: "এসএসসি স্পেশাল টার্গেট ব্যাচ",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    descEn: "Intensive model test program, board question paper solving, and target GPA 5.00 revision guides.",
    descBn: "নিবিড় মডেল টেস্ট প্রোগ্রাম, বোর্ড প্রশ্নপত্র সমাধান এবং জিপিএ-৫ নিশ্চিতকরণ রিভিশন গাইডলাইন।",
    subjectsEn: "All Board Compulsory & Science/Commerce Group Subjects",
    subjectsBn: "সকল বোর্ড আবশ্যিক এবং বিজ্ঞান/ব্যবসায় শিক্ষা গ্রুপ ভিত্তিক বিষয় সমূহ",
    scheduleEn: "Daily Class & Mock Exams - 02:00 PM to 05:00 PM",
    scheduleBn: "প্রতিদিন ক্লাস ও মক পরীক্ষা - দুপুর ০২:০০ থেকে বিকাল ০৫:০০"
  }
};

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [isBengali, setIsBengali] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Read local storage preferences
    const storedLang = localStorage.getItem("isBengali");
    if (storedLang === "true") setIsBengali(true);

    const storedTheme = localStorage.getItem("isDarkMode");
    if (storedTheme === "false") setIsDarkMode(false);
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

  const selectedClass = classData[slug];

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center text-text-main font-sans">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-brand-accent">Class Program Not Found</h1>
          <p className="text-text-mut text-sm">The class code requested does not exist.</p>
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
          <Link href="/" className="flex items-center space-x-2">
            <span className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary dark:text-brand-secondary font-extrabold text-xl shadow-lg border border-brand-primary/20">🎓</span>
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
          <img src={selectedClass.image} alt={slug} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/50 to-transparent" />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 space-y-2 z-10">
            <span className="bg-brand-primary/20 border border-brand-primary/30 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl">
              Academic Class
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
              {isBengali ? selectedClass.nameBn : selectedClass.nameEn}
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
                {isBengali ? selectedClass.descBn : selectedClass.descEn}
              </p>
            </div>

            {/* Subjects & Schedule Card */}
            <div className="bg-bg-surface border border-border-main p-8 rounded-2xl shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-mut uppercase tracking-wider">{currentLang.subjects}</h3>
                <p className="text-base font-semibold text-brand-primary dark:text-brand-secondary">
                  {isBengali ? selectedClass.subjectsBn : selectedClass.subjectsEn}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-mut uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={16} className="text-text-mut" />
                  <span>{currentLang.schedule}</span>
                </h3>
                <p className="text-base font-semibold text-brand-secondary">
                  {isBengali ? selectedClass.scheduleBn : selectedClass.scheduleEn}
                </p>
              </div>
            </div>

            {/* Teacher Panel Information */}
            <div className="bg-bg-surface border border-border-main p-8 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <Award size={20} className="text-brand-primary dark:text-brand-secondary" />
                <span>{currentLang.teacherInfo}</span>
              </h2>
              <p className="text-sm text-text-sec leading-relaxed">
                {currentLang.teacherDesc}
              </p>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Features Card */}
            <div className="bg-bg-surface border border-border-main p-6 rounded-2xl shadow-xl space-y-5">
              <h3 className="font-bold text-base text-text-main border-b border-border-main pb-3">{currentLang.features}</h3>
              <ul className="space-y-3 text-sm text-text-sec">
                <li className="flex items-center"><Check size={16} className="text-brand-primary dark:text-brand-secondary mr-2.5 flex-shrink-0" />{currentLang.feature1}</li>
                <li className="flex items-center"><Check size={16} className="text-brand-primary dark:text-brand-secondary mr-2.5 flex-shrink-0" />{currentLang.feature2}</li>
                <li className="flex items-center"><Check size={16} className="text-brand-primary dark:text-brand-secondary mr-2.5 flex-shrink-0" />{currentLang.feature3}</li>
                <li className="flex items-center"><Check size={16} className="text-brand-primary dark:text-brand-secondary mr-2.5 flex-shrink-0" />{currentLang.feature4}</li>
              </ul>
            </div>

            {/* Admission Help Card */}
            <div className="bg-gradient-to-tr from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 p-6 rounded-2xl shadow-xl space-y-5">
              <h3 className="font-bold text-base text-brand-primary dark:text-brand-secondary flex items-center gap-1.5">
                <span>🔔</span>
                <span>{currentLang.admission}</span>
              </h3>
              <p className="text-xs text-text-sec leading-relaxed">
                {currentLang.admissionDesc}
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
