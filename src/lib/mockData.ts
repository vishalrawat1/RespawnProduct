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
      "https://images.unsplash.com/photo-1518444035608-d6da43b0174e?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Color", options: ["Black", "Blue", "White"] }
    ],
    specs: {
      "Brand": "Amazon",
      "Model": "Echo Dot 5th Gen",
      "Connectivity": "Wi-Fi, Bluetooth",
      "Voice Assistant": "Alexa Built-in",
      "Dimensions": "100 x 100 x 89 mm",
      "Weight": "340g"
    },
    whatInBox: ["Echo Dot 5th Gen", "Power Adapter (15W)", "Quick Start Guide"],
    isPrime: true,
    isBestSeller: true,
    isChoice: false,
    stock: 25,
    seller: "Appario Retail Private Ltd",
    reviews: [
      { id: "r1", userName: "Aman S.", rating: 5, date: "12 May 2026", title: "Amazing Sound!", text: "The bass is significantly improved over the 4th gen. Alexa is very responsive. Best purchase of this month!", helpfulVotes: 42 },
      { id: "r2", userName: "Priya Patel", rating: 4, date: "01 June 2026", title: "Great smart speaker", text: "Sound quality is very nice for the size. Only issue is that it needs constant power connection.", helpfulVotes: 12 }
    ],
    qas: [
      { id: "q1", question: "Does this require a Wi-Fi connection?", answer: "Yes, it requires Wi-Fi to access Alexa features and stream music." },
      { id: "q2", question: "Can we connect it to TV?", answer: "Yes, you can pair it via Bluetooth to use it as an external speaker." }
    ]
  },
  {
    id: "kindle-paperwhite",
    name: "Kindle Paperwhite (16 GB) | 6.8\" display with adjustable warm light",
    description: "Kindle Paperwhite is thin, light, and travels easily so you can enjoy your favorite books at any time. With our signature 300 ppi glare-free Paperwhite display — now 10% brighter at its max setting.",
    price: 13999,
    mrp: 14999,
    rating: 4.7,
    ratingCount: 8940,
    category: "devices",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Storage", options: ["16 GB", "32 GB Signature Edition"] }
    ],
    specs: {
      "Brand": "Amazon",
      "Screen Size": "6.8 inches",
      "Storage Capacity": "16 GB",
      "Connectivity": "Wi-Fi",
      "Battery Life": "Up to 10 weeks",
      "Water Resistance": "IPX8 waterproof"
    },
    whatInBox: ["Kindle Paperwhite", "USB-C Charging Cable", "Quick Start Guide"],
    isPrime: true,
    isBestSeller: false,
    isChoice: true,
    stock: 15,
    seller: "Cocoblu Retail",
    reviews: [
      { id: "r1", userName: "Vikram R.", rating: 5, date: "22 April 2026", title: "Perfect for Avid Readers", text: "The warm light is a lifesaver for night reading. The screen is sharp and looks exactly like paper.", helpfulVotes: 68 },
      { id: "r2", userName: "Sonia G.", rating: 5, date: "05 May 2026", title: "Excellent battery life", text: "Charged it once and it lasted for over a month. Highly recommended!", helpfulVotes: 29 }
    ],
    qas: [
      { id: "q1", question: "Is this model waterproof?", answer: "Yes, it is IPX8 rated, meaning it can withstand accidental immersion in water." }
    ]
  },
  {
    id: "iphone-15-pro",
    name: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    price: 127999,
    mrp: 134900,
    rating: 4.6,
    ratingCount: 3120,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1695048132717-57eccdeec7af?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Color", options: ["Natural Titanium", "Blue Titanium", "Black Titanium"] },
      { name: "Storage", options: ["128 GB", "256 GB", "512 GB"] }
    ],
    specs: {
      "Brand": "Apple",
      "Model Name": "iPhone 15 Pro",
      "Operating System": "iOS 17",
      "Cellular Technology": "5G",
      "Processor": "A17 Pro chip",
      "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto"
    },
    whatInBox: ["iPhone 15 Pro with iOS 17", "USB-C Charge Cable (1m)"],
    isPrime: true,
    isBestSeller: true,
    isChoice: false,
    stock: 8,
    seller: "Darshita Electronics",
    reviews: [
      { id: "r1", userName: "Harsh L.", rating: 5, date: "10 February 2026", title: "Premium Device", text: "The natural titanium look is stunning. A17 Pro chip flies through everything. High-end camera.", helpfulVotes: 110 }
    ],
    qas: [
      { id: "q1", question: "Does it come with a charger adapter?", answer: "No, Apple does not include a power adapter in the box. Only a USB-C charging cable is provided." }
    ]
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Wireless Industry Leading Active Noise Cancelling Headphones",
    description: "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancelling and exceptional call quality.",
    price: 25999,
    mrp: 34990,
    rating: 4.4,
    ratingCount: 12050,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Color", options: ["Black", "Silver", "Midnight Blue"] }
    ],
    specs: {
      "Brand": "Sony",
      "Model": "WH-1000XM5",
      "Type": "Over-Ear",
      "Battery Life": "Up to 30 hours",
      "Charging Time": "3 hours (Quick charge: 3 min for 3 hours)",
      "Bluetooth Version": "5.2"
    },
    whatInBox: ["WH-1000XM5 Headphones", "Carrying Case", "Headphone Cable (1.2m)", "USB Charging Cable"],
    isPrime: true,
    isBestSeller: false,
    isChoice: true,
    stock: 32,
    seller: "Appario Retail Private Ltd",
    reviews: [
      { id: "r1", userName: "Rajdeep K.", rating: 5, date: "15 March 2026", title: "Best ANC ever", text: "Blocks out almost all office and airplane cabin noise. Extremely lightweight and comfortable.", helpfulVotes: 34 }
    ],
    qas: [
      { id: "q1", question: "Can we connect it to two devices simultaneously?", answer: "Yes, it supports multi-point connection. You can pair it with both your phone and laptop at the same time." }
    ]
  },
  {
    id: "asus-rog-g14",
    name: "ASUS ROG Zephyrus G14 Gaming Laptop (AMD Ryzen 9, 16GB RAM, 1TB SSD, RTX 4060)",
    description: "The 2024 Zephyrus G14 is thin, light, and features an OLED display. Packed with a Ryzen 9 processor and RTX 4060 graphics, it is ready to handle all games and creative workflows.",
    price: 134990,
    mrp: 174990,
    rating: 4.3,
    ratingCount: 780,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Processor", options: ["Ryzen 9 + RTX 4060", "Ryzen 9 + RTX 4070"] }
    ],
    specs: {
      "Brand": "ASUS",
      "Screen": "14-inch ROG Nebula OLED WQXGA",
      "CPU": "AMD Ryzen 9 8945HS",
      "RAM": "16GB LPDDR5X",
      "Storage": "1TB PCIe 4.0 NVMe SSD",
      "GPU": "NVIDIA GeForce RTX 4060 8GB GDDR6"
    },
    whatInBox: ["ROG Zephyrus G14 Laptop", "AC Power Adapter", "ROG Sleeve", "User Manual"],
    isPrime: true,
    isBestSeller: false,
    isChoice: false,
    stock: 5,
    seller: "RetailNet",
    reviews: [
      { id: "r1", userName: "GamerBoy", rating: 4, date: "02 May 2026", title: "Incredible Screen and Form Factor", text: "The OLED display is gorgeous. Extremely thin for a gaming laptop. It gets warm under heavy gaming though.", helpfulVotes: 19 }
    ],
    qas: [
      { id: "q1", question: "Can we upgrade the RAM?", answer: "No, the RAM is soldered on this model. Make sure to choose the correct capacity during purchase." }
    ]
  },
  {
    id: "nike-revolution-6",
    name: "Nike Men's Revolution 6 Next Nature Running Shoes",
    description: "Comfort is key to your running routine. Made with at least 20% recycled content by weight, it has touch points at the heel and tongue for easy on and off.",
    price: 3199,
    mrp: 3995,
    rating: 4.1,
    ratingCount: 5210,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Size (UK)", options: ["7", "8", "9", "10"] },
      { name: "Color", options: ["Red/White", "All Black", "Grey/Blue"] }
    ],
    specs: {
      "Brand": "Nike",
      "Material": "Mesh & Polyester",
      "Closure": "Lace-Up",
      "Sole": "Rubber",
      "Type": "Road Running"
    },
    whatInBox: ["1 Pair of Running Shoes"],
    isPrime: true,
    isBestSeller: true,
    isChoice: false,
    stock: 40,
    seller: "Cocoblu Retail",
    reviews: [
      { id: "r1", userName: "Rohan D.", rating: 4, date: "11 May 2026", title: "Very comfortable for daily runs", text: "Fits perfectly. Cushioning is decent. Good quality daily trainers.", helpfulVotes: 8 }
    ],
    qas: [
      { id: "q1", question: "Is this shoe washable?", answer: "Hand washing with a damp cloth and mild soap is recommended instead of machine washing." }
    ]
  },
  {
    id: "instant-pot-duo",
    name: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker, 6 Quart",
    description: "Duo Plus replaces 9 appliances: pressure cooker, slow cooker, rice cooker, yogurt maker, steamer, sauté pan, yogurt maker, sterilizer and food warmer.",
    price: 9999,
    mrp: 14999,
    rating: 4.6,
    ratingCount: 38240,
    category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Capacity", options: ["3 Quart", "6 Quart", "8 Quart"] }
    ],
    specs: {
      "Brand": "Instant Pot",
      "Capacity": "5.7 Litres (6 Quart)",
      "Material": "Stainless Steel",
      "Power": "1000 Watts",
      "Control Method": "Touch screen buttons"
    },
    whatInBox: ["Instant Pot Base", "Stainless Steel Inner Pot", "Steam Rack with Handles", "Condensation Collector", "Quick Start Guide"],
    isPrime: false,
    isBestSeller: true,
    isChoice: false,
    stock: 12,
    seller: "Appario Retail Private Ltd",
    reviews: [
      { id: "r1", userName: "Kavita S.", rating: 5, date: "19 May 2026", title: "A life changer in the kitchen", text: "Saves so much time! Makes perfect rajma and chole in minutes without keeping track of whistles.", helpfulVotes: 44 }
    ],
    qas: [
      { id: "q1", question: "Does this have a delay start option?", answer: "Yes, it has a delay start feature up to 24 hours." }
    ]
  },
  {
    id: "atomic-habits",
    name: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    description: "The million-copy bestseller. Tiny Changes, Remarkable Results. No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    price: 499,
    mrp: 799,
    rating: 4.8,
    ratingCount: 92450,
    category: "books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80"
    ],
    variations: [
      { name: "Format", options: ["Paperback", "Hardcover", "Kindle Edition"] }
    ],
    specs: {
      "Author": "James Clear",
      "Publisher": "Penguin Business",
      "Language": "English",
      "Pages": "320 pages",
      "Dimensions": "15.3 x 2.2 x 23.4 cm"
    },
    whatInBox: ["1 Book"],
    isPrime: true,
    isBestSeller: true,
    isChoice: false,
    stock: 120,
    seller: "Trans-infopreneur",
    reviews: [
      { id: "r1", userName: "Debashish B.", rating: 5, date: "01 January 2026", title: "Practical and Actionable", text: "The advice is very practical. Implementing the 2-minute rule has changed my reading habit. A must read!", helpfulVotes: 198 }
    ],
    qas: [
      { id: "q1", question: "Is this book suitable for teenagers?", answer: "Yes, the concepts are simple and highly relevant for teenagers looking to build productive routines." }
    ]
  }
];

export const SIMULATED_ACCOUNTS = [
  { id: "acc-1", name: "Vishal Rawat", pincode: "110001", city: "New Delhi" },
  { id: "acc-2", name: "Anjali Panwar", pincode: "400001", city: "Mumbai" },
  { id: "acc-3", name: "Guest User", pincode: "560001", city: "Bengaluru" }
];
