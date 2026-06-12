import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-students.jpg";
import piLogo from "@/assets/pi-logo.png";
import {
  Sparkles,
  Trophy,
  WifiOff,
  Brain,
  GraduationCap,
  MessageCircle,
  Globe2,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mathchines — Making Math Enjoyable for Every Student" },
      {
        name: "description",
        content:
          "Curriculum-aligned, adaptive math learning for students worldwide. Lessons, AI tutoring, and gamified practice — online or offline.",
      },
      { property: "og:title", content: "Mathchines — Making Math Enjoyable for Every Student" },
      {
        property: "og:description",
        content:
          "Curriculum-aligned, adaptive math learning for students worldwide. Lessons, AI tutoring, and gamified practice — online or offline.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <img src={piLogo} alt="Mathchines pi logo" width={36} height={36} className="h-9 w-9" />
          <span className="text-xl font-semibold tracking-tight">Mathchines</span>
        </a>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#personas" className="transition-colors hover:text-foreground">Who it's for</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </div>
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-105"
        >
          Start learning <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-soft">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            Now in development · v2.0 · Launching globally
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
            Making math <span className="bg-gradient-hero bg-clip-text text-transparent">enjoyable</span> for every student.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Mathchines turns anxiety into achievement with curriculum-aligned lessons,
            AI-powered tutoring, and gamified practice — on any device, with or without internet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              Start learning free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
            >
              See how it works
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { k: "10K+", v: "Practice questions" },
              { k: "20+", v: "Curricula supported" },
              { k: "100%", v: "Offline-capable" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-semibold text-foreground">{s.k}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-coral opacity-30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-glow">
            <img
              src={heroImage}
              alt="Students learning math with Mathchines"
              width={1280}
              height={1024}
              className="w-full"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/30 text-gold-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">+50 XP earned</div>
              <div className="text-xs text-muted-foreground">Algebra mastery unlocked</div>
            </div>
          </div>
          <div className="absolute -right-4 top-10 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-soft">
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
            <span className="text-xs font-medium">Live tutoring</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    "Lessons that don't match the local curriculum",
    "No personal feedback when you get stuck",
    "Boring drills that kill curiosity",
    "Expensive data and low-end devices",
  ];
  return (
    <section className="border-y border-border bg-card py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-coral">The problem</span>
        <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
          Math shouldn't feel impossible.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Students everywhere — from Accra to Atlanta — struggle with the same gaps. We built Mathchines
          to close every one of them.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {items.map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral/15 text-coral">
                ✕
              </span>
              <span className="text-foreground/90">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Globe2,
    title: "Curriculum-aligned",
    body: "Pick your country and grade. Get lessons mapped to GES, CCSS, WAEC, GCSE, SAT, and more.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Brain,
    title: "Adaptive practice",
    body: "Difficulty adjusts in real time across Foundational, Standard, and Challenge tiers.",
    accent: "bg-coral/15 text-coral",
  },
  {
    icon: MessageCircle,
    title: "AI tutoring",
    body: "Get full worked explanations the moment you make a mistake — never feel lost again.",
    accent: "bg-gold/25 text-gold-foreground",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    body: "Download lessons and quizzes. Progress syncs the moment you're back online.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Trophy,
    title: "Gamified arena",
    body: "Math-Offs, Lightning Jams, and Speed Drills turn practice into something you actually want to do.",
    accent: "bg-coral/15 text-coral",
  },
  {
    icon: Award,
    title: "Mastery badges",
    body: "Earn XP, unlock streaks, and build genuine confidence one topic at a time.",
    accent: "bg-gold/25 text-gold-foreground",
  },
];

function Features() {
  return (
    <section id="features" className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Features</span>
          <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
            Everything a student needs to fall in love with math.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${f.accent}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Pick your country & grade", d: "Tell us where you learn. We line up the right curriculum instantly." },
  { n: "02", t: "Take a quick placement", d: "An optional 10-question check finds the perfect starting point." },
  { n: "03", t: "Watch & practice", d: "Expert video lessons, worked examples, and 10+ practice questions per topic." },
  { n: "04", t: "Learn from every mistake", d: "Get an immediate, full explanation — then earn your mastery badge." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-coral">How it works</span>
          <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
            From confusion to confidence in four steps.
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-3xl border border-border bg-card p-7"
            >
              <span className="font-display text-5xl font-bold text-primary/30">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PERSONAS = [
  {
    icon: Target,
    name: "The Struggling Student",
    age: "12–18",
    body: "Feels lost in class. Mathchines gives the personal attention school can't — at their own pace.",
  },
  {
    icon: GraduationCap,
    name: "The Self-Directed Learner",
    age: "13–18",
    body: "Wants the edge. Explore topics ahead of class or revisit old ones — perfectly aligned to their exam.",
  },
  {
    icon: WifiOff,
    name: "The Low-Connectivity Learner",
    age: "12–16",
    body: "Unreliable data, low-end Android. Download lessons once, learn anywhere — and ace BECE & WAEC.",
  },
];

function Personas() {
  return (
    <section id="personas" className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Who it's for</span>
          <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
            Built for every kind of learner.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <article
              key={p.name}
              className="rounded-3xl border border-border bg-background p-7 shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
                <p.icon className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Ages {p.age}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForGrownups() {
  const items = [
    { icon: Users, t: "Teachers", d: "Assign topics, view class analytics, and push Instant Reviews on shared Trouble Spots." },
    { icon: BookOpen, t: "Parents", d: "Weekly SMS/WhatsApp reports and a dashboard to follow real progress, not just scores." },
    { icon: Zap, t: "Schools", d: "Bulk seat licences with full teacher tools, mock exams, and class-level mastery tracking." },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-coral">For grown-ups</span>
            <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
              Real visibility for the people who care most.
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Mathchines gives teachers, parents, and schools the tools to support every learner —
              without getting in the way of the learning itself.
            </p>
          </div>
          <ul className="space-y-4">
            {items.map((i) => (
              <li
                key={i.t}
                className="flex gap-4 rounded-3xl border border-border bg-card p-6"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <i.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{i.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const TIERS = [
  {
    name: "Free",
    price: "$0",
    sub: "Forever",
    blurb: "Three topics per week to get a real taste.",
    features: ["3 topics / week", "Adaptive practice", "Mastery badges", "Mobile + web"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    sub: "/ month · or GHS 2/day via airtime",
    blurb: "Unlimited everything, built for the long haul.",
    features: [
      "Unlimited topics & practice",
      "Full offline mode",
      "Speed Drills & Fluency Zone",
      "Weekly parent reports",
      "AI tutoring",
    ],
    cta: "Go Premium",
    highlight: true,
  },
  {
    name: "School",
    price: "Custom",
    sub: "Per seat / year",
    blurb: "For classrooms and districts that mean business.",
    features: ["Bulk seat licences", "Teacher dashboard", "Class analytics", "Mock exams", "Priority support"],
    cta: "Talk to us",
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</span>
          <h2 className="mt-3 text-balance text-4xl font-bold md:text-5xl">
            Calibrated for every wallet, on every continent.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pay monthly, or a few cents a day via mobile airtime. Whatever works where you are.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                t.highlight
                  ? "border-transparent bg-gradient-hero text-primary-foreground shadow-glow"
                  : "border-border bg-card"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-coral-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-2xl font-semibold">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold">{t.price}</span>
              </div>
              <div className={`mt-1 text-sm ${t.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {t.sub}
              </div>
              <p className={`mt-4 text-sm ${t.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {t.blurb}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${t.highlight ? "text-gold" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`mt-8 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition-transform hover:scale-105 ${
                  t.highlight
                    ? "bg-background text-foreground"
                    : "bg-foreground text-background"
                }`}
              >
                {t.cta} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-12 text-center text-primary-foreground shadow-glow md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/40 blur-3xl" />
          <h2 className="relative text-balance text-4xl font-bold md:text-5xl">
            Ready to make math your favorite subject?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Join the waitlist. We'll let you know the moment Mathchines is live in your country.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@school.com"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-primary-foreground placeholder:text-primary-foreground/60 outline-none backdrop-blur focus:border-white/40"
            />
            <button
              type="submit"
              className="rounded-full bg-background px-6 py-3 font-medium text-foreground transition-transform hover:scale-105"
            >
              Get early access
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={piLogo} alt="Mathchines pi logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold">Mathchines</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Mathchines. Making math enjoyable for every student.
        </p>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Personas />
        <ForGrownups />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
