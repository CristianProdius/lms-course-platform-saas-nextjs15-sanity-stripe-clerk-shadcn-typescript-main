"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-[80vh] sm:min-h-[70vh] lg:min-h-[60vh] w-full flex items-center overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #2A4666 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF4A1C]/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2A4666]/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium badge */}
          <div className="flex justify-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4A1C]/10 to-[#2A4666]/10 backdrop-blur-sm border border-[#FF4A1C]/20 rounded-full">
              <Sparkles className="w-4 h-4 text-[#FF4A1C]" />
              <span className="text-sm font-medium bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] bg-clip-text text-transparent">
                Transform Your Business with AI
              </span>
            </div>
          </div>

          {/* Main heading with gradient */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up overflow-visible">
            <span className="block">Your Team Can Master</span>
            <span className="block mt-2 bg-gradient-to-r from-[#2A4666] via-[#2A4666] to-[#FF4A1C] bg-clip-text text-transparent py-2">
              AI in Just 5 Days
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in animation-delay-200">
            While big companies spend millions on AI training, your small
            business can get the
            <span className="font-semibold text-[#2A4666]"> same edge</span>
            —faster and simpler.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Button
              asChild
              className="group relative bg-gradient-to-r from-[#FF4A1C] to-[#FF4A1C]/90 text-white rounded-full px-8 py-6 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#FF4A1C]/25 hover:shadow-xl hover:shadow-[#FF4A1C]/30 border-0"
            >
              <Link
                href="/courses/precuity-ai"
                className="flex items-center gap-2"
              >
                Train Your Team Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="group rounded-full px-8 py-6 text-lg font-semibold border-2 border-[#2A4666]/20 hover:border-[#2A4666]/40 hover:bg-[#2A4666]/5 transition-all duration-300"
            >
              <Link
                href="/courses/precuity-ai"
                className="flex items-center gap-2 text-[#2A4666]"
              >
                Watch Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in animation-delay-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A4666] to-[#FF4A1C] border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-[#2A4666]">500+</span> teams
                trained
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-[#FF4A1C]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-2">
                <span className="font-semibold text-[#2A4666]">4.9/5</span>{" "}
                rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
}
