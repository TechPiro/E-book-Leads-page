import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Mail, 
  User, 
  Phone, 
  BookOpen, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Lock,
  ChevronRight,
  X,
  Footprints
} from "lucide-react";
import confetti from "canvas-confetti";
import { COPY_CONFIG, renderCopy } from "./copyConfig";
import AdminDashboard from "./components/AdminDashboard";
import LeadCounterWidget from "./components/LeadCounterWidget";

const TYPO_DOMAINS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmeil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmaill.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmale.com": "hotmail.com",
  "outllok.com": "outlook.com",
  "outlok.com": "outlook.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
  "aol.co": "aol.com"
};

const checkEmailTypo = (email: string): string | null => {
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split("@");
  if (parts.length !== 2) return null;
  const username = parts[0];
  const domain = parts[1];
  if (TYPO_DOMAINS[domain]) {
    return `${username}@${TYPO_DOMAINS[domain]}`;
  }
  return null;
};

const triggerConfetti = () => {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.8 },
      colors: ["#2563eb", "#2c3e3a", "#38bdf8", "#10b981", "#fbbf24"]
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.8 },
      colors: ["#2563eb", "#2c3e3a", "#38bdf8", "#10b981", "#fbbf24"]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [emailSuggestion, setEmailSuggestion] = useState("");

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const [modalFormData, setModalFormData] = useState({ name: "", email: "", phone: "" });
  const [modalErrors, setModalErrors] = useState({ name: "", email: "", phone: "" });
  const [modalIsSubmitting, setModalIsSubmitting] = useState(false);
  const [modalSubmitSuccess, setModalSubmitSuccess] = useState(false);
  const [modalSubmitError, setModalSubmitError] = useState("");

  const [modalEmailSuggestion, setModalEmailSuggestion] = useState("");

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === "#admin");
    };
    
    // Check initial hash
    handleHashChange();
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Exit intent logic
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor moves out of top viewport boundary (towards tabs/address bar)
      if (e.clientY < 15 && !hasExited && !submitSuccess && !modalSubmitSuccess) {
        setShowExitIntent(true);
        setHasExited(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasExited, submitSuccess, modalSubmitSuccess]);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) {
        error = "Full Name is required.";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters.";
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = "Email address is required.";
        setEmailSuggestion("");
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
        setEmailSuggestion("");
      } else {
        const typoSuggestion = checkEmailTypo(value);
        setEmailSuggestion(typoSuggestion || "");
      }
    } else if (name === "phone") {
      const cleanPhone = value.replace(/\D/g, "");
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (cleanPhone.length < 7) {
        error = "Please enter a valid phone number (at least 7 digits).";
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    // Validate all fields
    const isNameValid = validateField("name", formData.name);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phone", formData.phone);

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        // Clear form
        setFormData({ name: "", email: "", phone: "" });
        setEmailSuggestion("");
        triggerConfetti();
      } else {
        setSubmitError(data.error || "Form submission failed. Please try again.");
      }
    } catch (err) {
      setSubmitError("Failed to reach the server. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateModalField = (name: string, value: string) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) {
        error = "Full Name is required.";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters.";
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = "Email address is required.";
        setModalEmailSuggestion("");
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
        setModalEmailSuggestion("");
      } else {
        const typoSuggestion = checkEmailTypo(value);
        setModalEmailSuggestion(typoSuggestion || "");
      }
    } else if (name === "phone") {
      const cleanPhone = value.replace(/\D/g, "");
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (cleanPhone.length < 7) {
        error = "Please enter a valid phone number (at least 7 digits).";
      }
    }
    setModalErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({ ...prev, [name]: value }));
    validateModalField(name, value);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitError("");
    
    const isNameValid = validateModalField("name", modalFormData.name);
    const isEmailValid = validateModalField("email", modalFormData.email);
    const isPhoneValid = validateModalField("phone", modalFormData.phone);

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      return;
    }

    setModalIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalFormData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalSubmitSuccess(true);
        setModalFormData({ name: "", email: "", phone: "" });
        // Set main landing page success state as well
        setSubmitSuccess(true);
        triggerConfetti();
      } else {
        setModalSubmitError(data.error || "Form submission failed. Please try again.");
      }
    } catch (err) {
      setModalSubmitError("Failed to reach the server. Please check your internet connection and try again.");
    } finally {
      setModalIsSubmitting(false);
    }
  };

  // Helper to scroll smoothly to the lead form in Hero
  const scrollToForm = () => {
    const element = document.getElementById("lead-capture-form-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Pulse focus animation on the first input
      const input = document.getElementById("name-input");
      if (input) input.focus();
    }
  };

  // Replace placeholders in text
  const getCopy = (text: string) => {
    return renderCopy(text, COPY_CONFIG.ebookTitle, COPY_CONFIG.targetAudience);
  };

  const renderHeadline = () => {
    const headline = COPY_CONFIG.headline;
    const parts = headline.split("{{TARGET_AUDIENCE}}");
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          <span className="italic text-[#2563eb] underline decoration-blue-200 decoration-3 underline-offset-4">
            {COPY_CONFIG.targetAudience}
          </span>
          {parts[1]}
        </>
      );
    }
    return getCopy(headline);
  };

  // Render the Admin Dashboard if active
  if (isAdminView) {
    return (
      <AdminDashboard 
        onBack={() => {
          window.location.hash = "";
          setIsAdminView(false);
        }} 
      />
    );
  }

  return (
    <div id="landing-page-root" className="min-h-screen bg-white text-[#0f172a] font-sans overflow-x-hidden selection:bg-[#2563eb] selection:text-white">
      
      {/* Subtle top indicator bar */}
      <div className="bg-[#eff6ff] text-[#2563eb] text-center text-xs py-2.5 px-4 font-semibold flex items-center justify-center space-x-2 border-b border-[#e2e8f0]">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#2563eb]" />
        <span className="tracking-wide">LIMITED TIME: Get the complete framework 100% free today</span>
      </div>

      {/* Main Navigation Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Footprints className="h-9 w-9 text-[#2c3e3a] transform -rotate-12 stroke-[1.75]" />
          <span className="font-serif italic font-extrabold text-3xl tracking-tight text-[#2c3e3a] hover:opacity-90 transition-opacity select-none cursor-pointer">
            Becoming.
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-slate-400">Limited Time Offer</span>
          <button
            id="nav-cta-button"
            onClick={scrollToForm}
            className="text-xs sm:text-sm font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Claim Free Ebook
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Decorative subtle ambient backgrounds */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-slate-50 rounded-full filter blur-3xl opacity-60 -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-blue-50/30 rounded-full filter blur-3xl opacity-50 -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Benefit Copy */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#2563eb] uppercase tracking-wider">
              Free Strategy Guide
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-[1.1] text-slate-900 tracking-tight">
              {renderHeadline()}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
              Download <span className="font-semibold text-slate-800">{COPY_CONFIG.ebookTitle}</span> and get the exact step-by-step playbook to get real results faster than you thought possible. No fluff. No jargon. Just what works.
            </p>

            {/* Benefit Checkmarks */}
            <div className="space-y-4">
              {COPY_CONFIG.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-lg text-slate-700">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Micro trust banner inside Hero */}
            <div className="pt-6 flex items-center space-x-4 border-t border-slate-100 max-w-md">
              <div className="flex -space-x-2">
                <img className="h-10 w-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop" alt="User avatar" />
                <img className="h-10 w-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop" alt="User avatar" />
                <img className="h-10 w-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop" alt="User avatar" />
              </div>
              <div className="text-xs text-[#64748b]">
                <div className="flex text-amber-400 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="font-semibold text-slate-700">Join 10,000+ readers who've already transformed their results</p>
              </div>
            </div>
          </div>

          {/* Lead Capture Form Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Ebook Mockup Image with Value Badge */}
            <div className="relative mb-8 w-full max-w-xs flex justify-center">
              <div className="relative group flex justify-center">
                {/* Clean, realistic background shadow that enhances the 3D book feel */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-[290px] bg-slate-900/10 rounded-full blur-2xl filter group-hover:scale-105 transition-all duration-500 -z-10" />
                
                <img 
                  src="/book_cover.jpg" 
                  alt="The First Step to Becoming Book Cover" 
                  className="w-60 h-auto object-contain mx-auto mix-blend-multiply transition-all duration-300 group-hover:scale-[1.03] select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Value Badge */}
              <div className="absolute -right-2 top-8 w-18 h-18 bg-[#2563eb] rounded-full flex items-center justify-center text-white text-center flex-col shadow-xl animate-pulse z-10">
                <span className="text-[8px] uppercase font-bold leading-none">Value</span>
                <span className="text-base font-bold font-serif leading-none">$47</span>
                <span className="text-[8px] uppercase font-bold leading-none line-through opacity-60">FREE</span>
              </div>
            </div>

            <div 
              id="lead-capture-form-container" 
              className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 relative overflow-hidden w-full max-w-md"
            >
              {/* Highlight background strip on success */}
              {submitSuccess && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-success" />
              )}

              <AnimatePresence mode="wait">
                {!submitSuccess ? (
                  <motion.div
                    key="lead-form-fields"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center sm:text-left mb-6 flex flex-col items-center sm:items-start gap-4">
                      <LeadCounterWidget submitSuccess={submitSuccess} />
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                          Get Instant Access
                        </h3>
                        <p className="text-sm text-slate-500">
                          Enter your details to receive the download link.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name input */}
                      <div>
                        <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="h-4 w-4" />
                          </span>
                          <input
                            id="name-input"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.name ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                            placeholder="Jane Doe"
                          />
                        </div>
                        {errors.name && (
                          <p id="name-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{errors.name}</p>
                        )}
                      </div>

                      {/* Email input */}
                      <div>
                        <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            id="email-input"
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.email ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                            placeholder="jane@company.com"
                          />
                        </div>
                        {errors.email && (
                          <p id="email-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{errors.email}</p>
                        )}
                        {emailSuggestion && (
                          <div className="mt-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                              <span>Did you mean <strong className="font-semibold">{emailSuggestion}</strong>?</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, email: emailSuggestion }));
                                setEmailSuggestion("");
                                setErrors(prev => ({ ...prev, email: "" }));
                              }}
                              className="text-[#2563eb] hover:text-blue-700 font-bold ml-2 underline cursor-pointer focus:outline-none"
                            >
                              Yes, use this
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Phone input */}
                      <div>
                        <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="h-4 w-4" />
                          </span>
                          <input
                            id="phone-input"
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                            placeholder="(555) 000-0000"
                          />
                        </div>
                        {errors.phone && (
                          <p id="phone-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{errors.phone}</p>
                        )}
                      </div>

                      {submitError && (
                        <div className="rounded-xl bg-[#fef2f2] p-3 text-xs text-[#ef4444] border border-[#fecaca] font-medium">
                          {submitError}
                        </div>
                      )}

                      {/* CTA Submit Button */}
                      <button
                        id="submit-lead-button"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending Your Playbook...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Me the Free Ebook →</span>
                          </>
                        )}
                      </button>

                      {/* Reassurance Microcopy */}
                      <p className="text-center text-[11px] text-slate-400 pt-2 flex items-center justify-center space-x-1.5 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>100% free. No spam. Unsubscribe anytime.</span>
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="lead-form-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-success">
                      <Check className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Check Your Inbox!
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Your playbook has been successfully registered. We are delivering <strong className="text-slate-900 font-bold">{COPY_CONFIG.ebookTitle}</strong> to your email address right now.
                      </p>
                    </div>

                    <div className="px-2">
                      <a
                        href="/api/asset/ebook"
                        download="The-First-Step-to-Becoming.pdf"
                        className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
                      >
                        <span>📥 Download E-Book Instantly</span>
                      </a>
                    </div>

                    <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200 text-xs text-[#64748b] text-left space-y-2">
                      <p className="font-bold text-slate-900 flex items-center space-x-1">
                        <span>💡</span>
                        <span>What to do next:</span>
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Check your email inbox (and check spam folder just in case).</li>
                        <li>Whitelist <strong>hello@yourdomain.com</strong> to get important cheat sheets.</li>
                        <li>Put the playbook's Chapter 1 framework into practice immediately.</li>
                      </ol>
                    </div>

                    <button
                      id="reset-form-button"
                      onClick={() => setSubmitSuccess(false)}
                      className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] underline"
                    >
                      Fill in different contact details
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* BOOK STATS METRICS HIGHLIGHT SECTION */}
      <section className="py-16 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3 shadow-xs">
              <span className="text-5xl font-serif font-extrabold text-[#2c3e3a] leading-none">12</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Short, Honest Parts</span>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Addressing the quiet panic of feeling behind, recognizing inherited stories, and waking up to who you are trying to become.
              </p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3 shadow-xs">
              <span className="text-5xl font-serif font-extrabold text-[#2c3e3a] leading-none">7</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Days to Simply Begin</span>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                A gentle, non-overwhelming practice including Notice, Ask, Remember, Choose, Pray, Act, and Look Back.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3 shadow-xs">
              <span className="text-5xl font-serif font-extrabold text-[#2c3e3a] leading-none">1</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Question to Change the Search</span>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Discover the one powerful question that helps you let go of measuring your life against a clock that was never yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TRUST SECTION */}
      <section className="bg-slate-50/50 border-y border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-sm font-bold tracking-widest text-[#2563eb] uppercase font-mono">
              PROVEN PLAYBOOK, REAL RESULTS
            </h2>
            <p className="text-3xl font-serif text-slate-900 tracking-tight">
              Join 10,000+ readers who've already transformed their results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {COPY_CONFIG.testimonials.map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer"
                whileHover={{ 
                  scale: 1.03, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  {/* Testimonial Quote */}
                  <p className="text-slate-600 italic text-base leading-relaxed font-serif">
                    “{testimonial.text}”
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-6 flex items-center space-x-3.5 pt-4 border-t border-slate-100">
                  {testimonial.avatarUrl ? (
                    <img 
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-50" 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.author} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{testimonial.author}</h4>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT THE EBOOK SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Cover image mockup representation */}
          <div className="lg:col-span-5 flex justify-center order-last lg:order-first">
            <div className="relative group max-w-xs w-full flex justify-center">
              {/* Ambient elegant background glow and shadow for the 3D book mockup */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2c3e3a]/10 via-transparent to-blue-500/5 rounded-full blur-3xl opacity-80 -z-10" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-900/10 rounded-full blur-xl filter group-hover:scale-110 transition-all duration-500 -z-10" />
              
              {/* Ebook Book Mockup Cover Card */}
              <img 
                src="/book_cover.jpg" 
                alt="The First Step to Becoming Book Cover" 
                className="relative w-72 h-auto object-contain mix-blend-multiply transition-transform group-hover:scale-[1.03] duration-500 select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Core Benefit Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0f172a] tracking-tight leading-tight">
              {COPY_CONFIG.aboutHeadline}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-serif">
              {getCopy(COPY_CONFIG.aboutBody)}
            </p>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-3">The 5-Stage Journey inside:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xs font-bold bg-[#cbdbe0] text-[#2c3e3a] h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Wake Up</h5>
                      <p className="text-xs text-slate-500 leading-tight">Notice what you've been living without noticing.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xs font-bold bg-[#cbdbe0] text-[#2c3e3a] h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Question</h5>
                      <p className="text-xs text-slate-500 leading-tight">Ask honest questions to understand yourself.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xs font-bold bg-[#cbdbe0] text-[#2c3e3a] h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Let Go</h5>
                      <p className="text-xs text-slate-500 leading-tight">Release expensive beliefs and fears.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xs font-bold bg-[#cbdbe0] text-[#2c3e3a] h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Become</h5>
                      <p className="text-xs text-slate-500 leading-tight">Begin living differently, intentionally.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 sm:col-span-2">
                    <span className="text-xs font-bold bg-[#cbdbe0] text-[#2c3e3a] h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Give Back</h5>
                      <p className="text-xs text-slate-500 leading-tight">Turn around to help someone else walk the same road.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-3">Your 7-Day Path to Simply Begin:</h4>
                <div className="flex flex-wrap gap-2">
                  {["Day 1: Notice", "Day 2: Ask", "Day 3: Remember", "Day 4: Choose", "Day 5: Pray", "Day 6: Act", "Day 7: Look Back"].map((day, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CLOSING HERO / FINAL CTA */}
      <section className="bg-[#0f172a] text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Subtle decorative grid backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563eb] rounded-full filter blur-3xl opacity-15 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-widest">
            START WINNING TODAY
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight leading-tight">
            {getCopy(COPY_CONFIG.closingHeadline)}
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-serif">
            {getCopy(COPY_CONFIG.closingBody)}
          </p>

          <div className="pt-4">
            <button
              id="final-scroll-cta-button"
              onClick={scrollToForm}
              className="inline-flex items-center space-x-2.5 px-8 py-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-base font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>Download My Free Ebook</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-slate-500 text-xs mt-3.5">
              Instant delivery. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-400">
            Join <span className="font-bold text-slate-900">10,000+ readers</span> who've already transformed their results.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-40">
            <span className="font-serif italic font-bold text-lg">Forbes</span>
            <span className="font-sans font-black text-lg tracking-tighter">TechCrunch</span>
            <span className="font-sans font-bold text-lg">Wired</span>
            <span className="font-serif font-bold text-lg">The Wall Street Journal</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Footprints className="h-5.5 w-5.5 text-[#2c3e3a] transform -rotate-12 stroke-[1.75]" />
          <span className="font-serif italic font-extrabold text-xl tracking-tight text-[#2c3e3a] select-none">
            Becoming.
          </span>
        </div>
        <p>© 2026 BECOMING. All rights reserved. Built with precision marketing frameworks.</p>
        
        {/* Discreet admin entry link */}
        <div className="pt-2">
          <a 
            id="admin-portal-link"
            href="#admin" 
            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-[#2563eb] transition-colors font-semibold"
          >
            <Lock className="h-3 w-3" />
            <span>Admin Portal</span>
          </a>
        </div>
      </footer>

      {/* EXIT INTENT POPUP MODAL */}
      <AnimatePresence>
        {showExitIntent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitIntent(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-none overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowExitIntent(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Column (Highlight/Visual with Mockup) */}
              <div className="md:col-span-5 bg-slate-50 p-8 flex flex-col justify-center items-center text-center relative border-b md:border-b-0 md:border-r border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                
                <div className="relative space-y-6 flex flex-col items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#2563eb] border border-blue-100 uppercase tracking-wider">
                    Don't Leave Empty-Handed
                  </span>
                  
                  {/* Beautiful Book Cover Representation */}
                  <div className="relative group flex justify-center">
                    {/* Realistic soft floor shadow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900/10 rounded-full blur-md -z-10" />
                    
                    <img 
                      src="/book_cover.jpg" 
                      alt="The First Step to Becoming Book Cover" 
                      className="w-36 h-auto object-contain relative mix-blend-multiply transition-transform group-hover:scale-[1.02] duration-300 select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif font-semibold text-lg text-[#2c3e3a] tracking-tight">The First Step to Becoming</h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      12 short, honest parts to help you stop waiting for life to begin and simply start.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column (Form Capture / Thank You State) */}
              <div className="md:col-span-7 p-8 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!modalSubmitSuccess ? (
                    <motion.div
                      key="modal-form-fields"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start md:items-center flex-wrap gap-2">
                          <span className="text-[#2563eb] text-xs font-bold uppercase tracking-widest block">Wait, Before You Go!</span>
                          <LeadCounterWidget submitSuccess={modalSubmitSuccess} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                          Claim Your Free Guide Instantly
                        </h3>
                        <p className="text-sm text-slate-500">
                          We don't want you to stay stuck in comparison. Enter your details to start reading Gbolahan Oyegoke's companion guide right away.
                        </p>
                      </div>

                      <form onSubmit={handleModalSubmit} className="space-y-4">
                        {/* Name input */}
                        <div>
                          <label htmlFor="modal-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <User className="h-4 w-4" />
                            </span>
                            <input
                              id="modal-name-input"
                              type="text"
                              name="name"
                              required
                              value={modalFormData.name}
                              onChange={handleModalChange}
                              className={`w-full pl-10 pr-4 py-3 border ${modalErrors.name ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                              placeholder="Jane Doe"
                            />
                          </div>
                          {modalErrors.name && (
                            <p id="modal-name-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{modalErrors.name}</p>
                          )}
                        </div>

                         {/* Email input */}
                        <div>
                          <label htmlFor="modal-email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Email Address
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Mail className="h-4 w-4" />
                            </span>
                            <input
                              id="modal-email-input"
                              type="email"
                              name="email"
                              required
                              value={modalFormData.email}
                              onChange={handleModalChange}
                              className={`w-full pl-10 pr-4 py-3 border ${modalErrors.email ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                              placeholder="jane@company.com"
                            />
                          </div>
                          {modalErrors.email && (
                            <p id="modal-email-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{modalErrors.email}</p>
                          )}
                          {modalEmailSuggestion && (
                            <div className="mt-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 flex items-center justify-between">
                              <span className="flex items-center space-x-1">
                                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                <span>Did you mean <strong className="font-semibold">{modalEmailSuggestion}</strong>?</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setModalFormData(prev => ({ ...prev, email: modalEmailSuggestion }));
                                  setModalEmailSuggestion("");
                                  setModalErrors(prev => ({ ...prev, email: "" }));
                                }}
                                className="text-[#2563eb] hover:text-blue-700 font-bold ml-2 underline cursor-pointer focus:outline-none"
                              >
                                Yes, use this
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Phone input */}
                        <div>
                          <label htmlFor="modal-phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Phone Number
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Phone className="h-4 w-4" />
                            </span>
                            <input
                              id="modal-phone-input"
                              type="tel"
                              name="phone"
                              required
                              value={modalFormData.phone}
                              onChange={handleModalChange}
                              className={`w-full pl-10 pr-4 py-3 border ${modalErrors.phone ? "border-[#ef4444] focus:ring-[#ef4444]" : "border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10"} rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium bg-white`}
                              placeholder="(555) 000-0000"
                            />
                          </div>
                          {modalErrors.phone && (
                            <p id="modal-phone-error-message" className="text-xs text-[#ef4444] mt-1 font-semibold">{modalErrors.phone}</p>
                          )}
                        </div>

                        {modalSubmitError && (
                          <div className="rounded-xl bg-[#fef2f2] p-3 text-xs text-[#ef4444] border border-[#fecaca] font-medium">
                            {modalSubmitError}
                          </div>
                        )}

                        <button
                          id="modal-submit-lead-button"
                          type="submit"
                          disabled={modalIsSubmitting}
                          className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {modalIsSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Sending Your Guide...</span>
                            </>
                          ) : (
                            <>
                              <span>Get Free Guide Now →</span>
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="modal-form-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 space-y-5"
                    >
                      <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-success">
                        <Check className="h-8 w-8" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          Check Your Inbox!
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                          We have registered your request. <strong className="text-slate-900 font-bold">{COPY_CONFIG.ebookTitle}</strong> is being delivered to your email address right now.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto w-full">
                        <a
                          href="/api/asset/ebook"
                          download="The-First-Step-to-Becoming.pdf"
                          className="flex-1 w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors text-center"
                        >
                          <span>📥 Download E-Book</span>
                        </a>
                        <button
                          onClick={() => setShowExitIntent(false)}
                          className="flex-1 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer animate-none"
                        >
                          Start Reading
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
