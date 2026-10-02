import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import { ProjectsView } from "@/components/cards";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "প্রকল্প ইতিহাস",
  description: "সফল, চলমান, ব্যর্থ ও ভবিষ্যৎ — বিইউএসএসএসসি সাইন্স ক্লাবের সকল গবেষণা ও উদ্ভাবনী প্রকল্প।",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div>
      <PageHero
        eyebrow="উদ্ভাবনের যাত্রা"
        title="প্রকল্প ইতিহাস"
        subtitle="আমরা ব্যর্থতাকে মেনে নিই, শিখি এবং আবার চেষ্টা করি — এটাই প্রকৃত বিজ্ঞানীর পথ।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8">
        <ProjectsView projects={projects} />
      </section>
    </div>
  );
}
