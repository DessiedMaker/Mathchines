import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { COUNTRIES, getCountry } from "@/lib/curriculum";
import { getProgress, setSelection } from "@/lib/progress";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Start Learning — Mathchines" },
      { name: "description", content: "Pick your country and grade to begin your personalized math journey." },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const navigate = useNavigate();
  const [country, setCountry] = useState<string>("");
  const [grade, setGrade] = useState<string>("");

  useEffect(() => {
    const p = getProgress();
    if (p.country) setCountry(p.country);
    if (p.grade) setGrade(p.grade);
  }, []);

  const selected = country ? getCountry(country) : undefined;

  function continueFlow() {
    if (!country || !grade) return;
    setSelection(country, grade);
    navigate({ to: "/learn/topics" });
  }

  return (
    <div>
      <div className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Step 1 of 4</span>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Where do you learn?</h1>
        <p className="mt-3 text-muted-foreground">
          We map your lessons to the right national curriculum — GES, WAEC, Common Core, GCSE, and more.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Country</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTRIES.map((c) => {
            const active = c.code === country;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setCountry(c.code);
                  setGrade("");
                }}
                className={`relative rounded-2xl border p-5 text-left transition-all ${
                  active
                    ? "border-primary bg-card shadow-glow"
                    : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft"
                }`}
              >
                <div className="text-3xl">{c.flag}</div>
                <div className="mt-3 font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.curriculum}</div>
                {active && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Grade / Class
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {selected.grades.map((g) => {
              const active = g.id === grade;
              return (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? "border-primary bg-card shadow-glow"
                      : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft"
                  }`}
                >
                  <div className="font-semibold">{g.label}</div>
                  <div className="text-xs text-muted-foreground">{g.topics.length} topics ready</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-12 flex justify-end">
        <button
          disabled={!country || !grade}
          onClick={continueFlow}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 font-medium text-primary-foreground shadow-glow transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
