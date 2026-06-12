import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTopic } from "@/lib/curriculum";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/learn/lesson/$topicId")({
  loader: ({ params }) => {
    const topic = getTopic(params.topicId);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.topic.title ?? "Lesson"} — Mathchines` },
      { name: "description", content: loaderData?.topic.objective ?? "Mathchines lesson" },
    ],
  }),
  notFoundComponent: () => (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Topic not found</h1>
      <Link to="/learn/topics" className="mt-4 inline-block text-primary underline">
        Back to topics
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 text-primary underline">Try again</button>
    </div>
  ),
  component: LessonPage,
});

function LessonPage() {
  const { topic } = Route.useLoaderData();

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <span className="text-sm font-semibold uppercase tracking-wider text-coral">Lesson</span>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{topic.title}</h1>
        <p className="mt-3 text-muted-foreground">{topic.objective}</p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative aspect-video w-full">
            <iframe
              src={topic.videoUrl}
              title={topic.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Worked examples</h2>
          <div className="mt-4 space-y-4">
            {topic.workedExamples.map((ex) => (
              <article key={ex.title} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{ex.title}</h3>
                <ol className="mt-3 space-y-2 text-sm text-foreground/90">
                  {ex.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-semibold">You'll learn to:</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Apply step-by-step methods</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Recognize common pitfalls</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Solve at three difficulty tiers</li>
          </ul>
        </div>
        <Link
          to="/learn/quiz/$topicId"
          params={{ topicId: topic.id }}
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-hero px-5 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Start practice <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/learn/topics"
          className="block rounded-full border border-border bg-card px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-accent"
        >
          Back to topics
        </Link>
      </aside>
    </div>
  );
}
