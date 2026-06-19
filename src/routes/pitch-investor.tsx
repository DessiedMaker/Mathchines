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
  DollarSign,
  BarChart3,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import piLogo from "@/assets/pi-logo.png";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/pitch-investor")({
  head: () => ({
    meta: [
      { title: "Mathchines Investor Pitch Deck — Scaling Global Math Literacy" },
      {
        name: "description",
        content: "Explore the investor presentation for Mathchines: capturing the $45B digital math learning opportunity via offline-first design and mobile micro-billing.",
      },
    ],
  }),
  component: InvestorPitchDeck,
});

interface Slide {
  title: string;
  subtitle: string;
  notes: string;
}

const SLIDES: Slide[] = [
  {
    title: "Executive Vision",
    subtitle: "Scaling Global Mathematics Literacy",
    notes: "Welcome investors. Today we are presenting Mathchines, a high-growth EdTech platform built to democratize mathematics education across both Western and emerging markets. Standard Western platforms ignore the infrastructure realities of the Global South, while local solutions lack world-class adaptivity. Mathchines bridges this gap. By coupling offline-first software architectures with direct carrier airtime billing, we tap into a massive, under-served market of over 250 million students in Sub-Saharan Africa, while maintaining premium subscription revenues in the US and Europe.",
  },
  {
    title: "Investment Thesis",
    subtitle: "Capturing the Unserved Middle Class",
    notes: "Why now, and why Mathchines? First, credit cards are a barrier in emerging markets; parents want to pay, but standard Stripe or App Store recurring fees fail due to lack of local credit card penetration. Mathchines bypasses this by integrating direct telecom carrier billing (GHS 1-2 per day via airtime), unlocking 5-10x higher billing conversions. Second, high internet data costs prevent video tutoring. Our offline-first sync engine allows students to download modular curriculum packages in seconds and practice for weeks completely offline.",
  },
  {
    title: "Market Opportunity",
    subtitle: "A Triple-Tiered Addressable Market",
    notes: "Let's review the size of our prize. The Global EdTech market is projected to reach $400B by 2030, which is our TAM. Our SAM focuses on digital K-12 mathematics tutoring in emerging economies and Western remedial markets, representing $45B. We have defined a highly reachable SOM of $2.5B. This SOM targets high-growth regions like Sub-Saharan Africa (specifically starting in Ghana, Nigeria, and Kenya) and low-connectivity/under-resourced schools in the US, using localized curriculums and micro-payments.",
  },
  {
    title: "Unit Economics",
    subtitle: "Calibrated Subscription Tiers",
    notes: "Our pricing structure is optimized for local purchasing power parity. In Western markets, our Premium Student tier is a standard SaaS subscription at $4.99/month. In Sub-Saharan Africa, we offer micro-subscriptions of GHS 1-2 per day, billed directly via cellular airtime. Since mobile money and airtime are standard cash equivalents, this local integration results in frictionless recurring revenue. For schools, we offer custom bulk licensing starting at $5 per student per year, including full teacher analytics dashboards.",
  },
  {
    title: "Growth Simulator",
    subtitle: "Interactive Projections Dashboard",
    notes: "We've built an interactive calculator so you can model our growth. By sliding the Monthly Active Users (MAUs), paid Conversion Rate, and Monthly ARPU, you can see how our Monthly Recurring Revenue (MRR) scales. For example, at 250,000 active users, a conservative 6% premium conversion, and a $2.00 blended monthly ARPU, Mathchines yields $30,000 MRR, which is a $360K Annual Run Rate. With an 8x SaaS valuation multiple, this represents a $2.88M implied company valuation. Notice how scaling MAUs in emerging markets directly builds enterprise value.",
  },
  {
    title: "Go-To-Market",
    subtitle: "Carrier Billing and Viral Distribution",
    notes: "Our distribution strategy relies on two main pillars: Telecom Carrier Partnerships and School District alignments. We are integrating direct carrier billing agreements with major network operators (MTN, Telecel, AirtelTigo). In exchange for subscription revenue shares, operators zero-rate the cellular data for Mathchines, meaning using the app costs the family nothing in data. This makes Mathchines effectively free to run, and the billing is handled in one click. School partnerships provide localized viral acquisition.",
  },
  {
    title: "Technology Moat",
    subtitle: "Lightweight Client & Adaptive Compiler",
    notes: "Mathchines has built a proprietary technology stack. First, our Localized Curriculum Compiler allows us to ingest any national syllabus (like Ghana's GES or Nigeria's NERDC) via LLM mapping schemas and spit out a fully structured learning map in hours. Second, our client application is a lightweight Progressive Web App optimized for low-end $50 Android devices. It stores all lessons and quiz engines locally using IndexDB, syncing progress to our Supabase database in tiny JSON packets when connection allows.",
  },
  {
    title: "Funding Request",
    subtitle: "The $1.5M Seed Allocation",
    notes: "We are raising a $1.5M Seed Round to accelerate our milestones over the next 18 months. We will allocate 45% ($675K) to Product Development and Core Engineering to refine our offline sync engine and build out the teacher analytics suite. 30% ($450K) will fund Telecom Partnerships, direct API integrations, and carrier-billing security. 25% ($375K) is set aside for Curriculum Expansion to support WAEC/NECO exams in Nigeria and expand GCSE support in the UK.",
  },
  {
    title: "Roadmap & Exit",
    subtitle: "The 3-Year Scaling Lifecycle",
    notes: "Our roadmap leads to a high-value exit or Series A. In Year 1, we secure product-market fit in Ghana, targeting 50k MAUs. In Year 2, we launch direct carrier billing integrations and expand to Nigeria and Kenya, aiming for 250k MAUs and $500K ARR. By Year 3, we target 1 million active users and $2M+ ARR across Sub-Saharan Africa and Western remedial cohorts. Mathchines is positioning to be the dominant math learning gateway for the emerging middle class globally. Thank you, and we welcome your questions.",
  },
];

function InvestorPitchDeck() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isGridView, setIsGridView] = useState(false);

  // Growth Simulator Levers
  const [mau, setMau] = useState(150000); // 10k to 1M
  const [conversion, setConversion] = useState(5.0); // 1% to 15%
  const [arpu, setArpu] = useState(2.5); // $0.50 to $10.00

  const [isMounted, setIsMounted] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  // SSR Safe Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      }, 6000);
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

  // Projections calculations
  const paidSubscribers = Math.round(mau * (conversion / 100));
  const mrr = paidSubscribers * arpu;
  const arr = mrr * 12;
  const valuation = arr * 8; // 8x Multiple

  // Chart data points for simulator
  const chartData = [
    { year: "Year 1 (Launch)", arr: Math.round(arr * 0.25), subscribers: Math.round(paidSubscribers * 0.25) },
    { year: "Year 2 (Expansion)", arr: Math.round(arr * 0.65), subscribers: Math.round(paidSubscribers * 0.65) },
    { year: "Year 3 (Scale)", arr: Math.round(arr), subscribers: Math.round(paidSubscribers) },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const formatNumber = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const renderSlideBody = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="text-center animate-fade-in space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 shadow-inner border border-emerald-500/20">
              <img src={piLogo} alt="Mathchines Pi" className="h-14 w-14 object-contain animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="rounded-full bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                Seed Presentation Deck v1.0
              </span>
              <h2 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent font-display sm:text-6xl pt-2">
                Mathchines
              </h2>
              <p className="mt-4 text-lg font-medium text-slate-300 max-w-xl mx-auto leading-relaxed">
                Scaling global mathematics literacy through offline-first micro-billing.
              </p>
            </div>
            <div className="flex justify-center gap-4 text-xs pt-4">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                <Coins className="h-4 w-4 text-emerald-400" />
                <span>$45B addressable SAM</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                <span>Micro-billing model</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>Carrier Integrated Moat</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">Unlocking the Frictionless Path</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                EdTech platforms in the West require credit cards and 4G internet. Emerging markets have cash equivalents (airtime/mobile money) and low-connectivity devices. Mathchines bypasses these bottlenecks directly.
              </p>
              <div className="border-l-4 border-emerald-500 bg-emerald-500/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  "By delivering fully curriculum-aligned offline lessons, and integrating carrier micro-subscriptions, we reach 10x more subscribers."
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Direct Billing", desc: "Pay GHS 1-2 per day via phone airtime. No credit card required.", icon: Coins, color: "text-emerald-400 bg-emerald-500/10" },
                { title: "Zero-Rated Data", desc: "Zero data costs for subscribers via telecom partner proxy agreements.", icon: Globe2, color: "text-teal-400 bg-teal-500/10" },
                { title: "Offline-First Engine", desc: "Entire syllabus sets downloaded in seconds. Playable offline.", icon: WifiOff, color: "text-sky-400 bg-sky-500/10" },
                { title: "Syllabus Mapper", desc: "Adapts automatically to GES, WAEC, CCSS, and national curricula.", icon: Brain, color: "text-purple-400 bg-purple-500/10" },
              ].map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${p.color}`}>
                      <p.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{p.title}</span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 leading-normal">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">A Massive Market Opportunity</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Our initial target markets address high-growth remedial segments in the US (under-resourced schools) and standard primary/secondary segments in Sub-Saharan Africa (where parents prioritize tutoring spend above all else).
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="border border-slate-800 bg-slate-900/40 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-slate-400">TAM</div>
                  <div className="text-lg font-extrabold text-white">$400B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">Global K-12 EdTech</span>
                </div>
                <div className="border border-slate-800 bg-slate-900/40 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-teal-400 font-semibold">SAM</div>
                  <div className="text-lg font-extrabold text-teal-300">$45B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">Digital Math Tutoring</span>
                </div>
                <div className="border border-emerald-950 bg-emerald-950/20 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-emerald-400 font-semibold font-display">SOM</div>
                  <div className="text-lg font-extrabold text-emerald-400">$2.5B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">Emerging Micro-Sub Markets</span>
                </div>
              </div>
            </div>
            {/* Concentric Market Size Representation */}
            <div className="relative aspect-[4/3] flex items-center justify-center p-4 border border-slate-800 bg-slate-950/30 rounded-2xl">
              <div className="w-full max-w-[280px] aspect-square rounded-full border border-slate-800 bg-slate-900/10 flex items-center justify-center relative p-6">
                <span className="absolute top-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">TAM: $400 Billion</span>
                
                <div className="w-4/5 aspect-square rounded-full border border-teal-800 bg-teal-950/10 flex items-center justify-center relative p-6">
                  <span className="absolute top-4 text-[9px] font-mono text-teal-500 uppercase tracking-widest font-bold">SAM: $45 Billion</span>
                  
                  <div className="w-2/3 aspect-square rounded-full border border-emerald-500/40 bg-emerald-950/40 flex flex-col items-center justify-center text-center relative p-2 shadow-lg shadow-emerald-950/35">
                    <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-1">SOM</span>
                    <span className="text-xl font-black text-white font-display">$2.5B</span>
                    <span className="text-[8px] text-slate-300 leading-none max-w-[70px] mt-1 font-semibold">Africa + US Remedial Math</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-6 md:grid-cols-3 animate-fade-in items-center">
            <div className="flex flex-col justify-center space-y-3">
              <h3 className="text-2xl font-bold font-display text-slate-100">Subscription & Economics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                By aligning subscriber wallets with localized pricing, we ensure low churn. Airtime integration allows families to subscribe day-by-day based on current budget liquidity.
              </p>
              <div className="pt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Telecom Billing integration live in Ghana</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">AFRICA MICRO-TIER</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">High Volume</span>
                </div>
                <h4 className="text-3xl font-extrabold text-white font-display">
                  GHS 1 - 2
                  <span className="text-xs font-normal text-slate-400"> / day airtime</span>
                </h4>
                <ul className="text-[10px] text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Billed directly via carrier SMS logic</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Free cellular data (Zero-rated)</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Offline access to school syllabi</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider">WESTERN PREMIUM</span>
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-bold text-sky-400">High ARPU</span>
                </div>
                <h4 className="text-3xl font-extrabold text-white font-display">
                  $4.99
                  <span className="text-xs font-normal text-slate-400"> / month card</span>
                </h4>
                <ul className="text-[10px] text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-400" /> Standard web/app credit card billing</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-400" /> AI personalized tutor modules</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-400" /> Weekly parent analytics report</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid gap-6 lg:grid-cols-5 items-center animate-fade-in">
            {/* Controls (2/5 size) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Revenue Projections
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Drag the levers below to model Mathchines' subscriber conversions, pricing ARPU, and valuation potential.
              </p>

              <div className="space-y-3 pt-2">
                {/* Lever 1: MAU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Monthly Active Users (MAU)</span>
                    <span className="font-bold text-emerald-400">{formatNumber(mau)}</span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="1000000"
                    step="10000"
                    value={mau}
                    onChange={(e) => setMau(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>20k</span>
                    <span>500k</span>
                    <span>1M</span>
                  </div>
                </div>

                {/* Lever 2: Conversion */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Paid Conversion Rate</span>
                    <span className="font-bold text-teal-400">{conversion.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={conversion}
                    onChange={(e) => setConversion(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>1%</span>
                    <span>8%</span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Lever 3: ARPU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Monthly Blended ARPU</span>
                    <span className="font-bold text-sky-400">${arpu.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.25"
                    value={arpu}
                    onChange={(e) => setArpu(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>$0.50</span>
                    <span>$5.00</span>
                    <span>$10.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Dashboard & Live Area Chart (3/5 size) */}
            <div className="lg:col-span-3 grid grid-cols-3 gap-3 border border-slate-800 bg-slate-950/40 p-4 rounded-2xl relative">
              <div className="border border-slate-900/60 bg-slate-900/20 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Paid Subs</span>
                <span className="text-lg font-extrabold text-white mt-1 block">{formatNumber(paidSubscribers)}</span>
              </div>
              <div className="border border-slate-900/60 bg-slate-900/20 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">ARR (Annual)</span>
                <span className="text-lg font-extrabold text-emerald-400 mt-1 block">{formatCurrency(arr)}</span>
              </div>
              <div className="border border-emerald-950/60 bg-emerald-950/10 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-emerald-400 font-mono uppercase block">Valuation (8x)</span>
                <span className="text-lg font-extrabold text-teal-300 mt-1 block">{formatCurrency(valuation)}</span>
              </div>

              {/* Projections Area Chart */}
              <div className="col-span-3 pt-3">
                <span className="text-[9px] text-slate-500 font-mono block mb-2 text-center uppercase tracking-wider">
                  3-Year Projected ARR Curve (Scale Base)
                </span>
                
                {isMounted ? (
                  <div className="h-[120px] w-full">
                    <ChartContainer
                      config={{
                        arr: {
                          label: "ARR Run Rate",
                          color: "var(--color-emerald)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: "#64748b", fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v)}
                          tick={{ fill: "#64748b", fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                          width={35}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(l) => `Milestone: ${l}`}
                              formatter={(value) => [formatCurrency(Number(value)), "Projected ARR"]}
                            />
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="arr"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorArr)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                ) : (
                  /* Skeletons/fallback for SSR compiler loading stage */
                  <div className="h-[120px] w-full flex items-center justify-center bg-slate-900/10 border border-dashed border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-mono animate-pulse">Initializing projection engine...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">Telecom & Growth Moats</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Our primary acquisition engine relies on direct integration agreements with leading national carriers. Zero-rating removes user friction while carrier billing shares standard merchant revenue margins in exchange for bulk user placement.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-2 text-center flex-1">
                  <div className="text-xs text-emerald-400 font-bold">1-Click Billing</div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Airtime direct deduct</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-2 text-center flex-1">
                  <div className="text-xs text-teal-400 font-bold">Zero-Rated Data</div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">No internet data fees</span>
                </div>
              </div>
            </div>

            {/* Carrier Distribution Funnel Visualization */}
            <div className="space-y-3 p-4 border border-slate-800 bg-slate-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-2">Carrier Distribution Loop</span>
              {[
                { step: "01. Telco API Hook", label: "MTN, Telecel integration yields instant billing token", pct: "100%", width: "w-full", bg: "bg-emerald-500" },
                { step: "02. Zero-Rating Proxy", label: "No data costs bars data-drain dropouts", pct: "85%", width: "w-[85%]", bg: "bg-teal-500" },
                { step: "03. Classroom Viral Loop", label: "Teachers push content to parental contacts via SMS", pct: "65%", width: "w-[65%]", bg: "bg-sky-500" },
                { step: "04. Daily Churn Protection", label: "Automatic micro-renewal reduces drop-offs", pct: "40%", width: "w-[40%]", bg: "bg-purple-500" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono leading-none">
                    <span className="text-slate-300 font-bold">{item.step}</span>
                    <span className="text-slate-500">{item.label}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-900 overflow-hidden relative border border-slate-800/40">
                    <div className={`h-full ${item.bg} ${item.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">Technology Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Mathchines is engineered to survive low bandwidth. By separating the static curriculum schema from the adaptive client evaluation, we can package full courses into tiny index files.
              </p>
              <div className="border-l-4 border-teal-500 bg-teal-500/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  "Our offline database syncing guarantees that a student can learn, quiz, and level up for weeks without connecting to a cellular tower."
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { title: "Curriculum Compiler", desc: "AI maps raw PDF syllabi directly into structured adaptive trees matching national exams (GES, WAEC)." },
                { title: "Lightweight Client (PWA)", desc: "Optimized for Android Go & low RAM devices. Total initial assets bundle is less than 3.5MB." },
                { title: "Supabase Delta Sync", desc: "Saves client telemetry locally, syncing using compressed delta patches when connectivity restores." },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950/20 p-3 hover:border-slate-700 transition-all">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                    {item.title}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">Seed Funding Allocation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                We are raising $1.5M Seed Capital to complete integrations, expand national standard mappings, and build carrier billing pipelines.
              </p>
              <div className="border border-emerald-950/60 bg-emerald-950/10 p-4 rounded-xl text-center">
                <span className="text-xs text-slate-400 block font-semibold uppercase">The Funding Ask</span>
                <span className="text-3xl font-black text-white font-display block mt-1">$1.5 Million Seed</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">18-Month Operational Runway</span>
              </div>
            </div>
            {/* Segmented Funding Allocation Display */}
            <div className="space-y-4 p-5 border border-slate-800 bg-slate-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-2">Fund Allocation Breakdown</span>
              {[
                { label: "Product Engineering (Offline sync, Teacher dashboards)", pct: "45%", val: "$675k", bar: "w-[45%]", color: "bg-emerald-500" },
                { label: "Telecom partnerships & Direct API integration", pct: "30%", val: "$450k", bar: "w-[30%]", color: "bg-teal-500" },
                { label: "Curriculum Maps & local expansion (NGA, KEN, UK)", pct: "25%", val: "$375k", bar: "w-[25%]", color: "bg-sky-500" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] leading-tight">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="font-mono font-bold text-slate-100">{item.pct} <span className="text-[8px] text-slate-500">({item.val})</span></span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-900 overflow-hidden">
                    <div className={`h-full ${item.color} ${item.bar}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="text-center animate-fade-in space-y-6">
            <h3 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent font-display sm:text-5xl">
              Partner with Mathchines
            </h3>
            <p className="mt-4 text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              We are opening mathematical literacy to billions of minds globally by meeting students where they are — on budget phones, without data, and paying standard local micro-denominations.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/"
                className="rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                Return to Homepage
              </Link>
              <Link
                to="/pitch"
                className="rounded-full border border-slate-700 bg-slate-900 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Inspect Product Deck
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased select-none dark">
      {/* Header Panel */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={piLogo} alt="Mathchines Logo" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white font-display">Mathchines</span>
          </Link>
          <span className="rounded-full bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 text-[10px] font-semibold text-emerald-400">
            Investor Presentation v1.0
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
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
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
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
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
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
                  Investor Deck Overview
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-1 font-display">
                  Slide Sorter
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                  Click on any slide to jump directly to it in full-screen slideshow mode. All interactive simulation controls are active inside the previews.
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
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-900/40 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-emerald-950/20 cursor-pointer ${
                      i === activeSlide
                        ? "border-emerald-500 ring-1 ring-emerald-500/30 bg-slate-900/60"
                        : "border-slate-800/80"
                    }`}
                  >
                    {/* Ambient glow behind card contents */}
                    <div className="absolute -left-10 -top-10 -z-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 -z-10 h-32 w-32 rounded-full bg-teal-500/5 blur-2xl" />

                    {/* Card Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        {slide.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Card Slide Body */}
                    <div className="flex-1 py-2 flex flex-col justify-center min-h-[220px]">
                      {renderSlideBody(i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Slide Wrapper (Slideshow Mode) */
            <div className="relative flex h-full max-h-[580px] w-full max-w-[960px] aspect-[16/9] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl transition-all duration-500">
              {/* Ambient glows behind current slide content */}
              <div className="absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 -z-10 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {SLIDES[activeSlide].title}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">
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
                        i === activeSlide ? "w-6 bg-emerald-400" : "w-1.5 bg-slate-700 hover:bg-slate-500"
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Users className="h-4 w-4" />
                Presenter Notes
              </div>
              <h4 className="text-lg font-bold text-slate-100 font-display">
                Slide {activeSlide + 1}: {SLIDES[activeSlide].title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[300px]">
                {SLIDES[activeSlide].notes}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-800/60 pt-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Shortcuts</span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                <div className="rounded bg-slate-950 p-1.5 text-center">
                  <span className="text-emerald-400 font-bold">Space/Right</span> Next Slide
                </div>
                <div className="rounded bg-slate-950 p-1.5 text-center">
                  <span className="text-emerald-400 font-bold">Left Arrow</span> Prev Slide
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
