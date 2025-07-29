import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SanityLive } from "@/sanity/lib/live";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import PremiumFooter from "@/components/Footer";

export const metadata: Metadata = {
  title: "Precuity AI",
  description: "Master AI in 5 Days",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <PremiumFooter />
        </div>
      </ThemeProvider>

      <SanityLive />
    </ClerkProvider>
  );
}
