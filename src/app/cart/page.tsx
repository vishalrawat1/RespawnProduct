"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, CartItem } from "@/lib/AppContext";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQuantity, removeFromCart, addToCart } = useApp();

  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  // Load Saved for Later from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("amazon_clone_saved_later");
    if (saved) {
      try {
        setSavedForLater(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSavedLater = (items: CartItem[]) => {
    setSavedForLater(items);
    localStorage.setItem("amazon_clone_saved_later", JSON.stringify(items));
  };

  const handleSaveForLater = (item: CartItem) => {
    // Add to saved list
    saveSavedLater([...savedForLater, item]);
    // Remove from cart
    removeFromCart(item.id, item.variation);
  };

  const handleMoveToCart = (item: CartItem) => {
    // Add to cart
    addToCart(item);
    // Remove from saved list
    const newSaved = savedForLater.filter(
      (c) => !(c.id === item.id && c.variation === item.variation)
    );
    saveSavedLater(newSaved);
  };

  const handleDeleteSaved = (item: CartItem) => {
    const newSaved = savedForLater.filter(
      (c) => !(c.id === item.id && c.variation === item.variation)
    );
    saveSavedLater(newSaved);
  };

  // Pricing calculations
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const itemsSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const mrpSubtotal = cart.reduce((total, item) => total + (item.mrp * item.quantity), 0);
  const discountAmount = mrpSubtotal - itemsSubtotal;
  
  // Free delivery if subtotal > 499 or if any item has Prime
  const isFreeDelivery = itemsSubtotal > 499 || cart.some(item => item.isPrime);
  const deliveryCharges = totalItems === 0 ? 0 : (isFreeDelivery ? 0 : 40);
  
  const finalTotal = itemsSubtotal + deliveryCharges;

  return (
    <div className="cart-page-container">
      <h1 style={{ fontSize: "24px", fontWeight: "500", marginBottom: "20px" }}>Shopping Cart</h1>
      
      <div className="cart-layout">
        {/* Left Side: Items List */}
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <ShoppingBag size={48} color="#ccc" style={{ margin: "0 auto 15px auto" }} />
              <h2>Your shopping cart is empty</h2>
              <p style={{ color: "#666", margin: "10px 0 20px 0" }}>Check out today's recommended deals to add items.</p>
              <Link href="/search" className="btn-primary" style={{ padding: "10px 20px", display: "inline-block" }}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "10px", color: "var(--text-muted)", fontSize: "13px" }}>
                <span>Product Details</span>
                <span>Price</span>
              </div>

              {cart.map((item, idx) => (
                <div key={idx} className="cart-item-row">
                  {/* Item Image */}
                  <Link href={`/products/${item.id}`}>
                    <div 
                      className="cart-item-img"
                      style={{ backgroundImage: `url(${item.image})` }}
                    ></div>
                  </Link>

                  {/* Item Information */}
                  <div className="cart-item-info">
                    <Link href={`/products/${item.id}`} className="cart-item-title">
                      {item.name}
                    </Link>
                    {item.variation && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Options: <strong>{item.variation}</strong>
                      </div>
                    )}
                    
                    <div style={{ fontSize: "12px", color: "green", fontWeight: "700", marginTop: "4px" }}>
                      In Stock
                    </div>
                    {item.isPrime && (
                      <div style={{ marginTop: "4px" }}>
                        <span className="prime-badge">Prime</span> <span style={{ fontSize: "11px", color: "#565959" }}>Eligible for FREE Shipping</span>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="cart-item-actions">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value), item.variation)}
                      >
                        {[1, 2, 3, 4, 5, 10].map((qty) => (
                          <option key={qty} value={qty}>Qty: {qty}</option>
                        ))}
                      </select>
                      
                      <span style={{ color: "#ccc" }}>|</span>
                      
                      <button 
                        style={{ background: "none", color: "#007185", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => removeFromCart(item.id, item.variation)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      
                      <span style={{ color: "#ccc" }}>|</span>
                      
                      <button 
                        style={{ background: "none", color: "#007185", fontSize: "13px" }}
                        onClick={() => handleSaveForLater(item)}
                      >
                        Save for later
                      </button>
                    </div>
                  </div>

                  {/* Item Price */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", fontSize: "18px" }}>₹{item.price.toLocaleString("en-IN")}</div>
                    {item.mrp > item.price && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                        M.R.P. ₹{item.mrp.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ textAlign: "right", marginTop: "20px", fontSize: "16px" }}>
                Subtotal ({totalItems} items): <strong>₹{itemsSubtotal.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Price Summary Card */}
        {cart.length > 0 && (
          <div className="cart-summary-container">
            <div style={{ fontSize: "14px", marginBottom: "15px" }}>
              {isFreeDelivery ? (
                <div style={{ color: "green", fontWeight: "600", display: "flex", gap: "6px" }}>
                  ✓ Your order qualifies for FREE Delivery.
                </div>
              ) : (
                <div style={{ color: "var(--price-color)" }}>
                  Add ₹{Math.max(0, 500 - itemsSubtotal)} more to qualify for FREE Delivery.
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px" }}>Price Details</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span>Price ({totalItems} items)</span>
              <span>₹{mrpSubtotal.toLocaleString("en-IN")}</span>
            </div>
            
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "green" }}>
                <span>Discount</span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
              <span>Delivery Charges</span>
              <span style={{ color: deliveryCharges === 0 ? "green" : "inherit" }}>
                {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "10px" }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--price-color)" }}>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ color: "green", fontSize: "12px", fontWeight: "700", margin: "10px 0 20px 0" }}>
                You will save ₹{discountAmount.toLocaleString("en-IN")} on this order!
              </div>
            )}

            <button 
              className="btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onClick={() => router.push("/checkout")}
            >
              Proceed to Buy <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Saved for Later Section (E) */}
      <div className="reviews-container" style={{ marginTop: "40px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
          Saved for Later ({savedForLater.length} item{savedForLater.length !== 1 && "s"})
        </h3>
        {savedForLater.length === 0 ? (
          <p style={{ color: "#666", fontSize: "13px" }}>No items saved for later yet. Use "Save for later" on items in your cart to keep them here.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
            {savedForLater.map((item, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "4px", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "130px", backgroundImage: `url(${item.image})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", marginBottom: "8px" }}></div>
                <div style={{ fontSize: "13px", fontWeight: "500", height: "36px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: "4px" }}>
                  {item.name}
                </div>
                <div style={{ fontWeight: "700", color: "var(--price-color)", fontSize: "14px", marginBottom: "10px" }}>₹{item.price.toLocaleString("en-IN")}</div>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <button className="btn-primary" style={{ flexGrow: 1, padding: "6px", fontSize: "12px" }} onClick={() => handleMoveToCart(item)}>
                    Move to Cart
                  </button>
                  <button className="btn-gray" style={{ padding: "6px 8px" }} onClick={() => handleDeleteSaved(item)} title="Delete item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
