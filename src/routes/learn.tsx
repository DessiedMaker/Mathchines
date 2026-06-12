import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import piLogo from "@/assets/pi-logo.png";

export const Route = createFileRoute("/learn")({
  component: LearnLayout,
});

function LearnLayout() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={piLogo} alt="Mathchines" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">Mathchines</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        <Sparkles className="mx-auto h-4 w-4 text-primary" />
        <p className="mt-2">Mathchines · MVP preview</p>
      </footer>
    </div>
  );
}
