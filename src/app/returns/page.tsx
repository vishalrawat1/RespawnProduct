import React from "react";
import ReturnAnalyzerFlow from "@/components/ReturnAnalyzerFlow";

export const metadata = {
  title: "AI Return Analyzer | Returns",
  description: "Fast AI-powered return condition analysis.",
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Product Returns & Condition Verification
        </h1>
        <ReturnAnalyzerFlow />
      </div>
    </main>
  );
}
