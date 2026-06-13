"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Product, Review, QA } from "@/lib/mockData";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  MessageSquare,
  ThumbsUp
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, pincode, updatePincode } = useApp();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pinInput, setPinInput] = useState(pincode);
  const [isPinChecked, setIsPinChecked] = useState(false);
  
  // Interactive Reviews & QAs
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  
  const [localQas, setLocalQas] = useState<QA[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Fetch product details
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (data.status === "success" && data.product) {
          const prod: Product = data.product;
          setProduct(prod);
          setActiveImage(prod.image);
          setLocalReviews(prod.reviews || []);
          setLocalQas(prod.qas || []);
          
          // Set initial variation states
          const initialVars: Record<string, string> = {};
          prod.variations?.forEach((v) => {
            if (v.options.length > 0) {
              initialVars[v.name] = v.options[0];
            }
          });
          setSelectedVariations(initialVars);

          // Save to recently viewed
          const viewedStr = localStorage.getItem("amazon_clone_recently_viewed");
          let viewed: string[] = viewedStr ? JSON.parse(viewedStr) : [];
          viewed = [prod.id, ...viewed.filter((vid) => vid !== prod.id)].slice(0, 10);
          localStorage.setItem("amazon_clone_recently_viewed", JSON.stringify(viewed));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px 0", fontSize: "20px" }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <button className="btn-primary" style={{ padding: "8px 16px", marginTop: "15px" }} onClick={() => router.push("/")}>Go back home</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const varString = Object.entries(selectedVariations)
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(", ");

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      quantity,
      image: product.image,
      variation: varString || undefined,
      isPrime: product.isPrime,
    });
    alert(`Successfully added ${quantity} item(s) to your shopping cart!`);
  };

  const handleBuyNow = () => {
    const varString = Object.entries(selectedVariations)
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(", ");

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      quantity,
      image: product.image,
      variation: varString || undefined,
      isPrime: product.isPrime,
    });
    router.push("/cart");
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length === 6) {
      updatePincode(pinInput.trim());
      setIsPinChecked(true);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewTitle.trim()) return;

    const newRev: Review = {
      id: "rev-" + Math.floor(Math.random() * 10000),
      userName: "You (Vishal Rawat)",
      rating: newReviewRating,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      title: newReviewTitle,
      text: newReviewText,
      helpfulVotes: 0
    };

    setLocalReviews([newRev, ...localReviews]);
    setNewReviewTitle("");
    setNewReviewText("");
    alert("Thank you! Your review has been published.");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQa: QA = {
      id: "qa-" + Math.floor(Math.random() * 10000),
      question: newQuestion,
      answer: "We will get back to you shortly with an official answer from the seller."
    };

    setLocalQas([newQa, ...localQas]);
    setNewQuestion("");
    alert("Your question has been posted. Other customers and sellers will respond soon.");
  };

  const handleHelpfulVote = (reviewId: string) => {
    setLocalReviews(localReviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulVotes: r.helpfulVotes + 1 };
      }
      return r;
    }));
  };

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Product link copied to clipboard!");
  };

  return (
    <div className="pdp-container">
      {/* Breadcrumbs */}
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "15px" }}>
        Home &gt; Products &gt; {product.category.toUpperCase()} &gt; {product.name.substring(0, 40)}...
      </div>

      <div className="pdp-layout">
        {/* Gallery Section (D) */}
        <div className="pdp-gallery-container">
          <div className="pdp-thumbnails">
            {product.thumbnails?.map((thumb, idx) => (
              <div
                key={idx}
                className={`pdp-thumbnail ${activeImage === thumb ? "active" : ""}`}
                style={{ backgroundImage: `url(${thumb})` }}
                onMouseEnter={() => setActiveImage(thumb)}
                onClick={() => setActiveImage(thumb)}
              ></div>
            ))}
          </div>
          <div 
            className="pdp-main-image"
            style={{ backgroundImage: `url(${activeImage})` }}
            title="Hover zoom disabled in preview mode"
          ></div>
        </div>

        {/* Info Column (D) */}
        <div className="pdp-info-container">
          <h1 className="pdp-title">{product.name}</h1>
          
          {/* Rating Summary */}
          <div className="pdp-rating">
            <span style={{ color: "var(--star-color)", fontWeight: "700" }}>
              {"★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))} {product.rating} out of 5
            </span>
            <span style={{ color: "#007185" }}>{product.ratingCount.toLocaleString()} ratings</span>
            <span style={{ color: "#aaa" }}>|</span>
            <span style={{ color: "#007185" }}>{localQas.length} answered questions</span>
          </div>

          {/* Pricing Block */}
          <div className="pdp-price-box">
            <div>
              <span className="pdp-discount-percent">-{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%</span>
              <span className="pdp-price">₹{product.price.toLocaleString("en-IN")}</span>
            </div>
            <div className="pdp-mrp-row">
              M.R.P.: <span style={{ textDecoration: "line-through" }}>₹{product.mrp.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ fontSize: "14px", color: "var(--success-color)", fontWeight: "700", marginTop: "6px" }}>
              You Save: ₹{(product.mrp - product.price).toLocaleString("en-IN")} (Inclusive of all taxes)
            </div>
          </div>

          {/* Variations Swatches */}
          {product.variations?.map((v) => (
            <div key={v.name} className="pdp-variation-section">
              <div className="pdp-variation-title">{v.name}: <strong>{selectedVariations[v.name]}</strong></div>
              <div className="pdp-swatches">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    className={`pdp-swatch ${selectedVariations[v.name] === opt ? "active" : ""}`}
                    onClick={() => setSelectedVariations({ ...selectedVariations, [v.name]: opt })}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Delivery & Pincode Checker */}
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", margin: "15px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px", marginBottom: "8px" }}>
              <MapPin size={18} color="var(--amazon-blue-gray)" /> 
              <span>Check Delivery Options</span>
            </div>
            <form onSubmit={handlePincodeCheck} style={{ display: "flex", gap: "10px" }}>
              <input 
                type="text" 
                maxLength={6}
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit pincode"
                style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px", width: "160px" }}
              />
              <button type="submit" className="btn-gray" style={{ padding: "8px 16px" }}>Check</button>
            </form>
            {isPinChecked && (
              <div style={{ marginTop: "10px", fontSize: "13px", color: "green", fontWeight: "600" }}>
                ✓ Delivery available to {pincode}. Standard FREE Delivery tomorrow by 5 PM!
              </div>
            )}
          </div>

          {/* Features description */}
          <div style={{ marginTop: "15px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>About this item</h3>
            <p style={{ fontSize: "14px", color: "#333", marginBottom: "15px" }}>{product.description}</p>
            
            <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px" }}>What's in the Box</h3>
            <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#555" }}>
              {product.whatInBox?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buy Box Side Panel (D) */}
        <div className="pdp-buy-box">
          <div className="buy-box-price">₹{product.price.toLocaleString("en-IN")}</div>
          <div className="buy-box-stock">In Stock.</div>
          
          <div style={{ fontSize: "13px", color: "#555", margin: "10px 0" }}>
            Sold by <strong>{product.seller || "Appario Retail"}</strong> and Fulfilled by Respawn.
          </div>

          <div style={{ margin: "12px 0" }}>
            <label htmlFor="qtySelect" style={{ fontSize: "13px", marginRight: "8px" }}>Quantity:</label>
            <select 
              id="qtySelect"
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: "4px" }}
            >
              {[1, 2, 3, 4, 5, 10].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="buy-box-cta">
            <button className="btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="btn-secondary" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          {/* Wishlist and Share */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
            <button 
              style={{ background: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: isWishlisted ? "red" : "#007185" }}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart size={16} fill={isWishlisted ? "red" : "none"} /> 
              {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button 
              style={{ background: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#007185" }}
              onClick={shareProduct}
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Table (D) */}
      <div className="reviews-container" style={{ margin: "20px 0" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Technical Details</h3>
        <table className="specs-table">
          <tbody>
            {Object.entries(product.specs || {}).map(([key, val]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Q&A Section (D) */}
      <div className="reviews-container" style={{ margin: "20px 0" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Customer questions & answers</h3>
        
        {/* Q&A List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
          {localQas.map((qa) => (
            <div key={qa.id} style={{ fontSize: "14px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontWeight: "700", color: "#666" }}>Question:</span>
                <span style={{ fontWeight: "700" }}>{qa.question}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontWeight: "700", color: "#666" }}>Answer:</span>
                <span style={{ color: "#333" }}>{qa.answer}</span>
              </div>
            </div>
          ))}
          {localQas.length === 0 && <p style={{ color: "#888", fontSize: "13px" }}>No questions have been asked yet. Be the first!</p>}
        </div>

        {/* Post Q&A form */}
        <form onSubmit={handleAddQuestion} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Have a question? Search for answers or ask one"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{ flexGrow: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
          <button type="submit" className="btn-primary" style={{ padding: "10px 20px" }}>Ask Question</button>
        </form>
      </div>

      {/* Customer Reviews Section (D) */}
      <div className="reviews-container">
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Customer reviews</h3>
        
        <div className="reviews-layout">
          {/* Left Summary Histogram */}
          <div className="reviews-summary">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px", fontWeight: "700" }}>{product.rating}</span>
              <div>
                <div style={{ color: "var(--star-color)" }}>{"★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))}</div>
                <span style={{ fontSize: "12px", color: "#666" }}>out of 5 stars</span>
              </div>
            </div>

            {/* Histogram bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { star: 5, pct: "75%" },
                { star: 4, pct: "15%" },
                { star: 3, pct: "5%" },
                { star: 2, pct: "3%" },
                { star: 1, pct: "2%" }
              ].map((h) => (
                <div key={h.star} style={{ display: "flex", alignItems: "center", fontSize: "12px", gap: "8px" }}>
                  <span style={{ width: "40px" }}>{h.star} star</span>
                  <div style={{ flexGrow: 1, height: "14px", backgroundColor: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: h.pct, height: "100%", backgroundColor: "var(--star-color)" }}></div>
                  </div>
                  <span style={{ width: "30px", textAlign: "right" }}>{h.pct}</span>
                </div>
              ))}
            </div>

            {/* Write a review Form */}
            <form onSubmit={handleAddReview} style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <h4 style={{ fontWeight: "700", marginBottom: "10px" }}>Review this product</h4>
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>Share your thoughts with other customers</p>
              
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Rating</label>
                <select 
                  value={newReviewRating} 
                  onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                  style={{ padding: "6px", width: "100%", borderRadius: "4px" }}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Star{r > 1 && "s"}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Title</label>
                <input 
                  type="text" 
                  placeholder="What's most important to know?"
                  value={newReviewTitle} 
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Review Text</label>
                <textarea 
                  rows={4}
                  placeholder="Write your review here..."
                  value={newReviewText} 
                  onChange={(e) => setNewReviewText(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-gray" style={{ width: "100%", padding: "10px", fontSize: "13px", fontWeight: "700" }}>
                Submit Review
              </button>
            </form>
          </div>

          {/* Right Reviews list */}
          <div className="reviews-list">
            <h4 style={{ fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "10px" }}>Top reviews from India</h4>
            
            {localReviews.map((rev) => (
              <div key={rev.id} className="review-item">
                <div className="review-item-header">
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}><Check size={14} color="#888" /></div>
                  <span className="review-item-user">{rev.userName}</span>
                </div>
                <div className="review-item-rating">
                  {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                  <span className="review-item-title">{rev.title}</span>
                </div>
                <div className="review-item-date">Reviewed in India on {rev.date}</div>
                <p className="review-item-text">{rev.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#666" }}>
                  <span>{rev.helpfulVotes} people found this helpful</span>
                  <button 
                    className="btn-gray" 
                    style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                    onClick={() => handleHelpfulVote(rev.id)}
                  >
                    <ThumbsUp size={12} /> Helpful
                  </button>
                </div>
              </div>
            ))}
            {localReviews.length === 0 && <p style={{ color: "#888", fontSize: "13px", padding: "20px 0" }}>No reviews yet. Purchase the item and write one!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
