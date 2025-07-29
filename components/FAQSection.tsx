"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  HelpCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BarChart3,
  Shield,
  Rocket,
  Target,
  Brain,
  Star,
  PlayCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const faqs = [
    {
      number: "01",
      category: "Time Investment",
      question: "How long does it take?",
      shortAnswer: "Just 5 days, 15 minutes per day",
      fullAnswer:
        "Transform your team in less time than a Netflix binge. Our micro-learning approach fits into any schedule.",
      icon: Clock,
      gradient: "from-orange-600 via-[#FF4A1C] to-red-600",
      lightGradient: "from-orange-100 to-red-100",
      details: [
        {
          icon: Target,
          text: "Day 1-3: Master AI fundamentals",
          highlight: "fundamentals",
        },
        {
          icon: Rocket,
          text: "Day 4-5: Implement real tools",
          highlight: "real tools",
        },
        {
          icon: Brain,
          text: "Lifetime updates included",
          highlight: "Lifetime",
        },
      ],
      stat: {
        value: "75",
        label: "Total Minutes",
        subtext: "Less than 2 episodes of your favorite show",
      },
    },
    {
      number: "02",
      category: "Technical Skills",
      question: "What if we're not tech people?",
      shortAnswer: "Perfect! Made for non-tech teams",
      fullAnswer:
        "If you can use email, you can master AI. We've eliminated all technical jargon and complexity.",
      icon: Users,
      gradient: "from-[#2A4666] via-blue-600 to-indigo-600",
      lightGradient: "from-blue-100 to-indigo-100",
      details: [
        {
          icon: Shield,
          text: "Zero coding or tech skills needed",
          highlight: "Zero coding",
        },
        { icon: Users, text: "Plain English only", highlight: "Plain English" },
        {
          icon: CheckCircle,
          text: "Visual step-by-step guides",
          highlight: "step-by-step",
        },
      ],
      stat: {
        value: "97%",
        label: "Success Rate",
        subtext: "Among non-technical users",
      },
    },
    {
      number: "03",
      category: "Return on Investment",
      question: "Will this actually save us money?",
      shortAnswer: "Average ROI: 850% in 90 days",
      fullAnswer:
        "Most teams save 10-20 hours per week. Calculate your potential savings based on your team size.",
      icon: DollarSign,
      gradient: "from-emerald-600 via-green-600 to-teal-600",
      lightGradient: "from-emerald-100 to-teal-100",
      details: [
        {
          icon: TrendingUp,
          text: "$50,000+ average annual savings",
          highlight: "$50,000+",
        },
        { icon: BarChart3, text: "ROI within 30 days", highlight: "30 days" },
        {
          icon: Zap,
          text: "10-20 hours saved weekly",
          highlight: "10-20 hours",
        },
      ],
      stat: {
        value: "$4,200",
        label: "Monthly Savings",
        subtext: "Average per team member",
      },
    },
  ];

  const competitorData = [
    { name: "Google", spending: "$100B", employees: "180K", icon: "G" },
    { name: "Microsoft", spending: "$20B", employees: "220K", icon: "M" },
    { name: "Amazon", spending: "$75B", employees: "1.5M", icon: "A" },
    { name: "Meta", spending: "$30B", employees: "87K", icon: "F" },
  ];

  const calculateSavings = (hours = 15) => {
    const hourlyRate = 50;
    const weeklySavings = hours * hourlyRate;
    const monthlySavings = weeklySavings * 4;
    const yearlySavings = monthlySavings * 12;
    return {
      weekly: weeklySavings,
      monthly: monthlySavings,
      yearly: yearlySavings,
    };
  };

  return (
    <>
      <div className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white"></div>

          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Grid Pattern */}
          <div className='absolute inset-0 bg-[url(&apos;data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239CA3AF" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&apos;)]'></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-20">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200 mb-10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2A4666]" />
                <span className="text-sm font-semibold text-gray-700">
                  Everything You Need to Know
                </span>
              </div>
              <div className="h-5 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-600">
                  4.9/5 from 10,000+ users
                </span>
              </div>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gray-900">Got Questions?</span>
              <br />
              <span className="bg-gradient-to-r from-[#FF4A1C] via-orange-500 to-[#2A4666] bg-clip-text text-transparent">
                We've Got Answers
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Clear, honest answers to help you make the best decision for your
              team
            </p>
          </div>

          {/* FAQ Cards */}
          <div className="space-y-6 mb-32">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`group relative transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background Glow Effect */}
                {hoveredIndex === index && (
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${faq.gradient} rounded-3xl blur-xl opacity-20 transition-opacity duration-500`}
                  ></div>
                )}

                <div
                  className={`relative bg-white rounded-3xl transition-all duration-500 ${
                    openIndex === index
                      ? "shadow-2xl scale-[1.02]"
                      : "shadow-lg hover:shadow-xl"
                  }`}
                >
                  {/* Premium Border Gradient */}
                  <div
                    className={`absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r ${
                      openIndex === index
                        ? faq.gradient
                        : "from-transparent to-transparent"
                    } transition-all duration-500`}
                  >
                    <div className="bg-white rounded-3xl h-full w-full"></div>
                  </div>

                  <div className="relative">
                    {/* Question Header */}
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? -1 : index)
                      }
                      className="w-full p-8 sm:p-10 text-left"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-6 flex-1">
                          {/* Icon & Number Container */}
                          <div className="relative">
                            <div
                              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                                faq.lightGradient
                              } flex items-center justify-center transition-all duration-500 ${
                                openIndex === index
                                  ? "scale-110 rotate-3"
                                  : "group-hover:scale-105"
                              }`}
                            >
                              <faq.icon
                                className={`w-10 h-10 bg-gradient-to-br ${faq.gradient} bg-clip-text`}
                                strokeWidth={2}
                              />
                            </div>
                            <div
                              className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${
                                faq.gradient
                              } text-white text-sm font-bold flex items-center justify-center shadow-lg ${
                                openIndex === index ? "scale-110" : ""
                              }`}
                            >
                              {faq.number}
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-500 mb-2">
                              {faq.category}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                              {faq.question}
                            </h3>
                            <p
                              className={`text-lg font-medium transition-all duration-300 ${
                                openIndex === index
                                  ? "text-transparent"
                                  : `bg-gradient-to-r ${faq.gradient} bg-clip-text text-transparent`
                              }`}
                            >
                              {faq.shortAnswer}
                            </p>
                          </div>

                          {/* Stat Preview (shown when closed) */}
                          {openIndex !== index && (
                            <div className="hidden lg:block">
                              <div
                                className={`px-6 py-4 rounded-2xl bg-gradient-to-br ${faq.lightGradient} border border-gray-200`}
                              >
                                <div
                                  className={`text-3xl font-bold bg-gradient-to-br ${faq.gradient} bg-clip-text text-transparent`}
                                >
                                  {faq.stat.value}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {faq.stat.label}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Toggle Button */}
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            openIndex === index
                              ? `bg-gradient-to-br ${faq.gradient} text-white shadow-lg rotate-180`
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}
                        >
                          <Plus
                            className={`w-7 h-7 transition-transform duration-500 ${
                              openIndex === index ? "rotate-45" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-700 ease-in-out ${
                        openIndex === index
                          ? "max-h-[800px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-8 sm:px-10 pb-8 sm:pb-10">
                        {/* Divider with gradient */}
                        <div
                          className={`h-px bg-gradient-to-r ${faq.gradient} opacity-20 mb-8`}
                        ></div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Main Answer */}
                          <div className="lg:col-span-2 space-y-6">
                            <p className="text-xl text-gray-700 leading-relaxed">
                              {faq.fullAnswer}
                            </p>

                            {/* Detail Cards */}
                            <div className="space-y-4">
                              {faq.details.map((detail, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br ${faq.lightGradient} bg-opacity-30 border border-gray-200 transition-all duration-300`}
                                  style={{
                                    transform:
                                      openIndex === index
                                        ? "translateX(0)"
                                        : "translateX(-20px)",
                                    opacity: openIndex === index ? 1 : 0,
                                    transitionDelay: `${i * 100 + 200}ms`,
                                  }}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${faq.gradient} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
                                  >
                                    <detail.icon
                                      className={`w-5 h-5 bg-gradient-to-br ${faq.gradient} bg-clip-text`}
                                    />
                                  </div>
                                  <p className="text-gray-700 flex-1">
                                    {detail.text
                                      .split(detail.highlight)
                                      .map((part, index) => (
                                        <React.Fragment key={index}>
                                          {part}
                                          {index === 0 && (
                                            <span
                                              className={`font-semibold bg-gradient-to-r ${faq.gradient} bg-clip-text text-transparent`}
                                            >
                                              {detail.highlight}
                                            </span>
                                          )}
                                        </React.Fragment>
                                      ))}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Stats Card */}
                          <div>
                            <div
                              className={`p-6 rounded-2xl bg-gradient-to-br ${faq.gradient} text-white`}
                            >
                              <div className="text-center">
                                <div className="text-5xl font-bold mb-2">
                                  {faq.stat.value}
                                </div>
                                <div className="text-lg font-medium mb-2">
                                  {faq.stat.label}
                                </div>
                                <div className="text-sm opacity-90">
                                  {faq.stat.subtext}
                                </div>
                              </div>

                              {/* Visual indicator */}
                              <div className="mt-6 pt-6 border-t border-white/20">
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">
                                    Verified by real users
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className="relative mt-32">
            {/* Light Theme CTA Card */}
            <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl border-2 border-gray-100">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                {/* Premium Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='100' y1='0' y2='100' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23FF4A1C'/%3E%3Cstop offset='1' stop-color='%232A4666'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 0h50v50H0zm50 50h50v50H50z' fill='url(%23a)' opacity='.1'/%3E%3C/svg%3E")`,
                      backgroundSize: "100px 100px",
                    }}
                  ></div>
                </div>

                {/* Gradient Orbs */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#FF4A1C]/20 to-orange-300/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#2A4666]/20 to-blue-300/20 rounded-full blur-3xl animate-float-delayed"></div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10">
                  <div className="relative">
                    <Sparkles className="w-12 h-12 text-[#FF4A1C]/20 animate-sparkle" />
                    <div className="absolute inset-0 w-12 h-12 bg-[#FF4A1C]/10 rounded-full blur-xl animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute bottom-10 left-10">
                  <div className="relative">
                    <Zap className="w-10 h-10 text-[#2A4666]/20 animate-sparkle animation-delay-1000" />
                    <div className="absolute inset-0 w-10 h-10 bg-[#2A4666]/10 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Competitor Comparison Section */}
                <div className="mb-16">
                  {/* Header Badge */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-full border border-red-200 mb-6">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-gray-800">
                        Market Alert: AI Adoption Accelerating
                      </span>
                    </div>

                    <h3 className="text-3xl font-semibold text-gray-800 mb-2">
                      While you're reading this, industry leaders are investing:
                    </h3>
                  </div>

                  {/* Competitor Cards - Redesigned */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {competitorData.map((company, index) => (
                      <div key={index} className="group relative">
                        {/* Card Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

                        {/* Card Content */}
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                          {/* Company Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF4A1C] to-[#2A4666] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                              {company.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">
                                {company.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {company.employees} employees
                              </div>
                            </div>
                          </div>

                          {/* Spending Amount */}
                          <div className="space-y-1">
                            <div className="text-4xl font-bold bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] bg-clip-text text-transparent">
                              {company.spending}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              Annual AI Investment
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] animate-progress-fill"
                              style={{ animationDelay: `${index * 200}ms` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                        <span className="text-3xl font-bold text-gray-900">
                          89%
                        </span>
                      </div>
                      <p className="text-gray-700">
                        of Fortune 500 companies are actively using AI
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Rocket className="w-6 h-6 text-blue-600" />
                        <span className="text-3xl font-bold text-gray-900">
                          3.2x
                        </span>
                      </div>
                      <p className="text-gray-700">
                        productivity increase reported by AI-enabled teams
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-green-600" />
                        <span className="text-3xl font-bold text-gray-900">
                          $15.7T
                        </span>
                      </div>
                      <p className="text-gray-700">
                        projected global AI market value by 2030
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Message - Redesigned */}
                <div className="text-center mb-16">
                  <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                    <span className="text-gray-900">Your Competitors</span>
                    <br />
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-[#FF4A1C] via-orange-500 to-[#2A4666] bg-clip-text text-transparent animate-gradient-x">
                        Won't Wait.
                      </span>
                      {/* Underline Animation */}
                      <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full animate-width-expand"></div>
                    </span>
                    <br />
                    <span className="text-gray-700">Why Should You?</span>
                  </h3>

                  <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    While enterprises spend millions, you can transform your
                    entire team
                    <span className="font-bold text-gray-900">
                      {" "}
                      this week
                    </span>{" "}
                    for less than
                    <span className="font-bold text-gray-900">
                      {" "}
                      one employee's daily wage.
                    </span>
                  </p>
                </div>

                {/* Enhanced ROI Calculator */}
                <div className="max-w-3xl mx-auto mb-16">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-10 border-2 border-emerald-200 shadow-xl">
                    <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      Your Guaranteed ROI
                    </h4>

                    {/* Savings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-emerald-600 mb-2">
                          ${calculateSavings().weekly}
                        </div>
                        <div className="text-gray-600 font-medium">
                          Weekly Savings
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Starting Week 1
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform scale-105">
                        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                          ${calculateSavings().monthly.toLocaleString()}
                        </div>
                        <div className="text-gray-700 font-semibold">
                          Monthly Savings
                        </div>
                        <div className="text-sm text-emerald-600 mt-2 font-medium">
                          Most Popular
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-green-700 mb-2">
                          ${calculateSavings().yearly.toLocaleString()}
                        </div>
                        <div className="text-gray-600 font-medium">
                          Annual Savings
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          850% ROI
                        </div>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div className="bg-white/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 text-center mb-2">
                        Based on <span className="font-semibold">15 hours</span>{" "}
                        saved weekly at{" "}
                        <span className="font-semibold">$50/hour</span>
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">
                          Conservative estimate • Most teams save 20+ hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Section - Enhanced */}
                <div className="text-center">
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                    {/* Primary CTA */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                      <Button
                        asChild
                        className="relative bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#2A4666] hover:to-[#FF4A1C] text-white rounded-full px-12 py-8 text-xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Link href="/start" className="flex items-center gap-3">
                          <Rocket className="w-7 h-7" />
                          <span>Start Training Today</span>
                          <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </div>

                    {/* Secondary CTA */}
                    <Button
                      asChild
                      className="group bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-full px-10 py-8 text-lg font-semibold shadow-lg transition-all duration-300"
                    >
                      <Link href="/demo" className="flex items-center gap-3">
                        <PlayCircle className="w-6 h-6 text-[#2A4666]" />
                        <span>Watch 2-Min Demo</span>
                      </Link>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="space-y-6">
                    {/* Live Activity */}
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-300 shadow-lg">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-gray-800 font-semibold">
                        <span className="text-orange-600 font-bold">
                          47 teams
                        </span>{" "}
                        started training in the last 2 hours
                      </span>
                    </div>

                    {/* Guarantees */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium">30-Day Money Back</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Results in 5 Days</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">
                          10,000+ Teams Trained
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced CSS */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes float-delayed {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(20px);
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

          @keyframes gradient-x {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes progress-fill {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }

          @keyframes width-expand {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }

          @keyframes ping {
            75%,
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float-delayed 8s ease-in-out infinite;
          }

          .animate-sparkle {
            animation: sparkle 3s ease-in-out infinite;
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 4s ease infinite;
          }

          .animate-progress-fill {
            animation: progress-fill 2s ease-out forwards;
          }

          .animate-width-expand {
            animation: width-expand 1.5s ease-out forwards;
            animation-delay: 0.5s;
            width: 0;
          }

          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .animation-delay-1000 {
            animation-delay: 1000ms;
          }

          .animation-delay-2000 {
            animation-delay: 2000ms;
          }

          .animation-delay-4000 {
            animation-delay: 4000ms;
          }
        `}</style>
      </div>
    </>
  );
};

export default FAQSection;
