"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { SIMULATED_ACCOUNTS, CATEGORIES } from "@/lib/mockData";
import { analyzeImage, AnalysisResult } from "@/lib/imageAnalyzer";
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  Menu, 
  Mic, 
  Camera, 
  Globe, 
  User, 
  LogOut, 
  History,
  X
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { 
    cart, 
    user, 
    switchUser, 
    logoutUser,
    pincode, 
    updatePincode, 
    recentSearches, 
    addRecentSearch, 
    clearRecentSearches 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [language, setLanguage] = useState("EN");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dialogs
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [imageSearchActive, setImageSearchActive] = useState(false);
  const [editingPincode, setEditingPincode] = useState(false);
  const [pinInput, setPinInput] = useState(pincode);

  // Voice & Image Search details
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<AnalysisResult | null>(null);
  const [imageScanning, setImageScanning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const closeVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceSearchActive(false);
    setVoiceTranscript("");
    setVoiceError("");
  };

  const closeImageSearch = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setImageSearchActive(false);
    setUploadedImageSrc(null);
    setImageAnalysis(null);
    setImageScanning(false);
    setCountdown(null);
  };

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions list
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const sampleKeywords = [
      "echo", "dot", "alexa", "kindle", "paperwhite", "iphone", 
      "apple", "sony", "headphones", "asus", "laptop", "gaming", 
      "nike", "shoes", "running", "instant pot", "cooker", "books", "atomic habits",
      "samsung", "galaxy", "ipad", "jbl", "speaker", "realme", "buds", "earbuds", 
      "levis", "jeans", "rayban", "sunglasses", "casio", "watch", "puma", "tshirt", 
      "boat", "smartwatch", "dyson", "fan", "philips", "mixer", "prestige", "induction", 
      "milton", "flask", "bottle", "yoga", "mat", "dumbbell", "gym", "yonex", 
      "badminton", "racket", "football", "psychology", "money", "sapiens", "ikigai", 
      "rich dad", "fire tv", "ring", "doorbell", "echo show"
    ];
    const filtered = sampleKeywords.filter((k) =>
      k.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    addRecentSearch(searchQuery);
    setShowSuggestions(false);
    
    let url = `/search?q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory) {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    router.push(url);
  };

  const handleSuggestionClick = (val: string) => {
    setSearchQuery(val);
    addRecentSearch(val);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(val)}${selectedCategory ? `&category=${selectedCategory}` : ""}`);
  };

  const startVoiceSearch = () => {
    setVoiceTranscript("");
    setVoiceError("");
    setVoiceSearchActive(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser.");
      // Fallback simulation
      setTimeout(() => {
        setVoiceTranscript("Sony headphones");
        setTimeout(() => {
          setSearchQuery("Sony headphones");
          setVoiceSearchActive(false);
          router.push("/search?q=Sony%20headphones");
        }, 1000);
      }, 1500);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setVoiceTranscript("Listening...");
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setVoiceError(`Error: ${event.error}`);
      };

      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setVoiceTranscript(transcript);
      };

      rec.onend = () => {
        setVoiceTranscript(prev => {
          if (prev && prev !== "Listening...") {
            setTimeout(() => {
              setSearchQuery(prev);
              setVoiceSearchActive(false);
              router.push(`/search?q=${encodeURIComponent(prev)}`);
            }, 1000);
          } else {
            setVoiceError("No speech detected. Try again.");
            setTimeout(() => {
              setVoiceSearchActive(false);
            }, 2000);
          }
          return prev;
        });
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setVoiceError(`Could not start: ${err.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setUploadedImageSrc(null);
      setImageAnalysis(null);
      setCountdown(null);
      
      setImageScanning(true);
      
      const dataUrl = URL.createObjectURL(file);
      setUploadedImageSrc(dataUrl);

      try {
        const result = await analyzeImage(file);
        
        setTimeout(() => {
          setImageScanning(false);
          setImageAnalysis(result);
          
          if (result.matchingKeywords && result.matchingKeywords.length > 0) {
            const firstKeyword = result.matchingKeywords[0];
            let timeRemaining = 3000;
            setCountdown(timeRemaining);
            
            countdownIntervalRef.current = setInterval(() => {
              timeRemaining -= 100;
              setCountdown(timeRemaining);
              if (timeRemaining <= 0) {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              }
            }, 100);

            countdownTimerRef.current = setTimeout(() => {
              setSearchQuery(firstKeyword);
              closeImageSearch();
              router.push(`/search?q=${encodeURIComponent(firstKeyword)}`);
            }, 3000);
          }
        }, 1500);

      } catch (err) {
        console.error("Image analysis error", err);
        setImageScanning(false);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSearchQuery(tag);
    closeImageSearch();
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim()) {
      updatePincode(pinInput.trim());
      setEditingPincode(false);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <header className="header">
      {/* Top Main Header */}
      <div className="header-top">
        {/* Logo */}
        <div className="header-logo-container">
          <button 
            className="sub-nav-link" 
            style={{ background: "none", border: "none" }}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} color="#fff" />
          </button>
          <Link href="/" className="header-logo">
            respawn<span>.in</span>
          </Link>
        </div>

        {/* Location Pin */}
        <div className="header-pin" onClick={() => setEditingPincode(true)}>
          <MapPin size={20} color="#fff" />
          <div>
            <span>Deliver to {user.name.split(" ")[0]}</span>
            <span className="header-pin-bold">{user.city} {pincode}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="header-search" ref={searchRef}>
          <select 
            className="search-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          <form onSubmit={handleSearchSubmit} className="search-input-container">
            <input
              type="text"
              placeholder="Search Respawn"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            
            {/* Voice and Image Search Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingRight: "10px", background: "#fff" }}>
              <button 
                type="button" 
                title="Voice Search"
                style={{ background: "none", padding: "4px" }}
                onClick={startVoiceSearch}
              >
                <Mic size={18} color="#555" />
              </button>
              <button 
                type="button" 
                title="Search by Image"
                style={{ background: "none", padding: "4px" }}
                onClick={() => setImageSearchActive(true)}
              >
                <Camera size={18} color="#555" />
              </button>
            </div>

            {/* Suggestions Overlay */}
            {showSuggestions && (
              <div className="search-suggestions">
                {/* Recent Searches */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div>
                    <div style={{ padding: "8px 15px", fontSize: "12px", color: "#666", display: "flex", justifyContent: "space-between", background: "#f9f9f9" }}>
                      <span>Recent Searches</span>
                      <button style={{ background: "none", color: "#007185", fontSize: "11px" }} onClick={clearRecentSearches}>Clear</button>
                    </div>
                    {recentSearches.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="suggestion-item"
                        onMouseDown={() => handleSuggestionClick(item)}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><History size={14} color="#888" /> {item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Autocomplete suggestions */}
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionClick(item)}
                  >
                    <span>{item}</span>
                    <span style={{ fontSize: "11px", color: "#888" }}>Search suggestion</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          <button onClick={() => handleSearchSubmit()} className="search-btn">
            <Search size={20} color="#131921" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="header-link-item" style={{ flexDirection: "row", alignItems: "center", gap: "4px" }}>
          <Globe size={16} />
          <span className="header-link-bold">{language}</span>
          <div className="dropdown-menu" style={{ width: "120px" }}>
            <div className="dropdown-title">Select Language</div>
            {["EN - English", "HI - Hindi", "TA - Tamil", "TE - Telugu", "KN - Kannada"].map((lang) => (
              <button 
                key={lang} 
                className="dropdown-link" 
                style={{ background: "none", width: "100%", textAlign: "left" }}
                onClick={() => setLanguage(lang.split(" ")[0])}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Account & Lists */}
        <div className="header-link-item">
          <span>Hello, {user?.name ? user.name.split(" ")[0] : "Sign in"}</span>
          <span className="header-link-bold">Account & Lists</span>
          
          <div className="dropdown-menu" style={{ minWidth: "250px" }}>
            {/* Amazon Sign-In/Out Section */}
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {user.id === "acc-1" || user.id === "acc-2" || user.id.startsWith("mock-user-") || (user.id && user.id.length > 5) ? (
                <button
                  onClick={() => logoutUser()}
                  style={{
                    backgroundColor: "#f0f2f2",
                    backgroundImage: "linear-gradient(to bottom, #f7f8f8, #e7e9ec)",
                    border: "1px solid #adb1b8",
                    borderRadius: "3px",
                    color: "#111",
                    padding: "6px 20px",
                    textAlign: "center",
                    width: "100%",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset",
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  href="/login" 
                  style={{
                    backgroundColor: "#f0c14b",
                    backgroundImage: "linear-gradient(to bottom, #f7dfa5, #f0c14b)",
                    border: "1px solid #a88734",
                    borderRadius: "3px",
                    color: "#111",
                    padding: "6px 20px",
                    textAlign: "center",
                    width: "100%",
                    fontSize: "12px",
                    fontWeight: "500",
                    textDecoration: "none",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset",
                  }}
                >
                  Sign In
                </Link>
              )}
              <div style={{ fontSize: "11px", marginTop: "6px", color: "#333" }}>
                New customer? <Link href="/signup" style={{ color: "#007185", textDecoration: "none" }}>Start here.</Link>
              </div>
            </div>
            
            <div style={{ margin: "4px 0", borderBottom: "1px solid #eee" }}></div>

            <div className="dropdown-title">Your Account</div>
            <Link href="/orders" className="dropdown-link">Your Orders</Link>
            <Link href="/cart" className="dropdown-link">Your Wishlist</Link>
            <div style={{ margin: "8px 0", borderBottom: "1px solid #eee" }}></div>
            
            <div className="dropdown-title" style={{ borderBottom: "none", marginBottom: "4px" }}>Switch User Account</div>
            {SIMULATED_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => switchUser(acc.id)}
                className="dropdown-link"
                style={{ 
                  background: "none", 
                  width: "100%", 
                  textAlign: "left",
                  fontWeight: user.id === acc.id ? "700" : "400",
                  color: user.id === acc.id ? "var(--amazon-orange-hover)" : "#333"
                }}
              >
                {acc.name} ({acc.city})
              </button>
            ))}
          </div>
        </div>

        {/* Returns & Orders */}
        <Link href="/orders" className="header-link-item">
          <span>Returns</span>
          <span className="header-link-bold">& Orders</span>
        </Link>

        {/* Cart */}
        <div 
          className="header-link-item header-cart"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.dropdown-menu')) return;
            router.push("/cart");
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="cart-icon-container">
            <ShoppingCart size={28} />
            <span className="cart-badge">{totalCartItems}</span>
          </div>
          <span className="header-link-bold" style={{ alignSelf: "flex-end" }}>Cart</span>
          
          {/* Mini-cart Dropdown */}
          {cart.length > 0 && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: "280px" }}>
              <div className="dropdown-title">Cart Subtotal ({totalCartItems} items)</div>
              <p style={{ fontWeight: 700, color: "var(--price-color)", fontSize: "16px", marginBottom: "12px" }}>
                ₹{cartSubtotal.toLocaleString("en-IN")}
              </p>
              <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "12px" }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", marginBottom: "8px", borderBottom: "1px solid #f9f9f9", paddingBottom: "4px" }}>
                    <div style={{ width: "30px", height: "30px", backgroundImage: `url(${item.image})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}></div>
                    <div style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div>Qty: {item.quantity}</div>
                  </div>
                ))}
              </div>
              <Link href="/cart" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "8px", fontSize: "13px", fontWeight: "700", borderRadius: "4px" }}>
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="sub-nav">
        <div className="sub-nav-left">
          <span className="sub-nav-link" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={16} /> All
          </span>
          <Link href="/search?sort=newest" className="sub-nav-link">Today's Deals</Link>
          <Link href="/search?category=electronics" className="sub-nav-link">Electronics</Link>
          <Link href="/search?category=fashion" className="sub-nav-link">Fashion</Link>
          <Link href="/search?category=devices" className="sub-nav-link">Amazon Devices</Link>
          <Link href="/search?category=books" className="sub-nav-link">Books</Link>
          <Link href="/search?category=home-kitchen" className="sub-nav-link">Home & Kitchen</Link>
        </div>
        <div className="sub-nav-right">
          Join Prime for Free Delivery
        </div>
      </div>

      {/* ----------------------------------------------------
         MODALS & SLIDE-OUT OVERLAYS
         ---------------------------------------------------- */}

      {/* Mobile Slide-out Menu (Hamburger All categories) */}
      {isMobileMenuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
          <div style={{ width: "300px", height: "100%", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
            <div style={{ backgroundColor: "var(--amazon-blue-gray)", color: "#fff", padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><User size={20} /> Hello, {user.name}</span>
              <button style={{ background: "none" }} onClick={() => setIsMobileMenuOpen(false)}><X size={20} color="#fff" /></button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto" }}>
              <h4 style={{ fontWeight: 700, fontSize: "15px", borderBottom: "1px solid #eee", paddingBottom: "6px" }}>Shop By Category</h4>
              {CATEGORIES.map((c) => (
                <Link 
                  key={c.id} 
                  href={`/search?category=${c.id}`} 
                  className="dropdown-link"
                  style={{ fontSize: "14px" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
              
              <h4 style={{ fontWeight: 700, fontSize: "15px", borderBottom: "1px solid #eee", paddingBottom: "6px", marginTop: "15px" }}>Help & Settings</h4>
              <Link href="/orders" className="dropdown-link" style={{ fontSize: "14px" }} onClick={() => setIsMobileMenuOpen(false)}>Your Orders</Link>
              <Link href="/cart" className="dropdown-link" style={{ fontSize: "14px" }} onClick={() => setIsMobileMenuOpen(false)}>Your Cart</Link>
              <button 
                className="dropdown-link" 
                style={{ background: "none", width: "100%", textAlign: "left", fontSize: "14px" }}
                onClick={() => { switchUser(user.id === "acc-1" ? "acc-2" : "acc-1"); setIsMobileMenuOpen(false); }}
              >
                Switch Simulated Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Search Dialog */}
      {voiceSearchActive && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <div style={{ backgroundColor: "#fff", padding: "40px 30px", borderRadius: "8px", textAlign: "center", minWidth: "320px", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", position: "relative" }}>
            <button 
              style={{ position: "absolute", top: "15px", right: "15px", background: "none", cursor: "pointer", border: "none" }} 
              onClick={closeVoiceSearch}
              title="Close"
            >
              <X size={20} color="#555" />
            </button>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#fbe8e7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }} className="pulse-mic">
              <Mic size={32} color="var(--price-color)" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
              {voiceError ? "Voice Search Error" : "Listening..."}
            </h3>
            <div className="voice-transcript-text">
              {voiceTranscript || "Speak now..."}
            </div>
            {voiceError ? (
              <div className="voice-error-text">{voiceError}</div>
            ) : (
              <p style={{ color: "#666", fontSize: "12px" }}>Try saying names of brands, products, or categories</p>
            )}
          </div>
        </div>
      )}

      {/* Image Search Dialog */}
      {imageSearchActive && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", maxWidth: "450px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Smart Camera & Image Search</h3>
              <button style={{ background: "none" }} onClick={closeImageSearch}><X size={20} /></button>
            </div>
            
            {!uploadedImageSrc ? (
              <>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
                  Upload a photo of any item (e.g. shoes, book, gadget) to scan and find similar products on Respawn.
                </p>
                <div style={{ border: "2px dashed #ccc", padding: "40px 20px", borderRadius: "6px", textAlign: "center", backgroundColor: "#fafafa" }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="image-search-upload" 
                    style={{ display: "none" }} 
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-search-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Camera size={44} color="#888" />
                    <span className="btn-gray" style={{ padding: "8px 16px", borderRadius: "4px", fontSize: "13px", fontWeight: "600" }}>Select Image File</span>
                  </label>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Visual Preview */}
                <div className="camera-preview-container">
                  <img src={uploadedImageSrc} alt="Scanning source" className="camera-preview-img" />
                  {imageScanning && <div className="scan-line" />}
                </div>

                {imageScanning && (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontWeight: 600, color: "var(--amazon-blue-gray)" }}>Analyzing visual properties...</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Scanning color histograms & aspect ratios</div>
                  </div>
                )}

                {imageAnalysis && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="analysis-results-box">
                      <h4>Scan Results</h4>
                      <p style={{ fontSize: "13px", margin: "4px 0" }}>
                        <strong>Detected Profile:</strong> {imageAnalysis.detectedType.replace("-", " ")}
                      </p>
                      
                      <div style={{ fontSize: "13px", marginTop: "8px" }}>
                        <strong>Dominant Colors:</strong>
                        <div className="color-swatches-list">
                          {imageAnalysis.dominantColors.map((col: string, idx: number) => {
                            const hex = imageAnalysis.colorHexes[idx] || "#ccc";
                            return (
                              <div key={idx} className="color-swatch-pill">
                                <span className="color-swatch-dot" style={{ backgroundColor: hex }} />
                                {col}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Matching Products</h4>
                      <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                        Click a tag to search immediately:
                      </p>
                      <div className="matching-tags-list">
                        {imageAnalysis.matchingKeywords.map((tag: string, idx: number) => (
                          <button 
                            key={idx} 
                            className="match-tag"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {countdown !== null && countdown > 0 && (
                      <div style={{ background: "#fff8f2", border: "1px solid #fbd8b4", borderRadius: "6px", padding: "12px", fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span>Searching for <strong>{imageAnalysis.matchingKeywords[0]}</strong> in <strong>{Math.ceil(countdown / 1000)}s</strong>...</span>
                          <button 
                            onClick={() => {
                              if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
                              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                              setCountdown(null);
                            }}
                            style={{ background: "none", color: "#c7511f", fontWeight: "600", fontSize: "11px", textDecoration: "underline" }}
                          >
                            Pause Auto-Search
                          </button>
                        </div>
                        <div className="countdown-progress-bar-container">
                          <div 
                            className="countdown-progress-bar-fill" 
                            style={{ width: `${(countdown / 3000) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", gap: "10px" }}>
                      <button 
                        className="btn-gray" 
                        style={{ padding: "8px 16px", flexGrow: 1, fontSize: "13px" }}
                        onClick={() => {
                          setUploadedImageSrc(null);
                          setImageAnalysis(null);
                          setCountdown(null);
                        }}
                      >
                        Scan Another Image
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ padding: "8px 16px", flexGrow: 1, fontSize: "13px" }}
                        onClick={() => {
                          if (imageAnalysis.matchingKeywords.length > 0) {
                            handleTagClick(imageAnalysis.matchingKeywords[0]);
                          }
                        }}
                      >
                        Search Top Match
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Pincode Dialog */}
      {editingPincode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <form onSubmit={handlePincodeSubmit} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", maxWidth: "350px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Update Delivery Location</h3>
              <button type="button" style={{ background: "none" }} onClick={() => setEditingPincode(false)}><X size={20} /></button>
            </div>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>Enter an Indian pincode to see product availability and shipping speed.</p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input 
                type="text" 
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit pincode" 
                style={{ flexGrow: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
              />
              <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>Apply</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
