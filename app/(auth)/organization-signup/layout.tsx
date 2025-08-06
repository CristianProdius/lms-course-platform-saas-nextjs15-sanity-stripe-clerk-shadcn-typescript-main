import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Precuity AI - Organization Setup",
  description: "Set up your organization account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <main className="min-h-screen">{children}</main>
    </ClerkProvider>
  );
}
