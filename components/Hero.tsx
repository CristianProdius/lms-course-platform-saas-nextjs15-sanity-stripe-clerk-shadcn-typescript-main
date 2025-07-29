import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative h-[45vh] w-full top-6">
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">
            Your Team Can Master AI in Just 5 Days
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            While big companies spend millions on AI training, your small
            business can get the same edge—faster and simpler.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            className="bg-[#FF4A1C] text-black rounded-2xl py-6  hover:scale-105 transition-transform duration-300 hover:bg-[#FF4A1C]/90 "
          >
            <Link href="/courses" className="text-lg">
              Start Training Today
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
