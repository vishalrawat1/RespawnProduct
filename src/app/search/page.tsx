"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Product } from "@/lib/mockData";
import { Star, ShieldAlert } from "lucide-react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useApp();

  // URL query params
  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  // Component states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [onlyPrime, setOnlyPrime] = useState(false);
  const [onlyRespawn, setOnlyRespawn] = useState(false);
  const [sortOrder, setSortOrder] = useState("featured");

  // Fetch products based on query and filters
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        let url = `/api/products?q=${encodeURIComponent(q)}`;
        if (categoryParam) url += `&category=${encodeURIComponent(categoryParam)}`;
        if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (selectedRating > 0) url += `&rating=${selectedRating}`;
        if (priceRange.min) url += `&priceMin=${priceRange.min}`;
        if (priceRange.max) url += `&priceMax=${priceRange.max}`;
        if (onlyPrime) url += `&prime=true`;
        if (onlyRespawn) url += `&respawnOnly=true`;
        url += `&sort=${sortOrder}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") {
          const availableProducts = (data.products || []).filter(
            (p: any) => p.respawn?.status !== "accepted"
          );
          setProducts(availableProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [q, categoryParam, selectedBrand, selectedRating, priceRange.min, priceRange.max, onlyPrime, onlyRespawn, sortOrder]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    // Forces re-evaluation of effect by updating price range
  };

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      quantity: 1,
      image: p.image,
      isPrime: p.isPrime,
    });
    alert(`Added ${p.name.substring(0, 30)}... to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      quantity: 1,
      image: p.image,
      isPrime: p.isPrime,
    });
    router.push("/cart");
  };

  const clearFilters = () => {
    setSelectedBrand("");
    setSelectedRating(0);
    setPriceRange({ min: "", max: "" });
    setOnlyPrime(false);
    setOnlyRespawn(false);
    setSortOrder("featured");
  };

  return (
    <div className="search-page-container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "15px" }}>
        Home &gt; Search Results {categoryParam && `> ${categoryParam.toUpperCase()}`} {q && `> "${q}"`}
      </div>

      <div className="srp-layout">
        {/* Filter Sidebar (C) */}
        <aside className="srp-sidebar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Filters</h3>
            <button style={{ background: "none", color: "#007185", fontSize: "12px" }} onClick={clearFilters}>Clear All</button>
          </div>

          {/* Prime Eligibility */}
          <div className="filter-section">
            <h4>Delivery Day</h4>
            <ul>
              <li>
                <input 
                  type="checkbox" 
                  id="primeCheck" 
                  checked={onlyPrime}
                  onChange={(e) => setOnlyPrime(e.target.checked)}
                />
                <label htmlFor="primeCheck" style={{ fontSize: "13px", display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <span className="prime-badge" style={{ marginLeft: "4px" }}>Prime</span> Eligible
                </label>
              </li>
            </ul>
          </div>

          {/* Respawn Filter */}
          <div className="filter-section">
            <h4>Item Condition</h4>
            <ul>
              <li>
                <input 
                  type="checkbox" 
                  id="respawnCheck" 
                  checked={onlyRespawn}
                  onChange={(e) => setOnlyRespawn(e.target.checked)}
                />
                <label htmlFor="respawnCheck" style={{ fontSize: "13px", display: "flex", alignItems: "center", cursor: "pointer", marginLeft: "6px" }}>
                  Show only <span className="respawn-tag" style={{ marginLeft: "4px" }}>RESPAWN</span>
                </label>
              </li>
            </ul>
          </div>

          {/* Brands */}
          <div className="filter-section">
            <h4>Brand</h4>
            <ul>
              {["Amazon", "Apple", "ASUS", "Sony", "Nike", "Instant Pot"].map((brand) => (
                <li key={brand}>
                  <input 
                    type="checkbox" 
                    id={`brand-${brand}`} 
                    checked={selectedBrand.toLowerCase() === brand.toLowerCase()}
                    onChange={() => setSelectedBrand(selectedBrand.toLowerCase() === brand.toLowerCase() ? "" : brand)}
                  />
                  <label htmlFor={`brand-${brand}`} style={{ cursor: "pointer" }}>{brand}</label>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Reviews */}
          <div className="filter-section">
            <h4>Customer Review</h4>
            <ul>
              {[4, 3, 2].map((stars) => (
                <li key={stars} style={{ cursor: "pointer" }} onClick={() => setSelectedRating(stars)}>
                  <span style={{ 
                    fontWeight: selectedRating === stars ? "700" : "400",
                    color: selectedRating === stars ? "var(--amazon-orange-hover)" : "inherit"
                  }}>
                    {"★".repeat(stars) + "☆".repeat(5 - stars)} & Up
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div className="filter-section" style={{ borderBottom: "none" }}>
            <h4>Price Range</h4>
            <form onSubmit={handlePriceApply} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                style={{ width: "60px", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                style={{ width: "60px", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <button type="submit" className="btn-gray" style={{ padding: "6px 10px", borderRadius: "4px" }}>Go</button>
            </form>
          </div>
        </aside>

        {/* Results Pane */}
        <div className="srp-results">
          {/* Results Header */}
          <div className="srp-header">
            <div>
              {loading ? (
                <span>Searching...</span>
              ) : (
                <span>
                  {products.length} results for{" "}
                  <strong style={{ color: "var(--amazon-orange-hover)" }}>
                    "{q || categoryParam || "All Products"}"
                  </strong>
                </span>
              )}
            </div>
            
            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Sort by:</span>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Avg. Customer Review</option>
                <option value="newest">Newest Arrivals</option>
                <option value="best-health">Best Health Score</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "18px", color: "#666" }}>Loading search results...</p>
            </div>
          ) : products.length === 0 ? (
            /* No Results (C) */
            <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "4px", textAlign: "center", boxShadow: "var(--shadow)" }}>
              <ShieldAlert size={48} color="red" style={{ margin: "0 auto 15px auto" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No results found</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>Try checking your spelling, use more general terms, or filter by category.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link href="/search?category=electronics" className="btn-primary" style={{ padding: "8px 16px" }}>Browse Electronics</Link>
                <Link href="/search?category=devices" className="btn-gray" style={{ padding: "8px 16px" }}>Browse Devices</Link>
              </div>
            </div>
          ) : (
            <div className="srp-list">
              {products.map((p, idx) => {
                // Mark first item as Sponsored if sorting is featured
                const isSponsored = sortOrder === "featured" && idx === 0;
                
                return (
                  <div key={p.id} className="product-card">
                    {isSponsored && <span className="product-card-badge">Sponsored</span>}
                    {!isSponsored && p.isBestSeller && <span className="product-card-badge" style={{ backgroundColor: "#e47911" }}>Best Seller</span>}
                    {!isSponsored && !p.isBestSeller && p.isChoice && <span className="product-card-badge" style={{ backgroundColor: "#232f3e" }}>Amazon's Choice</span>}

                    <Link href={`/products/${p.id}`} style={{ position: "relative", display: "block" }}>
                      {p.respawn?.isRespawned && (
                        <span style={{ position: "absolute", top: "5px", left: "5px", zIndex: 10 }} className="respawn-tag">RESPAWN</span>
                      )}
                      <div 
                        className="product-card-img" 
                        style={{ backgroundImage: `url(${p.image})` }}
                      ></div>
                    </Link>

                    <Link href={`/products/${p.id}`} className="product-card-title">
                      {p.name}
                    </Link>

                    {/* Ratings */}
                    <div className="product-card-rating">
                      <span>{"★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating))}</span>
                      <span className="rating-count">({p.ratingCount.toLocaleString()})</span>
                    </div>

                    {/* Pricing */}
                    <div className="product-card-pricing">
                      <div>
                        <span className="card-price">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="card-mrp">₹{p.mrp.toLocaleString("en-IN")}</span>
                        <span className="card-discount">
                          ({Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off)
                        </span>
                      </div>
                      <div className="card-delivery" style={{ marginTop: "4px", fontSize: "12px", color: "#565959" }}>
                        Get it by <strong>Tomorrow, 11 AM</strong>
                        {p.isPrime && <span className="prime-badge">Prime</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "green", fontWeight: "700" }}>
                        FREE Delivery by Respawn
                      </div>
                    </div>

                    {/* Quick CTAs */}
                    <div className="card-actions">
                      <button className="btn-primary" onClick={(e) => handleAddToCart(e, p)}>
                        Add to Cart
                      </button>
                      <button className="btn-secondary" onClick={(e) => handleBuyNow(e, p)}>
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {products.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px", padding: "10px 0" }}>
              <button className="btn-gray" style={{ padding: "6px 12px" }} disabled>Prev</button>
              <button className="btn-primary" style={{ padding: "6px 12px" }}>1</button>
              <button className="btn-gray" style={{ padding: "6px 12px" }}>2</button>
              <button className="btn-gray" style={{ padding: "6px 12px" }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 0" }}>Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
