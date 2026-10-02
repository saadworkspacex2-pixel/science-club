import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, TrendingDown, Rocket, Lightbulb } from "lucide-react";
import { getProjects } from "@/lib/data";
import { projectStatus, statusChipCls } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getProjects();
  const p = all.find((x) => x.id === Number(id));
  if (!p) notFound();
  const st = projectStatus[p.status] ?? projectStatus.ongoing;

  const sections = [
    { key: "successes", title: "সফলতা ও পুরস্কার", Icon: CheckCircle2, text: p.successes },
    { key: "failures", title: "ব্যর্থতা ও শিক্ষা", Icon: TrendingDown, text: p.failures },
    { key: "futurePlans", title: "ভবিষ্যৎ পরিকল্পনা", Icon: Rocket, text: p.futurePlans },
  ].filter((s) => s.text.trim());

  return (
    <div className="pt-28 sm:pt-32">
      <div className="mx-auto max-w-5xl px-5">
        <Link
          href="/projects"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:text-blue dark:text-white/65"
        >
          <ArrowLeft className="size-3.5 rotate-180" />
          সকল প্রকল্প
        </Link>

        <Reveal className="mt-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[21/9]">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.title} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-black/[0.06] dark:bg-white/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className={cn("absolute left-5 top-5 sm:left-8 sm:top-8 !px-4 !py-2 !text-xs", statusChipCls)}>
              <span className={cn("size-2 rounded-full", st.dot)} />
              {st.label}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <h1 className="font-display max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                {p.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-white/80">{p.summary}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="card p-6 sm:p-9">
            <h2 className="font-display flex items-center gap-2.5 text-xl font-extrabold sm:text-2xl">
              <Lightbulb className="size-6 text-blue" />
              প্রকল্পের বিবরণ
            </h2>
            <p className="mt-4 leading-[1.9] text-ink-soft dark:text-white/70">{p.description}</p>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {sections.map(({ key, title, Icon, text }, i) => (
            <Reveal key={key} delay={0.1 + i * 0.07}>
              <div className="glass h-full rounded-[1.75rem] p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-base font-extrabold">{title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {text.split("\n").filter(Boolean).map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[13px] font-medium leading-relaxed text-ink-soft dark:text-white/65">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
