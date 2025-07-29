"use client";
import React from "react";

const AICompetitorsSection = () => {
  const benefits = [
    {
      icon: "⚡",
      title: "Getting work",
      highlight: "3x faster",
      description: "done",
    },
    {
      icon: "✓",
      title: "Making fewer",
      highlight: "mistakes",
      description: "",
    },
    {
      icon: "❤️",
      title: "Serving",
      highlight: "customers better",
      description: "",
    },
  ];

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl w-full">
        {/* Main Container */}
        <div className="relative">
          {/* Content */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
            {/* Header Section */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <div className="overflow-visible">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[#2A4666] via-[#2A4666] to-[#FF4A1C] bg-clip-text text-transparent leading-tight animate-fade-in-up pb-3">
                  Your Competitors Are Already Using AI
                </h1>
              </div>

              {/* Animated underline */}
              <div className="flex justify-center mt-6 mb-8">
                <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer" />
                </div>
              </div>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-light animate-fade-in">
                Every day you wait, other businesses are:
              </p>
            </div>

            {/* Benefits Container with glassmorphism */}
            <div className="relative bg-gradient-to-br from-[#2A4666] via-[#2A4666]/85 to-[#1a2d42]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-14 shadow-inner overflow-hidden group border border-white/10">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent opacity-70" />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,74,28,0.3) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Benefits Grid */}
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="group/item relative">
                    {/* Vertical divider for desktop */}
                    {index < benefits.length - 1 && (
                      <div className="hidden md:block absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-px h-1/2 bg-gradient-to-b from-transparent via-[#FF4A1C]/30 to-transparent" />
                    )}

                    {/* Benefit Card */}
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#FF4A1C]/30 hover:transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group-hover/item:shadow-[#FF4A1C]/20 h-full flex flex-col">
                      {/* Icon */}
                      <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF4A1C] to-[#FF4A1C]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF4A1C]/30 transform transition-all duration-300 group-hover/item:rotate-3 group-hover/item:scale-110 group-hover/item:shadow-[#FF4A1C]/50">
                          <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                            {benefit.icon}
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="text-center flex-1 flex flex-col justify-center">
                        <p className="text-xl sm:text-2xl lg:text-3xl text-white font-light leading-relaxed">
                          {benefit.title}
                          <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-[#FF4A1C] to-[#FF6B42] bg-clip-text text-transparent mt-1 animate-pulse-slow drop-shadow-sm">
                            {benefit.highlight}
                          </span>
                          {benefit.description && (
                            <span className="block text-xl sm:text-2xl lg:text-3xl text-white font-light">
                              {benefit.description}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF4A1C]/10 to-transparent blur-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.02);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.3s both;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AICompetitorsSection;
