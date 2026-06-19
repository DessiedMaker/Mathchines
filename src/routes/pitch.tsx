import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Trophy,
  WifiOff,
  GraduationCap,
  Users,
  Check,
  X,
  Coins,
  TrendingUp,
  Calendar,
  Award,
  Globe2,
  ArrowRight,
  BookOpen,
  Zap,
  LayoutGrid,
  Presentation,
} from "lucide-react";
import piLogo from "@/assets/pi-logo.png";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Mathchines Pitch Deck — Making Math Enjoyable" },
      {
        name: "description",
        content: "Explore the pitch deck for Mathchines: making mathematics enjoyable for every student globally.",
      },
    ],
  }),
  component: PitchDeck,
});

interface Slide {
  title: string;
  subtitle: string;
  notes: string;
}

const SLIDES: Slide[] = [
  {
    title: "Mathchines",
    subtitle: "Making Math Enjoyable for Every Student",
    notes: "Welcome everyone. Today we are presenting Mathchines, a revolutionary mathematics platform designed to transform math from a source of anxiety into an enjoyable, rewarding pursuit. Mathchines is built to be accessible to students globally, with a specific focus on curriculum alignment and offline-first capabilities to reach both Western and African markets. We'll walk through the problem, our solution, target personas, MVP learning flow, competitor comparisons, monetization, and our growth roadmap.",
  },
  {
    title: "The Problem",
    subtitle: "Why Mathematics is Feared Globally",
    notes: "A significant proportion of students view math as an unapproachable barrier. In traditional systems, resources lack personalization, and when students get stuck, they don't get immediate corrective feedback, leading to cumulative learning gaps. Furthermore, existing digital tools are disconnected from local standards, and stable internet access is often expensive or unavailable in emerging markets. Mathchines addresses all these constraints directly.",
  },
  {
    title: "The Solution",
    subtitle: "Curriculum-Aligned, Adaptive, and Offline-First",
    notes: "Our solution is simple yet powerful: Mathchines delivers highly visual, curriculum-aligned video lessons coupled with an adaptive practice engine. Our custom Error Correction Engine acts as a personal tutor, immediately explaining mistakes. Most importantly, the entire experience is built to run offline, meaning students can download lessons and practice without consuming expensive internet data.",
  },
  {
    title: "Primary Personas",
    subtitle: "Meeting Learners Where They Are",
    notes: "We've mapped out three primary target personas. First, Ama: the struggling JHS/SHS student who is lost in class and wants to build confidence. Second, Kofi: the self-directed learner striving for academic excellence and exam edge. Third, Kwame: the low-connectivity learner who represents millions of students in markets like Sub-Saharan Africa who use budget Android devices and have unreliable internet. Mathchines fits the specific needs of all three.",
  },
  {
    title: "MVP Learning Journey",
    subtitle: "The Student Success Loop",
    notes: "The user journey is streamlined for maximum efficiency: users onboard by selecting their country and grade (which maps the app to their specific local syllabus, like Ghana's GES). They can take an optional 5-question Adaptive Placement Quiz to identify skill gaps. Once they select a topic, they watch a short tutor-led animated lesson, complete an adaptive practice set of 10 questions, receive immediate worked explanations for errors, and earn mastery badges to progress.",
  },
  {
    title: "Competitive Benchmarks",
    subtitle: "Closing the Market Gaps",
    notes: "When we look at the landscape, competitors fall short in critical areas. Platforms like IXL or SplashLearn are expensive and require high-speed internet. Khan Academy is excellent but generic and lacks local curriculum integrations. Mathchines is the first platform purpose-built for both Western and African curricula, featuring robust offline syncing, and integrated daily airtime payments tailored for local purchasing power.",
  },
  {
    title: "Monetization & Pricing",
    subtitle: "Calibrated for Global Affordability",
    notes: "Our monetization follows a freemium model. The Free tier offers full access to basic topics. Premium students unlock unlimited lessons, offline mode, and parent reports for $4.99/month, or a localized micro-payment of GHS 1-2 per day via mobile airtime. This airtime subscription is crucial for high conversion in Africa. Schools can also purchase bulk licenses which include a teacher analytics dashboard to monitor trouble spots.",
  },
  {
    title: "Roadmap & Go-To-Market",
    subtitle: "Phase 1 - Phase 7 Lifecycle",
    notes: "Our proposed roadmap is divided into structured phases. We start with Phase 1-2: curriculum mapping and UX design. We build the core MVP in Weeks 8-18, followed by thorough beta testing in Ghana and the US. Launch is slated for Week 23, with post-MVP features like 1v1 Math-Off duels, Lightning Jams, and parent SMS reports releasing in subsequent months. By Phase 7, we expand to Nigeria, Kenya, and the UK.",
  },
  {
    title: "MVP Success Metrics",
    subtitle: "KPIs to Validate our Core Hypothesis",
    notes: "To validate that Mathchines improves comprehension, we are measuring several key performance indicators. We're targeting a Day 7 retention of 40% or higher, a lesson completion rate of 60%, and an assessment attempt rate of 70%. At least 20% of sessions are expected to run offline, validating our offline-first architecture. Our ultimate success metric is achieving a 15% average learning gain in 30 days.",
  },
  {
    title: "Join the Revolution",
    subtitle: "Making Math Accessible to Every Mind",
    notes: "In conclusion, Mathchines bridges a massive global gap by combining world-class curriculum-aligned learning with offline-first technology and localized pricing. We are democratizing mathematical literacy and making learning enjoyable. Thank you for your time. I am happy to open the floor to any questions.",
  },
];

function PitchDeck() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [activePersona, setActivePersona] = useState(0);
  const [isGhsCurrency, setIsGhsCurrency] = useState(false);
  const [solutionMode, setSolutionMode] = useState<"before" | "after">("after");
  const [isGridView, setIsGridView] = useState(false);

  const deckRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGridView) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setActiveSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveSlide((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGridView]);

  // Autoplay functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay && !isGridView) {
      interval = setInterval(() => {
        setActiveSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, isGridView]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const renderSlideBody = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10 shadow-inner">
              <img src={piLogo} alt="Mathchines Pi" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="bg-gradient-to-r from-sky-400 via-emerald-400 to-coral bg-clip-text text-5xl font-extrabold tracking-tight text-transparent font-display sm:text-6xl">
              Mathchines
            </h2>
            <p className="mt-4 text-xl font-medium text-slate-300 max-w-xl mx-auto">
              Making Math Enjoyable for Every Student
            </p>
            <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto">
              A global, curriculum-aligned, adaptive mathematics platform. Built to work anywhere, anytime — online or offline.
            </p>

            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs">
                <Globe2 className="h-4 w-4 text-emerald-400" />
                <span>Curriculum Aligned</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs">
                <Brain className="h-4 w-4 text-sky-400" />
                <span>Adaptive Engine</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs">
                <WifiOff className="h-4 w-4 text-coral" />
                <span>Offline Capable</span>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 font-display">The Classroom Bottlenecks</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Traditional mathematics instruction leaves students struggling. Without personalization or immediate support, they hit brick walls.
              </p>
              <div className="mt-6 border-l-4 border-coral bg-coral/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  "No single math platform is purpose-built for both African and Western curricula simultaneously. Most require fast internet and are priced out of reach."
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Curriculum Gaps", desc: "No local GES or NERDC alignment out of the box." },
                { title: "No Feedback Loop", desc: "Mistakes go unexplained. Gaps widen daily." },
                { title: "Static Practice", desc: "Generic drills that trigger math anxiety." },
                { title: "Data Limits", desc: "High costs bar online video tools in rural areas." },
              ].map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                  <div className="text-xs font-bold text-coral flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
                    {p.title}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-tight">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-slate-800 mb-6">
              <button
                onClick={() => setSolutionMode("before")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  solutionMode === "before" ? "bg-coral text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Before Mathchines
              </button>
              <button
                onClick={() => setSolutionMode("after")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  solutionMode === "after" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                After Mathchines
              </button>
            </div>

            {solutionMode === "before" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-center">
                {[
                  { title: "Frustrated Learners", desc: "Students stuck on homework with zero help." },
                  { title: "Internet Dependency", desc: "Lessons don't load when data runs out." },
                  { title: "Rigid Curricula", desc: "Content aligned to CCSS doesn't help in Ghana." },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 relative overflow-hidden">
                    <div className="absolute right-3 top-3 rounded-full bg-coral/10 p-1 text-coral">
                      <X className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-slate-200 text-sm">{item.title}</h4>
                    <p className="mt-2 text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-center">
                {[
                  { title: "Error Correction Engine", desc: "Immediate visual breakdown of errors.", icon: Brain, color: "text-sky-400" },
                  { title: "Offline Sync Mode", desc: "Download full topic modules locally.", icon: WifiOff, color: "text-coral" },
                  { title: "Dual Syllabus Mapping", desc: "GES, NERDC, CCSS, GCSE covered.", icon: Globe2, color: "text-emerald-400" },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-sky-950/40 bg-sky-950/15 p-5 relative overflow-hidden transition-all hover:border-sky-500/20">
                    <div className="absolute right-3 top-3 rounded-full bg-sky-500/10 p-1.5">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <h4 className="font-semibold text-slate-100 text-sm mt-2">{item.title}</h4>
                    <p className="mt-2 text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="grid gap-6 md:grid-cols-5 animate-fade-in h-full items-center">
            <div className="md:col-span-2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-display text-slate-100">Target Learners</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                We support both Western students seeking mastery and Sub-Saharan learners navigating data limits.
              </p>
              <div className="mt-4 flex gap-1.5">
                {["Ama / Alex", "Kofi / Jordan", "Kwame / Fatima"].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePersona(i)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      activePersona === i ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              {activePersona === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Ama / Alex (12-18 years)</h4>
                      <span className="text-[10px] text-sky-400">The Struggling Student</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li><strong>Goal:</strong> Understand specific math concepts they feel lost in.</li>
                    <li><strong>Pain Point:</strong> Overwhelmed in class, doesn't receive enough direct attention.</li>
                    <li><strong>Motivation:</strong> Build genuine confidence & raise failing marks.</li>
                  </ul>
                </div>
              )}

              {activePersona === 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Kofi / Jordan (13-18 years)</h4>
                      <span className="text-[10px] text-emerald-400">The Self-Directed Learner</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li><strong>Goal:</strong> Explore math topics ahead of their current class curricula.</li>
                    <li><strong>Pain Point:</strong> Standard apps are generic or don't line up with exams.</li>
                    <li><strong>Motivation:</strong> Maintain academic excellence & score highly in placement exams.</li>
                  </ul>
                </div>
              )}

              {activePersona === 2 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-coral/10 p-2 text-coral">
                      <WifiOff className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Kwame / Fatima (12-16 years)</h4>
                      <span className="text-[10px] text-coral">Low-Connectivity Learner</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li><strong>Goal:</strong> Access premium school lessons without cellular connection.</li>
                    <li><strong>Pain Point:</strong> Extremely slow, expensive data & low-end mobile devices.</li>
                    <li><strong>Motivation:</strong> Clear BECE / WAEC examinations to secure secondary access.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold font-display text-center mb-6 text-slate-100">The User Learning Loop</h3>
            <div className="grid grid-cols-6 gap-2 relative">
              {[
                { step: "01", label: "Select Grade", icon: Globe2, desc: "GES, CCSS, NERDC syllabus instantly mapped." },
                { step: "02", label: "Diagnostic", icon: Brain, desc: "5-question gap quiz sets starting point." },
                { step: "03", label: "Visual Lesson", icon: Play, desc: "Expert animations explaining core concept." },
                { step: "04", label: "Adaptive Pract", icon: Zap, desc: "IRT difficulty adjusts in real time." },
                { step: "05", label: "Correction", icon: Sparkles, desc: "Error correction details why you failed." },
                { step: "06", label: "Mastery Badge", icon: Award, desc: "Gain XP, streaks, and custom rewards." },
              ].map((s, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all group">
                  <span className="text-[9px] font-mono text-slate-500 font-bold">{s.step}</span>
                  <div className="my-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 group-hover:bg-sky-500 group-hover:text-white transition-all text-sky-400">
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-200 leading-tight">{s.label}</h4>
                  <div className="absolute bottom-full mb-2 hidden w-36 rounded-lg bg-slate-950 border border-slate-800 p-2 text-[9px] text-slate-400 leading-tight shadow-xl group-hover:block z-20">
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in flex flex-col justify-center">
            <h3 className="text-xl font-bold font-display text-center mb-4 text-slate-100">Closing the Competitive Gaps</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="p-3 text-[10px] uppercase font-bold text-slate-400">Core Features</th>
                    <th className="p-3 text-[10px] uppercase font-bold text-sky-400">Mathchines</th>
                    <th className="p-3 text-[10px] uppercase font-bold text-slate-400">IXL / SplashLearn</th>
                    <th className="p-3 text-[10px] uppercase font-bold text-slate-400">Khan Academy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {[
                    { feat: "African & Western Curricula", math: true, ixl: false, khan: false },
                    { feat: "Fully Offline Offline Playback", math: true, ixl: false, khan: false },
                    { feat: "Daily Airtime Payments (GHS 1-2)", math: true, ixl: false, khan: false },
                    { feat: "Interactive Error Correction", math: true, ixl: true, khan: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-900/10">
                      <td className="p-3 font-medium text-slate-200">{row.feat}</td>
                      <td className="p-3 text-sky-400 font-bold">{row.math ? <Check className="h-4.5 w-4.5" /> : <X className="h-4.5 w-4.5 text-slate-600" />}</td>
                      <td className="p-3 text-slate-500">{row.ixl ? <Check className="h-4.5 w-4.5" /> : <X className="h-4.5 w-4.5" />}</td>
                      <td className="p-3 text-slate-500">{row.khan ? <Check className="h-4.5 w-4.5" /> : <X className="h-4.5 w-4.5" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid gap-6 md:grid-cols-3 animate-fade-in items-center">
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-display text-slate-100">Global Pricing</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                We offer pricing calibrated directly to regional purchasing power.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Display currency:</span>
                <button
                  onClick={() => setIsGhsCurrency(!isGhsCurrency)}
                  className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-300 hover:text-white"
                >
                  {isGhsCurrency ? "Switch to USD ($)" : "Switch to GHS (Cedis)"}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <span className="text-[10px] font-bold text-sky-400">PREMIUM STUDENT</span>
                <h4 className="text-3xl font-extrabold text-white mt-1">
                  {isGhsCurrency ? "GHS 2" : "$4.99"}
                  <span className="text-xs font-normal text-slate-400">{isGhsCurrency ? "/day airtime" : "/month"}</span>
                </h4>
                <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                  Unlimited topics, offline lesson downloads, speed drills, weekly parent reports.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <span className="text-[10px] font-bold text-emerald-400">SCHOOL LICENSE</span>
                <h4 className="text-3xl font-extrabold text-white mt-1">Custom</h4>
                <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                  Bulk seat licensing, class analytics dashboard, instant review tools for classrooms.
                </p>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="animate-fade-in flex flex-col justify-center h-full">
            <h3 className="text-xl font-bold font-display text-center mb-6 text-slate-100">Project Timeline</h3>
            <div className="relative border-t border-slate-800 pt-8 mt-4 grid grid-cols-4 gap-4">
              <div className="absolute top-0 -translate-y-1/2 left-0 h-3 w-3 rounded-full bg-sky-500" />
              <div className="absolute top-0 -translate-y-1/2 left-1/4 h-3 w-3 rounded-full bg-sky-500" />
              <div className="absolute top-0 -translate-y-1/2 left-2/4 h-3 w-3 rounded-full bg-sky-500" />
              <div className="absolute top-0 -translate-y-1/2 left-3/4 h-3 w-3 rounded-full bg-coral animate-ping" />

              {[
                { title: "Discovery", date: "Weeks 1-3", desc: "Curriculum mapping & stack definition." },
                { title: "Design", date: "Weeks 4-7", desc: "Wireframes, UI mockups, adaptive spec." },
                { title: "MVP Build", date: "Weeks 8-18", desc: "Core engines & offline capabilities." },
                { title: "Launch", date: "Week 23", desc: "Ghana & US launch, micro-airtime payments." },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[9px] font-bold text-sky-400">{step.date}</span>
                  <h4 className="font-bold text-xs text-slate-200 mt-1">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-100">Core Success Targets</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                We aim to prove that curriculum-aligned adaptive learning directly correlates to higher student outcomes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Day 7 Retention", pct: "40%", bar: "w-[40%]", color: "bg-sky-500" },
                { label: "Lesson Completion", pct: "60%", bar: "w-[60%]", color: "bg-emerald-500" },
                { label: "Assessment Attempt", pct: "70%", bar: "w-[70%]", color: "bg-coral" },
                { label: "Offline Sessions", pct: "20%", bar: "w-[20%]", color: "bg-amber-500" },
              ].map((m, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/20 p-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-semibold">{m.label}</span>
                    <span className="text-xs font-bold text-white">{m.pct}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${m.bar} ${m.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="text-center animate-fade-in">
            <h3 className="bg-gradient-to-r from-sky-400 to-coral bg-clip-text text-4xl font-extrabold tracking-tight text-transparent font-display sm:text-5xl">
              Unlock Mathematical Potential
            </h3>
            <p className="mt-4 text-sm text-slate-300 max-w-lg mx-auto">
              Let's close curriculum gaps and build math confidence globally. Join us on the waitlist to receive development milestones.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/"
                className="rounded-full bg-sky-500 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-sky-400 shadow-lg shadow-sky-500/20"
              >
                Back to Homepage
              </Link>
              <Link
                to="/learn"
                className="rounded-full border border-slate-700 bg-slate-900 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Try Learning Demo
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased select-none">
      {/* Header Panel */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={piLogo} alt="Mathchines Logo" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white font-display">Mathchines</span>
          </Link>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            Pitch Deck v2.0
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGridView(!isGridView)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isGridView
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Toggle between slideshow and grid view"
          >
            {isGridView ? <Presentation className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
            {isGridView ? "Slideshow" : "All Slides"}
          </button>

          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isPresenterMode
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Toggle speaker notes and dual presentation view"
          >
            <Users className="h-3.5 w-3.5" />
            Presenter Mode
          </button>

          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isAutoplay
                ? "bg-coral text-white shadow-lg shadow-coral/25"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isAutoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isAutoplay ? "Pause Autoplay" : "Autoplay"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Slideshow Workspace */}
      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden" ref={deckRef}>
        {/* Left Side: The Deck Container */}
        <div
          className={`relative flex flex-1 flex-col items-center bg-gradient-to-b from-slate-950 to-slate-900 transition-all ${
            isGridView ? "p-4 md:p-8 overflow-y-auto" : "justify-center p-6 lg:p-12"
          } ${isPresenterMode && !isGridView ? "lg:w-2/3" : "w-full"}`}
        >
          {isGridView ? (
            /* Grid View / Slide Sorter Mode */
            <div className="w-full max-w-6xl py-4 animate-fade-in">
              <div className="text-center mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Slide Gallery
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-1 font-display">
                  All Slides Preview
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                  Scroll and inspect all slides. Interactive controls are active. Click a slide background to jump directly to it in full slideshow mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
                {SLIDES.map((slide, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button, a, input")) {
                        return;
                      }
                      setActiveSlide(i);
                      setIsGridView(false);
                    }}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-900/40 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-sky-950/20 cursor-pointer ${
                      i === activeSlide
                        ? "border-sky-500 ring-1 ring-sky-500/30 bg-slate-900/60"
                        : "border-slate-800/80"
                    }`}
                  >
                    {/* Ambient glow behind card contents */}
                    <div className="absolute -left-10 -top-10 -z-10 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 -z-10 h-32 w-32 rounded-full bg-coral/5 blur-2xl" />

                    {/* Card Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                        {slide.title === "Mathchines" ? "Mission Intro" : slide.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Card Slide Body */}
                    <div className="flex-1 py-2 flex flex-col justify-center min-h-[180px]">
                      {renderSlideBody(i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Slide Wrapper (Slideshow Mode) */
            <div className="relative flex h-full max-h-[580px] w-full max-w-[960px] aspect-[16/9] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-sky-950/10 backdrop-blur-xl transition-all duration-500">
              {/* Ambient glows behind current slide content */}
              <div className="absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 -z-10 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />

              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  {SLIDES[activeSlide].title === "Mathchines" ? "Mission Intro" : SLIDES[activeSlide].title}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {String(activeSlide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
              </div>

              {/* Slide Body (Dynamic based on activeSlide) */}
              <div className="flex-1 py-6 flex flex-col justify-center">
                {renderSlideBody(activeSlide)}
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                <div className="flex items-center gap-1">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeSlide ? "w-6 bg-sky-400" : "w-1.5 bg-slate-700 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeSlide === 0}
                    onClick={() => setActiveSlide((prev) => prev - 1)}
                    className="rounded-full border border-slate-800 bg-slate-900/40 p-2 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={activeSlide === SLIDES.length - 1}
                    onClick={() => setActiveSlide((prev) => prev + 1)}
                    className="rounded-full border border-slate-800 bg-slate-900/40 p-2 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Presenter Notes Panel */}
        {isPresenterMode && !isGridView && (
          <aside className="border-t border-slate-800 bg-slate-900/40 p-6 lg:w-1/3 lg:border-l lg:border-t-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Users className="h-4 w-4" />
                Presenter Notes
              </div>
              <h4 className="mt-3 text-lg font-bold text-slate-100 font-display">
                Slide {activeSlide + 1}: {SLIDES[activeSlide].title}
              </h4>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {SLIDES[activeSlide].notes}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-800/60 pt-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Shortcuts</span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                <div className="rounded bg-slate-950 p-1.5 text-center">
                  <span className="text-sky-400 font-bold">Space/Right</span> Next Slide
                </div>
                <div className="rounded bg-slate-950 p-1.5 text-center">
                  <span className="text-sky-400 font-bold">Left Arrow</span> Prev Slide
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
