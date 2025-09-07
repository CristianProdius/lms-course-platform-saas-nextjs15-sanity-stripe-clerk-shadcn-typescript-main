import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precuity AI - Authentication",
  description: "Sign in to your organization account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">{children}</main>
  );
}