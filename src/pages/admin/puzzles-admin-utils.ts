import type { PuzzleDefinition, ScenarioPuzzleDefinition } from "../../data/puzzle-types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PointRow = { value: string };
export type AnswerRow = { label: string; value: string; is_correct: boolean };
export type ScenarioRow = { label: string; is_correct: boolean; points: PointRow[] };

export type PuzzleForm = {
  slug: string;
  type: "next_point" | "scenarios";
  title: string;
  published: boolean;
  notes: string;
  explanation_correct: string;
  explanation_incorrect: string;
  base_points: PointRow[];
  answers: AnswerRow[];
  scenarios: ScenarioRow[];
};

export type ApiPuzzle = {
  id: number;
  slug: string;
  type: "next_point" | "scenarios";
  title: string;
  published: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  explanation_correct: string;
  explanation_incorrect: string;
  puzzle_base_points: { step: number; value: number }[];
  puzzle_answers: { id: number; label: string; value: number; is_correct: boolean }[];
  puzzle_scenarios: {
    id: number;
    label: string;
    is_correct: boolean;
    puzzle_scenario_points: { step: number; value: number }[];
  }[];
};

export type SortField = "created_at" | "updated_at" | "slug" | "type" | "published";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function suggestSlug(type: "next_point" | "scenarios", existingSlugs: string[]): string {
  const prefix = type === "next_point" ? "puzzle" : "scenario";
  const nums = existingSlugs
    .filter((s) => s.startsWith(prefix + "-"))
    .map((s) => parseInt(s.replace(prefix + "-", "")))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const emptyBase = (n = 7): PointRow[] => Array(n).fill(null).map(() => ({ value: "" }));
export const emptyScenarioPoints = (n = 6): PointRow[] => Array(n).fill(null).map(() => ({ value: "" }));

export const defaultForm: PuzzleForm = {
  slug: "",
  type: "next_point",
  title: "",
  published: true,
  notes: "",
  explanation_correct: "",
  explanation_incorrect: "Not quite. You chose {selected}, but the correct answer is {correct}.",
  base_points: emptyBase(),
  answers: [
    { label: "", value: "", is_correct: false },
    { label: "", value: "", is_correct: true },
    { label: "", value: "", is_correct: false },
  ],
  scenarios: [
    { label: "A", is_correct: false, points: emptyScenarioPoints() },
    { label: "B", is_correct: true, points: emptyScenarioPoints() },
    { label: "C", is_correct: false, points: emptyScenarioPoints() },
  ],
};

// ─── Converters ──────────────────────────────────────────────────────────────

export function apiToForm(p: ApiPuzzle): PuzzleForm {
  const sortedBase = [...p.puzzle_base_points].sort((a, b) => a.step - b.step);
  return {
    slug: p.slug,
    type: p.type,
    title: p.title,
    published: p.published,
    notes: p.notes ?? "",
    explanation_correct: p.explanation_correct ?? "",
    explanation_incorrect: p.explanation_incorrect ?? "",
    base_points: sortedBase.map((bp) => ({ value: String(bp.value) })),
    answers:
      p.type === "next_point"
        ? p.puzzle_answers.map((a) => ({ label: a.label, value: String(a.value), is_correct: a.is_correct }))
        : defaultForm.answers,
    scenarios:
      p.type === "scenarios"
        ? p.puzzle_scenarios.map((s) => ({
            label: s.label,
            is_correct: s.is_correct,
            points: [...s.puzzle_scenario_points]
              .sort((a, b) => a.step - b.step)
              .map((sp) => ({ value: String(sp.value) })),
          }))
        : defaultForm.scenarios,
  };
}

export function formToBody(form: PuzzleForm) {
  const base_points = form.base_points
    .map((p, i) => ({ step: i + 1, value: Number(p.value) }))
    .filter((p) => p.value !== 0 && !isNaN(p.value));
  const baseCount = base_points.length;

  return {
    slug: form.slug,
    type: form.type,
    title: form.title,
    published: form.published,
    notes: form.notes || null,
    explanation_correct: form.explanation_correct,
    explanation_incorrect: form.explanation_incorrect,
    base_points,
    answers:
      form.type === "next_point"
        ? form.answers.map((a) => ({ label: a.value, value: Number(a.value), is_correct: a.is_correct }))
        : [],
    scenarios:
      form.type === "scenarios"
        ? form.scenarios.map((s) => ({
            label: s.label,
            is_correct: s.is_correct,
            points: s.points
              .map((p, i) => ({ step: baseCount + i + 1, value: Number(p.value) }))
              .filter((p) => p.value !== 0 && !isNaN(p.value)),
          }))
        : [],
  };
}

export function buildPreview(form: PuzzleForm): PuzzleDefinition | ScenarioPuzzleDefinition | null {
  const baseData = form.base_points
    .map((p, i) => ({ step: i + 1, value: Number(p.value) }))
    .filter((p) => !isNaN(p.value) && p.value !== 0);

  if (baseData.length === 0) return null;

  const incorrectFn = (chosen: string, correct: string) =>
    form.explanation_incorrect.replace("{selected}", chosen).replace("{correct}", correct);

  if (form.type === "next_point") {
    const correctIdx = form.answers.findIndex((a) => a.is_correct);
    return {
      id: form.slug || "preview",
      title: form.title || "Preview",
      baseData,
      answers: form.answers
        .map((a, i) => ({ id: String(i), label: a.label || a.value, value: Number(a.value) }))
        .filter((a) => !isNaN(a.value) && a.value !== 0),
      correctAnswerId: String(correctIdx >= 0 ? correctIdx : 0),
      explanation: { correct: form.explanation_correct || "Correct!", incorrect: incorrectFn },
    };
  } else {
    return {
      id: form.slug || "preview",
      title: form.title || "Preview",
      baseData,
      scenarios: form.scenarios.map((s, i) => ({
        id: String(i),
        label: s.label,
        data: s.points
          .map((p, j) => ({ step: baseData.length + j + 1, value: Number(p.value) }))
          .filter((p) => !isNaN(p.value) && p.value !== 0),
      })),
      correctScenarioId: String(form.scenarios.findIndex((s) => s.is_correct)),
      explanation: { correct: form.explanation_correct || "Correct!", incorrect: incorrectFn },
    };
  }
}
