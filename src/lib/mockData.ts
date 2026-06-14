export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  helpfulVotes: number;
}

export interface QA {
  id: string;
  question: string;
  answer: string;
}

export interface Variation {
  name: string;
  options: string[];
}

export interface HealthCardReturnEntry {
  id: number;
  reason: string;
  count?: number;
  info?: string;
}

export interface HealthCardData {
  grade: string;
  confidence: number;
  returns: HealthCardReturnEntry[];
  routed: string;
  manufacturerNote: string;
  sustainability: string;
  generatedDate?: string;
  blockchainHash?: string;
}

export interface RespawnData {
  isRespawned: boolean;
  healthCardId?: string;
  grade?: string;
}

export interface Product {
  id: string;
  _id?: string; // for MongoDB
  name: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  category: string;
  image: string;
  thumbnails: string[];
  variations: Variation[];
  specs: Record<string, string>;
  whatInBox: string[];
  isPrime: boolean;
  isBestSeller: boolean;
  isChoice: boolean;
  stock: number;
  reviews: Review[];
  qas: QA[];
  seller: string;
  respawn?: RespawnData;
}

export const CATEGORIES = [
  { id: "electronics", name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60" },
  { id: "devices", name: "Amazon Devices", image: "https://images.unsplash.com/photo-1543069027-d73630640aa3?w=500&auto=format&fit=crop&q=60" },
  { id: "fashion", name: "Fashion & Apparel", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60" },
  { id: "home-kitchen", name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60" },
  { id: "books", name: "Books", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=60" },
  { id: "sports", name: "Sports & Outdoors", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60" }
];

export const HERO_BANNERS = [
  { id: 1, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80", title: "Mega Summer Electronics Sale", subtitle: "Up to 40% Off on Top Brands" },
  { id: 2, image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&auto=format&fit=crop&q=80", title: "Read Anywhere, Anytime", subtitle: "Kindle Paperwhite starting at ₹11,999" },
  { id: 3, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80", title: "Upgrade Your Smart Kitchen", subtitle: "Save Big on Appliances" },
  { id: 4, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80", title: "Steal Deals on Fashion", subtitle: "Minimum 50% Off" }
];

export const PRODUCTS: Product[] = [
  // =============================================
  // DEVICES (5 products)
  // =============================================
  {
    id: "echo-dot-5",
    name: "Echo Dot (5th Gen) | Smart speaker with Alexa and deeper bass",
    description: "Our best-sounding Echo Dot yet — Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room.",
    price: 4499,
    mrp: 5499,
    rating: 4.5,
    ratingCount: 15430,
    category: "devices",
    image: "https://images.unsplash.com/photo-1543069027-d73630640aa3?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1543069027-d73630640aa3?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518444035608-d6da43b0174e?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [{ name: "Color", options: ["Black", "Blue", "White"] }],
    specs: { "Brand": "Amazon", "Model": "Echo Dot 5th Gen", "Connectivity": "Wi-Fi, Bluetooth", "Voice Assistant": "Alexa Built-in", "Dimensions": "100 x 100 x 89 mm", "Weight": "340g" },
    whatInBox: ["Echo Dot 5th Gen", "Power Adapter (15W)", "Quick Start Guide"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 25, seller: "Appario Retail Private Ltd",
    reviews: [
      { id: "r1", userName: "Aman S.", rating: 5, date: "12 May 2026", title: "Amazing Sound!", text: "The bass is significantly improved over the 4th gen. Alexa is very responsive.", helpfulVotes: 42 },
      { id: "r2", userName: "Priya Patel", rating: 4, date: "01 June 2026", title: "Great smart speaker", text: "Sound quality is very nice for the size. Only issue is constant power connection.", helpfulVotes: 12 }
    ],
    qas: [
      { id: "q1", question: "Does this require a Wi-Fi connection?", answer: "Yes, it requires Wi-Fi to access Alexa features and stream music." }
    ]
  },
  {
    id: "kindle-paperwhite",
    name: "Kindle Paperwhite (16 GB) | 6.8\" display with adjustable warm light",
    description: "Kindle Paperwhite is thin, light, and travels easily. With 300 ppi glare-free Paperwhite display — now 10% brighter at its max setting.",
    price: 13999, mrp: 14999, rating: 4.7, ratingCount: 8940, category: "devices",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Storage", options: ["16 GB", "32 GB Signature Edition"] }],
    specs: { "Brand": "Amazon", "Screen Size": "6.8 inches", "Storage Capacity": "16 GB", "Battery Life": "Up to 10 weeks", "Water Resistance": "IPX8 waterproof" },
    whatInBox: ["Kindle Paperwhite", "USB-C Charging Cable", "Quick Start Guide"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 15, seller: "Cocoblu Retail",
    reviews: [{ id: "r1", userName: "Vikram R.", rating: 5, date: "22 April 2026", title: "Perfect for Avid Readers", text: "The warm light is a lifesaver for night reading.", helpfulVotes: 68 }],
    qas: [{ id: "q1", question: "Is this model waterproof?", answer: "Yes, it is IPX8 rated." }]
  },
  {
    id: "fire-tv-stick-4k",
    name: "Fire TV Stick 4K Max (2nd Gen) with Alexa Voice Remote",
    description: "Our most powerful streaming stick — 4K Ultra HD, Dolby Vision, HDR10+, and Dolby Atmos audio. Wi-Fi 6E support for smooth streaming.",
    price: 4999, mrp: 6999, rating: 4.4, ratingCount: 21340, category: "devices",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Model", options: ["4K Max", "4K Standard", "Lite"] }],
    specs: { "Brand": "Amazon", "Resolution": "4K Ultra HD", "Audio": "Dolby Atmos", "Wi-Fi": "Wi-Fi 6E", "Storage": "16 GB", "RAM": "2 GB" },
    whatInBox: ["Fire TV Stick 4K Max", "Alexa Voice Remote", "USB Cable", "Power Adapter", "HDMI Extender"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 50, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Keshav M.", rating: 5, date: "18 May 2026", title: "Best streaming device!", text: "Lightning fast and picture quality is incredible. Alexa remote is super handy.", helpfulVotes: 89 }],
    qas: [{ id: "q1", question: "Does it support Netflix?", answer: "Yes, it supports Netflix, Prime Video, Disney+, YouTube and hundreds more." }]
  },
  {
    id: "echo-show-10",
    name: "Echo Show 10 (3rd Gen) | HD smart display with motion and Alexa",
    description: "The screen moves with you automatically. Make video calls, watch shows, manage your smart home — all while the 10.1\" HD display stays in view.",
    price: 19999, mrp: 24999, rating: 4.3, ratingCount: 4560, category: "devices",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Charcoal", "Glacier White"] }],
    specs: { "Brand": "Amazon", "Display": "10.1\" HD", "Camera": "13MP with auto-framing", "Speakers": "Dual tweeters + woofer", "Smart Home Hub": "Zigbee built-in" },
    whatInBox: ["Echo Show 10", "Power Adapter", "Quick Start Guide"],
    isPrime: true, isBestSeller: false, isChoice: false, stock: 10, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Neha T.", rating: 4, date: "03 June 2026", title: "Motion tracking is cool", text: "Love that the screen follows me around the kitchen while I cook with recipe videos.", helpfulVotes: 23 }],
    qas: [{ id: "q1", question: "Can this be used as a security camera?", answer: "Yes, you can view a live feed from your phone when away from home." }]
  },
  {
    id: "ring-video-doorbell",
    name: "Ring Video Doorbell (2nd Gen) | 1080p HD Video, Night Vision",
    description: "See, hear, and speak to anyone at your door from your phone. With 1080p HD video, improved motion detection, and easy DIY setup.",
    price: 8499, mrp: 12999, rating: 4.2, ratingCount: 6780, category: "devices",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Finish", options: ["Satin Nickel", "Venetian Bronze"] }],
    specs: { "Brand": "Ring", "Video": "1080p Full HD", "Field of View": "155° horizontal", "Power": "Rechargeable battery", "Connectivity": "Wi-Fi" },
    whatInBox: ["Ring Video Doorbell", "Rechargeable Battery", "Mounting Bracket", "Screws", "USB Charging Cable"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 18, seller: "Cocoblu Retail",
    reviews: [{ id: "r1", userName: "Deepak J.", rating: 5, date: "28 May 2026", title: "Peace of mind", text: "Can check who's at the door anytime from anywhere. Night vision is crystal clear.", helpfulVotes: 31 }],
    qas: [{ id: "q1", question: "Does it need a subscription?", answer: "Basic features are free. Ring Protect Plan is optional for video history." }]
  },

  // =============================================
  // ELECTRONICS (7 products)
  // =============================================
  {
    id: "iphone-15-pro",
    name: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    price: 127999, mrp: 134900, rating: 4.6, ratingCount: 3120, category: "electronics",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Color", options: ["Natural Titanium", "Blue Titanium", "Black Titanium"] },
      { name: "Storage", options: ["128 GB", "256 GB", "512 GB"] }
    ],
    specs: { "Brand": "Apple", "Model Name": "iPhone 15 Pro", "Operating System": "iOS 17", "Cellular Technology": "5G", "Processor": "A17 Pro chip", "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
    whatInBox: ["iPhone 15 Pro with iOS 17", "USB-C Charge Cable (1m)"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 8, seller: "Darshita Electronics",
    reviews: [{ id: "r1", userName: "Harsh L.", rating: 5, date: "10 February 2026", title: "Premium Device", text: "The natural titanium look is stunning. A17 Pro chip flies through everything.", helpfulVotes: 110 }],
    qas: [{ id: "q1", question: "Does it come with a charger adapter?", answer: "No, only a USB-C charging cable is provided." }]
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Two processors control 8 microphones for unprecedented noise cancelling. 30-hour battery life. Ultra-comfortable and lightweight design.",
    price: 25999, mrp: 34990, rating: 4.4, ratingCount: 12050, category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Black", "Silver", "Midnight Blue"] }],
    specs: { "Brand": "Sony", "Model": "WH-1000XM5", "Type": "Over-Ear", "Battery Life": "Up to 30 hours", "Bluetooth Version": "5.2" },
    whatInBox: ["WH-1000XM5 Headphones", "Carrying Case", "Headphone Cable", "USB Charging Cable"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 32, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Rajdeep K.", rating: 5, date: "15 March 2026", title: "Best ANC ever", text: "Blocks out almost all office noise. Extremely comfortable.", helpfulVotes: 34 }],
    qas: [{ id: "q1", question: "Can we connect it to two devices?", answer: "Yes, it supports multi-point connection." }]
  },
  {
    id: "asus-rog-g14",
    name: "ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9, 16GB, 1TB SSD, RTX 4060)",
    description: "The 2024 Zephyrus G14 is thin, light, and features an OLED display. Packed with Ryzen 9 and RTX 4060 for gaming and creative workflows.",
    price: 134990, mrp: 174990, rating: 4.3, ratingCount: 780, category: "electronics",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Processor", options: ["Ryzen 9 + RTX 4060", "Ryzen 9 + RTX 4070"] }],
    specs: { "Brand": "ASUS", "Screen": "14-inch ROG Nebula OLED WQXGA", "CPU": "AMD Ryzen 9 8945HS", "RAM": "16GB LPDDR5X", "Storage": "1TB PCIe 4.0 NVMe SSD", "GPU": "NVIDIA GeForce RTX 4060" },
    whatInBox: ["ROG Zephyrus G14 Laptop", "AC Power Adapter", "ROG Sleeve", "User Manual"],
    isPrime: true, isBestSeller: false, isChoice: false, stock: 5, seller: "RetailNet",
    reviews: [{ id: "r1", userName: "GamerBoy", rating: 4, date: "02 May 2026", title: "Incredible Screen", text: "The OLED display is gorgeous. Gets warm under heavy gaming though.", helpfulVotes: 19 }],
    qas: [{ id: "q1", question: "Can we upgrade the RAM?", answer: "No, the RAM is soldered on this model." }]
  },
  {
    id: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB, 256GB)",
    description: "Galaxy AI is here. The Galaxy S24 Ultra features a stunning 6.8\" QHD+ Dynamic AMOLED 2X display, 200MP camera with AI-powered enhancements, and the powerful Snapdragon 8 Gen 3 processor.",
    price: 129999, mrp: 134999, rating: 4.5, ratingCount: 8920, category: "electronics",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Color", options: ["Titanium Gray", "Titanium Violet", "Titanium Yellow"] },
      { name: "Storage", options: ["256 GB", "512 GB", "1 TB"] }
    ],
    specs: { "Brand": "Samsung", "Model": "Galaxy S24 Ultra", "Display": "6.8\" QHD+ AMOLED 2X", "Processor": "Snapdragon 8 Gen 3", "Camera": "200MP + 12MP + 10MP + 50MP", "Battery": "5000 mAh" },
    whatInBox: ["Galaxy S24 Ultra", "USB-C Cable", "SIM Ejection Pin"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 12, seller: "Samsung Authorized",
    reviews: [{ id: "r1", userName: "Rahul V.", rating: 5, date: "20 May 2026", title: "AI features are game changer", text: "Circle to Search and Live Translate are incredibly useful. Camera is unreal.", helpfulVotes: 76 }],
    qas: [{ id: "q1", question: "Does it support S Pen?", answer: "Yes, the S Pen is built into the Galaxy S24 Ultra." }]
  },
  {
    id: "ipad-air-m2",
    name: "Apple iPad Air (M2 Chip, 11-inch, Wi-Fi, 128GB) - Starlight",
    description: "The iPad Air is powered by the M2 chip, delivering next-level performance. A gorgeous 11-inch Liquid Retina display, 12MP front and back cameras, and all-day battery life.",
    price: 59900, mrp: 64900, rating: 4.7, ratingCount: 4230, category: "electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Color", options: ["Starlight", "Space Gray", "Blue", "Purple"] },
      { name: "Storage", options: ["128 GB", "256 GB", "512 GB"] }
    ],
    specs: { "Brand": "Apple", "Chip": "Apple M2", "Display": "11\" Liquid Retina", "Storage": "128 GB", "Battery": "Up to 10 hours", "Connectivity": "Wi-Fi 6E" },
    whatInBox: ["iPad Air", "USB-C Charge Cable", "20W USB-C Power Adapter"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 20, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Meera S.", rating: 5, date: "12 June 2026", title: "Perfect for students", text: "M2 chip handles everything smoothly. Great for note-taking with Apple Pencil.", helpfulVotes: 41 }],
    qas: [{ id: "q1", question: "Does it support Apple Pencil?", answer: "Yes, it supports Apple Pencil (USB-C) and Apple Pencil Pro." }]
  },
  {
    id: "jbl-flip-6",
    name: "JBL Flip 6 Portable Bluetooth Speaker with IP67 Waterproof",
    description: "Bold JBL Original Pro Sound. IP67 waterproof and dustproof. 12 hours of playtime. PartyBoost enabled for pairing multiple speakers.",
    price: 9999, mrp: 14999, rating: 4.5, ratingCount: 18900, category: "electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Black", "Blue", "Red", "Teal", "Pink"] }],
    specs: { "Brand": "JBL", "Model": "Flip 6", "Output Power": "30W", "Battery Life": "12 hours", "Waterproof": "IP67", "Bluetooth": "5.1" },
    whatInBox: ["JBL Flip 6 Speaker", "USB-C Charging Cable", "Quick Start Guide", "Safety Sheet"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 35, seller: "Harman Official Store",
    reviews: [{ id: "r1", userName: "Ankit P.", rating: 5, date: "05 June 2026", title: "Pool party essential!", text: "Took it to the pool, submerged it accidentally — still works perfectly. Bass is punchy.", helpfulVotes: 56 }],
    qas: [{ id: "q1", question: "Can I pair two Flip 6 speakers together?", answer: "Yes, using JBL PartyBoost you can connect two or more compatible speakers." }]
  },
  {
    id: "realme-buds-air5",
    name: "realme Buds Air 5 Pro with 50dB ANC, 360° Spatial Audio",
    description: "Premium sound with 50dB Active Noise Cancellation, LDAC Hi-Res Audio, and up to 40 hours total playback. Ergonomic design for all-day comfort.",
    price: 3999, mrp: 5999, rating: 4.1, ratingCount: 24560, category: "electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Astral Black", "Arctic White"] }],
    specs: { "Brand": "realme", "Model": "Buds Air 5 Pro", "ANC": "50dB", "Battery": "40 hrs total", "Driver": "11mm bass driver", "Bluetooth": "5.3" },
    whatInBox: ["Buds Air 5 Pro", "Charging Case", "USB-C Cable", "Ear Tips (S/M/L)", "User Guide"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 60, seller: "RetailNet",
    reviews: [{ id: "r1", userName: "Shreya D.", rating: 4, date: "01 June 2026", title: "Best under 4K", text: "ANC is impressive at this price. Sound quality rivals brands costing double.", helpfulVotes: 33 }],
    qas: [{ id: "q1", question: "Does it support wireless charging?", answer: "No, it charges via USB-C only." }]
  },

  // =============================================
  // FASHION & APPAREL (6 products)
  // =============================================
  {
    id: "nike-revolution-6",
    name: "Nike Men's Revolution 6 Next Nature Running Shoes",
    description: "Comfort is key to your running routine. Made with at least 20% recycled content by weight, it has touch points at the heel and tongue for easy on and off.",
    price: 3199, mrp: 3995, rating: 4.1, ratingCount: 5210, category: "fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Size (UK)", options: ["7", "8", "9", "10"] },
      { name: "Color", options: ["Red/White", "All Black", "Grey/Blue"] }
    ],
    specs: { "Brand": "Nike", "Material": "Mesh & Polyester", "Closure": "Lace-Up", "Sole": "Rubber", "Type": "Road Running" },
    whatInBox: ["1 Pair of Running Shoes"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 40, seller: "Cocoblu Retail",
    reviews: [{ id: "r1", userName: "Rohan D.", rating: 4, date: "11 May 2026", title: "Very comfortable", text: "Fits perfectly. Cushioning is decent. Good daily trainers.", helpfulVotes: 8 }],
    qas: [{ id: "q1", question: "Is this shoe washable?", answer: "Hand washing with a damp cloth and mild soap is recommended." }]
  },
  {
    id: "puma-rs-z",
    name: "Puma RS-Z Reinvention Sneakers Men",
    description: "Sharp silhouette and streetwise design language meet in the RS-Z Reinvention sneakers. Part of the iconic Running System (RS) family, this shoe features a breathable mesh upper with premium suede and synthetic leather overlays, a PU midsole for lightweight cushioning, and a durable rubber outsole.",
    price: 4999,
    mrp: 9999,
    rating: 4.4,
    ratingCount: 350,
    category: "fashion",
    image: "https://rukminim2.flixcart.com/image/480/640/xif0q/shoe/p/f/k/-original-imah852np7yscyzp.jpeg?q=90",
    thumbnails: [
      "https://rukminim2.flixcart.com/image/480/640/xif0q/shoe/p/f/k/-original-imah852np7yscyzp.jpeg?q=90"
    ],
    variations: [
      { name: "Size (UK)", options: ["7", "8", "9", "10"] },
      { name: "Color", options: ["Puma White-Puma Black", "Blue/White/Black"] }
    ],
    specs: {
      "Brand": "Puma",
      "Model Name": "RS-Z Reinvention",
      "Material": "Mesh, Suede & Leather Overlays",
      "Closure": "Lace-Up",
      "Sole": "Rubber",
      "Midsole": "PU Cushioning Midsole",
      "Type": "Sneakers"
    },
    whatInBox: ["1 Pair of Sneakers"],
    isPrime: true,
    isBestSeller: true,
    isChoice: false,
    stock: 20,
    seller: "Appario Retail Private Ltd",
    reviews: [
      { id: "r1", userName: "Aarav M.", rating: 5, date: "28 May 2026", title: "Excellent Comfort and Style", text: "The RS cushioning is amazing. Very lightweight and looks extremely premium. Totally recommend it!", helpfulVotes: 15 }
    ],
    qas: [
      { id: "q1", question: "Is this model suitable for running?", answer: "While it is part of the Running System family, it is designed primarily as a casual lifestyle sneaker." }
    ]
  },
  {
    id: "levis-511-jeans",
    name: "Levi's Men's 511 Slim Fit Jeans - Dark Indigo Stretch",
    description: "The 511 Slim Fit Jeans sit below the waist with a slim fit from hip to ankle. Made with Flex technology for comfortable stretch that moves with you all day.",
    price: 2499, mrp: 4299, rating: 4.3, ratingCount: 14320, category: "fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Size", options: ["30", "32", "34", "36"] },
      { name: "Color", options: ["Dark Indigo", "Medium Wash", "Black"] }
    ],
    specs: { "Brand": "Levi's", "Fit Type": "Slim Fit", "Material": "98% Cotton, 2% Elastane", "Closure": "Zip Fly with Button", "Care": "Machine Washable" },
    whatInBox: ["1 Pair of Jeans"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 55, seller: "Levi's Official",
    reviews: [{ id: "r1", userName: "Arjun K.", rating: 5, date: "08 May 2026", title: "Perfect fit and quality", text: "The stretch is comfortable and it holds its shape after many washes. Great color.", helpfulVotes: 22 }],
    qas: [{ id: "q1", question: "Does it shrink after washing?", answer: "Minimal shrinkage. We recommend cold water wash to maintain fit." }]
  },
  {
    id: "rayban-aviator",
    name: "Ray-Ban Aviator Classic Sunglasses - Gold Frame, Green Lens",
    description: "The iconic Ray-Ban Aviator. Originally designed for US aviators in 1937, the classic shape and gold frame make it the most recognizable style in the world.",
    price: 8490, mrp: 11990, rating: 4.6, ratingCount: 7800, category: "fashion",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Lens Color", options: ["Green Classic G-15", "Brown Gradient", "Blue Gradient"] }],
    specs: { "Brand": "Ray-Ban", "Frame Material": "Metal", "Lens": "Crystal Glass", "UV Protection": "100% UV", "Frame Color": "Gold", "Style": "RB3025" },
    whatInBox: ["Ray-Ban Aviator Sunglasses", "Ray-Ban Case", "Cleaning Cloth", "Authenticity Card"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 22, seller: "Luxottica India",
    reviews: [{ id: "r1", userName: "Siddharth M.", rating: 5, date: "25 April 2026", title: "Timeless classic", text: "Build quality is exceptional. Glass lenses are crystal clear. Worth every rupee.", helpfulVotes: 45 }],
    qas: [{ id: "q1", question: "Are these polarized?", answer: "The classic G-15 version is not polarized. Ray-Ban offers a polarized variant separately." }]
  },
  {
    id: "casio-gshock-ga2100",
    name: "Casio G-Shock GA-2100-1A1 CasiOak Analog-Digital Watch",
    description: "The 'CasiOak' — slim G-Shock with carbon core guard structure. Features shock resistance, 200m water resistance, world time, and LED light.",
    price: 9995, mrp: 10995, rating: 4.7, ratingCount: 3450, category: "fashion",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["All Black", "Black/Green", "Navy/Rose Gold"] }],
    specs: { "Brand": "Casio", "Model": "GA-2100-1A1", "Movement": "Quartz", "Water Resistance": "200 meters", "Case Material": "Carbon/Resin", "Weight": "51g" },
    whatInBox: ["G-Shock GA-2100 Watch", "Warranty Card", "Manual"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 15, seller: "Casio Authorized",
    reviews: [{ id: "r1", userName: "Varun P.", rating: 5, date: "14 May 2026", title: "Sleekest G-Shock ever", text: "Looks like a Royal Oak at a fraction of the price. Super light and tough.", helpfulVotes: 67 }],
    qas: [{ id: "q1", question: "Is this solar powered?", answer: "No, the GA-2100 uses a CR2016 battery lasting about 3 years." }]
  },
  {
    id: "puma-tshirt-active",
    name: "Puma Men's Active Soft Cotton T-Shirt - Regular Fit",
    description: "Made with soft cotton for everyday comfort. Puma Cat logo on the chest. Ribbed crew neck with clean, minimal design perfect for casual wear.",
    price: 899, mrp: 1499, rating: 4.0, ratingCount: 8900, category: "fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["White", "Black", "Navy Blue", "Grey Heather"] }
    ],
    specs: { "Brand": "Puma", "Material": "100% Cotton", "Fit": "Regular", "Neck": "Crew Neck", "Sleeve": "Short Sleeve", "Care": "Machine Washable" },
    whatInBox: ["1 T-Shirt"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 80, seller: "RetailNet",
    reviews: [{ id: "r1", userName: "Manish G.", rating: 4, date: "20 May 2026", title: "Good quality basic tee", text: "Soft fabric, good stitching. Slightly loose fit which I prefer. Value for money.", helpfulVotes: 12 }],
    qas: [{ id: "q1", question: "Does the color fade after washing?", answer: "If washed in cold water and not in dryer, the color holds up well." }]
  },
  {
    id: "boat-smartwatch-storm",
    name: "boAt Storm Call 2 Smartwatch with 1.83\" HD Display & BT Calling",
    description: "Make/receive calls from your wrist with built-in mic and speaker. 1.83\" HD display, 100+ sports modes, SpO2, heart rate, and 7-day battery.",
    price: 1999, mrp: 5999, rating: 4.0, ratingCount: 31200, category: "fashion",
    image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Active Black", "Cherry Blossom", "Deep Blue"] }],
    specs: { "Brand": "boAt", "Display": "1.83\" HD", "Calling": "Bluetooth Calling", "Battery": "7 days", "Sensors": "Heart Rate, SpO2, Sleep", "Water Resistance": "IP67" },
    whatInBox: ["Storm Call 2 Smartwatch", "Magnetic Charging Cable", "User Manual"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 100, seller: "boAt Lifestyle",
    reviews: [{ id: "r1", userName: "Riya A.", rating: 4, date: "10 June 2026", title: "Best smartwatch under 2K", text: "Call quality is surprisingly good. Display is bright and responsive. Great value!", helpfulVotes: 89 }],
    qas: [{ id: "q1", question: "Does it work with iPhone?", answer: "Yes, it works with both Android and iOS devices." }]
  },

  // =============================================
  // HOME & KITCHEN (5 products)
  // =============================================
  {
    id: "instant-pot-duo",
    name: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker, 6 Quart",
    description: "Duo Plus replaces 9 appliances: pressure cooker, slow cooker, rice cooker, yogurt maker, steamer, sauté pan, sterilizer and food warmer.",
    price: 9999, mrp: 14999, rating: 4.6, ratingCount: 38240, category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Capacity", options: ["3 Quart", "6 Quart", "8 Quart"] }],
    specs: { "Brand": "Instant Pot", "Capacity": "5.7 Litres (6 Quart)", "Material": "Stainless Steel", "Power": "1000 Watts", "Control Method": "Touch screen buttons" },
    whatInBox: ["Instant Pot Base", "Stainless Steel Inner Pot", "Steam Rack", "Condensation Collector", "Quick Start Guide"],
    isPrime: false, isBestSeller: true, isChoice: false, stock: 12, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Kavita S.", rating: 5, date: "19 May 2026", title: "A life changer", text: "Makes perfect rajma and chole in minutes without keeping track of whistles.", helpfulVotes: 44 }],
    qas: [{ id: "q1", question: "Does this have a delay start option?", answer: "Yes, it has delay start up to 24 hours." }]
  },
  {
    id: "dyson-purifier-fan",
    name: "Dyson Pure Cool TP07 Air Purifier & Tower Fan - White/Silver",
    description: "Purifies and cools you. Automatically senses particles and gases, capturing 99.97% of pollutants and allergens as small as 0.3 microns with HEPA H13 filter.",
    price: 41900, mrp: 49900, rating: 4.5, ratingCount: 2340, category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["White/Silver", "Black/Nickel"] }],
    specs: { "Brand": "Dyson", "Model": "TP07", "Filter": "HEPA H13 + Activated Carbon", "Coverage": "Up to 800 sq ft", "Noise Level": "As low as 35 dB", "App": "Dyson Link App" },
    whatInBox: ["Dyson Pure Cool Tower Fan", "Remote Control", "HEPA Filter (pre-installed)", "User Manual"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 6, seller: "Dyson India",
    reviews: [{ id: "r1", userName: "Aisha N.", rating: 5, date: "01 June 2026", title: "Worth the investment", text: "Air quality noticeably improved. Very quiet on low settings. The app shows real-time air quality.", helpfulVotes: 38 }],
    qas: [{ id: "q1", question: "How often do I need to replace the filter?", answer: "Dyson recommends replacing the filter every 12 months with typical use." }]
  },
  {
    id: "philips-mixer-grinder",
    name: "Philips HL7756/00 Mixer Grinder 750 Watt, 3 Jars (Black)",
    description: "Powerful 750W motor with advanced air ventilation for longer life. 3 stainless steel jars for wet grinding, dry grinding, and chutney. Turbo speed for tough grinding.",
    price: 3299, mrp: 4495, rating: 4.3, ratingCount: 22100, category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Black", "White"] }],
    specs: { "Brand": "Philips", "Wattage": "750W", "Jars": "3 (Wet, Dry, Chutney)", "Blade": "Stainless Steel", "Speed": "3 Speed + Turbo", "Warranty": "2 Years" },
    whatInBox: ["Mixer Grinder Base", "1.5L Wet Jar", "1L Dry Jar", "0.3L Chutney Jar", "User Manual"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 30, seller: "Appario Retail Private Ltd",
    reviews: [{ id: "r1", userName: "Sunita R.", rating: 4, date: "15 May 2026", title: "Powerful and durable", text: "Grinds idli batter and masala paste effortlessly. Motor is very strong.", helpfulVotes: 29 }],
    qas: [{ id: "q1", question: "Can it grind dry spices?", answer: "Yes, the dry grinding jar is specifically designed for dry spices and coffee beans." }]
  },
  {
    id: "prestige-induction",
    name: "Prestige PIC 16.0+ 2000W Induction Cooktop with Push Button",
    description: "Advanced Indian menu option with pre-set cooking times. Anti-magnetic wall ensures no radiation. Automatic voltage regulator for safe operation.",
    price: 2499, mrp: 4195, rating: 4.2, ratingCount: 15600, category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop&q=80"],
    variations: [],
    specs: { "Brand": "Prestige", "Wattage": "2000W", "Voltage": "230V", "Pre-set Menus": "Roti, Dosa, Chapati, Paneer, Rice, Idli", "Timer": "Up to 3 hours", "Warranty": "1 Year" },
    whatInBox: ["Induction Cooktop", "User Manual", "Warranty Card"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 25, seller: "Cocoblu Retail",
    reviews: [{ id: "r1", userName: "Rekha B.", rating: 4, date: "22 May 2026", title: "Fast and efficient", text: "Heats up very quickly. Indian menu presets are handy. Saves a lot of gas money.", helpfulVotes: 18 }],
    qas: [{ id: "q1", question: "Which utensils work on this?", answer: "Any flat-bottom induction-compatible utensils made of stainless steel or iron." }]
  },
  {
    id: "milton-thermosteel",
    name: "Milton Thermosteel Flip Lid Flask 1000ml - Stainless Steel",
    description: "Double-walled vacuum insulation keeps beverages hot for 24 hours or cold for 24 hours. Leak-proof flip lid, BPA-free, rust-resistant stainless steel.",
    price: 799, mrp: 1350, rating: 4.4, ratingCount: 42300, category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80"],
    variations: [
      { name: "Capacity", options: ["500ml", "750ml", "1000ml"] },
      { name: "Color", options: ["Silver", "Black", "Blue"] }
    ],
    specs: { "Brand": "Milton", "Material": "18/8 Stainless Steel", "Capacity": "1000ml", "Insulation": "24 hours hot/cold", "Lid": "Flip Lid, Leak-proof", "BPA Free": "Yes" },
    whatInBox: ["1 Milton Thermosteel Flask"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 90, seller: "Hamilton Housewares",
    reviews: [{ id: "r1", userName: "Akash S.", rating: 5, date: "30 May 2026", title: "Keeps chai hot for hours!", text: "Poured boiling chai at 7am, still hot at lunch. Build quality is solid. No leaks.", helpfulVotes: 78 }],
    qas: [{ id: "q1", question: "Is this dishwasher safe?", answer: "Hand wash recommended to maintain vacuum insulation properties." }]
  },

  // =============================================
  // BOOKS (5 products)
  // =============================================
  {
    id: "atomic-habits",
    name: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    description: "The million-copy bestseller. Tiny Changes, Remarkable Results. Offers a proven framework for improving — every day.",
    price: 499, mrp: 799, rating: 4.8, ratingCount: 92450, category: "books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Format", options: ["Paperback", "Hardcover", "Kindle Edition"] }],
    specs: { "Author": "James Clear", "Publisher": "Penguin Business", "Language": "English", "Pages": "320 pages", "Dimensions": "15.3 x 2.2 x 23.4 cm" },
    whatInBox: ["1 Book"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 120, seller: "Trans-infopreneur",
    reviews: [{ id: "r1", userName: "Debashish B.", rating: 5, date: "01 January 2026", title: "Practical and Actionable", text: "The 2-minute rule has changed my reading habit. A must read!", helpfulVotes: 198 }],
    qas: [{ id: "q1", question: "Is this book suitable for teenagers?", answer: "Yes, the concepts are simple and highly relevant for teenagers." }]
  },
  {
    id: "psychology-of-money",
    name: "The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness",
    description: "Award-winning author Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life's most important topics.",
    price: 349, mrp: 399, rating: 4.7, ratingCount: 67800, category: "books",
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Format", options: ["Paperback", "Hardcover", "Kindle Edition"] }],
    specs: { "Author": "Morgan Housel", "Publisher": "Jaico Publishing", "Language": "English", "Pages": "252 pages", "Genre": "Personal Finance" },
    whatInBox: ["1 Book"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 200, seller: "Kitab Mahal",
    reviews: [{ id: "r1", userName: "Pooja N.", rating: 5, date: "10 April 2026", title: "Changed how I think about money", text: "Not a typical finance book. It's about behaviour and decision-making. Every chapter is a gem.", helpfulVotes: 156 }],
    qas: [{ id: "q1", question: "Is this good for someone with no finance background?", answer: "Absolutely. The book uses simple stories, no jargon." }]
  },
  {
    id: "sapiens",
    name: "Sapiens: A Brief History of Humankind by Yuval Noah Harari",
    description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. What happened? Sapiens takes you on a thrilling journey of our species' history.",
    price: 399, mrp: 599, rating: 4.6, ratingCount: 54300, category: "books",
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Format", options: ["Paperback", "Hardcover"] }],
    specs: { "Author": "Yuval Noah Harari", "Publisher": "Harper Perennial", "Language": "English", "Pages": "498 pages", "Genre": "History / Anthropology" },
    whatInBox: ["1 Book"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 150, seller: "Trans-infopreneur",
    reviews: [{ id: "r1", userName: "Ankur T.", rating: 5, date: "18 March 2026", title: "Mind-blowing perspective", text: "Makes you rethink everything you know about human history. Beautifully written.", helpfulVotes: 112 }],
    qas: [{ id: "q1", question: "Is it a heavy academic read?", answer: "No, it's written in a very engaging narrative style accessible to everyone." }]
  },
  {
    id: "rich-dad-poor-dad",
    name: "Rich Dad Poor Dad by Robert T. Kiyosaki",
    description: "What the rich teach their kids about money — that the poor and middle class do not! The #1 personal finance book of all time, with over 40 million copies sold worldwide.",
    price: 299, mrp: 399, rating: 4.5, ratingCount: 88900, category: "books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Format", options: ["Paperback", "Mass Market Paperback"] }],
    specs: { "Author": "Robert T. Kiyosaki", "Publisher": "Plata Publishing", "Language": "English", "Pages": "336 pages", "Genre": "Personal Finance / Self-Help" },
    whatInBox: ["1 Book"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 300, seller: "Kitab Mahal",
    reviews: [{ id: "r1", userName: "Nitin J.", rating: 4, date: "05 May 2026", title: "Great intro to financial literacy", text: "Eye-opening concepts about assets vs liabilities. A bit repetitive but the core message is powerful.", helpfulVotes: 88 }],
    qas: [{ id: "q1", question: "Is this suitable for students?", answer: "Yes, the earlier you read it, the better. Great for building financial mindset." }]
  },
  {
    id: "ikigai-book",
    name: "Ikigai: The Japanese Secret to a Long and Happy Life",
    description: "Bring meaning and joy to all your days with this internationally bestselling guide to the Japanese concept of ikigai — the happiness of always being busy.",
    price: 299, mrp: 599, rating: 4.5, ratingCount: 45600, category: "books",
    image: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Format", options: ["Paperback", "Hardcover"] }],
    specs: { "Author": "Héctor García & Francesc Miralles", "Publisher": "Hutchinson", "Language": "English", "Pages": "208 pages", "Genre": "Self-Help / Philosophy" },
    whatInBox: ["1 Book"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 180, seller: "Trans-infopreneur",
    reviews: [{ id: "r1", userName: "Sneha L.", rating: 5, date: "12 June 2026", title: "Beautiful and calming read", text: "Short, insightful chapters about finding purpose. Loved the stories from Okinawa centenarians.", helpfulVotes: 67 }],
    qas: [{ id: "q1", question: "Is this a self-help book?", answer: "It's more of a lifestyle and philosophy book than a typical self-help manual." }]
  },

  // =============================================
  // SPORTS & OUTDOORS (4 products)
  // =============================================
  {
    id: "boldfit-yoga-mat",
    name: "Boldfit Yoga Mat for Women and Men - 6mm Anti-Slip Exercise Mat",
    description: "Premium NBR material with anti-slip texture for excellent grip. 6mm thick cushioning protects knees and joints. Comes with a carrying strap for easy portability.",
    price: 499, mrp: 1299, rating: 4.2, ratingCount: 34500, category: "sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Purple", "Blue", "Black", "Pink", "Green"] }],
    specs: { "Brand": "Boldfit", "Material": "NBR Foam", "Thickness": "6mm", "Size": "183 x 61 cm", "Weight": "800g", "Anti-Slip": "Yes - Textured Surface" },
    whatInBox: ["1 Yoga Mat", "1 Carrying Strap"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 200, seller: "Boldfit Store",
    reviews: [{ id: "r1", userName: "Ananya K.", rating: 4, date: "08 June 2026", title: "Great for home workouts", text: "Good cushioning for floor exercises. Anti-slip works well even with sweat. Amazing value.", helpfulVotes: 56 }],
    qas: [{ id: "q1", question: "Is it suitable for hot yoga?", answer: "For hot yoga, we recommend using a yoga towel on top as heavy sweating may reduce grip." }]
  },
  {
    id: "kore-dumbbell-set",
    name: "Kore PVC 10-40 Kg Home Gym Dumbbell Set with Gym Accessories",
    description: "Complete home gym solution with PVC dumbbell plates, 2 dumbbell rods, gym gloves, hand gripper, and skipping rope. Perfect for beginners to intermediate fitness.",
    price: 1899, mrp: 3499, rating: 4.0, ratingCount: 18700, category: "sports",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Weight", options: ["10 Kg", "16 Kg", "20 Kg", "40 Kg"] }],
    specs: { "Brand": "Kore", "Material": "PVC Coated", "Rod Length": "14 inches", "Rod Material": "Chrome Plated Steel", "Includes": "Plates + Rods + Gloves + Gripper + Rope" },
    whatInBox: ["PVC Weight Plates (assorted)", "2 Dumbbell Rods", "4 Locks", "Gym Gloves", "Hand Gripper", "Skipping Rope"],
    isPrime: true, isBestSeller: true, isChoice: false, stock: 45, seller: "Kore Fitness",
    reviews: [{ id: "r1", userName: "Sahil M.", rating: 4, date: "25 May 2026", title: "Perfect starter set", text: "Good quality for the price. PVC coating prevents floor damage. Accessories are a nice bonus.", helpfulVotes: 34 }],
    qas: [{ id: "q1", question: "Are the plates adjustable on the rods?", answer: "Yes, you can mix and match plates on the dumbbell rods using the included locks." }]
  },
  {
    id: "yonex-nanoray-racket",
    name: "Yonex Nanoray Light 18i Graphite Badminton Racquet",
    description: "Ultra-lightweight 77g isometric head shape for a larger sweet spot. Built-in T-Joint for a stronger and more stable frame. Ideal for beginners and intermediate players.",
    price: 1690, mrp: 2390, rating: 4.4, ratingCount: 9800, category: "sports",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Black/Red", "Blue/Orange"] }],
    specs: { "Brand": "Yonex", "Material": "Graphite", "Weight": "77g (5U)", "Flexibility": "Medium", "String Tension": "Up to 30 lbs", "Head Shape": "Isometric" },
    whatInBox: ["1 Badminton Racquet (pre-strung)", "Full Cover"],
    isPrime: true, isBestSeller: false, isChoice: true, stock: 30, seller: "Sports Wing India",
    reviews: [{ id: "r1", userName: "Prashant D.", rating: 5, date: "02 June 2026", title: "Best racket under 2K", text: "Super lightweight and great for quick smashes. Build quality is excellent for the price.", helpfulVotes: 42 }],
    qas: [{ id: "q1", question: "Does it come pre-strung?", answer: "Yes, it comes factory strung and ready to play." }]
  },
  {
    id: "nivia-football",
    name: "Nivia Storm Football - Size 5, Machine Stitched (White/Blue)",
    description: "Official size 5 football with 32-panel machine stitched construction. Rubberized outer for grip and durability. Suitable for training, practice, and casual matches.",
    price: 599, mrp: 960, rating: 4.1, ratingCount: 12400, category: "sports",
    image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Size", options: ["Size 3", "Size 4", "Size 5"] }],
    specs: { "Brand": "Nivia", "Size": "5 (Standard)", "Panels": "32 Machine Stitched", "Material": "Rubberized TPU", "Weight": "420-445g", "Suitable For": "Training / Casual" },
    whatInBox: ["1 Football (Deflated)", "1 Needle for Inflation"],
    isPrime: true, isBestSeller: false, isChoice: false, stock: 50, seller: "Sports Wing India",
    reviews: [{ id: "r1", userName: "Vishal R.", rating: 4, date: "15 May 2026", title: "Good for daily practice", text: "Holds air well and the grip is decent. Good quality for the price point.", helpfulVotes: 15 }],
    qas: [{ id: "q1", question: "Does it come inflated?", answer: "No, it comes deflated. A needle is included for inflation but you'll need a pump." }]
  },
  // =============================================
  // RESPAWNED PRODUCTS (1 product)
  // =============================================
  {
    id: "respawn-wireless-mouse",
    name: "Logitech MX Master 3S Wireless Mouse - Refurbished",
    description: "Fully inspected and restored by RESPawn AI. The MX Master 3S offers quiet clicks and an 8000 DPI track-on-glass sensor. Note: Minor cosmetic wear.",
    price: 6499, mrp: 10995, rating: 4.8, ratingCount: 412, category: "electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80",
    thumbnails: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80"],
    variations: [{ name: "Color", options: ["Graphite"] }],
    specs: { "Brand": "Logitech", "Model": "MX Master 3S", "Connectivity": "Bluetooth / Logi Bolt", "Sensor": "8000 DPI Darkfield", "Battery": "Up to 70 days" },
    whatInBox: ["Refurbished MX Master 3S", "Logi Bolt USB Receiver", "USB-C Charging Cable"],
    isPrime: true, isBestSeller: false, isChoice: false, stock: 3, seller: "Respawn Certified Refurbished",
    reviews: [{ id: "r1", userName: "Techie Guy", rating: 5, date: "12 June 2026", title: "Like new!", text: "Couldn't tell it was refurbished. Works perfectly.", helpfulVotes: 5 }],
    qas: [{ id: "q1", question: "Does it come with warranty?", answer: "Yes, it comes with a 6-month RESPawn warranty." }],
    respawn: {
      isRespawned: true,
      healthCardId: "hc-1",
      grade: "B"
    }
  }
];

export const HEALTH_CARDS: Record<string, HealthCardData> = {
  "hc-1": {
    grade: "B",
    confidence: 82,
    returns: [
      { id: 1, reason: "Too small (Size M)", count: 2 },
      { id: 2, reason: "Color mismatch" }
    ],
    routed: "REFURBISH",
    manufacturerNote: "v2.1 adjusted sizing",
    sustainability: "0.3kg saved",
    generatedDate: "2026-06-15",
    blockchainHash: "0x8f7b...3c1a"
  }
};

export const SIMULATED_ACCOUNTS = [
  { id: "acc-1", name: "Vishal Rawat", pincode: "110001", city: "New Delhi" },
  { id: "acc-2", name: "Anjali Panwar", pincode: "400001", city: "Mumbai" },
  { id: "acc-3", name: "Guest User", pincode: "560001", city: "Bengaluru" }
];
