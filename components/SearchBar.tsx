"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for AI courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent placeholder:text-gray-500"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="px-8 bg-[#B9FF66] text-[#2A4666] hover:bg-[#B9FF66]/90 font-semibold rounded-xl shadow-lg"
        disabled={!searchQuery.trim()}
      >
        Search
      </Button>
    </form>
  );
}
