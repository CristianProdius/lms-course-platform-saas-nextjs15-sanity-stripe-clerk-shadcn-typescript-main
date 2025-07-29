"use client";
import React, { useState } from "react";
import {
  Mail,
  FileText,
  MessageSquare,
  Search,
  Zap,
  CheckCircle,
  ArrowRight,
  Brain,
  Rocket,
} from "lucide-react";

const AIPowerUsersSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const outcomes = [
    {
      number: "01",
      icon: Mail,
      title: "Write emails in seconds",
      subtitle: "(not minutes)",
      metric: "95%",
      metricLabel: "Time Saved",
      description:
        "Transform hours of email writing into seconds with AI-powered templates",
      gradient: "from-blue-600 to-cyan-600",
      lightGradient: "from-blue-500/20 to-cyan-500/20",
      bgPattern:
        "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
      benefits: ["Smart templates", "Perfect tone", "Zero errors"],
      featured: true,
    },
    {
      number: "02",
      icon: FileText,
      title: "Create reports automatically",
      subtitle: "(save hours weekly)",
      metric: "8hrs",
      metricLabel: "Saved Weekly",
      description:
        "Generate comprehensive reports with data analysis in minutes",
      gradient: "from-purple-600 to-pink-600",
      lightGradient: "from-purple-500/20 to-pink-500/20",
      bgPattern:
        "radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
      benefits: ["Auto formatting", "Data insights", "One-click export"],
      featured: true,
    },
    {
      number: "03",
      icon: MessageSquare,
      title: "Answer customer questions",
      subtitle: "instantly",
      metric: "24/7",
      metricLabel: "Availability",
      description: "Provide instant, accurate responses to customer inquiries",
      gradient: "from-emerald-600 to-teal-600",
      lightGradient: "from-emerald-500/20 to-teal-500/20",
      bgPattern:
        "radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
      benefits: ["Instant replies", "Accurate info", "Happy customers"],
      featured: true,
    },
    {
      number: "04",
      icon: Search,
      title: "Find information 10x faster",
      subtitle: "",
      metric: "10x",
      metricLabel: "Faster Search",
      description: "Access any information across all your tools instantly",
      gradient: "from-orange-600 to-red-600",
      lightGradient: "from-orange-500/20 to-red-500/20",
      bgPattern:
        "radial-gradient(circle at 20% 80%, rgba(251, 146, 60, 0.1) 0%, transparent 50%)",
      benefits: ["Smart search", "All sources", "Instant results"],
    },
    {
      number: "05",
      icon: Zap,
      title: "Automate boring tasks",
      subtitle: "forever",
      metric: "∞",
      metricLabel: "Tasks Automated",
      description: "Set up once, run forever - automate repetitive workflows",
      gradient: "from-indigo-600 to-purple-600",
      lightGradient: "from-indigo-500/20 to-purple-500/20",
      bgPattern:
        "radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)",
      benefits: ["Set & forget", "Error-free", "Time freedom"],
    },
  ];

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "4.9/5", label: "User Rating" },
    { value: "2M+", label: "Hours Saved" },
    { value: "97%", label: "Success Rate" },
  ];

  return (
    <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium Background */}

      <div className="relative max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="text-center mb-20 relative">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg mb-8 animate-bounce-subtle">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                ></div>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Transforming Teams Since 2020
            </span>
            <Rocket className="w-4 h-4 text-[#FF4A1C]" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="block text-gray-900 mb-2">
              Turn Your Team Into
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#2A4666] via-[#FF4A1C] to-[#2A4666] bg-clip-text text-transparent animate-gradient-x">
                AI Power Users
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-[#2A4666]/20 via-[#FF4A1C]/20 to-[#2A4666]/20 blur-xl animate-pulse"></div>
            </span>
          </h2>

          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Real outcomes that transform how your team works,
            <span className="text-gray-900 font-semibold"> guaranteed.</span>
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Outcomes Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-16">
          {/* Featured Large Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {outcomes.slice(0, 2).map((outcome, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                  {/* Dynamic Background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: outcome.bgPattern }}
                  ></div>

                  {/* Animated Number */}
                  <div className="absolute top-8 right-8">
                    <div
                      className={`text-7xl font-bold bg-gradient-to-br ${outcome.gradient} bg-clip-text text-transparent opacity-10 group-hover:opacity-25 transition-all duration-500 group-hover:scale-110`}
                    >
                      {outcome.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with Animation */}
                    <div className="mb-6">
                      <div
                        className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${outcome.lightGradient} backdrop-blur-sm group-hover:scale-110 transition-all duration-300`}
                      >
                        <outcome.icon
                          className={`w-10 h-10 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Title & Metric */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          {outcome.title}
                        </h3>
                        {outcome.subtitle && (
                          <p className="text-lg text-gray-600">
                            {outcome.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold bg-gradient-to-br ${outcome.gradient} bg-clip-text text-transparent`}
                        >
                          {outcome.metric}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          {outcome.metricLabel}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{outcome.description}</p>

                    {/* Benefits */}
                    <div className="space-y-2">
                      {outcome.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                          style={{
                            opacity: hoveredIndex === index ? 1 : 0.7,
                            transform:
                              hoveredIndex === index
                                ? "translateX(0)"
                                : "translateX(-10px)",
                            transition: `all 0.3s ease ${i * 100}ms`,
                          }}
                        >
                          <CheckCircle
                            className={`w-4 h-4 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                          />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium Hover Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${outcome.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Vertical Card */}
          <div className="lg:col-span-4">
            {outcomes.slice(2, 3).map((outcome, index) => (
              <div
                key={index + 2}
                className="group relative h-full"
                onMouseEnter={() => setHoveredIndex(index + 2)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                  {/* Dynamic Background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: outcome.bgPattern }}
                  ></div>

                  {/* Large Icon Background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <outcome.icon
                      className="w-64 h-64 text-gray-100 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                      strokeWidth={0.5}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-6">
                      <div
                        className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${outcome.lightGradient} backdrop-blur-sm group-hover:scale-110 transition-all duration-300`}
                      >
                        <outcome.icon
                          className={`w-10 h-10 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {outcome.title}
                      {outcome.subtitle && (
                        <span className="block text-lg font-medium text-gray-600 mt-1">
                          {outcome.subtitle}
                        </span>
                      )}
                    </h3>

                    {/* Large Metric */}
                    <div className="flex-1 flex items-center justify-center my-8">
                      <div className="text-center">
                        <div
                          className={`text-6xl lg:text-7xl font-bold bg-gradient-to-br ${outcome.gradient} bg-clip-text text-transparent`}
                        >
                          {outcome.metric}
                        </div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider mt-2">
                          {outcome.metricLabel}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{outcome.description}</p>

                    {/* Benefits */}
                    <div className="space-y-2">
                      {outcome.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                          style={{
                            opacity: hoveredIndex === index + 2 ? 1 : 0.7,
                            transform:
                              hoveredIndex === index + 2
                                ? "translateX(0)"
                                : "translateX(-10px)",
                            transition: `all 0.3s ease ${i * 100}ms`,
                          }}
                        >
                          <CheckCircle
                            className={`w-4 h-4 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                          />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {outcomes.slice(3, 5).map((outcome, index) => (
              <div
                key={index + 3}
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index + 3)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                  {/* Dynamic Background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: outcome.bgPattern }}
                  ></div>

                  {/* Content Layout */}
                  <div className="relative z-10 flex items-center gap-8">
                    {/* Left Side - Icon & Number */}
                    <div className="flex-shrink-0">
                      <div
                        className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${outcome.lightGradient} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                      >
                        <outcome.icon
                          className={`w-16 h-16 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                          strokeWidth={2}
                        />
                        <div
                          className={`absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-lg font-bold bg-gradient-to-br ${outcome.gradient} bg-clip-text text-transparent`}
                        >
                          {outcome.number}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-4 mb-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {outcome.title}
                          {outcome.subtitle && (
                            <span className="text-lg font-medium text-gray-600 ml-2">
                              {outcome.subtitle}
                            </span>
                          )}
                        </h3>
                        <div className="text-right ml-auto">
                          <div
                            className={`text-2xl font-bold bg-gradient-to-br ${outcome.gradient} bg-clip-text text-transparent`}
                          >
                            {outcome.metric}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {outcome.description}
                      </p>

                      {/* Inline Benefits */}
                      <div className="flex flex-wrap gap-3">
                        {outcome.benefits.map((benefit, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-sm"
                            style={{
                              opacity: hoveredIndex === index + 3 ? 1 : 0.7,
                              transition: `all 0.3s ease ${i * 100}ms`,
                            }}
                          >
                            <CheckCircle
                              className={`w-3.5 h-3.5 bg-gradient-to-br ${outcome.gradient} bg-clip-text`}
                            />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="relative mt-20 text-center">
          {/* Background Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-32 bg-gradient-to-r from-[#FF4A1C]/20 via-[#2A4666]/20 to-[#FF4A1C]/20 blur-3xl"></div>
          </div>

          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-lg">
              <Brain className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-800">
                Start seeing results from day one
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Trusted by</span>
                <div className="flex -space-x-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white flex items-center justify-center shadow-md"
                    >
                      <span className="text-xs text-white font-bold">
                        {10 - i}K
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-gray-600">
                Ready to transform your team?
              </span>
              <ArrowRight className="w-6 h-6 text-[#FF4A1C] animate-bounce-horizontal animation-delay-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS */}
      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes sparkle-rotate {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: rotate(180deg) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.5;
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes bounce-horizontal {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-sparkle-rotate {
          animation: sparkle-rotate 3s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default AIPowerUsersSection;
