import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowLeft,
  LogOut,
  Loader2,
  GraduationCap,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import piLogo from "@/assets/pi-logo.png";
import { supabase } from "@/integrations/supabase/client";
import {
  hydrateFromCloud,
  clearLocalProgress,
  getProgress,
  setRole,
  subscribe,
} from "@/lib/progress";
import { loadCurriculumFromDatabase } from "@/lib/curriculum";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/learn")({
  component: LearnLayout,
});

function RoleSelection({ onSelect }: { onSelect: (r: "student" | "teacher" | "parent") => void }) {
  const [selected, setSelected] = useState<"student" | "teacher" | "parent" | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setSaving(true);
    try {
      setRole(selected);
      onSelect(selected);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-elegant md:p-12">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Onboarding
          </span>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Choose your path</h1>
          <p className="mt-4 text-muted-foreground">
            Welcome to Mathchines! Tell us how you will be using the application.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              id: "student",
              icon: BookOpen,
              label: "Student",
              desc: "Choose topics, solve quizzes, build streaks, and earn badges.",
              accent: "bg-primary/10 text-primary border-primary/20",
            },
            {
              id: "teacher",
              icon: GraduationCap,
              label: "Teacher",
              desc: "Set up classrooms, invite students, and track class progress metrics.",
              accent: "bg-coral/15 text-coral border-coral/20",
            },
            {
              id: "parent",
              icon: Users,
              label: "Parent",
              desc: "Link to your children's profiles and follow their learning metrics.",
              accent: "bg-gold/25 text-gold-foreground border-gold/20",
            },
          ].map((item) => {
            const active = selected === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item.id as any)}
                className={`relative rounded-2xl border p-6 text-left transition-all ${
                  active
                    ? "border-foreground bg-accent shadow-soft scale-[1.02]"
                    : "border-border bg-card hover:border-foreground/30 hover:-translate-y-0.5"
                }`}
              >
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${item.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!selected || saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 font-medium text-primary-foreground shadow-glow transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Confirm selection"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;
  const isMock = localStorage.getItem("mathchines.mock_auth") === "true";
  if (isMock) {
    return {
      id: "demo-user-id",
      email: "demo@mathchines.com",
      user_metadata: { display_name: "Demo Learner" },
    } as any;
  }
  try {
    const raw = localStorage.getItem("sb-ilrgtouzacxisprenntg-auth-token");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user) return parsed.user;
    }
  } catch (err) {
    console.error("Error reading initial user session:", err);
  }
  return null;
}

function getInitialRole(): "student" | "teacher" | "parent" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mathchines.progress.v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role) return parsed.role;
    }
  } catch {}
  return null;
}

function LearnLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [role, setRoleState] = useState<"student" | "teacher" | "parent" | null>(getInitialRole);
  const [checking, setChecking] = useState(() => !getInitialUser());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        clearLocalProgress();
        navigate({ to: "/auth" });
      } else if (event === "SIGNED_IN") {
        void hydrateFromCloud(session.user.id).then(() => {
          setRoleState(getProgress().role || null);
        });
      }
    });

    const init = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const authTimeout = new Promise<{ data: { session: any } }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 2000);
        });
        
        const { data } = await Promise.race([sessionPromise, authTimeout]);
        
        if (!data.session) {
          const isMock = typeof window !== "undefined" && localStorage.getItem("mathchines.mock_auth") === "true";
          if (isMock) {
            setUser({ id: "demo-user-id", email: "demo@mathchines.com", user_metadata: { display_name: "Demo Learner" } } as any);
            setRoleState(getProgress().role || null);
          } else {
            navigate({ to: "/auth" });
          }
        } else {
          setUser(data.session.user);
          
          const loadPromise = Promise.all([
            hydrateFromCloud(data.session.user.id),
            loadCurriculumFromDatabase(),
          ]);
          
          const loadTimeout = new Promise((resolve) => {
            setTimeout(() => {
              console.warn("Supabase loading timed out. Falling back to local data.");
              resolve(null);
            }, 2000);
          });

          await Promise.race([loadPromise, loadTimeout]);
          setRoleState(getProgress().role || null);
        }
      } catch (err) {
        console.error("Auth init failed, falling back to local progress:", err);
        const isMock = typeof window !== "undefined" && localStorage.getItem("mathchines.mock_auth") === "true";
        if (isMock) {
          setUser({ id: "demo-user-id", email: "demo@mathchines.com", user_metadata: { display_name: "Demo Learner" } } as any);
          setRoleState(getProgress().role || null);
        } else {
          navigate({ to: "/auth" });
        }
      } finally {
        setChecking(false);
      }
    };

    void init();

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    return subscribe(() => {
      setRoleState(getProgress().role || null);
    });
  }, []);

  async function handleSignOut() {
    clearLocalProgress();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={piLogo} alt="Mathchines" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">Mathchines</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-semibold text-coral mr-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
                Offline
              </span>
            ) : (
              <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 mr-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Synced
              </span>
            )}
            {role && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary mr-2">
                {role} mode
              </span>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline mr-2">
              {user.email}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!role ? <RoleSelection onSelect={(r) => setRoleState(r)} /> : <Outlet />}
      </main>
      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        <Sparkles className="mx-auto h-4 w-4 text-primary" />
        <p className="mt-2">Mathchines · Dynamic Curricula Preview</p>
      </footer>
    </div>
  );
}
