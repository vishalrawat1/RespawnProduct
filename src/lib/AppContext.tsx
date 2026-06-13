"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SIMULATED_ACCOUNTS } from "./mockData";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  variation?: string;
  isPrime: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  pincode: string;
  city: string;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, variation?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number, variation?: string) => void;
  clearCart: () => void;
  user: UserAccount;
  switchUser: (userId: string) => void;
  loginUser: (userData: UserAccount) => void;
  logoutUser: () => void;
  pincode: string;
  updatePincode: (pin: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserAccount>(SIMULATED_ACCOUNTS[0]);
  const [pincode, setPincode] = useState<string>(SIMULATED_ACCOUNTS[0].pincode);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load cart, searches, and user on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("amazon_clone_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart", e);
      }
    }

    const savedSearches = localStorage.getItem("amazon_clone_searches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Error loading searches", e);
      }
    }

    const savedUser = localStorage.getItem("amazon_clone_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setPincode(parsedUser.pincode);
      } catch (e) {
        console.error("Error loading user", e);
      }
    }
  }, []);

  // Save cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("amazon_clone_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex(
      (c) => c.id === item.id && c.variation === item.variation
    );
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += item.quantity;
      saveCart(newCart);
    } else {
      saveCart([...cart, item]);
    }
  };

  const removeFromCart = (itemId: string, variation?: string) => {
    const newCart = cart.filter(
      (c) => !(c.id === itemId && c.variation === variation)
    );
    saveCart(newCart);
  };

  const updateCartQuantity = (itemId: string, quantity: number, variation?: string) => {
    if (quantity <= 0) {
      removeFromCart(itemId, variation);
      return;
    }
    const newCart = cart.map((c) => {
      if (c.id === itemId && c.variation === variation) {
        return { ...c, quantity };
      }
      return c;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const switchUser = (userId: string) => {
    const found = SIMULATED_ACCOUNTS.find((a) => a.id === userId);
    if (found) {
      setUser(found);
      setPincode(found.pincode);
      localStorage.setItem("amazon_clone_user", JSON.stringify(found));
    }
  };

  const loginUser = (userData: UserAccount) => {
    setUser(userData);
    setPincode(userData.pincode);
    localStorage.setItem("amazon_clone_user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    const defaultUser = SIMULATED_ACCOUNTS[0];
    setUser(defaultUser);
    setPincode(defaultUser.pincode);
    localStorage.removeItem("amazon_clone_user");
  };

  const updatePincode = (pin: string) => {
    setPincode(pin);
  };

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    const updated = [cleanQuery, ...recentSearches.filter((q) => q !== cleanQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("amazon_clone_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("amazon_clone_searches");
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        user,
        switchUser,
        loginUser,
        logoutUser,
        pincode,
        updatePincode,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
