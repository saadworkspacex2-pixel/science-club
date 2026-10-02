export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative px-5 pb-4 pt-32 sm:pt-40">
      <div className="ambient left-[8%] top-24 size-72 bg-blue/30" />
      <div className="ambient right-[10%] top-40 size-64 bg-teal/30" />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="font-tiro text-lg italic text-blue">
          ◦ {eyebrow} ◦
        </p>
        <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="font-noto mx-auto mt-5 max-w-2xl text-lg font-light leading-relaxed text-ink-soft dark:text-white/60">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
