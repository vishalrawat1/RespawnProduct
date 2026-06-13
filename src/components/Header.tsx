"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { SIMULATED_ACCOUNTS, CATEGORIES } from "@/lib/mockData";
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

  const searchRef = useRef<HTMLDivElement>(null);

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
      "nike", "shoes", "running", "instant pot", "cooker", "books", "atomic habits"
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
    setVoiceSearchActive(true);
    // Simulate voice recognition
    setTimeout(() => {
      setSearchQuery("Sony headphones");
      setVoiceSearchActive(false);
      router.push("/search?q=Sony%20headphones");
    }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageSearchActive(false);
      // Simulate image matching
      setSearchQuery("Kindle");
      router.push("/search?q=Kindle");
    }
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
          <span>Hello, {user.name.split(" ")[0]}</span>
          <span className="header-link-bold">Account & Lists</span>
          
          <div className="dropdown-menu" style={{ minWidth: "250px" }}>
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
          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", textAlign: "center", minWidth: "300px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#fbe8e7", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }} className="pulse-mic">
              <Mic size={32} color="var(--price-color)" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Listening...</h3>
            <p style={{ color: "#666" }}>Try saying "Sony headphones"</p>
          </div>
        </div>
      )}

      {/* Image Search Dialog */}
      {imageSearchActive && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Search by Image</h3>
              <button style={{ background: "none" }} onClick={() => setImageSearchActive(false)}><X size={20} /></button>
            </div>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>Upload a photo of any item (e.g. books, kindle) to search on Respawn.</p>
            <div style={{ border: "2px dashed #ccc", padding: "30px", borderRadius: "6px", textAlign: "center", backgroundColor: "#fafafa" }}>
              <input 
                type="file" 
                accept="image/*" 
                id="image-search-upload" 
                style={{ display: "none" }} 
                onChange={handleImageUpload}
              />
              <label htmlFor="image-search-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <Camera size={40} color="#888" />
                <span className="btn-gray" style={{ padding: "6px 12px", borderRadius: "4px" }}>Select Image File</span>
              </label>
            </div>
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
