import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
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
  ShieldCheck,
  Award,
  Globe2,
  ArrowRight,
  Zap,
  LayoutGrid,
  Presentation,
  BookOpen,
  FileText,
  Copy,
  PenSquare,
  Sparkle,
  Mail,
  Lock,
  Loader2,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ParsedSlide, parseMarkdownToDecks } from "@/lib/pitchParser";
import { generateDeckFromDocument } from "@/lib/api/pitch.functions";
import piLogo from "@/assets/pi-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { User } from "@supabase/supabase-js";

// Dialog components from shadcn UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SlideDeckPlayerProps {
  initialSlides: ParsedSlide[];
  deckTitle: string;
  defaultDeckType: "product" | "investor" | "custom";
}

export function SlideDeckPlayer({
  initialSlides,
  deckTitle,
  defaultDeckType,
}: SlideDeckPlayerProps) {
  const [slides, setSlides] = useState<ParsedSlide[]>(initialSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [deckType, setDeckType] = useState<"product" | "investor" | "custom">(defaultDeckType);
  const [currentDeckName, setCurrentDeckName] = useState(deckTitle);

  // Custom slide states (Product Deck)
  const [activePersona, setActivePersona] = useState(0);
  const [isGhsCurrency, setIsGhsCurrency] = useState(false);
  const [solutionMode, setSolutionMode] = useState<"before" | "after">("after");

  // Custom slide states (Investor Deck)
  const [mau, setMau] = useState(250000);
  const [conversion, setConversion] = useState(6.0);
  const [arpu, setArpu] = useState(2.0);

  // Auth states for interactive slide
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authLoading, setAuthLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("password123");
  const [authDisplayName, setAuthDisplayName] = useState("");

  // Sync auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSlideAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        if (!authEmail.trim() || !authPassword.trim() || !authDisplayName.trim()) {
          toast.error("Please fill in all fields.");
          setAuthLoading(false);
          return;
        }
        if (authPassword.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setAuthLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}learn`,
            data: { display_name: authDisplayName },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("This email is already registered. Try signing in.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Account created! Welcome to Mathchines.");
      } else {
        if (!authEmail.trim() || !authPassword.trim()) {
          toast.error("Please enter email and password.");
          setAuthLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Invalid email or password."
              : error.message
          );
          return;
        }

        toast.success("Welcome back! You are signed in.");
      }
    } catch (err: any) {
      toast.error(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSlideGoogleAuth = async () => {
    setAuthLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${import.meta.env.BASE_URL}learn`,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setAuthLoading(false);
    }
  };

  const handleSlideSignOut = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success("Successfully signed out.");
    } catch (err: any) {
      toast.error(err.message || "Sign out failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Dialog States
  const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = useState(false);
  const [isGenDialogOpen, setIsGenDialogOpen] = useState(false);
  const [pasteMarkdownText, setPasteMarkdownText] = useState("");
  const [documentInputText, setDocumentInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setSlides(initialSlides);
    setActiveSlide(0);
    setDeckType(defaultDeckType);
    setCurrentDeckName(deckTitle);
  }, [initialSlides, deckTitle, defaultDeckType]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGridView || isMarkdownDialogOpen || isGenDialogOpen) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveSlide((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGridView, slides.length, isMarkdownDialogOpen, isGenDialogOpen]);

  // Autoplay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay && !isGridView) {
      interval = setInterval(() => {
        setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, isGridView, slides.length]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckRef.current
        ?.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Projections calculations (Investor Deck Simulator)
  const paidSubscribers = Math.round(mau * (conversion / 100));
  const mrr = paidSubscribers * arpu;
  const arr = mrr * 12;
  const valuation = arr * 8; // 8x Multiple

  const chartData = [
    {
      year: "Year 1 (Launch)",
      arr: Math.round(arr * 0.25),
      subscribers: Math.round(paidSubscribers * 0.25),
    },
    {
      year: "Year 2 (Expansion)",
      arr: Math.round(arr * 0.65),
      subscribers: Math.round(paidSubscribers * 0.65),
    },
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

  // Custom markdown paste handler
  const handleLoadCustomMarkdown = () => {
    if (!pasteMarkdownText.trim()) {
      toast.error("Please enter markdown slide contents first.");
      return;
    }
    try {
      const parsed = parseMarkdownToDecks(pasteMarkdownText);
      const customSlides = [...parsed.productSlides, ...parsed.investorSlides];
      if (customSlides.length === 0) {
        toast.error("No slides detected. Split slides with '---' boundaries.");
        return;
      }
      setSlides(customSlides);
      setActiveSlide(0);
      setDeckType("custom");
      setCurrentDeckName("Custom Slide Deck");
      setIsMarkdownDialogOpen(false);
      toast.success(`Successfully loaded ${customSlides.length} custom slides.`);
    } catch (err) {
      toast.error("Failed to parse markdown slide deck.");
    }
  };

  // AI Generation handler
  const handleGenerateAIDeck = async () => {
    if (documentInputText.trim().length < 15) {
      toast.error("Please enter a longer document context for better AI slides.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await generateDeckFromDocument({ data: { documentText: documentInputText } });
      const parsed = parseMarkdownToDecks(response.markdown);
      const aiSlides = [...parsed.productSlides, ...parsed.investorSlides];
      if (aiSlides.length === 0) {
        toast.error("AI generated deck, but we failed to parse slides from it.");
        return;
      }
      setSlides(aiSlides);
      setActiveSlide(0);
      setDeckType("custom");
      setCurrentDeckName("AI Generated Deck");
      setIsGenDialogOpen(false);
      toast.success(`Successfully generated ${aiSlides.length} slides with Gemini AI!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate deck using Gemini AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    const rawMarkdown = slides
      .map((s) => {
        let text = "";
        if (s.bg) text += `<!-- bg: ${s.bg} -->\n`;
        if (s.color) text += `<!-- color: ${s.color} -->\n`;
        if (s.title) text += `# ${s.title}\n\n`;
        if (s.subtitle) text += `### ${s.subtitle}\n\n`;
        if (s.bullets.length > 0) {
          text += s.bullets.map((b) => `- ${b}`).join("\n") + "\n\n";
        }
        if (s.table) {
          text += `| ${s.table.headers.join(" | ")} |\n`;
          text += `| ${s.table.headers.map(() => "---").join(" | ")} |\n`;
          text += s.table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n") + "\n\n";
        }
        if (s.mermaid) {
          text += `\`\`\`mermaid\n${s.mermaid}\`\`\`\n\n`;
        }
        if (s.rawContent) {
          text += `${s.rawContent}\n\n`;
        }
        if (s.notes) {
          text += `> **Presenter Notes:**\n> ` + s.notes.split("\n").join("\n> ") + "\n";
        }
        return text.trim();
      })
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(rawMarkdown);
    toast.success("Deck markdown copied to clipboard!");
  };

  // Slide renderer logic
  const renderSlideBody = (slide: ParsedSlide, index: number) => {
    const titleLower = slide.title.toLowerCase();

    // Custom Interactive Authentication Slide template
    if (titleLower.includes("secure authentication") || titleLower.includes("authentication")) {
      return (
        <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in text-left">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-100 font-display">
              {slide.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {slide.subtitle || "Frictionless Learner Identity & Progress Preservation"}
            </p>
            
            <ul className="mt-4 space-y-3">
              {slide.bullets.map((bullet, idx) => {
                const parts = bullet.split(/[:·]/);
                const heading = parts[0]?.replace(/\*\*/g, "").trim() || "Security";
                const desc = parts.slice(1).join(":")?.replace(/\*\*/g, "").trim() || "";
                
                return (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Check className="h-3 w-3" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{heading}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Interactive Auth Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl backdrop-blur-md max-w-sm w-full mx-auto relative overflow-hidden">
            <div className="absolute -left-10 -top-10 -z-10 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl" />
            
            {currentUser ? (
              /* User is Logged In: Show Stats Card */
              <div className="space-y-4 text-center animate-fade-in py-2">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">Active Session Verified</h4>
                  <p className="text-[10px] text-sky-400 mt-0.5">{currentUser.email}</p>
                </div>

                <div className="rounded-xl bg-slate-900/60 border border-slate-850 p-3 text-left space-y-2.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-1">
                    Student Dashboard Live
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Streak:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      🔥 3 days
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Level:</span>
                    <span className="font-bold text-white">Level 1 Math Machine</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">XP Points:</span>
                    <span className="font-bold text-sky-400">120 XP</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Link
                    to="/learn"
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-sky-400 shadow-md shadow-sky-500/20"
                  >
                    Go to Learn <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={handleSlideSignOut}
                    disabled={authLoading}
                    className="rounded-lg border border-slate-850 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {authLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* User is Logged Out: Show Interactive Sign-In / Sign-Up Form */
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className={`flex-1 text-center py-1 rounded text-xs font-semibold transition-all ${
                      authMode === "signin"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`flex-1 text-center py-1 rounded text-xs font-semibold transition-all ${
                      authMode === "signup"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSlideAuthSubmit} className="space-y-2.5">
                  {authMode === "signup" && (
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Display Name"
                        value={authDisplayName}
                        onChange={(e) => setAuthDisplayName(e.target.value)}
                        className="w-full rounded-lg border border-slate-850 bg-slate-900/60 px-9 py-2 text-xs text-white outline-none focus:border-sky-500/40"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@school.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-850 bg-slate-900/60 px-9 py-2 text-xs text-white outline-none focus:border-sky-500/40"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-850 bg-slate-900/60 px-9 py-2 text-xs text-white outline-none focus:border-sky-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-sky-400 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        {authMode === "signin" ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-850" />
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">or</span>
                  <div className="h-px flex-1 bg-slate-850" />
                </div>

                <button
                  type="button"
                  onClick={handleSlideGoogleAuth}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-850 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-850 disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 1. Check for Product Deck Custom templates
    if (deckType === "product") {
      if (titleLower === "mathchines") {
        return (
          <div className="text-center animate-fade-in space-y-4">
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10 shadow-inner">
              <img src={piLogo} alt="Mathchines Pi" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="bg-gradient-to-r from-sky-400 via-emerald-400 to-coral bg-clip-text text-5xl font-extrabold tracking-tight text-transparent font-display sm:text-6xl">
              {slide.title}
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-300 max-w-xl mx-auto">
              {slide.subtitle || "Making Math Enjoyable for Every Student"}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {slide.bullets.map((bullet, idx) => {
                const parts = bullet.split("·");
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs"
                  >
                    {idx === 0 && <Globe2 className="h-4 w-4 text-emerald-400" />}
                    {idx === 1 && <Brain className="h-4 w-4 text-sky-400" />}
                    {idx === 2 && <WifiOff className="h-4 w-4 text-coral" />}
                    <strong>{parts[0]?.trim()}</strong> {parts[1] && `· ${parts[1].trim()}`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower === "the problem") {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.subtitle || "Why Mathematics is Feared Globally"}
              </h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Traditional mathematics instruction leaves students struggling. Without personalization
                or immediate support, they hit brick walls.
              </p>
              <div className="mt-6 border-l-4 border-coral bg-coral/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  No single math platform is purpose-built for both African and Western curricula. Most
                  require fast internet and are priced out of reach.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {slide.bullets.map((b, idx) => {
                const parts = b.split(":");
                const heading = parts[0]?.trim() || "Bottleneck";
                const desc = parts[1]?.trim() || "";
                return (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                    <div className="text-xs font-bold text-coral flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
                      {heading}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-tight">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower === "the solution") {
        return (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-slate-800 mb-6">
              <button
                onClick={() => setSolutionMode("before")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  solutionMode === "before"
                    ? "bg-coral text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Before Mathchines
              </button>
              <button
                onClick={() => setSolutionMode("after")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  solutionMode === "after"
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                After Mathchines
              </button>
            </div>

            {solutionMode === "before" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-center">
                {[
                  {
                    title: "Frustrated Learners",
                    desc: "Students stuck on homework with zero help.",
                  },
                  { title: "Internet Dependency", desc: "Lessons don't load when data runs out." },
                  {
                    title: "Rigid Curricula",
                    desc: "Content aligned to Western standards doesn't help local schools.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 relative overflow-hidden"
                  >
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
                {slide.table?.rows.map((row, idx) => {
                  const afterCol = row[1] || "";
                  const parts = afterCol.split("·");
                  const head = parts[0]?.trim() || "Solution";
                  const desc = parts[1]?.trim() || "";
                  const icons = [Brain, WifiOff, Globe2];
                  const colors = ["text-sky-400", "text-coral", "text-emerald-400"];
                  const SelectedIcon = icons[idx % icons.length] || Brain;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-sky-950/40 bg-sky-950/15 p-5 relative overflow-hidden transition-all hover:border-sky-500/20"
                    >
                      <div className="absolute right-3 top-3 rounded-full bg-sky-500/10 p-1.5">
                        <SelectedIcon className={`h-4 w-4 ${colors[idx % colors.length]}`} />
                      </div>
                      <h4 className="font-semibold text-slate-100 text-sm mt-2">{head}</h4>
                      <p className="mt-2 text-xs text-slate-400">{desc}</p>
                    </div>
                  );
                }) || (
                  <div className="text-slate-400 text-xs">Error parsing solution rows.</div>
                )}
              </div>
            )}
          </div>
        );
      }

      if (titleLower.includes("personas")) {
        return (
          <div className="grid gap-6 md:grid-cols-5 animate-fade-in h-full items-center">
            <div className="md:col-span-2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-display text-slate-100">{slide.title}</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {slide.subtitle || "Meeting Learners Where They Are"}
              </p>
              <div className="mt-4 flex gap-1.5">
                {slide.bullets.map((b, i) => {
                  const name = b.split("·")[0] || `Persona ${i + 1}`;
                  return (
                    <button
                      key={i}
                      onClick={() => setActivePersona(i)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                        activePersona === i
                          ? "bg-sky-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3">
              {slide.bullets.map((b, i) => {
                if (activePersona !== i) return null;
                const parts = b.split("·");
                const nameSection = parts[0]?.trim() || "";
                const role = parts[1]?.trim() || "Learner";
                
                const points = parts.slice(2).map((p) => {
                  const subParts = p.split(":");
                  return {
                    label: subParts[0]?.trim() || "Item",
                    val: subParts[1]?.trim() || "",
                  };
                });

                const icons = [Users, GraduationCap, WifiOff];
                const colors = ["text-sky-400 bg-sky-500/10", "text-emerald-400 bg-emerald-500/10", "text-coral bg-coral/10"];
                const SelectedIcon = icons[i % icons.length] || Users;

                return (
                  <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-lg p-2 ${colors[i % colors.length]}`}>
                        <SelectedIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{nameSection}</h4>
                        <span className="text-[10px] text-sky-400">{role}</span>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      {points.map((pt, pIdx) => (
                        <li key={pIdx}>
                          <strong>{pt.label}:</strong> {pt.val}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("student success loop") || titleLower.includes("learning journey")) {
        const defaultSteps = [
          { step: "01", label: "Select Grade", icon: Globe2, desc: "GES, CCSS, NERDC syllabus instantly mapped." },
          { step: "02", label: "Diagnostic", icon: Brain, desc: "5-question gap quiz sets starting point." },
          { step: "03", label: "Visual Lesson", icon: Play, desc: "Expert animations explaining core concept." },
          { step: "04", label: "Adaptive Practice", icon: Zap, desc: "IRT difficulty adjusts in real time." },
          { step: "05", label: "Correction", icon: Sparkles, desc: "Error correction details why you failed." },
          { step: "06", label: "Mastery Badge", icon: Award, desc: "Gain XP, streaks, and custom rewards." },
        ];

        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold font-display text-center mb-6 text-slate-100">
              {slide.title}
            </h3>
            <div className="grid grid-cols-6 gap-2 relative">
              {defaultSteps.map((s, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all group cursor-pointer"
                >
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
      }

      if (titleLower.includes("benchmarks")) {
        return (
          <div className="animate-fade-in flex flex-col justify-center">
            <h3 className="text-xl font-bold font-display text-center mb-4 text-slate-100">
              {slide.subtitle || "Closing the Competitive Gaps"}
            </h3>
            {slide.table ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      {slide.table.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className={`p-3 text-[10px] uppercase font-bold ${
                            hIdx === 1 ? "text-sky-400 font-black" : "text-slate-400"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {slide.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/10">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-3 ${
                              cIdx === 0
                                ? "font-medium text-slate-200"
                                : cIdx === 1
                                ? "text-sky-400 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            {cell.includes("(✓)") || cell.includes("Yes") || cell.trim() === "✓" ? (
                              <Check className="h-4.5 w-4.5 text-sky-400" />
                            ) : cell.includes("(✕)") || cell.includes("No") || cell.trim() === "✕" ? (
                              <X className="h-4.5 w-4.5 text-slate-600" />
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Table parsing failed.</div>
            )}
          </div>
        );
      }

      if (titleLower.includes("monetization") || titleLower.includes("pricing")) {
        return (
          <div className="grid gap-6 md:grid-cols-3 animate-fade-in items-center">
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-display text-slate-100">{slide.title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {slide.subtitle || "Calibrated for Global Affordability"}
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
              {slide.bullets.map((b, idx) => {
                if (idx === 0) return null; // Skip free tier representation to keep it clean
                const parts = b.split("-") || [b];
                const heading = parts[0]?.trim() || "Plan";
                const isPremium = heading.toLowerCase().includes("premium");
                const price = isPremium ? (isGhsCurrency ? "GHS 2" : "$4.99") : "Custom";
                const subText = isPremium ? (isGhsCurrency ? "/day airtime" : "/month") : "Bulk seat licensing";

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 ${
                      isPremium
                        ? "border-sky-500/20 bg-sky-950/10 shadow-lg shadow-sky-950/5"
                        : "border-slate-800 bg-slate-950/40"
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isPremium ? "text-sky-400" : "text-emerald-400"}`}>
                      {heading.toUpperCase()}
                    </span>
                    <h4 className="text-3xl font-extrabold text-white mt-1">
                      {price}
                      <span className="text-xs font-normal text-slate-400">{subText}</span>
                    </h4>
                    <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                      {parts.slice(1).join("-")?.trim()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("roadmap") || titleLower.includes("timeline")) {
        const milestones = [
          { title: "Discovery", date: "Weeks 1-2", desc: "Curriculum mapping & stack definition.", status: "completed" },
          { title: "Design", date: "Weeks 3-4", desc: "Wireframes, UI mockups, adaptive spec.", status: "completed" },
          { title: "MVP Build", date: "Weeks 5-6", desc: "Core engines & offline capabilities.", status: "current" },
          { title: "Launch", date: "Week 7", desc: "Ghana & US launch, micro-airtime payments.", status: "upcoming" },
        ];

        return (
          <div className="animate-fade-in flex flex-col justify-center h-full">
            <h3 className="text-xl font-bold font-display text-center mb-6 text-slate-100">
              {slide.title}
            </h3>
            <div className="relative border-t border-slate-800 pt-8 mt-4 grid grid-cols-4 gap-4">
              {milestones.map((m, idx) => {
                const positions = ["left-0", "left-1/4", "left-2/4", "left-3/4"];
                const pos = positions[idx] || "left-0";

                let dotClass = "bg-slate-700";
                if (m.status === "completed") {
                  dotClass = "bg-sky-500";
                } else if (m.status === "current") {
                  dotClass = "bg-coral ring-4 ring-coral/20";
                }

                return (
                  <div key={idx}>
                    <div className={`absolute top-0 -translate-y-1/2 ${pos} h-3 w-3 rounded-full ${dotClass}`} />
                    {m.status === "current" && (
                      <div className={`absolute top-0 -translate-y-1/2 ${pos} h-3 w-3 rounded-full bg-coral animate-ping`} />
                    )}
                  </div>
                );
              })}

              {milestones.map((step, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className={`text-[9px] font-bold ${step.status === 'current' ? 'text-coral' : 'text-sky-400'}`}>
                    {step.date} {step.status === 'current' && '(In Progress)'}
                  </span>
                  <h4 className="font-bold text-xs text-slate-200 mt-1">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (titleLower.includes("metrics") || titleLower.includes("kpis")) {
        const gauges = [
          { label: "Weekly Retention", pct: "≥ 45%", bar: "w-[45%]", color: "bg-sky-500" },
          { label: "Daily Active Time", pct: "15+ Min", bar: "w-[75%]", color: "bg-violet-500" },
          { label: "Math Score Gains", pct: "≥ 22%", bar: "w-[65%]", color: "bg-emerald-500" },
          { label: "Offline Resilience", pct: "≥ 35%", bar: "w-[35%]", color: "bg-amber-500" },
        ];

        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-100">{slide.title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                {slide.subtitle || "Key Performance Indicators for Core Validation"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {gauges.map((m, idx) => (
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
      }

      if (titleLower.includes("join") || titleLower.includes("revolution")) {
        return (
          <div className="text-center animate-fade-in space-y-4">
            <h3 className="bg-gradient-to-r from-sky-400 to-coral bg-clip-text text-4xl font-extrabold tracking-tight text-transparent font-display sm:text-5xl">
              {slide.title}
            </h3>
            <p className="mt-4 text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {slide.subtitle || "Making Math Enjoyable for Every Student Globally"}
            </p>
            <div className="mt-8 flex justify-center gap-4 pt-4">
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
      }
    }

    // 2. Check for Investor Deck Custom templates
    if (deckType === "investor") {
      if (titleLower.includes("vision") || index === 0) {
        return (
          <div className="text-center animate-fade-in space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 shadow-inner border border-emerald-500/20">
              <img src={piLogo} alt="Mathchines Pi" className="h-12 w-12 object-contain animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="rounded-full bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 text-[9px] font-semibold text-emerald-400">
                {slide.subtitle || "Scaling Global Mathematics Literacy"}
              </span>
              <h2 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent font-display sm:text-6xl pt-2">
                {slide.title}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] pt-4">
              {slide.bullets.map((b, idx) => {
                const icons = [Coins, TrendingUp, ShieldCheck];
                const SelectedIcon = icons[idx % icons.length] || Coins;
                return (
                  <div key={idx} className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                    <SelectedIcon className="h-4 w-4 text-emerald-400" />
                    <span>{b}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("thesis")) {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.subtitle || "Capturing the Unserved Middle Class"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                EdTech platforms in the West require credit cards and 4G internet. Emerging markets have cash
                equivalents (airtime/mobile money) and low-connectivity devices. Mathchines bypasses these
                bottlenecks directly.
              </p>
              <div className="border-l-4 border-emerald-500 bg-emerald-500/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  By delivering fully curriculum-aligned offline lessons, and integrating carrier
                  micro-subscriptions, we reach 10x more subscribers.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {slide.bullets.map((b, idx) => {
                const parts = b.split("-") || [b];
                const heading = parts[0]?.trim() || "Moat";
                const desc = parts.slice(1).join("-")?.trim() || "";

                const icons = [Coins, Globe2, WifiOff, Brain];
                const colors = [
                  "text-emerald-400 bg-emerald-500/10",
                  "text-teal-400 bg-teal-500/10",
                  "text-sky-400 bg-sky-500/10",
                  "text-purple-400 bg-purple-500/10",
                ];
                const SelectedIcon = icons[idx % icons.length] || Coins;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${colors[idx % colors.length]}`}>
                        <SelectedIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{heading}</span>
                    </div>
                    <p className="mt-1.5 text-[9px] text-slate-400 leading-snug">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("opportunity")) {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {slide.subtitle || "A Triple-Tiered Addressable Market"}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="border border-slate-800 bg-slate-900/40 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-slate-400">TAM</div>
                  <div className="text-lg font-extrabold text-white">$400B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">
                    Global K-12 EdTech
                  </span>
                </div>
                <div className="border border-slate-800 bg-slate-900/40 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-teal-400 font-semibold">SAM</div>
                  <div className="text-lg font-extrabold text-teal-300">$45B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">
                    Digital Math Tutoring
                  </span>
                </div>
                <div className="border border-emerald-950 bg-emerald-950/20 p-2.5 rounded-xl text-center">
                  <div className="text-sm font-bold text-emerald-400 font-semibold font-display">
                    SOM
                  </div>
                  <div className="text-lg font-extrabold text-emerald-400">$2.5B</div>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">
                    Emerging Micro-Sub
                  </span>
                </div>
              </div>
            </div>
            {/* Concentric Market Size Representation */}
            <div className="relative aspect-[4/3] flex items-center justify-center p-4 border border-slate-800 bg-slate-950/30 rounded-2xl">
              <div className="w-full max-w-[240px] aspect-square rounded-full border border-slate-800 bg-slate-900/10 flex items-center justify-center relative p-6">
                <span className="absolute top-4 text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  TAM: $400B
                </span>

                <div className="w-4/5 aspect-square rounded-full border border-teal-800 bg-teal-950/10 flex items-center justify-center relative p-6">
                  <span className="absolute top-4 text-[8px] font-mono text-teal-500 uppercase tracking-widest font-bold">
                    SAM: $45B
                  </span>

                  <div className="w-2/3 aspect-square rounded-full border border-emerald-500/40 bg-emerald-950/40 flex flex-col items-center justify-center text-center relative p-2 shadow-lg shadow-emerald-950/35">
                    <span className="text-[7px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-0.5">
                      SOM
                    </span>
                    <span className="text-lg font-black text-white font-display">$2.5B</span>
                    <span className="text-[8px] text-slate-300 leading-none max-w-[70px] mt-1 font-semibold">
                      Africa + US Remedial Math
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (titleLower.includes("unit economics")) {
        return (
          <div className="grid gap-6 md:grid-cols-3 animate-fade-in items-center">
            <div className="flex flex-col justify-center space-y-3">
              <h3 className="text-2xl font-bold font-display text-slate-100">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {slide.subtitle || "Subscription & Economics"}
              </p>
              <div className="pt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Telecom Billing integration live in Ghana</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                    AFRICA MICRO-TIER
                  </span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                    High Volume
                  </span>
                </div>
                <h4 className="text-3xl font-extrabold text-white font-display">
                  GHS 1 - 2
                  <span className="text-xs font-normal text-slate-400"> / day airtime</span>
                </h4>
                <ul className="text-[10px] text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> Billed directly via carrier SMS
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> Free data (Zero-rated)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> Offline access to syllabi
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider">
                    WESTERN PREMIUM
                  </span>
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-bold text-sky-400">
                    High ARPU
                  </span>
                </div>
                <h4 className="text-3xl font-extrabold text-white font-display">
                  $4.99
                  <span className="text-xs font-normal text-slate-400"> / month card</span>
                </h4>
                <ul className="text-[10px] text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-sky-400" /> Credit card / Web app billing
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-sky-400" /> AI personalized tutor modules
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-sky-400" /> Weekly parent analytics reports
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      }

      if (titleLower.includes("projections") || titleLower.includes("simulator")) {
        return (
          <div className="grid gap-6 lg:grid-cols-5 items-center animate-fade-in">
            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Revenue Projections
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                {slide.subtitle || "Drag the levers below to model Mathchines' subscriber conversions, pricing, and valuation."}
              </p>

              <div className="space-y-3 pt-2">
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

            {/* Calculations Dashboard & Live Area Chart */}
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
                  <div className="h-[100px] w-full">
                    <ChartContainer
                      config={{
                        arr: {
                          label: "ARR Run Rate",
                          color: "var(--color-emerald)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} />
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
                        <Area type="monotone" dataKey="arr" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorArr)" />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-[100px] w-full flex items-center justify-center bg-slate-900/10 border border-dashed border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-mono animate-pulse">
                      Initializing projection engine...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      if (titleLower.includes("go-to-market") || titleLower.includes("telco")) {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {slide.subtitle || "Telecom & Growth Moats"}
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

            <div className="space-y-3 p-4 border border-slate-800 bg-slate-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-2">
                Carrier Distribution Funnel
              </span>
              {[
                { step: "01. Telco API Hook", label: "MTN, Telecel integration yields billing token", pct: "100%", width: "w-full", bg: "bg-emerald-500" },
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
      }

      if (titleLower.includes("moat") || titleLower.includes("architecture")) {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {slide.subtitle || "Lightweight Client & Syllabus Mapping"}
              </p>
              <div className="border-l-4 border-teal-500 bg-teal-500/5 p-4 rounded-r-xl">
                <p className="text-xs italic text-slate-300">
                  Our offline database syncing guarantees that a student can learn, quiz, and level up for weeks without connecting to a cellular tower.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {slide.bullets.map((b, idx) => {
                const parts = b.split(":");
                const heading = parts[0]?.trim() || "Tech";
                const desc = parts.slice(1).join(":")?.trim() || "";

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/20 p-3 hover:border-slate-700 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                      {heading}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 leading-normal">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("funding") || titleLower.includes("request")) {
        return (
          <div className="grid gap-6 md:grid-cols-2 items-center animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {slide.subtitle || "The $1.5M Seed Allocation"}
              </p>
              <div className="border border-emerald-950/60 bg-emerald-950/10 p-4 rounded-xl text-center">
                <span className="text-xs text-slate-400 block font-semibold uppercase">The Funding Ask</span>
                <span className="text-3xl font-black text-white font-display block mt-1">$1.5 Million Seed</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">18-Month Operational Runway</span>
              </div>
            </div>
            <div className="space-y-4 p-5 border border-slate-800 bg-slate-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-2">
                Fund Allocation Breakdown
              </span>
              {slide.bullets.map((b, idx) => {
                const parts = b.split(":") || [b];
                const heading = parts[0]?.trim() || "Item";
                const desc = parts.slice(1).join(":")?.trim() || "";
                
                const percentMatch = heading.match(/\d+%/);
                const pct = percentMatch ? percentMatch[0] : "33%";
                const barWidth = `w-[${pct}]`;
                
                const colors = ["bg-emerald-500", "bg-teal-500", "bg-sky-500"];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] leading-tight">
                      <span className="text-slate-300 font-medium">{heading}</span>
                      <span className="font-mono font-bold text-slate-100">{desc}</span>
                    </div>
                    <div className="h-2 w-full rounded bg-slate-900 overflow-hidden">
                      <div className={`h-full ${colors[idx % colors.length]} ${barWidth}`} style={{ width: pct }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("roadmap") || titleLower.includes("milestones")) {
        const years = [
          {
            title: "Year 1 (Ghana Launch)",
            desc: "Product-market fit validation in West Africa. Establish user engagement benchmarks and initial syllabus compilation maps.",
            metric: "Target: 50k MAUs",
            icon: Globe2,
            color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/30",
          },
          {
            title: "Year 2 (Carrier & Scale)",
            desc: "Roll out live carrier airtime billing integration. Expand syllabus engine to Nigeria and Kenya for high-volume subscriber capture.",
            metric: "Target: 250k MAUs / $500k ARR",
            icon: Coins,
            color: "text-teal-400 border-teal-500/20 bg-teal-950/10 hover:border-teal-500/30",
          },
          {
            title: "Year 3 (Western & Exit)",
            desc: "Expand to US remedial school district licensing and enter the UK GCSE markets. Position for high-value strategic acquisition.",
            metric: "Target: 1M MAUs / $2M+ ARR",
            icon: TrendingUp,
            color: "text-sky-400 border-sky-500/20 bg-sky-950/10 hover:border-sky-500/30",
          },
        ];

        return (
          <div className="animate-fade-in flex flex-col justify-center h-full w-full">
            <h3 className="text-xl font-bold font-display text-center mb-6 text-slate-100">
              {slide.title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {years.map((y, idx) => {
                const SelectedIcon = y.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 space-y-3 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${y.color}`}
                  >
                    <div className="absolute -left-10 -top-10 -z-10 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
                    
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-display">
                        {y.title}
                      </span>
                      <span className="rounded bg-slate-900/60 p-1 border border-slate-800/40 shrink-0">
                        <SelectedIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed text-left flex-1">
                      {y.desc}
                    </p>
                    <div className="border-t border-slate-850/80 pt-3 mt-1">
                      <span className="text-[9px] font-bold text-white font-mono bg-slate-950 px-2 py-1 rounded border border-slate-850">
                        {y.metric}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (titleLower.includes("partner") || titleLower.includes("contact")) {
        return (
          <div className="text-center animate-fade-in space-y-6">
            <h3 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent font-display sm:text-5xl">
              {slide.title}
            </h3>
            <p className="mt-4 text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              {slide.subtitle || "Making Math Enjoyable for Every Student, Anywhere"}
            </p>
            {slide.rawContent && (
              <div className="mx-auto max-w-lg bg-slate-950/40 border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-400">
                {slide.rawContent}
              </div>
            )}
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
      }
    }

    // 3. General Markdown Slides Layout (for custom/fallback)
    const customBg = slide.bg || (deckType === "investor" ? "#061c15" : "#0b1329");
    const customColor = slide.color || "#ffffff";

    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center animate-fade-in px-4">
        {slide.title && (
          <h2 className="text-3xl font-extrabold tracking-tight font-display mb-2 text-white">
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p className="text-sm font-medium text-slate-300 max-w-xl mx-auto mb-4 italic">
            {slide.subtitle}
          </p>
        )}

        {slide.bullets.length > 0 && (
          <ul className="mt-4 space-y-2 text-left max-w-lg mx-auto list-disc list-inside text-xs text-slate-300">
            {slide.bullets.map((b, idx) => (
              <li key={idx} className="leading-relaxed">
                {b}
              </li>
            ))}
          </ul>
        )}

        {slide.table && (
          <div className="mt-6 overflow-x-auto w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950/20 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {slide.table.headers.map((h, idx) => (
                    <th key={idx} className="p-3 text-[10px] uppercase font-bold text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {slide.table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/10">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-slate-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {slide.rawContent && !slide.table && slide.bullets.length === 0 && (
          <p className="mt-4 text-xs text-slate-400 max-w-xl mx-auto whitespace-pre-line leading-relaxed">
            {slide.rawContent}
          </p>
        )}

        {slide.mermaid && (
          <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/60 font-mono text-[10px] text-sky-400 max-w-lg overflow-x-auto">
            {slide.mermaid}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased select-none">
      {/* Header Panel */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={piLogo} alt="Mathchines Logo" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Mathchines
            </span>
          </Link>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {currentDeckName}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Deck Select Dropdown / Quick Tools */}
          <div className="flex items-center gap-1.5">
            <Dialog open={isMarkdownDialogOpen} onOpenChange={setIsMarkdownDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs h-8 flex items-center gap-1.5"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  Paste Markdown
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[600px] max-h-[85vh] flex flex-col justify-between">
                <DialogHeader>
                  <DialogTitle className="font-display text-white text-xl">Load Slide Deck Markdown</DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                    Paste any Marp/Maud formatted presentation markdown slides separated by "---" lines.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 py-4">
                  <Textarea
                    placeholder={`<!-- bg: #0b1329 -->
<!-- color: #ffffff -->
# Title Slide
### Slide Subtitle
- First bullet point
- Second bullet point

> Presenter notes go here.
---
# Second Slide
- More points`}
                    className="w-full min-h-[250px] bg-slate-900 border-slate-850 rounded-xl p-3 text-xs font-mono text-slate-300 outline-none focus:border-sky-500/40"
                    value={pasteMarkdownText}
                    onChange={(e) => setPasteMarkdownText(e.target.value)}
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsMarkdownDialogOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleLoadCustomMarkdown} className="bg-sky-500 text-white hover:bg-sky-400">
                    Load Slide Deck
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isGenDialogOpen} onOpenChange={setIsGenDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-sky-950 bg-sky-950/20 text-sky-400 hover:bg-sky-950/40 hover:text-sky-300 text-xs h-8 flex items-center gap-1.5 shadow-sm shadow-sky-950/10"
                >
                  <Sparkle className="h-3.5 w-3.5 animate-pulse text-sky-400" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-850 text-slate-100 sm:max-w-[600px] max-h-[85vh] flex flex-col justify-between">
                <DialogHeader>
                  <DialogTitle className="font-display text-white text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-400" />
                    AI Presentation Builder
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                    Paste any raw text context (e.g. business plans, school notes, pitch ideas) and Gemini 2.5 Flash will automatically summarize and format it into a stunning slide deck.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 py-4">
                  <Textarea
                    placeholder="Enter or paste your text context here..."
                    className="w-full min-h-[220px] bg-slate-900 border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-sky-500/40"
                    value={documentInputText}
                    onChange={(e) => setDocumentInputText(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsGenDialogOpen(false)}
                    disabled={isGenerating}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateAIDeck}
                    disabled={isGenerating}
                    className="bg-gradient-hero text-white shadow-glow hover:opacity-90 flex items-center gap-1.5 min-w-[130px] justify-center"
                  >
                    {isGenerating ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin rounded-full mr-1.5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Deck
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <span className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setIsGridView(!isGridView)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isGridView
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
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

          <button
            onClick={handleCopyMarkdown}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title="Copy Deck Markdown"
          >
            <Copy className="h-4 w-4" />
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
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Slide Sorter
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-1 font-display">
                  All Slides Overview
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                  Click a slide to jump directly to it in full slideshow mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
                {slides.map((slide, i) => (
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
                    <div className="absolute -left-10 -top-10 -z-10 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 -z-10 h-32 w-32 rounded-full bg-coral/5 blur-2xl" />

                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                        {slide.title || "Slide"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex-1 py-2 flex flex-col justify-center min-h-[180px]">
                      {renderSlideBody(slide, i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Slide Wrapper (Slideshow Mode) */
            <div
              style={{
                backgroundColor: slides[activeSlide]?.bg || undefined,
                color: slides[activeSlide]?.color || undefined,
              }}
              className="relative flex h-full max-h-[580px] w-full max-w-[960px] aspect-[16/9] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-sky-950/10 backdrop-blur-xl transition-all duration-500"
            >
              <div className="absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 -z-10 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />

              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  {slides[activeSlide]?.title || "Slide"}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>

              {/* Slide Body */}
              <div className="flex-1 py-6 flex flex-col justify-center">
                {slides[activeSlide] && renderSlideBody(slides[activeSlide], activeSlide)}
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                <div className="flex items-center gap-1">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeSlide
                          ? "w-6 bg-sky-400"
                          : "w-1.5 bg-slate-700 hover:bg-slate-500"
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
                    disabled={activeSlide === slides.length - 1}
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
                Slide {activeSlide + 1}: {slides[activeSlide]?.title}
              </h4>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[300px]">
                {slides[activeSlide]?.notes || "No notes for this slide."}
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
