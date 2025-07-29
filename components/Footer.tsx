"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Shield,
  Award,
  Users,
  BookOpen,
  Zap,
  Star,
  ChevronRight,
  Globe,
  Clock,
  CheckCircle,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

const PremiumFooter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  const footerLinks = {
    product: [
      { name: "Features", href: "/features", badge: "New" },
      { name: "Pricing", href: "/pricing" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Reviews", href: "/reviews", badge: "4.9★" },
      { name: "Updates", href: "/updates" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "AI Training Guide", href: "/guide", badge: "Free" },
      { name: "Video Tutorials", href: "/tutorials" },
      { name: "Community", href: "/community" },
      { name: "Blog", href: "/blog" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers", badge: "Hiring" },
      { name: "Press Kit", href: "/press" },
      { name: "Contact", href: "/contact" },
      { name: "Partners", href: "/partners" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Licenses", href: "/licenses" },
    ],
  };

  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://linkedin.com",
      name: "LinkedIn",
      color: "hover:text-blue-600",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      name: "Twitter",
      color: "hover:text-sky-500",
    },
    {
      icon: Facebook,
      href: "https://facebook.com",
      name: "Facebook",
      color: "hover:text-blue-700",
    },
    {
      icon: Instagram,
      href: "https://instagram.com",
      name: "Instagram",
      color: "hover:text-pink-600",
    },
    {
      icon: Youtube,
      href: "https://youtube.com",
      name: "YouTube",
      color: "hover:text-red-600",
    },
  ];

  const awards = [
    { icon: Award, text: "Best AI Training 2024" },
    { icon: Shield, text: "SOC2 Certified" },
    { icon: Users, text: "10,000+ Teams" },
    { icon: Star, text: "4.9/5 Rating" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239CA3AF\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF4A1C]/10 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#2A4666]/10 to-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="relative bg-gradient-to-br from-[#2A4666] to-[#1a3455] rounded-3xl p-10 sm:p-16 overflow-hidden shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "60px 60px",
                  }}
                ></div>
              </div>

              {/* Floating Elements */}
              <Sparkles className="absolute top-10 right-10 w-8 h-8 text-white/20 animate-sparkle" />
              <Zap className="absolute bottom-10 left-10 w-6 h-6 text-white/20 animate-sparkle animation-delay-1000" />

              <div className="relative z-10 text-center">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Start Your AI Journey Today
                </h3>
                <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join 10,000+ teams getting weekly AI tips, exclusive
                  resources, and early access to new features.
                </p>

                {/* Newsletter Form */}
                <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-5 pr-48 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-[#FF4A1C]/50 transition-all duration-300"
                      required
                    />
                    <div className="absolute right-2 top-2 bottom-2">
                      <Button
                        type="submit"
                        className={`h-full px-8 rounded-full font-semibold transition-all duration-300 ${
                          isSubscribed
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gradient-to-r from-[#FF4A1C] to-orange-600 hover:from-orange-600 hover:to-[#FF4A1C]"
                        }`}
                      >
                        {isSubscribed ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Subscribed!
                          </>
                        ) : (
                          <>
                            Subscribe Free
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span>No spam, ever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Weekly insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Join 10,000+ readers</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/image.png"
                  alt="PrecultyAI Logo"
                  width={80}
                  height={100}
                  className="h-16 w-auto object-contain"
                />
              </Link>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Empowering teams worldwide with practical AI training that
                delivers real results. Transform your business in just 5 days.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-8">
                <a
                  href="mailto:info@precultyai.ai"
                  className="flex items-center gap-3 text-gray-600 hover:text-[#FF4A1C] transition-colors duration-300"
                >
                  <Mail className="w-5 h-5" />
                  <span>info@precultyai.ai</span>
                </a>
                <a
                  href="tel:555-567-8901"
                  className="flex items-center gap-3 text-gray-600 hover:text-[#FF4A1C] transition-colors duration-300"
                >
                  <Phone className="w-5 h-5" />
                  <span>555-567-8901</span>
                </a>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    1234 Main St
                    <br />
                    Moonstone City, Stardust State 12345
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 transition-all duration-300 hover:bg-white hover:shadow-md ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {/* Product Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#FF4A1C]" />
                  Product
                </h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between text-gray-600 hover:text-[#FF4A1C] transition-colors duration-300"
                      >
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-[#FF4A1C] to-orange-500 text-white rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#2A4666]" />
                  Resources
                </h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between text-gray-600 hover:text-[#2A4666] transition-colors duration-300"
                      >
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-[#2A4666] to-blue-600 text-white rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Company
                </h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between text-gray-600 hover:text-purple-600 transition-colors duration-300"
                      >
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full animate-pulse">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Legal
                </h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Awards Section */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <award.icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {award.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 text-center sm:text-left">
                © 2025 PrecultyAI. All Rights Reserved.
                <span className="mx-2">•</span>
                Made with ❤️ for innovators
              </p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">English</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                <a
                  href="/support"
                  className="flex items-center gap-2 text-gray-600 hover:text-[#FF4A1C] transition-colors duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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

        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </footer>
  );
};

export default PremiumFooter;
