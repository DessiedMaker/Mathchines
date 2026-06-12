const KEY = "mathchines.progress.v1";

export interface Progress {
  country?: string;
  grade?: string;
  mastered: string[]; // topic ids
  xp: number;
  streak: number;
  lastActiveDay?: string;
}

const empty: Progress = { mastered: [], xp: 0, streak: 0 };

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
