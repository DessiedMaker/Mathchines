import { supabase } from "@/integrations/supabase/client";

const KEY = "mathchines.progress.v1";

export interface Progress {
  country?: string;
  grade?: string;
  mastered: string[]; // topic ids
  xp: number;
  streak: number;
  lastActiveDay?: string;
  role?: 'student' | 'teacher' | 'parent';
}

const empty: Progress = { mastered: [], xp: 0, streak: 0 };


let currentUserId: string | null = null;

function read(): Progress {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

function write(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("mathchines:progress"));
  if (currentUserId) void syncToCloud(currentUserId, p);
}

async function syncToCloud(userId: string, p: Progress) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        country: p.country ?? null,
        grade: p.grade ?? null,
        xp: p.xp,
        streak: p.streak,
        last_active_day: p.lastActiveDay ?? null,
        mastered_topics: p.mastered,
        role: p.role ?? null,
      } as any)
      .eq("id", userId);
    if (error) {
      console.warn("Cloud sync failed (possibly offline). Progress saved locally.", error);
    }
  } catch (err) {
    console.warn("Error syncing progress to cloud:", err);
  }
}



export async function hydrateFromCloud(userId: string) {
  currentUserId = userId;
  const { data, error } = await supabase
    .from("profiles")
    .select("country, grade, xp, streak, last_active_day, mastered_topics, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return;
  const p: Progress = {
    country: data.country ?? undefined,
    grade: data.grade ?? undefined,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    lastActiveDay: data.last_active_day ?? undefined,
    mastered: data.mastered_topics ?? [],
    role: (data as any).role ?? undefined,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("mathchines:progress"));
  }
}


export function clearLocalProgress() {
  currentUserId = null;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("mathchines:progress"));
}

export function getProgress(): Progress {
  return read();
}

export function setSelection(country: string, grade: string) {
  const p = read();
  p.country = country;
  p.grade = grade;
  write(p);
}

export function setRole(role: 'student' | 'teacher' | 'parent') {
  const p = read();
  p.role = role;
  write(p);
}


export function addMastery(topicId: string, xpGained: number) {
  const p = read();
  if (!p.mastered.includes(topicId)) p.mastered.push(topicId);
  p.xp += xpGained;
  const today = new Date().toISOString().slice(0, 10);
  if (p.lastActiveDay !== today) {
    p.streak += 1;
    p.lastActiveDay = today;
  }
  write(p);
}

export function resetProgress() {
  write({ ...empty });
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("mathchines:progress", cb);
  return () => window.removeEventListener("mathchines:progress", cb);
}
