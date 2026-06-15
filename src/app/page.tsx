"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { HERO_BANNERS, CATEGORIES, Product } from "@/lib/mockData";
import { ChevronLeft, ChevronRight, Zap, ShoppingCart, Eye } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 15 });

  // Trigger DB setup and fetch products
  useEffect(() => {
    async function initApp() {
      try {
        // Run database setup in background to seed if running in MongoDB
        await fetch("/api/setup-db", { method: "POST" });
        
        // Fetch products
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.status === "success") {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    }
    initApp();

    // Load recently viewed
    const savedRecentlyViewed = localStorage.getItem("amazon_clone_recently_viewed");
    if (savedRecentlyViewed) {
      try {
        const ids: string[] = JSON.parse(savedRecentlyViewed);
        // Fetch specific details or filter from loaded products
        fetch("/api/products")
          .then(res => res.json())
          .then(data => {
            if (data.status === "success" && data.products) {
              const items = (data.products as Product[]).filter((p) => ids.includes(p.id));
              setRecentlyViewed(items);
            }
          });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Slide Carousel interval
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Countdown timer interval
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset timer when it hits 0
              hours = 8;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const formatTime = (t: typeof timeLeft) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(t.hours)}h : ${pad(t.minutes)}m : ${pad(t.seconds)}s`;
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
      image: product.image,
      isPrime: product.isPrime,
    });
  };

  return (
    <div className="home-container">
      {/* Hero Carousel */}
      <div className="carousel-container">
        <button className="carousel-btn carousel-prev" onClick={prevSlide} aria-label="Previous Slide">
          <ChevronLeft size={24} />
        </button>
        
        <div 
          className="carousel-slide" 
          style={{ backgroundImage: `url(${HERO_BANNERS[currentSlide].image})` }}
        >
          <div className="carousel-gradient"></div>
          <div className="carousel-content">
            <h2>{HERO_BANNERS[currentSlide].title}</h2>
            <p>{HERO_BANNERS[currentSlide].subtitle}</p>
            <Link 
              href="/search" 
              className="btn-primary" 
              style={{ display: "inline-block", padding: "8px 16px", borderRadius: "4px", fontWeight: "700" }}
            >
              Shop Now
            </Link>
          </div>
        </div>

        <button className="carousel-btn carousel-next" onClick={nextSlide} aria-label="Next Slide">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Categories & Deals Overlay Grid */}
      <div className="home-grid">
        {/* Category card 1 */}
        <div className="home-card">
          <h3>Shop by Category</h3>
          <div className="home-card-grid">
            {CATEGORIES.slice(0, 4).map((c) => (
              <div 
                key={c.id} 
                className="category-tile" 
                onClick={() => router.push(`/search?category=${c.id}`)}
              >
                <div 
                  className="category-tile-img" 
                  style={{ backgroundImage: `url(${c.image})` }}
                ></div>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
          <Link href="/search" className="home-card-link">See all categories</Link>
        </div>

        {/* Category card 2 */}
        <div className="home-card">
          <h3>Top Electronic Deals</h3>
          <div className="home-card-grid">
            {products
              .filter((p) => p.category === "electronics")
              .slice(0, 4)
              .map((p) => (
                <div 
                  key={p.id} 
                  className="category-tile"
                  onClick={() => router.push(`/products/${p.id}`)}
                >
                  <div 
                    className="category-tile-img" 
                    style={{ backgroundImage: `url(${p.image})` }}
                  ></div>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{p.name}</span>
                </div>
              ))}
          </div>
          <Link href="/search?category=electronics" className="home-card-link">Shop electronics</Link>
        </div>

        {/* Today's Deals Card */}
        <div className="home-card" style={{ justifyContent: "flex-start", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3>Lightning Deals</h3>
            <span className="countdown-timer">{formatTime(timeLeft)}</span>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>Loading deals...</div>
          ) : (
            products.slice(0, 1).map((p) => (
              <div key={p.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/products/${p.id}`)}>
                <div 
                  style={{ 
                    height: "140px", 
                    backgroundImage: `url(${p.image})`, 
                    backgroundSize: "contain", 
                    backgroundPosition: "center", 
                    backgroundRepeat: "no-repeat",
                    marginBottom: "10px"
                  }}
                ></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ backgroundColor: "#cc0c39", color: "#fff", padding: "2px 6px", fontSize: "12px", fontWeight: "700", borderRadius: "2px" }}>
                    20% OFF
                  </span>
                  <span style={{ color: "#cc0c39", fontSize: "12px", fontWeight: "700" }}>Deal of the Day</span>
                </div>
                <p style={{ fontWeight: 700, margin: "6px 0 2px 0" }}>₹{p.price.toLocaleString("en-IN")}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                  MRP: ₹{p.mrp.toLocaleString("en-IN")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Join Prime card */}
        <div className="home-card" style={{ background: "linear-gradient(135deg, #1d2d44 0%, #0d1b2a 100%)", color: "#fff" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ color: "var(--amazon-amber)", fontWeight: "800", fontSize: "14px" }}>RESPAWN PRIME</span>
            <h3 style={{ fontSize: "22px", lineHeight: "1.2" }}>FREE Delivery, Gaming Perks, and More!</h3>
            <p style={{ fontSize: "13px", color: "#ccc" }}>Get unlimited FREE fast delivery, video streaming, ad-free music, and exclusive early access to deals.</p>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: "100%", padding: "12px", fontWeight: "700", fontSize: "14px", marginTop: "20px" }}
            onClick={() => alert("Simulated Prime Subscription: You are now a Prime member!")}
          >
            Join Prime for ₹1,499/year
          </button>
        </div>
      </div>

      {/* Main Deals & Recommendations Section */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontSize: "18px" }}>Loading products catalog...</div>
      ) : (
        <>
          {/* Inspired by your browsing history */}
          <div className="horizontal-row-container">
            <div className="horizontal-row-header">
              <h3>Inspired by your browsing history</h3>
              <Link href="/search">See all recommendations</Link>
            </div>
            <div className="horizontal-scroll">
              {products.map((p) => (
                <div key={p.id} className="scroll-item">
                  <Link href={`/products/${p.id}`} style={{ position: "relative", display: "block" }}>
                    {p.respawn?.isRespawned && (
                      <span style={{ position: "absolute", top: "5px", left: "5px", zIndex: 10 }} className="respawn-tag">RESPAWN</span>
                    )}
                    <div className="scroll-item-img" style={{ backgroundImage: `url(${p.image})` }}></div>
                  </Link>
                  <Link href={`/products/${p.id}`} className="scroll-item-name">{p.name}</Link>
                  <div style={{ display: "flex", alignItems: "center", color: "var(--star-color)", fontSize: "12px", marginBottom: "4px" }}>
                    {"★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating))}
                    <span style={{ color: "#007185", marginLeft: "4px" }}>({p.ratingCount})</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span className="scroll-item-price">₹{p.price.toLocaleString("en-IN")}</span>
                    <button 
                      className="btn-primary" 
                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
                      onClick={(e) => handleQuickAdd(e, p)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsored Row */}
          <div className="horizontal-row-container" style={{ backgroundColor: "#fdf5ea", border: "1px solid #fbd29c" }}>
            <div className="horizontal-row-header">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={18} color="var(--amazon-orange-hover)" />
                <h3 style={{ fontSize: "18px" }}>Sponsored Products Related to Your Searches</h3>
              </span>
              <span style={{ fontSize: "11px", color: "#666" }}>Paid Placements</span>
            </div>
            <div className="horizontal-scroll">
              {products.slice().reverse().map((p) => (
                <div key={p.id} className="scroll-item" style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px" }}>
                  <Link href={`/products/${p.id}`} style={{ position: "relative", display: "block" }}>
                    {p.respawn?.isRespawned && (
                      <span style={{ position: "absolute", top: "5px", left: "5px", zIndex: 10 }} className="respawn-tag">RESPAWN</span>
                    )}
                    <div className="scroll-item-img" style={{ backgroundImage: `url(${p.image})` }}></div>
                  </Link>
                  <Link href={`/products/${p.id}`} className="scroll-item-name">{p.name}</Link>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span className="scroll-item-price">₹{p.price.toLocaleString("en-IN")}</span>
                    <span style={{ color: "green", fontSize: "11px", fontWeight: "700" }}>FREE Delivery</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="horizontal-row-container">
              <div className="horizontal-row-header">
                <h3>Your Recently Viewed Items</h3>
                <button 
                  style={{ background: "none", color: "#007185", fontSize: "13px" }}
                  onClick={() => { localStorage.removeItem("amazon_clone_recently_viewed"); setRecentlyViewed([]); }}
                >
                  Clear history
                </button>
              </div>
              <div className="horizontal-scroll">
                {recentlyViewed.map((p) => (
                  <div key={p.id} className="scroll-item">
                    <Link href={`/products/${p.id}`} style={{ position: "relative", display: "block" }}>
                      {p.respawn?.isRespawned && (
                        <span style={{ position: "absolute", top: "5px", left: "5px", zIndex: 10 }} className="respawn-tag">RESPAWN</span>
                      )}
                      <div className="scroll-item-img" style={{ backgroundImage: `url(${p.image})` }}></div>
                    </Link>
                    <Link href={`/products/${p.id}`} className="scroll-item-name">{p.name}</Link>
                    <span className="scroll-item-price" style={{ marginTop: "auto" }}>₹{p.price.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
