"use client";

import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useOrganization,
} from "@clerk/nextjs";
import { Menu, X, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { membership } = useOrganization();

  // Check if user is an organization admin
  const isOrgAdmin =
    membership?.role === "admin" || membership?.role === "org:admin";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="relative my-2">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <Image src="/image.png" alt="logo" width="100" height="100" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-4">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-2">
              {/* Course Link */}
              <Link
                prefetch={false}
                href="/courses/precuity-ai"
                className="flex space-x-2 items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:border md:border-border md:rounded-md md:px-4 md:py-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Course</span>
              </Link>

              {/* Organization Admin Link - Only show for admins */}
              <SignedIn>
                {isOrgAdmin && (
                  <Link
                    prefetch={false}
                    href="/dashboard/admin"
                    className="flex space-x-2 items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:border md:border-border md:rounded-md md:px-4 md:py-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Organization Admin</span>
                  </Link>
                )}
              </SignedIn>
            </nav>

            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="default">
                  Start Now
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {/* Course Link */}
              <Link
                prefetch={false}
                href="/courses/precuity-ai"
                onClick={closeMenu}
                className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Course</span>
              </Link>

              {/* Organization Admin Link - Only show for admins */}
              <SignedIn>
                {isOrgAdmin && (
                  <Link
                    prefetch={false}
                    href="/dashboard/organization/invite"
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Organization Admin</span>
                  </Link>
                )}
              </SignedIn>
            </nav>

            {/* Mobile Auth */}
            <div className="px-4 py-2 border-t border-border">
              <SignedIn>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <UserButton />
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="default" className="w-full">
                    Start Now
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          style={{ top: "64px" }}
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
