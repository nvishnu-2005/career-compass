import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateRecommendation, type RecommendationResult } from "@/lib/recommendation";
import { toast } from "sonner";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "Get Your Recommendation — PathwayAI" },
      { name: "description", content: "Tell us about yourself and we'll recommend your ideal academic pathway." },
    ],
  }),
  component: RecommendPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  qualification: z.string().min(1, "Please select your qualification"),
  work_experience: z.number().int().min(0, "Cannot be negative").max(80),
  profession: z.string().trim().min(2, "Please enter your profession").max(120),
  career_goal: z.string().trim().min(10, "Please share a bit more about your goal").max(1000),
});

const QUALIFICATIONS = ["High School", "Diploma", "Undergraduate", "Master's", "MPhil", "PhD"];

function RecommendPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    qualification: "",
    work_experience: "",
    profession: "",
    career_goal: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      work_experience: Number(form.work_experience),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as string;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const rec = generateRecommendation({
        qualification: parsed.data.qualification,
        workExperience: parsed.data.work_experience,
        careerGoal: parsed.data.career_goal,
      });
      const { error } = await supabase.from("submissions").insert({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        qualification: parsed.data.qualification,
        work_experience: parsed.data.work_experience,
        profession: parsed.data.profession,
        career_goal: parsed.data.career_goal,
        recommendation: rec.title,
      });
      if (error) throw error;
      setResult(rec);
      toast.success("Your recommendation is ready!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {!result ? (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Tell us about yourself
              </h1>
              <p className="mt-3 text-muted-foreground">
                Takes less than a minute. Your answers shape your recommendation.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full Name" error={errors.full_name}>
                  <Input
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="Ada Lovelace"
                  />
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="ada@example.com"
                  />
                </Field>
                <Field label="Highest Qualification" error={errors.qualification}>
                  <Select
                    value={form.qualification}
                    onValueChange={(v) => update("qualification", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Years of Work Experience" error={errors.work_experience}>
                  <Input
                    type="number"
                    min={0}
                    max={80}
                    value={form.work_experience}
                    onChange={(e) => update("work_experience", e.target.value)}
                    placeholder="5"
                  />
                </Field>
                <Field label="Current Profession" error={errors.profession} className="sm:col-span-2">
                  <Input
                    value={form.profession}
                    onChange={(e) => update("profession", e.target.value)}
                    placeholder="Product Manager"
                  />
                </Field>
                <Field label="Career Goal" error={errors.career_goal} className="sm:col-span-2">
                  <Textarea
                    rows={4}
                    value={form.career_goal}
                    onChange={(e) => update("career_goal", e.target.value)}
                    placeholder="e.g., I want to lead research at the intersection of AI and education..."
                  />
                </Field>
              </div>

              <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-full shadow-glow">
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <>Generate Recommendation <ArrowRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </>
        ) : (
          <ResultCard result={result} onRestart={() => { setResult(null); setForm({ full_name: "", email: "", qualification: "", work_experience: "", profession: "", career_goal: "" }); }} />
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ResultCard({ result, onRestart }: { result: RecommendationResult; onRestart: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="relative px-6 py-10 sm:px-10" style={{ background: "var(--gradient-hero)" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Recommended for you
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {result.title}
            </span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{result.explanation}</p>
        </div>
        <div className="space-y-6 px-6 py-8 sm:px-10">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Why this suits you</h3>
            <p className="mt-2 text-foreground">{result.whyItSuits}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggested next steps</h3>
            <ul className="mt-3 space-y-2">
              {result.nextSteps.map((s) => (
                <li key={s} className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={onRestart} variant="outline" className="rounded-full">Start over</Button>
            <Button asChild className="rounded-full">
              <Link to="/submissions">View dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
