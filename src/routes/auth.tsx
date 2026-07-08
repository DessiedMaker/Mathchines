import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import piLogo from "@/assets/pi-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up — Mathchines" },
      {
        name: "description",
        content: "Sign in or create your Mathchines account to start learning.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(60, "Display name must be at most 60 characters")
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      "Display name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .refine((val) => /[a-z]/.test(val) && /[A-Z]/.test(val), {
      message: "Password must contain both uppercase and lowercase letters",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    })
    .refine((val) => !/password/i.test(val) && !/12345/i.test(val), {
      message: "Password contains forbidden patterns or common words",
    }),
});

function isConnectionError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    msg.includes("typo in the url") ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("load failed") ||
    msg.includes("unreachable") ||
    msg.includes("connection")
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [displayName, setDisplayName] = useState("");

  // Redirect if already signed in
  useEffect(() => {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 1500);
    });

    Promise.race([sessionPromise, timeoutPromise]).then(({ data }) => {
      if (data.session) {
        navigate({ to: "/learn" });
      } else {
        const isMock = typeof window !== "undefined" && localStorage.getItem("mathchines.mock_auth") === "true";
        if (isMock) navigate({ to: "/learn" });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/learn" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        let { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/learn`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) {
          if (isConnectionError(error)) {
            console.warn("Supabase connection failed, falling back to mock auth:", error);
            localStorage.setItem("mathchines.mock_auth", "true");
            const result = await supabase.auth.signUp({
              email: parsed.data.email,
              password: parsed.data.password,
              options: {
                data: { display_name: parsed.data.displayName },
              },
            });
            if (result.error) {
              toast.error(result.error.message);
              return;
            }
            toast.success("Account created locally (Mock Mode)!");
            navigate({ to: "/learn" });
            return;
          }
          if (error.message.toLowerCase().includes("already")) {
            toast.error("This email is already registered. Try signing in.");
          } else toast.error(error.message);
          return;
        }
        toast.success("Account created! You're signed in.");
        navigate({ to: "/learn" });
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        let { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          if (isConnectionError(error)) {
            console.warn("Supabase connection failed, falling back to mock auth:", error);
            localStorage.setItem("mathchines.mock_auth", "true");
            const result = await supabase.auth.signInWithPassword({
              email: parsed.data.email,
              password: parsed.data.password,
            });
            if (result.error) {
              toast.error(result.error.message);
              return;
            }
            toast.success("Signed in locally (Mock Mode)!");
            navigate({ to: "/learn" });
            return;
          }
          if (parsed.data.email === "demo@mathchines.com" && parsed.data.password === "password123") {
            const { error: signUpError } = await supabase.auth.signUp({
              email: parsed.data.email,
              password: parsed.data.password,
              options: {
                data: { display_name: "Demo Learner" },
              },
            });
            if (signUpError) {
              localStorage.setItem("mathchines.mock_auth", "true");
              await supabase.auth.signInWithPassword({
                email: parsed.data.email,
                password: parsed.data.password,
              });
              toast.success("Signed in as Demo Learner (Mock Mode)!");
              navigate({ to: "/learn" });
              return;
            }
            toast.success("Demo account initialized!");
            navigate({ to: "/learn" });
            return;
          }

          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Invalid email or password."
              : error.message,
          );
          return;
        }
        navigate({ to: "/learn" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    const demoEmail = "demo@mathchines.com";
    const demoPassword = "password123";
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMode("signin");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("not found")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: { display_name: "Demo Learner" },
            },
          });

          if (signUpError) {
            console.warn("Supabase signup failed, falling back to mock auth:", signUpError);
            localStorage.setItem("mathchines.mock_auth", "true");
            await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword,
            });
            toast.success("Signed in as Demo Learner (Mock Mode)!");
            navigate({ to: "/learn" });
            return;
          }
          toast.success("Welcome! Demo account initialized.");
          navigate({ to: "/learn" });
          return;
        }

        console.warn("Supabase signin error, falling back to mock auth:", error);
        localStorage.setItem("mathchines.mock_auth", "true");
        await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        toast.success("Signed in as Demo Learner (Mock Mode)!");
        navigate({ to: "/learn" });
        return;
      }
      
      toast.success("Signed in with demo account!");
      navigate({ to: "/learn" });
    } catch (err) {
      console.warn("Demo login handler caught exception, falling back to mock:", err);
      localStorage.setItem("mathchines.mock_auth", "true");
      await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      toast.success("Signed in as Demo Learner (Mock Mode)!");
      navigate({ to: "/learn" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/learn",
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
    // If redirected, the browser navigates away.
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 py-12">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={piLogo} alt="Mathchines" className="h-10 w-10" />
          <span className="text-2xl font-semibold tracking-tight">Mathchines</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue learning."
                : "Start learning math the enjoyable way."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {displayName.length > 0 && (
                  <div className="mt-1 mb-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          displayName.trim().length >= 2 ? "bg-green-500" : "bg-muted-foreground/40"
                        }`}
                      />
                      <span className={displayName.trim().length >= 2 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                        At least 2 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          /^[a-zA-Z0-9\s-_]+$/.test(displayName) ? "bg-green-500" : "bg-red-500 animate-pulse"
                        }`}
                      />
                      <span className={/^[a-zA-Z0-9\s-_]+$/.test(displayName) ? "text-green-500 font-medium" : "text-red-500 font-semibold"}>
                        Only letters, numbers, spaces, hyphens, and underscores
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={mode === "signin" ? 6 : 8}
                maxLength={72}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {mode === "signup" && password.length > 0 && (
              <div className="mt-1 mb-3 bg-muted/40 p-3 rounded-lg border border-border/50 text-xs space-y-1.5">
                <p className="font-semibold text-muted-foreground mb-1 text-[11px]">Password Requirements:</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${
                      password.length >= 8 ? "bg-green-500" : "bg-muted-foreground/35"
                    }`}
                  >
                    ✓
                  </div>
                  <span className={password.length >= 8 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                    At least 8 characters ({password.length}/8)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${
                      /[a-z]/.test(password) && /[A-Z]/.test(password) ? "bg-green-500" : "bg-muted-foreground/35"
                    }`}
                  >
                    ✓
                  </div>
                  <span className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-500 font-medium" : "text-muted-foreground"}>
                    Both uppercase & lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${
                      /\d/.test(password) ? "bg-green-500" : "bg-muted-foreground/35"
                    }`}
                  >
                    ✓
                  </div>
                  <span className={/\d/.test(password) ? "text-green-500 font-medium" : "text-muted-foreground"}>
                    At least one number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${
                      /[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-muted-foreground/35"
                    }`}
                  >
                    ✓
                  </div>
                  <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500 font-medium" : "text-muted-foreground"}>
                    At least one special character
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${
                      (!/password/i.test(password) && !/12345/i.test(password)) ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {(!/password/i.test(password) && !/12345/i.test(password)) ? "✓" : "✗"}
                  </div>
                  <span className={(!/password/i.test(password) && !/12345/i.test(password)) ? "text-green-500 font-medium" : "text-red-500 font-semibold"}>
                    No common words (e.g. "password", "12345")
                  </span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Mathchines? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                const nextMode = mode === "signin" ? "signup" : "signin";
                setMode(nextMode);
                if (nextMode === "signup") {
                  setPassword("");
                } else {
                  setPassword("password123");
                }
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Demo Credentials
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Quick access to experience Mathchines as a test user
            </p>
            <div className="mt-2.5 flex flex-col gap-1 text-xs font-mono">
              <div className="flex justify-between px-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground select-all">demo@mathchines.com</span>
              </div>
              <div className="flex justify-between px-2">
                <span className="text-muted-foreground">Password:</span>
                <span className="font-semibold text-foreground select-all">password123</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
            >
              Quick Demo Sign-in <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
