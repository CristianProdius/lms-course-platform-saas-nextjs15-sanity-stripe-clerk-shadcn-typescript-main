"use client";

import { useState } from "react";
import { Menu, X, BookOpen, Building2, Users, User, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, organization, isAuthenticated, isAdmin, loading } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/image.png"
              alt="Precuity AI Logo"
              width={120}
              height={48}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/courses"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Courses</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/courses"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Learning</span>
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.name || user?.email}
                    </span>
                    {organization && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {organization.name} {isAdmin && "(Admin)"}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/employee-join">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:opacity-90"
                  >
                    Join Organization
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link
                href="/courses"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard/organization"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Organization</span>
                  </Link>

                  <Link
                    href="/dashboard/courses"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Our Courses</span>
                  </Link>

                  <Link
                    href="/dashboard/members"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user?.name || user?.email}
                      </span>
                      {organization && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {organization.name} {isAdmin && "(Admin)"}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/employee-join" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full justify-start bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:opacity-90"
                    >
                      Join Organization
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}