import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCountriesList, getCountry } from "@/lib/curriculum";
import { getProgress, setSelection, setRole } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  PlusCircle,
  BookOpen,
  Award,
  Flame,
  Trophy,
  Plus,
  GraduationCap,
  Mail,
  User as UserIcon,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mathchines" },
      {
        name: "description",
        content: "Interactive math learning dashboard for students, teachers, and parents.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRoleState] = useState<"student" | "teacher" | "parent">("student");
  const [loading, setLoading] = useState(true);

  // Load user details
  useEffect(() => {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 1500);
    });

    Promise.race([sessionPromise, timeoutPromise]).then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id);
        const p = getProgress();
        if (p.role) setRoleState(p.role);
      } else {
        // Fallback for mock session or offline
        const isMock = typeof window !== "undefined" && localStorage.getItem("mathchines.mock_auth") === "true";
        if (isMock) {
          setUserId("demo-user-id");
          const p = getProgress();
          if (p.role) setRoleState(p.role);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading || !userId) {
    return (
      <div className="flex h-60 items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <Toaster richColors position="top-center" />
      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {role === "student"
              ? "Student Workspace"
              : role === "teacher"
                ? "Teacher Admin Console"
                : "Parent Tracker"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as a {role}. You can switch roles from your profile layout.
          </p>
        </div>
        <button
          onClick={async () => {
            const nextRole =
              role === "student" ? "teacher" : role === "teacher" ? "parent" : "student";
            setRole(nextRole);
            setRoleState(nextRole);
            toast.success(`Switched role to ${nextRole}`);
          }}
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
        >
          Change Role Mode
        </button>
      </div>

      {role === "student" && <StudentDashboard userId={userId} navigate={navigate} />}
      {role === "teacher" && <TeacherDashboard userId={userId} />}
      {role === "parent" && <ParentDashboard userId={userId} />}
    </div>
  );
}

/* ==========================================================================
   STUDENT DASHBOARD
   ========================================================================== */
function StudentDashboard({ userId, navigate }: { userId: string; navigate: any }) {
  const [country, setCountry] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    const p = getProgress();
    if (p.country) setCountry(p.country);
    if (p.grade) setGrade(p.grade);
    void fetchMyClassrooms();
  }, []);

  async function fetchMyClassrooms() {
    try {
      const { data, error } = await supabase
        .from("classroom_enrollments")
        .select(
          `
          classroom_id,
          classrooms:classroom_id (
            id,
            name,
            code,
            profiles:teacher_id (
              display_name
            )
          )
        ` as any,
        )
        .eq("student_id", userId);
      if (data) setClassrooms(data.map((d: any) => d.classrooms));
    } catch (err) {
      console.error(err);
    }
  }

  const selectedCountry = country ? getCountry(country) : undefined;

  function continueFlow() {
    if (!country || !grade) return;
    setSelection(country, grade);
    navigate({ to: "/learn/topics" });
  }

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!classCode.trim()) return;
    setJoining(true);
    try {
      // 1. Find classroom
      const { data: classroom, error: cError } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("code", classCode.trim().toUpperCase())
        .maybeSingle();

      if (cError || !classroom) {
        toast.error("Classroom code not found.");
        return;
      }

      // 2. Enroll
      const { error: eError } = await supabase.from("classroom_enrollments").insert({
        classroom_id: classroom.id,
        student_id: userId,
      } as any);

      if (eError) {
        if (eError.message.toLowerCase().includes("unique")) {
          toast.info("You are already enrolled in this class.");
        } else {
          toast.error(eError.message);
        }
      } else {
        toast.success(`Successfully joined ${classroom.name}!`);
        setClassCode("");
        void fetchMyClassrooms();
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Dynamic Curricula Selection */}
      <div className="lg:col-span-2 space-y-10">
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Curriculum Select
            </span>
            <h2 className="mt-2 text-2xl font-bold">Pick your path</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select your country and grade to unlock localized WAEC, GCSE, or Common Core lesson
              packages.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Country
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {getCountriesList().map((c) => {
                const active = c.code === country;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                      setGrade("");
                    }}
                    className={`relative rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-foreground/20"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div className="mt-2 font-semibold text-sm">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.curriculum}</div>
                    {active && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCountry && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grade / Class
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCountry.grades.map((g) => {
                  const active = g.id === grade;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGrade(g.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-foreground/20"
                      }`}
                    >
                      <div className="font-semibold text-sm">{g.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {g.topics.length} topics ready
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              disabled={!country || !grade}
              onClick={continueFlow}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enter Curriculum <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Classroom Joins Sidepanel */}
      <aside className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> Join Classroom
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Enrolling links your quiz scores, streaks, and XP to your teacher's analytics report.
          </p>

          <form onSubmit={handleJoinClass} className="mt-4 space-y-3">
            <input
              type="text"
              required
              maxLength={12}
              placeholder="e.g. A1B2C3"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full uppercase rounded-xl border border-border bg-background px-4 py-2.5 text-center font-mono text-sm tracking-widest outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={joining || !classCode.trim()}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join Class"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">My Enrolled Classes</h2>
          <div className="mt-4 space-y-3">
            {classrooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Not enrolled in any classrooms yet.
              </div>
            ) : (
              classrooms.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <div className="text-[10px] text-muted-foreground">
                      Teacher: {c.profiles?.display_name || "Unknown Teacher"}
                    </div>
                  </div>
                  <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                    {c.code}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

/* ==========================================================================
   TEACHER DASHBOARD
   ========================================================================== */
function TeacherDashboard({ userId }: { userId: string }) {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void fetchClassrooms();
  }, []);

  async function fetchClassrooms() {
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*, grades(label)" as any)
        .eq("teacher_id", userId);
      if (data) setClassrooms(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim() || !newGrade) return;
    setCreating(true);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const { error } = await supabase.from("classrooms").insert({
        name: newClassName.trim(),
        grade_id: newGrade,
        teacher_id: userId,
        code,
      } as any);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Classroom "${newClassName}" created! Code: ${code}`);
        setNewClassName("");
        setNewGrade("");
        void fetchClassrooms();
      }
    } catch (err) {
      toast.error("Failed to create classroom.");
    } finally {
      setCreating(false);
    }
  }

  async function fetchClassroomDetails(cls: any) {
    setSelectedClass(cls);
    setEnrolledStudents([]);
    try {
      const { data, error } = await supabase
        .from("classroom_enrollments")
        .select(
          `
          student_id,
          profiles:student_id (
            id,
            display_name,
            email,
            xp,
            streak,
            mastered_topics
          )
        ` as any,
        )
        .eq("classroom_id", cls.id);
      if (data) setEnrolledStudents(data.map((d: any) => d.profiles));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Classrooms List & Creator */}
      <div className="lg:col-span-2 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Active Classrooms
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your rosters, share classroom code keys, and track learning progress.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {classrooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground col-span-2">
                No active classrooms. Create one below to invite your students!
              </div>
            ) : (
              classrooms.map((cls) => {
                const active = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => fetchClassroomDetails(cls)}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-foreground/20"
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      Curriculum grade: {cls.grades?.label || "Unassigned"}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold">
                      <span className="font-mono text-primary font-bold">{cls.code}</span>
                      <span className="text-muted-foreground">View Roster &rarr;</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Detailed Classroom Roster */}
        {selectedClass && (
          <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold">{selectedClass.name} — Student Roster</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Classroom Code:{" "}
              <span className="font-mono font-bold text-foreground bg-accent px-2 py-0.5 rounded">
                {selectedClass.code}
              </span>
            </p>

            <div className="mt-6 space-y-3">
              {enrolledStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No students enrolled in this classroom yet. Share the code to invite them!
                </div>
              ) : (
                enrolledStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-4 bg-background"
                  >
                    <div>
                      <h4 className="font-semibold text-sm">
                        {student.display_name || student.email}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-coral" />
                        <span className="font-bold">{student.xp || 0} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-gold-foreground" />
                        <span className="font-bold">{student.streak || 0}d streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-bold">
                          {(student.mastered_topics || []).length} mastered
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* Classroom Creator Sidebar */}
      <aside>
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Create Classroom
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Creates a workspace and links it to a localized syllabus path.
          </p>

          <form onSubmit={handleCreateClass} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Class Name</label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. Algebra Period 3"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Syllabus Grade Mapping
              </label>
              <select
                required
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary"
              >
                <option value="">Select a grade...</option>
                <optgroup label="Ghana GES">
                  <option value="jhs1">JHS 1</option>
                  <option value="jhs2">JHS 2</option>
                  <option value="jhs3">JHS 3 (BECE)</option>
                  <option value="shs1">SHS 1</option>
                </optgroup>
                <optgroup label="Nigeria NERDC">
                  <option value="jss2">JSS 2</option>
                  <option value="jss3">JSS 3</option>
                  <option value="ss1">SS 1</option>
                </optgroup>
                <optgroup label="US Common Core">
                  <option value="g6">Grade 6</option>
                  <option value="g7">Grade 7</option>
                  <option value="g8">Grade 8</option>
                  <option value="g9">Grade 9 (Algebra I)</option>
                </optgroup>
                <optgroup label="UK GCSE">
                  <option value="y8">Year 8</option>
                  <option value="y9">Year 9</option>
                  <option value="y10">Year 10</option>
                </optgroup>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating || !newClassName.trim() || !newGrade}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Generate Classroom"}
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}

/* ==========================================================================
   PARENT DASHBOARD
   ========================================================================== */
function ParentDashboard({ userId }: { userId: string }) {
  const [children, setChildren] = useState<any[]>([]);
  const [emailToLink, setEmailToLink] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    void fetchLinkedChildren();
  }, []);

  async function fetchLinkedChildren() {
    try {
      const { data, error } = await supabase
        .from("parent_student_links")
        .select(
          `
          student_id,
          profiles:student_id (
            id,
            display_name,
            email,
            xp,
            streak,
            mastered_topics
          )
        ` as any,
        )
        .eq("parent_id", userId);
      if (data) setChildren(data.map((d: any) => d.profiles));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLinkStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!emailToLink.trim()) return;
    setLinking(true);

    try {
      // 1. Find the student profile by email
      // Note: profiles are linked to auth.users. But display names/emails may be in profiles.
      // If we don't store email directly in profiles, we can search by display_name, or query profiles
      // containing standard lookup. Let's do a search on profiles table for matching email or display_name.
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("display_name", emailToLink.trim())
        .maybeSingle();

      // If we query profiles display_name, let's also try lookup. Let's fall back to email lookups if profile table has display name
      let studentId = profiles?.id;

      if (!studentId) {
        // Fall back search where display_name matches display name
        const { data: fallbackProf } = await supabase
          .from("profiles")
          .select("id")
          .eq("display_name", emailToLink.trim())
          .maybeSingle();
        studentId = fallbackProf?.id;
      }

      if (!studentId) {
        // Since profiles contains display_name and ID, let's look for exact match or alert
        toast.error(
          `Student name/display name "${emailToLink}" not found. Ask them to check their Display Name in their auth page.`,
        );
        return;
      }

      // 2. Link
      const { error } = await supabase.from("parent_student_links").insert({
        parent_id: userId,
        student_id: studentId,
      } as any);

      if (error) {
        if (error.message.toLowerCase().includes("unique")) {
          toast.info("You have already linked this student.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(`Successfully linked student!`);
        setEmailToLink("");
        void fetchLinkedChildren();
      }
    } catch (err) {
      toast.error("Failed to link student.");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink(studentId: string) {
    try {
      const { error } = await supabase
        .from("parent_student_links")
        .delete()
        .eq("parent_id", userId)
        .eq("student_id", studentId);
      if (error) throw error;
      toast.success("Successfully unlinked student.");
      void fetchLinkedChildren();
    } catch (err) {
      toast.error("Failed to unlink student.");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Linked Children List */}
      <div className="lg:col-span-2">
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Monitored Students
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow your children's real-time XP scores, learning streaks, and mastery progress.
          </p>

          <div className="mt-6 space-y-4">
            {children.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No linked students yet. Link your student using the form on the right.
              </div>
            ) : (
              children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl border border-border p-6 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-soft transition-all"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {child.display_name || "Enrolled Student"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Student Profile ID: {child.id.substring(0, 8)}...
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-coral/10 text-coral px-3 py-1.5 rounded-full">
                      <Trophy className="h-4 w-4" />
                      <span>{child.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gold/20 text-gold-foreground px-3 py-1.5 rounded-full">
                      <Flame className="h-4 w-4" />
                      <span>{child.streak || 0}d Streak</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      <Award className="h-4 w-4" />
                      <span>{(child.mastered_topics || []).length} Mastered</span>
                    </div>
                    <button
                      onClick={() => handleUnlink(child.id)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      title="Unlink student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Linker Sidebar */}
      <aside>
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Link a Student
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Search for a student using their exact **Display Name** to link their metrics to your
            dashboard.
          </p>

          <form onSubmit={handleLinkStudent} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Student's Display Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={emailToLink}
                onChange={(e) => setEmailToLink(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={linking || !emailToLink.trim()}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {linking ? "Linking..." : "Link Profile"}
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
