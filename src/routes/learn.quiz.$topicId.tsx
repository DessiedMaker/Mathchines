import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getTopic, type Difficulty, type Question, type Topic } from "@/lib/curriculum";
import { addMastery, getProgress } from "@/lib/progress";
import { ArrowRight, Award, CheckCircle2, RotateCcw, XCircle, Sparkles, Loader2 } from "lucide-react";
import { getAIExplanation } from "@/lib/api/ai.functions";


export const Route = createFileRoute("/learn/quiz/$topicId")({
  loader: ({ params }) => {
    const topic = getTopic(params.topicId);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.topic.title ?? "Quiz"} — Practice` },
      { name: "description", content: "Adaptive practice with full corrections for every wrong answer." },
    ],
  }),
  notFoundComponent: () => (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Topic not found</h1>
      <Link to="/learn/topics" className="mt-4 inline-block text-primary underline">Back</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 text-primary underline">Try again</button>
    </div>
  ),
  component: QuizPage,
});

const TOTAL_QUESTIONS = 8;
const PASS_THRESHOLD = 0.8;

function pickAdaptive(pool: Question[], history: { difficulty: Difficulty; correct: boolean }[]): Question | undefined {
  const lastTwo = history.slice(-2);
  let target: Difficulty = "Standard";
  if (history.length === 0) target = "Foundational";
  else if (lastTwo.length === 2 && lastTwo.every((h) => h.correct)) target = "Challenge";
  else if (lastTwo.length >= 1 && !lastTwo[lastTwo.length - 1].correct) target = "Foundational";

  const seenIds = new Set(history.map((_, i) => pool[i]?.id));
  const unseen = pool.filter((q) => !seenIds.has(q.id));
  return (
    unseen.find((q) => q.difficulty === target) ||
    unseen.find((q) => q.difficulty === "Standard") ||
    unseen[0]
  );
}

function QuizPage() {
  const { topic } = Route.useLoaderData() as { topic: Topic };
  const navigate = useNavigate();
  const shuffled = useMemo(() => [...topic.questions].sort(() => Math.random() - 0.5), [topic]);

  const [history, setHistory] = useState<{ q: Question; chosen: number; correct: boolean }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);


  const pastForAdaptive = history.map((h) => ({ difficulty: h.q.difficulty, correct: h.correct }));
  const current = useMemo(
    () => (finished ? undefined : pickAdaptive(shuffled, pastForAdaptive)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history.length, finished, shuffled]
  );

  if (finished || !current) {
    const correctCount = history.filter((h) => h.correct).length;
    const score = history.length === 0 ? 0 : correctCount / history.length;
    const passed = score >= PASS_THRESHOLD;
    if (passed && history.length > 0) {
      // record mastery once on render
      addMastery(topic.id, Math.round(score * 50));
    }
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl ${passed ? "bg-gold/30 text-gold-foreground" : "bg-coral/15 text-coral"}`}>
          {passed ? <Award className="h-10 w-10" /> : <RotateCcw className="h-10 w-10" />}
        </div>
        <h1 className="mt-6 text-3xl font-bold md:text-4xl">
          {passed ? "Mastery unlocked!" : "Close — let's try again."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          You scored {correctCount} / {history.length} ({Math.round(score * 100)}%).
          {passed ? " You earned XP and a Mastery badge." : ` Aim for ${Math.round(PASS_THRESHOLD * 100)}% to earn the badge.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setHistory([]);
              setSelected(null);
              setRevealed(false);
              setFinished(false);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Practice again <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate({ to: "/learn/topics" })}
            className="rounded-full border border-border bg-card px-5 py-3 font-medium transition-colors hover:bg-accent"
          >
            Back to topics
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === current.answerIndex;
  const progress = history.length / TOTAL_QUESTIONS;

  function submit() {
    if (selected === null) return;
    setRevealed(true);
  }

  function next() {
    setHistory((h) => [...h, { q: current!, chosen: selected!, correct: isCorrect }]);
    setSelected(null);
    setRevealed(false);
    setAiExplanation(null);
    if (history.length + 1 >= TOTAL_QUESTIONS) setFinished(true);
  }

  const progressData = getProgress();
  const gradeLabel = progressData.grade || "student grade";

  async function handleAskAi() {
    if (selected === null || !current) return;
    setLoadingAi(true);
    setAiExplanation(null);
    try {
      const res = await getAIExplanation({
        data: {
          topicTitle: topic.title,
          difficulty: current.difficulty,
          prompt: current.prompt,
          choices: current.choices,
          answerIndex: current.answerIndex,
          chosenIndex: selected,
          gradeLabel: gradeLabel,
        }
      });
      setAiExplanation(res.explanation);
    } catch (err) {
      console.error("Failed to query AI Tutor:", err);
      setAiExplanation("Sorry, I had trouble connecting to the AI Tutor. Please review the worked examples in the lesson!");
    } finally {
      setLoadingAi(false);
    }
  }


  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{topic.title}</span>
        <span>
          Question {history.length + 1} of {TOTAL_QUESTIONS}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-hero transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span
            className={`rounded-full px-2 py-0.5 ${
              current.difficulty === "Foundational"
                ? "bg-primary/15 text-primary"
                : current.difficulty === "Standard"
                ? "bg-gold/30 text-gold-foreground"
                : "bg-coral/15 text-coral"
            }`}
          >
            {current.difficulty}
          </span>
          {current.examTag && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{current.examTag}</span>
          )}
        </div>

        <h2 className="mt-4 text-2xl font-semibold">{current.prompt}</h2>

        <div className="mt-6 grid gap-3">
          {current.choices.map((choice, i) => {
            const chosen = selected === i;
            const showCorrect = revealed && i === current.answerIndex;
            const showWrong = revealed && chosen && i !== current.answerIndex;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  showCorrect
                    ? "border-primary bg-primary/10 text-primary"
                    : showWrong
                    ? "border-coral bg-coral/10 text-coral"
                    : chosen
                    ? "border-foreground bg-accent"
                    : "border-border bg-background hover:border-foreground/40"
                }`}
              >
                <span>{choice}</span>
                {showCorrect && <CheckCircle2 className="h-5 w-5" />}
                {showWrong && <XCircle className="h-5 w-5" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="space-y-4 mt-6">
            <div
              className={`rounded-2xl border p-4 text-sm ${
                isCorrect
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-coral/30 bg-coral/5 text-foreground"
              }`}
            >
              <div className="font-semibold">
                {isCorrect ? "Correct!" : "Not quite — here's why:"}
              </div>
              <p className="mt-1 text-muted-foreground">{current.explanation}</p>
            </div>

            {!aiExplanation && !loadingAi && (
              <button
                onClick={handleAskAi}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="h-4 w-4" /> Ask Mathchines AI Tutor for a step-by-step breakdown
              </button>
            )}

            {loadingAi && (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>AI Tutor is formulating a custom response...</span>
              </div>
            )}

            {aiExplanation && (
              <div className="rounded-2xl border border-border bg-accent/30 p-5 text-sm animate-fade-in shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-primary text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="h-4 w-4" /> AI Tutor Explanation
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">{aiExplanation}</p>
              </div>
            )}
          </div>
        )}


        <div className="mt-6 flex justify-end gap-3">
          {!revealed ? (
            <button
              onClick={submit}
              disabled={selected === null}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              {history.length + 1 >= TOTAL_QUESTIONS ? "See results" : "Next question"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
