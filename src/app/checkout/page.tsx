"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { CreditCard, Truck, Wallet, CheckCircle, ShieldCheck } from "lucide-react";

interface ShippingAddress {
  name: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, user, pincode } = useApp();

  // Address State
  const [addresses, setAddresses] = useState<ShippingAddress[]>([
    {
      name: user.name,
      pincode: pincode,
      address: "Flat 402, Sector 12, Dwarka",
      city: user.city,
      state: "Delhi",
      phone: "9876543210"
    },
    {
      name: user.name,
      pincode: pincode,
      address: "B-12, Sector 3, Rohini",
      city: user.city,
      state: "Delhi",
      phone: "9876543211"
    }
  ]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    name: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
    phone: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Delivery Speed State
  const [deliverySpeed, setDeliverySpeed] = useState("Prime FREE One-Day Delivery");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("UPI (Amazon Pay)");

  // Coupon / Promo Code State
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Final Order placement state
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any | null>(null);

  if (cart.length === 0 && !placedOrderDetails) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ margin: "10px 0" }}>You cannot checkout with an empty cart.</p>
        <Link href="/" className="btn-primary" style={{ padding: "8px 16px", display: "inline-block" }}>Go Shop</Link>
      </div>
    );
  }

  // Cost calculation
  const itemsSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const couponDiscount = couponApplied ? Math.round(itemsSubtotal * 0.1) : 0; // 10% discount
  const isFreeDelivery = itemsSubtotal > 499 || cart.some(item => item.isPrime);
  const deliveryCharges = isFreeDelivery ? 0 : 40;
  const finalTotal = itemsSubtotal + deliveryCharges - couponDiscount;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(newAddress).every(val => val.trim() !== "")) {
      setAddresses([...addresses, newAddress]);
      setSelectedAddressIndex(addresses.length);
      setShowAddressForm(false);
      setNewAddress({ name: "", pincode: "", address: "", city: "", state: "", phone: "" });
    }
  };

  const applyCouponCode = () => {
    if (coupon.toLowerCase() === "respawn10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try 'RESPAWN10' for 10% off.");
      setCouponApplied(false);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const address = addresses[selectedAddressIndex];
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": user.name
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variation: item.variation
          })),
          totalAmount: finalTotal,
          shippingAddress: address,
          paymentMethod,
          deliverySpeed
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        // Intercept: Notify Seller Dashboard for Respawn Items
        for (const item of cart) {
          if (item.isRespawned || item.id.startsWith("respawn-")) {
            try {
              await fetch("/api/products/respawn", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.id, status: "matched" })
              });
            } catch (e) {
              console.error("Failed to notify seller dashboard", e);
            }
          }
        }

        setPlacedOrderDetails(data.order);
        clearCart();
      } else {
        alert("Failed to place order: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while placing your order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order Confirmation View
  if (placedOrderDetails) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center", backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
        <CheckCircle size={60} color="green" style={{ margin: "0 auto 15px auto" }} />
        <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>Order Confirmed!</h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>Thank you, {user.name}. Your order has been placed successfully.</p>
        
        <div style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "20px", textAlign: "left", backgroundColor: "#fafafa", marginBottom: "30px", fontSize: "14px" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>Order ID:</strong> <span style={{ fontFamily: "monospace" }}>{placedOrderDetails.id}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Total Amount Paid:</strong> <span style={{ color: "var(--price-color)", fontWeight: "700" }}>₹{placedOrderDetails.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Delivery Address:</strong> {placedOrderDetails.shippingAddress.address}, {placedOrderDetails.shippingAddress.city} - {placedOrderDetails.shippingAddress.pincode}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Delivery Speed:</strong> {placedOrderDetails.deliverySpeed}
          </div>
          <div>
            <strong>Estimated Delivery:</strong> {new Date(placedOrderDetails.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <Link href="/orders" className="btn-primary" style={{ padding: "10px 20px" }}>View Your Orders</Link>
          <Link href="/" className="btn-gray" style={{ padding: "10px 20px" }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 style={{ fontSize: "24px", fontWeight: "500", borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "25px" }}>
        Secure Checkout
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        {/* Left Side: Checkout Details */}
        <div style={{ flexGrow: 1, flexBasis: "600px" }}>
          {/* Step 1: Shipping Address */}
          <div className="checkout-step">
            <h3><span className="checkout-step-number">1</span> Delivery Address</h3>
            
            <div className="checkout-address-list">
              {addresses.map((addr, idx) => (
                <div 
                  key={idx} 
                  className={`checkout-address-card ${selectedAddressIndex === idx ? "selected" : ""}`}
                  onClick={() => setSelectedAddressIndex(idx)}
                >
                  <strong style={{ fontSize: "14px" }}>{addr.name}</strong>
                  <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                    {addr.address}, {addr.city} - {addr.pincode}
                  </p>
                  <p style={{ fontSize: "12px", color: "#555" }}>Phone: {addr.phone}</p>
                </div>
              ))}
            </div>

            <button 
              className="btn-gray" 
              style={{ padding: "6px 12px", fontSize: "13px" }}
              onClick={() => setShowAddressForm(!showAddressForm)}
            >
              {showAddressForm ? "Cancel" : "+ Add New Address"}
            </button>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginTop: "15px", border: "1px solid #ddd", padding: "15px", borderRadius: "6px", display: "grid", gap: "10px" }}>
                <input 
                  type="text" placeholder="Full Name" value={newAddress.name} 
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} required
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <input 
                  type="text" placeholder="Address line" value={newAddress.address} 
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} required
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input 
                    type="text" placeholder="City" value={newAddress.city} 
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required
                    style={{ flexGrow: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input 
                    type="text" placeholder="State" value={newAddress.state} 
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required
                    style={{ flexGrow: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input 
                    type="text" maxLength={6} placeholder="Pincode" value={newAddress.pincode} 
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })} required
                    style={{ flexGrow: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input 
                    type="text" placeholder="Phone Number" value={newAddress.phone} 
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required
                    style={{ flexGrow: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Save Address</button>
              </form>
            )}
          </div>

          {/* Step 2: Delivery Speed */}
          <div className="checkout-step">
            <h3><span className="checkout-step-number">2</span> Shipping Method</h3>
            
            <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
              {[
                { name: "Prime FREE One-Day Delivery", desc: "Get it by tomorrow 11 AM — FREE for Prime members" },
                { name: "Standard Delivery", desc: "Get it in 3-5 business days — FREE for orders over ₹499" }
              ].map((speed) => (
                <div 
                  key={speed.name}
                  className="payment-option"
                  style={{ borderColor: deliverySpeed === speed.name ? "var(--amazon-orange)" : "#ddd", backgroundColor: deliverySpeed === speed.name ? "#fdf5ea" : "#fff" }}
                  onClick={() => setDeliverySpeed(speed.name)}
                >
                  <input 
                    type="radio" 
                    checked={deliverySpeed === speed.name}
                    onChange={() => setDeliverySpeed(speed.name)}
                  />
                  <div>
                    <strong style={{ fontSize: "14px" }}>{speed.name}</strong>
                    <p style={{ fontSize: "12px", color: "#555" }}>{speed.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Options */}
          <div className="checkout-step">
            <h3><span className="checkout-step-number">3</span> Payment Method</h3>
            
            <div className="checkout-payments" style={{ marginTop: "10px" }}>
              {[
                { name: "UPI (Amazon Pay)", desc: "Pay with any UPI app (Google Pay, PhonePe, Paytm)" },
                { name: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay, Maestro accepted" },
                { name: "Net Banking", desc: "All major Indian banks supported" },
                { name: "Pay on Delivery (COD)", desc: "Cash, UPI, or Card payment at the door" }
              ].map((pay) => (
                <div 
                  key={pay.name}
                  className="payment-option"
                  style={{ borderColor: paymentMethod === pay.name ? "var(--amazon-orange)" : "#ddd", backgroundColor: paymentMethod === pay.name ? "#fdf5ea" : "#fff" }}
                  onClick={() => setPaymentMethod(pay.name)}
                >
                  <input 
                    type="radio" 
                    checked={paymentMethod === pay.name}
                    onChange={() => setPaymentMethod(pay.name)}
                  />
                  <div>
                    <strong style={{ fontSize: "14px" }}>{pay.name}</strong>
                    <p style={{ fontSize: "12px", color: "#555" }}>{pay.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Final Review */}
          <div className="checkout-step" style={{ borderBottom: "none", marginBottom: "0" }}>
            <h3><span className="checkout-step-number">4</span> Review Items</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "6px", padding: "10px", marginTop: "10px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: idx < cart.length - 1 ? "1px solid #eee" : "none", fontSize: "13px" }}>
                  <div style={{ width: "40px", height: "40px", backgroundImage: `url(${item.image})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}></div>
                  <div style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                    {item.isRespawned && (
                      <span style={{ display: "inline-block", backgroundColor: "#007185", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", marginLeft: "6px", verticalAlign: "middle" }}>RESPAWN</span>
                    )}
                  </div>
                  <div style={{ fontWeight: "700" }}>₹{item.price.toLocaleString("en-IN")} x {item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Order Review Summary */}
        <div style={{ width: "300px", flexShrink: 0 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", position: "sticky", top: "20px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px" }}>Order Summary</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span>Items Subtotal</span>
              <span>₹{itemsSubtotal.toLocaleString("en-IN")}</span>
            </div>

            {couponDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "green" }}>
                <span>Coupon Applied</span>
                <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
              <span>Delivery Charges</span>
              <span style={{ color: deliveryCharges === 0 ? "green" : "inherit" }}>
                {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "15px" }}>
              <span>Order Total</span>
              <span style={{ color: "var(--price-color)" }}>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>

            {/* Promo code box */}
            <div style={{ marginBottom: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <label htmlFor="promo" style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Promo Code / Coupon</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="text" 
                  id="promo" 
                  placeholder="e.g. RESPAWN10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "12px" }}
                />
                <button type="button" className="btn-gray" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={applyCouponCode}>Apply</button>
              </div>
              {couponApplied && <span style={{ color: "green", fontSize: "11px", display: "block", marginTop: "4px" }}>10% discount applied!</span>}
              {couponError && <span style={{ color: "red", fontSize: "11px", display: "block", marginTop: "4px" }}>{couponError}</span>}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              disabled={placingOrder}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Your Order"}
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#666", fontSize: "11px", marginTop: "12px", justifyContent: "center" }}>
              <ShieldCheck size={14} /> 100% Safe Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
