import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCountry, getGrade } from "@/lib/curriculum";
import { getProgress, subscribe } from "@/lib/progress";
import { Award, Flame, PlayCircle, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/learn/topics")({
  head: () => ({
    meta: [
      { title: "Topics — Mathchines" },
      {
        name: "description",
        content:
          "Pick a topic to start learning. Each comes with a video lesson and adaptive practice.",
      },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const p = getProgress();
  useEffect(() => {
    if (!p.country || !p.grade) navigate({ to: "/learn" });
  }, [p.country, p.grade, navigate]);

  if (!p.country || !p.grade) return null;
  const country = getCountry(p.country)!;
  const grade = getGrade(p.country, p.grade)!;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {country.flag} {country.name} · {grade.label}
          </span>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">Your learning path</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pick any topic. Watch the lesson, then practice — you'll earn a Mastery badge when you
            hit 80%.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat icon={Trophy} label="XP" value={p.xp.toString()} tone="text-coral" />
          <Stat icon={Flame} label="Streak" value={`${p.streak}d`} tone="text-gold-foreground" />
          <Stat
            icon={Award}
            label="Mastered"
            value={p.mastered.length.toString()}
            tone="text-primary"
          />
        </div>
      </div>

      <Link
        to="/learn"
        className="mt-4 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Change country or grade
      </Link>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {grade.topics.map((t) => {
          const mastered = p.mastered.includes(t.id);
          return (
            <article
              key={t.id}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                {mastered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/30 px-2 py-1 text-xs font-medium text-gold-foreground">
                    <Award className="h-3 w-3" /> Mastered
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.objective}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                {t.questions.length} practice questions · 3 difficulty tiers
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/learn/lesson/$topicId"
                  params={{ topicId: t.id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-105"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start lesson
                </Link>
                <Link
                  to="/learn/quiz/$topicId"
                  params={{ topicId: t.id }}
                  className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Practice
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 shadow-sm">
      <Icon className={`h-5 w-5 ${tone}`} />
      <div>
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
