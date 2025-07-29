"use client";
import React, { useState } from "react";
import {
  UserPlus,
  PlayCircle,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  Calendar,
  Trophy,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const GetStartedSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "1",
      title: "Sign Up Your Team",
      subtitle: "Pick how many people need training",
      icon: UserPlus,
      color: "from-blue-600 to-cyan-600",
      lightColor: "from-blue-50 to-cyan-50",
      accentColor: "blue",
      time: "2 min",
      details: [
        "No credit card required",
        "Instant team access",
        "Flexible team sizes",
      ],
      illustration: (
        <div className="relative w-full h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Team avatars */}
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-white shadow-lg flex items-center justify-center animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </div>
                ))}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center animate-fade-in animation-delay-400">
                  <span className="text-2xl font-bold text-gray-600">+</span>
                </div>
              </div>
              {/* Add sparkle */}
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-blue-500 animate-sparkle" />
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "2",
      title: "Watch Short Lessons",
      subtitle: "15-minute videos that get to the point",
      icon: PlayCircle,
      color: "from-purple-600 to-pink-600",
      lightColor: "from-purple-50 to-pink-50",
      accentColor: "purple",
      time: "15 min/day",
      details: ["Bite-sized lessons", "Real-world examples", "Skip the fluff"],
      illustration: (
        <div className="relative w-full h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Video player mockup */}
              <div className="w-48 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-2xl relative overflow-hidden animate-float">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-white animate-progress" />
                </div>
              </div>
              {/* Time indicator */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-lg flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  15 min
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "3",
      title: "Use AI Tomorrow",
      subtitle: "Start saving time on Day 1",
      icon: Rocket,
      color: "from-emerald-600 to-teal-600",
      lightColor: "from-emerald-50 to-teal-50",
      accentColor: "emerald",
      time: "Day 1",
      details: [
        "Immediate results",
        "ROI from day one",
        "Transform your workflow",
      ],
      illustration: (
        <div className="relative w-full h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Rocket launching */}
              <div className="relative animate-rocket-launch">
                <Rocket className="w-24 h-24 text-emerald-600 rotate-45" />
                {/* Exhaust flames */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 space-y-1">
                  <div className="w-4 h-8 bg-gradient-to-b from-orange-400 to-red-500 rounded-full animate-pulse" />
                  <div className="w-6 h-6 bg-gradient-to-b from-orange-300 to-yellow-400 rounded-full animate-pulse animation-delay-200" />
                </div>
              </div>
              {/* Stars */}
              <div className="absolute -top-8 -left-8">
                <Trophy className="w-8 h-8 text-yellow-500 animate-sparkle" />
              </div>
              <div className="absolute -top-4 -right-8">
                <Zap className="w-6 h-6 text-emerald-500 animate-sparkle animation-delay-300" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white">
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200 mb-8 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-700">
              Start Today, See Results Tomorrow
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gray-900">Get Started in</span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-full animate-pulse"></div>
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
            Your entire team can be using AI tools productively by tomorrow.
            <span className="text-gray-900 font-semibold"> Seriously.</span>
          </p>
        </div>

        {/* Steps Container */}
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12 lg:mb-16">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
              {/* Step indicators */}
              <div className="absolute inset-0 flex justify-between items-center px-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full transition-all duration-300 ${
                      index <= activeStep
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 scale-125"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setActiveStep(index)}
              >
                <div
                  className={`relative h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${
                    activeStep === index
                      ? "border-gray-300"
                      : "border-transparent"
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-8">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="absolute -top-6 right-8">
                    <div className="px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {step.time}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-8">
                    {/* Icon */}
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.lightColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon
                        className={`w-8 h-8 text-${step.accentColor}-600`}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.subtitle}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 mb-8">
                      {step.details.map((detail, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3"
                          style={{
                            opacity: activeStep === index ? 1 : 0.7,
                            transform:
                              activeStep === index
                                ? "translateX(0)"
                                : "translateX(-10px)",
                            transition: `all 0.3s ease ${i * 100}ms`,
                          }}
                        >
                          <CheckCircle2
                            className={`w-5 h-5 text-${step.accentColor}-600 flex-shrink-0`}
                          />
                          <span className="text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Illustration */}
                    {step.illustration}
                  </div>

                  {/* Connector Line (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-5 w-10 h-0.5 bg-gray-300">
                      <ChevronRight className="absolute -right-3 -top-3 w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8">
            {/* Success Message */}
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-gray-800">
                  No technical knowledge required
                </span>
              </div>
              <div className="h-6 w-px bg-green-300" />
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-gray-800">
                  15 minutes a day
                </span>
              </div>
            </div>

            {/* Main CTA */}
            <div className="relative ">
              <Button
                asChild
                className="relative group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full px-12 py-8 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Link
                  href="/courses/precuity-ai"
                  className="flex items-center gap-3"
                >
                  <UserPlus className="w-6 h-6" />
                  <span>Start Your Team&apos;s AI Journey</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicator */}
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">
                30-day money-back guarantee
              </span>{" "}
              • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 60%;
          }
        }

        @keyframes rocket-launch {
          0%,
          100% {
            transform: translateY(0) rotate(45deg);
          }
          50% {
            transform: translateY(-20px) rotate(45deg);
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2s ease-out infinite;
        }

        .animate-rocket-launch {
          animation: rocket-launch 2s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
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
      `}</style>
    </div>
  );
};

export default GetStartedSection;
