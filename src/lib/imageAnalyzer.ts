/**
 * Utility for analyzing image colors and aspect ratio on the client side
 * to provide a "smart search" effect.
 */

export interface AnalysisResult {
  dominantColors: string[];
  aspectRatio: number;
  detectedType: "rectangular-device" | "book-or-document" | "appliance-or-metallic" | "colorful-item" | "unknown";
  matchingKeywords: string[];
  colorHexes: string[];
}

// Helper to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function analyzeImage(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const aspectRatio = width / height;

          // Create a canvas to downsample the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not create canvas context"));
            return;
          }

          // Sample at 30x30 for fast pixel scanning
          canvas.width = 30;
          canvas.height = 30;
          ctx.drawImage(img, 0, 0, 30, 30);

          const imgData = ctx.getImageData(0, 0, 30, 30);
          const data = imgData.data;

          // Color bucket counts
          let blackCount = 0;
          let whiteCount = 0;
          let greyCount = 0;
          let brownCount = 0;
          let redCount = 0;
          let orangeYellowCount = 0;
          let greenCount = 0;
          let blueCount = 0;
          let purplePinkCount = 0;

          // Keep track of some actual color samples for UI display
          const sampledColors: { r: number; g: number; b: number }[] = [];
          const step = 4 * 10; // sample every 10th pixel for hex list

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 50) continue; // Skip highly transparent pixels

            const [h, s, l] = rgbToHsl(r, g, b);

            if (i % step === 0 && sampledColors.length < 5) {
              sampledColors.push({ r, g, b });
            }

            // Heuristic categorization based on HSL
            if (l < 18) {
              blackCount++;
            } else if (l > 82 && s < 15) {
              whiteCount++;
            } else if (s < 12) {
              greyCount++;
            } else if (h >= 10 && h <= 38 && s >= 15 && s <= 65 && l >= 15 && l <= 55) {
              brownCount++;
            } else if ((h < 15 || h > 345) && s >= 20) {
              redCount++;
            } else if (h >= 15 && h <= 62 && s >= 20) {
              orangeYellowCount++;
            } else if (h >= 62 && h <= 160 && s >= 20) {
              greenCount++;
            } else if (h >= 160 && h <= 250 && s >= 20) {
              blueCount++;
            } else if (h >= 250 && h <= 345 && s >= 20) {
              purplePinkCount++;
            } else {
              greyCount++;
            }
          }

          // Convert sampled colors to Hex strings
          const colorHexes = sampledColors.map(c => {
            const toHex = (num: number) => {
              const hex = num.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            };
            return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
          });

          // Determine dominant color buckets
          const totalSamples = blackCount + whiteCount + greyCount + brownCount + redCount + orangeYellowCount + greenCount + blueCount + purplePinkCount || 1;
          const pct = (count: number) => (count / totalSamples) * 100;

          const colorPcts = [
            { name: "Black", pct: pct(blackCount), label: "🖤 Black/Dark" },
            { name: "White", pct: pct(whiteCount), label: "🤍 White/Light" },
            { name: "Grey", pct: pct(greyCount), label: "🩶 Grey/Silver" },
            { name: "Brown", pct: pct(brownCount), label: "🤎 Brown/Wood" },
            { name: "Red", pct: pct(redCount), label: "❤️ Red" },
            { name: "OrangeYellow", pct: pct(orangeYellowCount), label: "💛 Yellow/Orange" },
            { name: "Green", pct: pct(greenCount), label: "💚 Green" },
            { name: "Blue", pct: pct(blueCount), label: "💙 Blue" },
            { name: "PurplePink", pct: pct(purplePinkCount), label: "💜 Pink/Purple" },
          ];

          // Sort colors by percentage
          colorPcts.sort((a, b) => b.pct - a.pct);
          const dominantColors = colorPcts.filter(c => c.pct > 15).map(c => c.label);
          if (dominantColors.length === 0) {
            dominantColors.push(colorPcts[0].label);
          }

          const primaryColor = colorPcts[0].name;

          // Simple Shape/Type heuristics
          let detectedType: "rectangular-device" | "book-or-document" | "appliance-or-metallic" | "colorful-item" | "unknown" = "unknown";
          
          if (primaryColor === "Black" || primaryColor === "Grey") {
            if (aspectRatio > 1.2 || aspectRatio < 0.8) {
              detectedType = "rectangular-device";
            } else {
              detectedType = "appliance-or-metallic";
            }
          } else if (primaryColor === "Brown") {
            detectedType = "book-or-document";
          } else if (["Red", "Blue", "Green", "PurplePink", "OrangeYellow"].includes(primaryColor)) {
            detectedType = "colorful-item";
          } else if (primaryColor === "White") {
            detectedType = "appliance-or-metallic";
          }

          // Keyword mapping mapping based on categories
          let matchingKeywords: string[] = [];
          
          switch (detectedType) {
            case "rectangular-device":
              matchingKeywords = ["iPhone", "Samsung Galaxy", "iPad Air", "Kindle", "Fire TV Stick", "Echo Show", "Sony WH-1000XM5"];
              break;
            case "book-or-document":
              matchingKeywords = ["Atomic Habits", "Psychology of Money", "Sapiens", "Rich Dad Poor Dad", "Ikigai", "Books"];
              break;
            case "appliance-or-metallic":
              matchingKeywords = ["Instant Pot", "Dyson Fan", "Philips Mixer", "Prestige Induction", "Milton bottle", "Ring Doorbell"];
              break;
            case "colorful-item":
              if (primaryColor === "Blue") {
                matchingKeywords = ["JBL Flip 6", "Levis jeans", "Yoga Mat", "boAt Smartwatch", "Realme Buds"];
              } else if (primaryColor === "Red" || primaryColor === "PurplePink") {
                matchingKeywords = ["Nike shoes", "Dumbbell Set", "Nivia Football", "Puma T-shirt"];
              } else if (primaryColor === "Green") {
                matchingKeywords = ["Yoga Mat", "Yonex Racket", "Puma T-shirt"];
              } else {
                matchingKeywords = ["Casio G-Shock", "boAt Smartwatch", "Ray-Ban Aviator"];
              }
              break;
            default:
              // Fallback based on colors directly
              if (primaryColor === "Black") {
                matchingKeywords = ["Sony headphones", "Kindle", "Echo Dot", "Echo Show", "Casio G-Shock"];
              } else if (primaryColor === "Blue") {
                matchingKeywords = ["JBL Flip 6", "Yoga Mat", "Levis jeans", "boAt Smartwatch"];
              } else if (primaryColor === "Brown" || orangeYellowCount > blackCount) {
                matchingKeywords = ["Atomic Habits", "Sapiens", "Psychology of Money", "Ray-Ban Aviator"];
              } else {
                matchingKeywords = ["Kindle", "Instant Pot", "Dyson Fan", "Nike shoes", "Atomic Habits"];
              }
          }

          // Return result
          resolve({
            dominantColors,
            aspectRatio,
            detectedType,
            matchingKeywords,
            colorHexes: colorHexes.length > 0 ? colorHexes : ["#232F3E", "#FF9900"]
          });

        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
