"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Clock,
  MessageCircle,
  Wrench,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const AITrainingSection = () => {
  const features = [
    {
      title: "Takes just 15 min per day",
      icon: Clock,
      gradient: "from-orange-500 to-red-600",
      iconBg: "bg-gradient-to-br from-orange-100 to-red-100",
      iconColor: "text-orange-600",
      subtitle: "Quick & Effective",
      delay: "0",
    },
    {
      title: "Uses plain English (no tech talk)",
      icon: MessageCircle,
      gradient: "from-blue-600 to-indigo-700",
      iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      subtitle: "Crystal Clear",
      delay: "100",
    },
    {
      title: "Shows real tools you'll use tomorrow",
      icon: Wrench,
      gradient: "from-purple-600 to-pink-600",
      iconBg: "bg-gradient-to-br from-purple-100 to-pink-100",
      iconColor: "text-purple-600",
      subtitle: "Practical Skills",
      delay: "200",
    },
    {
      title: "Gets your whole team up to speed",
      icon: Users,
      gradient: "from-teal-600 to-cyan-600",
      iconBg: "bg-gradient-to-br from-teal-100 to-cyan-100",
      iconColor: "text-teal-600",
      subtitle: "Team Ready",
      delay: "300",
    },
  ];

  return (
    <div className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#FF4A1C]/10 to-[#2A4666]/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#2A4666]/10 to-[#FF4A1C]/10 rounded-full blur-3xl animate-float-delayed"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="text-center mb-16 sm:mb-20 relative">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              AI Training Made for{" "}
            </span>

            <span className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] bg-clip-text text-transparent">
              Real Business Owners
            </span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto animate-fade-in-up animation-delay-100">
            Finally, an AI course that speaks your language and delivers
            immediate results
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              <div className="relative h-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                {/* Premium Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex p-4 rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`w-8 h-8 ${feature.iconColor}`}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  {/* Subtitle with Arrow */}
                  <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                    <span className="text-sm sm:text-base font-medium">
                      {feature.subtitle}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div
                  className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA Section */}
        <div className="relative text-center space-y-10 animate-fade-in-up animation-delay-400">
          {/* Sparkle Effect */}
          <div className="relative inline-block">
            <div className="absolute -inset-8 flex items-center justify-center">
              <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-[#FF4A1C] animate-sparkle" />
              <Sparkles className="absolute bottom-0 right-0 w-5 h-5 text-[#2A4666] animate-sparkle animation-delay-200" />
              <Sparkles className="absolute top-1/2 left-0 w-4 h-4 text-[#FF4A1C] animate-sparkle animation-delay-400" />
              <Sparkles className="absolute bottom-0 left-0 w-5 h-5 text-purple-500 animate-sparkle animation-delay-600" />
            </div>

            {/* Premium Icon */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4A1C] to-[#2A4666] rounded-3xl rotate-6 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl flex items-center justify-center h-full shadow-2xl">
                <div className="flex gap-4">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full animate-blink"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full animate-blink animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                No theory. Just practical skills.
              </span>
            </h3>
            <p className="text-lg sm:text-xl text-gray-600">
              Don&apos;t let your business fall behind in the AI revolution.
            </p>
          </div>

          {/* Premium CTA Button */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <Button
              asChild
              className="relative group bg-gradient-to-r from-[#2A4666] to-[#1a3455] hover:from-[#1a3455] hover:to-[#2A4666] text-white rounded-full px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/trial" className="flex items-center gap-3">
                <span>Start Your AI Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 animate-fade-in animation-delay-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(20px) rotate(-1deg);
          }
          66% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
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

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  );
};

export default AITrainingSection;
