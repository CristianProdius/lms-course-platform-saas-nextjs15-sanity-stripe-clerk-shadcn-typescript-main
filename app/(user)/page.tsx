import Hero from "@/components/Hero";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/sanity/lib/courses/getCourses";
import AICompetitorsSection from "@/components/AICompetitorsSection";
import AITrainingSection from "@/components/AITrainigSection";
import AIPowerUsersSection from "@/components/AIPowerUsersSection";
import GetStartedSection from "@/components/GetStartedSection";
import FAQSection from "@/components/FAQSection";

export const dynamic = "force-static";
export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <AICompetitorsSection />
      <AITrainingSection />
      <AIPowerUsersSection />
      <GetStartedSection />
      <FAQSection />
    </div>
  );
}
