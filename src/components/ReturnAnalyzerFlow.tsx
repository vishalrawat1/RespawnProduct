"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, Video, ScanBarcode, CheckCircle2, AlertCircle, RefreshCw, BoxSelect } from "lucide-react";
import "./ReturnAnalyzerFlow.css";

type Step = "SELECT_METHOD" | "CAPTURE" | "ANALYZING" | "RESULT";
type Method = "PHOTO" | "VIDEO" | "BARCODE";
type Category = "ELECTRONICS" | "CLOTHING";

export default function ReturnAnalyzerFlow() {
  const [step, setStep] = useState<Step>("SELECT_METHOD");
  const [method, setMethod] = useState<Method>("PHOTO");
  const [category, setCategory] = useState<Category>("ELECTRONICS");
  const [photosCaptured, setPhotosCaptured] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  
  const [result, setResult] = useState<{
    grade: string;
    confidence: number;
    issue: string;
    details: string;
  } | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "ANALYZING") {
      // Simulate <2s scanning process
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("RESULT");
            setResult({
              grade: "B",
              confidence: 92,
              issue: "Minor scratch on back",
              details: category === "ELECTRONICS" ? "Screen: Pass | Buttons: Pass | Back: Minor Scratch" : "Stains: None | Tears: None | Wear: Minor"
            });
            return 100;
          }
          return prev + 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step, category]);

  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod);
    setStep("CAPTURE");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPhotosCaptured(prev => [...prev, ...fileUrls].slice(0, 3));
      
      if (method === "VIDEO" || method === "BARCODE" || photosCaptured.length + fileUrls.length >= 3) {
        setStep("ANALYZING");
      }
    }
  };

  const renderSelectMethod = () => (
    <div className="raf-method-container">
      <h2 className="raf-title">How would you like to verify the item?</h2>
      <p className="raf-subtitle">Choose a fast AI verification method below.</p>
      
      <div className="raf-category-selector">
        <button 
          className={`raf-cat-btn ${category === "ELECTRONICS" ? "active" : ""}`}
          onClick={() => setCategory("ELECTRONICS")}
        >
          Phones & Tech
        </button>
        <button 
          className={`raf-cat-btn ${category === "CLOTHING" ? "active" : ""}`}
          onClick={() => setCategory("CLOTHING")}
        >
          Apparel
        </button>
      </div>

      <div className="raf-options-grid">
        <button className="raf-option-card" onClick={() => handleMethodSelect("PHOTO")}>
          <div className="raf-icon-wrapper"><Camera size={32} /></div>
          <h3>3 Photos</h3>
          <p>Front, back, and side angles</p>
        </button>

        <button className="raf-option-card" onClick={() => handleMethodSelect("VIDEO")}>
          <div className="raf-icon-wrapper"><Video size={32} /></div>
          <h3>5s Video</h3>
          <p>Show all sides in a quick pan</p>
        </button>

        <button className="raf-option-card" onClick={() => handleMethodSelect("BARCODE")}>
          <div className="raf-icon-wrapper"><ScanBarcode size={32} /></div>
          <h3>Barcode Scan</h3>
          <p>Auto-read product specs</p>
        </button>
      </div>
    </div>
  );

  const renderCapture = () => (
    <div className="raf-capture-container">
      <h2 className="raf-title">
        {method === "PHOTO" && "Upload 3 Photos"}
        {method === "VIDEO" && "Upload 5s Video"}
        {method === "BARCODE" && "Scan Barcode"}
      </h2>
      <p className="raf-subtitle">
        {method === "PHOTO" && `Upload front, back, and side (${photosCaptured.length}/3)`}
        {method === "VIDEO" && "Upload a short continuous video."}
        {method === "BARCODE" && "Take a clear picture of the barcode."}
      </p>

      <div className="raf-upload-area" onClick={() => fileInputRef.current?.click()}>
        <Upload size={48} className="raf-upload-icon" />
        <p>Click to upload or drag & drop</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="raf-hidden-input" 
          multiple={method === "PHOTO"} 
          accept={method === "VIDEO" ? "video/*" : "image/*"}
          onChange={handleFileUpload} 
        />
      </div>

      {photosCaptured.length > 0 && method === "PHOTO" && (
        <div className="raf-preview-row">
          {photosCaptured.map((src, idx) => (
            <img key={idx} src={src} alt={`Preview ${idx}`} className="raf-preview-img" />
          ))}
        </div>
      )}

      {method === "PHOTO" && photosCaptured.length > 0 && photosCaptured.length < 3 && (
        <button className="raf-btn-primary" onClick={() => setStep("ANALYZING")}>
          Analyze Now (Incomplete)
        </button>
      )}
    </div>
  );

  const renderAnalyzing = () => (
    <div className="raf-analyzing-container">
      <div className="raf-scanner">
        <div className="raf-scan-line"></div>
        <img 
          src={photosCaptured[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80"} 
          alt="Scanning" 
          className="raf-scan-img" 
        />
      </div>
      <h2 className="raf-title">AI Processing...</h2>
      <div className="raf-progress-bar">
        <div className="raf-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="raf-status">
        {progress < 40 ? "Extracting edges..." : progress < 80 ? `Checking ${category === "ELECTRONICS" ? "screen & ports" : "stains & tears"}...` : "Finalizing grade..."}
      </p>
    </div>
  );

  const renderResult = () => (
    <div className="raf-result-container">
      <div className="raf-result-header">
        <CheckCircle2 size={48} className="raf-success-icon" />
        <h2 className="raf-title">Analysis Complete</h2>
      </div>

      <div className="raf-grade-card">
        <div className="raf-grade-badge">
          <span>Grade</span>
          <strong>{result?.grade}</strong>
        </div>
        <div className="raf-confidence">
          <RefreshCw size={16} />
          <span>{result?.confidence}% AI Confidence</span>
        </div>
      </div>

      <div className="raf-details-card">
        <div className="raf-issue-row">
          <AlertCircle size={20} className="raf-issue-icon" />
          <span className="raf-issue-text">{result?.issue}</span>
        </div>
        <div className="raf-specifics">
          {result?.details}
        </div>
      </div>

      <div className="raf-demo-image">
        <p className="raf-demo-label">Damage Highlight</p>
        <div className="raf-img-wrapper">
          <img 
            src={photosCaptured[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80"} 
            alt="Analyzed Item" 
            className="raf-analyzed-img" 
          />
          {/* Simulated bounding box */}
          <div className="raf-bounding-box">
            <span className="raf-bb-label">Scratch (92%)</span>
          </div>
        </div>
      </div>

      <div className="raf-actions">
        <button className="raf-btn-secondary" onClick={() => {
          setStep("SELECT_METHOD");
          setPhotosCaptured([]);
          setProgress(0);
        }}>Start Over</button>
        <button className="raf-btn-primary">Confirm & Process Return</button>
      </div>

      <div className="raf-grading-legend">
        <h4>Condition Guide</h4>
        <ul>
          <li><strong>A (Like new):</strong> Unopened, no damage</li>
          <li><strong>B (Minor wear):</strong> Small scratch, works fine</li>
          <li><strong>C (Visible damage):</strong> Dent, stain, but functional</li>
          <li><strong>D (Broken):</strong> Can't resell</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="raf-wrapper">
      <div className="raf-glass-panel">
        {step === "SELECT_METHOD" && renderSelectMethod()}
        {step === "CAPTURE" && renderCapture()}
        {step === "ANALYZING" && renderAnalyzing()}
        {step === "RESULT" && renderResult()}
      </div>
    </div>
  );
}
