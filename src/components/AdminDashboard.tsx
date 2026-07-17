import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  Search, 
  Download, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Mail, 
  TrendingUp, 
  ArrowUpDown,
  User,
  Image as ImageIcon,
  Save,
  Upload,
  BookOpen,
  FileText
} from "lucide-react";
import { Lead } from "../types";

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "name" | "email">("date-desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<"leads" | "profile" | "ebook">("leads");

  // Profile management state
  const [authorName, setAuthorName] = useState("");
  const [profilePicBase64, setProfilePicBase64] = useState<string | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("/profile_picture.jpg");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);

  // Image Cropper States (Circular Profile Photo Cropping)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null); // Original uploaded image as DataURL
  const [cropZoom, setCropZoom] = useState<number>(1.0);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ebook management state
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [ebookBase64, setEbookBase64] = useState<string | null>(null);
  const [ebookInfo, setEbookInfo] = useState<{ exists: boolean; size?: number; mtime?: number } | null>(null);
  const [isEbookLoading, setIsEbookLoading] = useState(false);
  const [isEbookSaving, setIsEbookSaving] = useState(false);
  const [ebookSuccessMessage, setEbookSuccessMessage] = useState("");
  const [ebookErrorMessage, setEbookErrorMessage] = useState("");
  const [isDraggingEbook, setIsDraggingEbook] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch relevant tab data when authenticated or active tab changes
  useEffect(() => {
    if (isAuthenticated && token) {
      if (activeTab === "leads") {
        fetchLeads();
      } else if (activeTab === "profile") {
        fetchProfileSettings();
      } else if (activeTab === "ebook") {
        fetchEbookInfo();
      }
    }
  }, [isAuthenticated, token, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Invalid password. Please try again.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setToken("");
      setIsAuthenticated(false);
      localStorage.removeItem("admin_token");
    }
  };

  const fetchLeads = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(data.data);
      } else {
        if (res.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchProfileSettings = async () => {
    setIsProfileLoading(true);
    setProfileErrorMessage("");
    try {
      const res = await fetch("/api/admin/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthorName(data.authorName);
        setCacheBuster(Date.now());
        setProfilePicPreview(`/profile_picture.jpg?cb=${Date.now()}`);
      } else {
        setProfileErrorMessage(data.error || "Failed to load profile settings.");
      }
    } catch (err) {
      setProfileErrorMessage("Failed to connect to server to fetch profile settings.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMessage("");
    setProfileErrorMessage("");

    if (!authorName.trim() || authorName.trim().length < 2) {
      setProfileErrorMessage("Please enter a valid author name (at least 2 characters).");
      return;
    }

    setIsProfileSaving(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          profilePictureBase64: profilePicBase64
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccessMessage(data.message || "Profile updated successfully!");
        setProfilePicBase64(null); // reset selected upload
        setCacheBuster(Date.now());
        // Reload settings
        await fetchProfileSettings();
      } else {
        setProfileErrorMessage(data.error || "Failed to save profile settings.");
      }
    } catch (err) {
      setProfileErrorMessage("Failed to save settings. Connection to server lost.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setProfileErrorMessage("Please select an image file (PNG/JPG/WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMessage("Image size is too large (maximum 5MB allowed).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCropImageSrc(base64String); // Open crop modal with this source
      setCropZoom(1.0); // Reset zoom
      setCropOffset({ x: 0, y: 0 }); // Reset offsets
      setProfileSuccessMessage("");
      setProfileErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  // 1. Real-time Cropping Canvas Redraw Logic
  useEffect(() => {
    if (!cropImageSrc) return;
    const canvas = document.getElementById("cropper-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Clear the canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Scale to fit while maintaining aspect ratio
      const imgRatio = img.width / img.height;
      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;

      if (imgRatio > 1) {
        // Wide image
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
      } else {
        // Tall image
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
      }

      // Apply Zoom multiplier
      drawWidth *= cropZoom;
      drawHeight *= cropZoom;

      // Center coords
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // Centered render offsets plus user translation drag offsets
      const x = cx - drawWidth / 2 + cropOffset.x;
      const y = cy - drawHeight / 2 + cropOffset.y;

      // Draw the original image onto the canvas under the mask
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Draw elegant circular masking overlay (even-odd rule)
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)"; // Semi-transparent dark slate
      ctx.beginPath();
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      
      const radius = Math.min(canvasWidth, canvasHeight) * 0.42; // Circular bounds for profile avatar (42% size)
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true); // Counter-clockwise circle cutout
      ctx.fill();

      // Draw a subtle, crisp white border representing the crop boundary
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    };
    img.src = cropImageSrc;
  }, [cropImageSrc, cropZoom, cropOffset]);

  // Mouse Drag Handlers for Image Translation
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  // Touch Screen Drag Handlers (Native Mobile Support)
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDraggingCrop(true);
    setDragStart({ x: touch.clientX - cropOffset.x, y: touch.clientY - cropOffset.y });
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingCrop) return;
    const touch = e.touches[0];
    setCropOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleCanvasMouseUpOrLeave = () => {
    setIsDraggingCrop(false);
  };

  // Extract crop content as high resolution (400x400) profile base64
  const applyCrop = () => {
    if (!cropImageSrc) return;
    const canvas = document.createElement("canvas");
    canvas.width = 400; // Standard crisp res for dynamic avatar serving
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const canvasWidth = 400;
      const canvasHeight = 400;

      const imgRatio = img.width / img.height;
      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;

      if (imgRatio > 1) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
      } else {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
      }

      // Apply Zoom factor
      drawWidth *= cropZoom;
      drawHeight *= cropZoom;

      // Scale calculations from 280-pixel visual workspace to 400-pixel target extraction
      const scaleFactor = 400 / 280;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      const x = cx - drawWidth / 2 + cropOffset.x * scaleFactor;
      const y = cy - drawHeight / 2 + cropOffset.y * scaleFactor;

      // Draw the image cleanly at high resolution
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Convert to base64 Data URL
      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      setProfilePicBase64(croppedBase64);
      setProfilePicPreview(croppedBase64);
      
      // Close crop modal
      setCropImageSrc(null);
    };
    img.src = cropImageSrc;
  };

  // EBOOK HANDLERS
  const fetchEbookInfo = async () => {
    setIsEbookLoading(true);
    setEbookErrorMessage("");
    try {
      const res = await fetch("/api/admin/ebook-info", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEbookInfo(data);
      } else {
        setEbookErrorMessage(data.error || "Failed to load active ebook information.");
      }
    } catch (err) {
      setEbookErrorMessage("Failed to connect to server to fetch ebook information.");
    } finally {
      setIsEbookLoading(false);
    }
  };

  const handleSaveEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setEbookSuccessMessage("");
    setEbookErrorMessage("");

    if (!ebookBase64) {
      setEbookErrorMessage("Please select a valid Ebook PDF file to upload first.");
      return;
    }

    setIsEbookSaving(true);

    try {
      const res = await fetch("/api/admin/ebook", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ebookBase64: ebookBase64
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEbookSuccessMessage(data.message || "Ebook uploaded successfully!");
        setEbookBase64(null); // Reset uploading buffer
        setEbookFile(null); // Reset uploader file
        await fetchEbookInfo(); // Refresh stats
      } else {
        setEbookErrorMessage(data.error || "Failed to upload Ebook file.");
      }
    } catch (err) {
      setEbookErrorMessage("Failed to save Ebook file. Connection to server lost.");
    } finally {
      setIsEbookSaving(false);
    }
  };

  const handleEbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processEbookFile(file);
    }
  };

  const processEbookFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setEbookErrorMessage("Please select a valid PDF file. Other file types are not supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEbookErrorMessage("Ebook file size exceeds 10MB limit (maximum 10MB allowed).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEbookBase64(base64String);
      setEbookFile(file);
      setEbookSuccessMessage("");
      setEbookErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const formatDate = (mtime?: string | number) => {
    if (!mtime) return "Unknown";
    return new Date(mtime).toLocaleString();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const filteredLeads = getFilteredAndSortedLeads();
    const headers = ["Name", "Email", "Phone", "Date Captured", "Email Sent Status", "Delivery Error"];
    const rows = filteredLeads.map(lead => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email}"`,
      `"${lead.phone}"`,
      `"${new Date(lead.createdAt).toLocaleString()}"`,
      lead.emailSent ? "Sent Successfully" : "Failed / Not Configured",
      `"${(lead.emailSentError || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Captured_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredAndSortedLeads = () => {
    let result = leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
    );

    result.sort((a, b) => {
      if (sortBy === "date-desc") return b.createdAt - a.createdAt;
      if (sortBy === "date-asc") return a.createdAt - b.createdAt;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      return 0;
    });

    return result;
  };

  const totalLeadsCount = leads.length;
  const emailsSentCount = leads.filter(l => l.emailSent).length;
  const emailsFailedCount = leads.filter(l => !l.emailSent && l.emailSentError).length;

  const filteredLeads = getFilteredAndSortedLeads();

  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#eff6ff] flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-[#2563eb]" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#0f172a] tracking-tight">
              Admin Dashboard Sign In
            </h2>
            <p className="mt-2 text-sm text-[#64748b]">
              Enter your password to view and export captured leads.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm border border-[#e2e8f0] sm:rounded-2xl sm:px-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#0f172a]">
                  Admin Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl shadow-sm placeholder-[#64748b] focus:outline-none focus:ring-[#2563eb] focus:border-[#2563eb] sm:text-sm"
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              {loginError && (
                <div className="rounded-lg bg-[#fef2f2] p-3 text-sm text-[#ef4444] border border-[#fecaca] font-medium">
                  {loginError}
                </div>
              )}

              <div className="flex space-y-2 flex-col">
                <button
                  id="submit-login-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Signing In..." : "Access Leads"}
                </button>
                <button
                  id="back-to-landing-button"
                  type="button"
                  onClick={onBack}
                  className="w-full text-center text-sm font-medium text-[#64748b] hover:text-[#0f172a] py-2 transition-colors"
                >
                  ← Back to Landing Page
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-leads-dashboard" className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb]">
                Admin Core
              </span>
              <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Management Console</h1>
            </div>

            {/* TAB SELECTOR */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab("leads")}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "leads" 
                    ? "bg-white text-[#2563eb] shadow-xs" 
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Leads Database</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "profile" 
                    ? "bg-white text-[#2563eb] shadow-xs" 
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("ebook")}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "ebook" 
                    ? "bg-white text-[#2563eb] shadow-xs" 
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>E-Book Settings</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab === "leads" && (
              <button
                id="refresh-leads-button"
                onClick={fetchLeads}
                disabled={isRefreshing}
                className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-slate-50 rounded-lg border border-[#e2e8f0] transition-colors cursor-pointer"
                title="Refresh database"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              id="logout-button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-3.5 py-2 border border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              id="back-to-landing-main-button"
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 bg-[#0f172a] text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              View Landing Page
            </button>
          </div>
        </div>

        {/* MOBILE TAB SELECTOR */}
        <div className="flex md:hidden border-t border-slate-100 p-2 bg-[#f8fafc] justify-center">
          <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-xl w-full max-w-sm">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg font-bold text-[10px] transition-all ${
                activeTab === "leads" 
                  ? "bg-white text-[#2563eb] shadow-xs" 
                  : "text-[#64748b]"
              }`}
            >
              <Users className="h-3.5 w-3.5 mr-0.5" />
              <span>Leads</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg font-bold text-[10px] transition-all ${
                activeTab === "profile" 
                  ? "bg-white text-[#2563eb] shadow-xs" 
                  : "text-[#64748b]"
              }`}
            >
              <User className="h-3.5 w-3.5 mr-0.5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("ebook")}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg font-bold text-[10px] transition-all ${
                activeTab === "ebook" 
                  ? "bg-white text-[#2563eb] shadow-xs" 
                  : "text-[#64748b]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 mr-0.5" />
              <span>E-Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {activeTab === "leads" && (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#64748b]">Total Leads Captured</p>
                  <p className="text-3xl font-extrabold text-[#0f172a]">{totalLeadsCount}</p>
                </div>
                <div className="p-3 bg-[#eff6ff] rounded-xl">
                  <Users className="h-6 w-6 text-[#2563eb]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#64748b]">Ebooks Delivered</p>
                  <p className="text-3xl font-extrabold text-success">{emailsSentCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#64748b]">Delivery Blocked / Offline</p>
                  <p className="text-3xl font-extrabold text-[#f59e0b]">{emailsFailedCount}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search className="h-5 w-5 text-[#64748b]" />
                </span>
                <input
                  id="search-leads-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads by name, email, or phone..."
                  className="w-full pl-11 pr-4 py-2.5 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#0f172a] placeholder-[#64748b] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
              </div>

              <div className="flex w-full md:w-auto items-center gap-3 self-end md:self-auto">
                <div className="flex items-center space-x-2 border border-[#e2e8f0] bg-[#f8fafc] rounded-xl p-1 text-sm">
                  <button
                    id="sort-date-desc"
                    onClick={() => setSortBy("date-desc")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${sortBy === "date-desc" ? "bg-white text-[#0f172a] shadow-xs" : "text-[#64748b] hover:text-[#0f172a]"}`}
                  >
                    Newest First
                  </button>
                  <button
                    id="sort-name"
                    onClick={() => setSortBy("name")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${sortBy === "name" ? "bg-white text-[#0f172a] shadow-xs" : "text-[#64748b] hover:text-[#0f172a]"}`}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    id="sort-email"
                    onClick={() => setSortBy("email")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${sortBy === "email" ? "bg-white text-[#0f172a] shadow-xs" : "text-[#64748b] hover:text-[#0f172a]"}`}
                  >
                    Email
                  </button>
                </div>

                <button
                  id="export-csv-button"
                  onClick={handleExportCSV}
                  disabled={filteredLeads.length === 0}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Leads Table Card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#64748b] tracking-wider">Date Captured</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#64748b] tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#64748b] tracking-wider">Contact Info</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#64748b] tracking-wider">Email Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-[#64748b]">
                          {leads.length === 0 ? "No leads captured yet. Your ebook launch is ready!" : "No leads match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id || lead.email} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm text-[#0f172a] font-medium">
                            {new Date(lead.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-[#0f172a]">
                            {lead.name}
                          </td>
                          <td className="px-6 py-4.5 space-y-1">
                            <div className="text-sm font-medium text-[#0f172a] flex items-center space-x-1.5">
                              <span className="text-slate-400">✉</span>
                              <span>{lead.email}</span>
                            </div>
                            <div className="text-xs text-[#64748b] flex items-center space-x-1.5 font-mono">
                              <span className="text-slate-400">☎</span>
                              <span>{lead.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            {lead.emailSent ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-success">
                                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5"></span>
                                Sent Successfully
                              </span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#d97706] mb-1 self-start">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mr-1.5"></span>
                                  Pending / Not Sent
                                </span>
                                {lead.emailSentError && (
                                  <span className="text-xs text-[#ef4444] font-medium max-w-xs truncate" title={lead.emailSentError}>
                                    {lead.emailSentError}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
                <p>Showing <strong>{filteredLeads.length}</strong> of <strong>{totalLeadsCount}</strong> captured leads</p>
                <p>Secure Leads Database</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "profile" && (
          /* PROFILE MANAGEMENT VIEW */
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e2e8f0] shadow-md overflow-hidden">
            <div className="px-6 py-6 border-b border-[#e2e8f0] bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">Profile & Email Customization</h2>
              <p className="text-xs text-[#64748b] mt-1">
                Upload your custom profile photo and configure the dynamic author name displayed on delivery emails.
              </p>
            </div>

            {isProfileLoading ? (
              <div className="p-12 text-center text-[#64748b] flex flex-col items-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-[#2563eb]" />
                <p className="text-sm font-medium">Fetching active profile configurations...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="p-6 space-y-8">
                
                {/* SUCCESS & ERROR FEEDBACK */}
                {profileSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-success text-sm rounded-xl font-medium flex items-center space-x-2.5">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{profileSuccessMessage}</span>
                  </div>
                )}
                {profileErrorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-[#ef4444] text-sm rounded-xl font-medium flex items-center space-x-2.5">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{profileErrorMessage}</span>
                  </div>
                )}

                {/* AUTHOR NAME SECTION */}
                <div className="space-y-2">
                  <label htmlFor="author-name" className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Sender Display Name
                  </label>
                  <p className="text-xs text-slate-500">
                    This name will be dynamically rendered across all lead-delivery email templates and greetings.
                  </p>
                  <div className="relative max-w-lg mt-2">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="author-name"
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                      placeholder="e.g. Gbolahan Oyegoke"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm outline-none transition-all text-[#0f172a] font-medium"
                    />
                  </div>
                </div>

                {/* PROFILE PICTURE DRAG-AND-DROP UPLOAD SECTION */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Author Profile Picture
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Used directly inside the email body template. PNG, JPG or WEBP formats. Max size 5MB.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Visual Preview */}
                    <div className="md:col-span-4 flex flex-col items-center space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Preview</p>
                      <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-slate-100 bg-slate-50 flex items-center justify-center">
                        <img
                          src={profilePicPreview}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // If load fails, set standard default fallback avatar icon
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop";
                          }}
                        />
                      </div>
                      {profilePicBase64 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          New Image Selected
                        </span>
                      )}
                    </div>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`md:col-span-8 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5 ${
                        isDragging 
                          ? "border-[#2563eb] bg-blue-50/50 scale-[0.99]" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
                      }`}
                      onClick={() => document.getElementById("profile-image-upload")?.click()}
                    >
                      <div className="p-3 bg-slate-50 rounded-full border border-slate-100 text-[#2563eb]">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800">
                          Drag and drop your picture here
                        </p>
                        <p className="text-xs text-slate-400">
                          or <span className="text-[#2563eb] font-semibold underline">browse directories</span> on your device
                        </p>
                      </div>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>

                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("leads")}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isProfileSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Profile Settings</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {activeTab === "ebook" && (
          /* EBOOK MANAGEMENT VIEW */
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e2e8f0] shadow-md overflow-hidden animate-fade-in">
            <div className="px-6 py-6 border-b border-[#e2e8f0] bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-[#2563eb]" />
                <span>E-Book Download Asset Manager</span>
              </h2>
              <p className="text-xs text-[#64748b] mt-1">
                Upload and replace the E-Book PDF file. Captured leads will instantly download this file when they click the "Free E-Book" button.
              </p>
            </div>

            {isEbookLoading ? (
              <div className="p-12 text-center text-[#64748b] flex flex-col items-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-[#2563eb]" />
                <p className="text-sm font-medium">Loading asset configuration settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveEbook} className="p-6 space-y-8">
                {/* SUCCESS & ERROR FEEDBACK */}
                {ebookSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-success text-sm rounded-xl font-medium flex items-center space-x-2.5">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{ebookSuccessMessage}</span>
                  </div>
                )}
                {ebookErrorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-[#ef4444] text-sm rounded-xl font-medium flex items-center space-x-2.5">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{ebookErrorMessage}</span>
                  </div>
                )}

                {/* CURRENT ACTIVE ASSET PREVIEW CARD */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active E-Book Status
                  </h3>
                  
                  {ebookInfo?.exists ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-red-50 border border-red-100 text-[#ef4444] rounded-xl shrink-0">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-800">ebook.pdf</p>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                            <span>Size: <strong>{formatBytes(ebookInfo.size)}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Last Updated: <strong>{formatDate(ebookInfo.mtime)}</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      <a
                        href="/ebook.pdf"
                        download="The-First-Step-to-Becoming.pdf"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
                        title="Download active ebook to preview"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Preview Active E-Book</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 border border-amber-200 text-amber-900 rounded-2xl p-5 flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">No Active E-Book PDF Uploaded!</h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          The ebook file is missing. Leads will not receive attachments, and direct downloads on successful form capture will fail. Please upload a PDF ebook uploader below to initialize.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* FILE UPLOAD DRAG/DROP ZONE */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Upload New E-Book (PDF)
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Selected file card */}
                    {ebookFile && (
                      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-[#2563eb]" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{ebookFile.name}</p>
                            <p className="text-[10px] text-slate-500">{formatBytes(ebookFile.size)}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          Ready to Upload
                        </span>
                      </div>
                    )}

                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingEbook(true); }}
                      onDragLeave={() => setIsDraggingEbook(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingEbook(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processEbookFile(file);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                        isDraggingEbook 
                          ? "border-[#2563eb] bg-blue-50/50 scale-[0.99]" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
                      }`}
                      onClick={() => document.getElementById("ebook-pdf-upload")?.click()}
                    >
                      <div className="p-3 bg-slate-50 rounded-full border border-slate-100 text-[#2563eb]">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                          Drag and drop your PDF ebook here
                        </p>
                        <p className="text-xs text-slate-400">
                          or <span className="text-[#2563eb] font-semibold underline">browse directories</span> on your computer
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">Supported Format: PDF only (Max 10MB)</p>
                      <input
                        id="ebook-pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleEbookFileChange}
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Footer Action Controls */}
                <div className="flex items-center space-x-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEbookFile(null);
                      setEbookBase64(null);
                      setActiveTab("leads");
                    }}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-semibold transition-colors cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEbookSaving || !ebookBase64}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isEbookSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Uploading E-Book Asset...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Upload & Save E-Book</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* CROP MODAL DIALOG */}
        {cropImageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden w-full max-w-md flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">Crop Profile Photo</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Drag to reposition & zoom to fit the circle perfectly</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setCropImageSrc(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors h-8 w-8 rounded-full bg-white flex items-center justify-center cursor-pointer border border-slate-100 shadow-xs focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body / Canvas */}
              <div className="p-6 flex flex-col items-center justify-center space-y-6 flex-1 overflow-y-auto">
                {/* Interactive Canvas Container */}
                <div className="relative border-4 border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50 w-[280px] h-[280px] cursor-grab active:cursor-grabbing select-none">
                  <canvas
                    id="cropper-canvas"
                    width={280}
                    height={280}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUpOrLeave}
                    onMouseLeave={handleCanvasMouseUpOrLeave}
                    onTouchStart={handleCanvasTouchStart}
                    onTouchMove={handleCanvasTouchMove}
                    onTouchEnd={handleCanvasMouseUpOrLeave}
                    className="w-full h-full block"
                  />
                </div>

                {/* Slider for Zoom */}
                <div className="w-full space-y-2 px-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Zoom Level</span>
                    <span>{Math.round(cropZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCropImageSrc(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Crop & Apply</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
