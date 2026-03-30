import { useEffect, useState } from "react";
import { PuzzleCard } from "../../components/puzzle/PuzzleCard";
import { ScenarioCard } from "../../components/puzzle/ScenarioCard";
import type { PuzzleDefinition, ScenarioPuzzleDefinition } from "../../data/puzzle-types";

// ─── Auth ────────────────────────────────────────────────────────────────────

function authHeader(): Record<string, string> {
  const pw = sessionStorage.getItem("da_admin_pw") ?? "";
  return { Authorization: `Bearer ${pw}`, "Content-Type": "application/json" };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PointRow = { value: string };
type AnswerRow = { label: string; value: string; is_correct: boolean };
type ScenarioRow = { label: string; is_correct: boolean; points: PointRow[] };

type PuzzleForm = {
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

type ApiPuzzle = {
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

type SortField = "created_at" | "updated_at" | "slug" | "type" | "published";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function suggestSlug(type: "next_point" | "scenarios", existingSlugs: string[]): string {
  const prefix = type === "next_point" ? "puzzle" : "scenario";
  const nums = existingSlugs
    .filter((s) => s.startsWith(prefix + "-"))
    .map((s) => parseInt(s.replace(prefix + "-", "")))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const emptyBase = (n = 7): PointRow[] => Array(n).fill(null).map(() => ({ value: "" }));
const emptyScenarioPoints = (n = 6): PointRow[] => Array(n).fill(null).map(() => ({ value: "" }));

const defaultForm: PuzzleForm = {
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

function apiToForm(p: ApiPuzzle): PuzzleForm {
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

function formToBody(form: PuzzleForm) {
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

function buildPreview(form: PuzzleForm): PuzzleDefinition | ScenarioPuzzleDefinition | null {
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

// ─── Component ───────────────────────────────────────────────────────────────

export function PuzzlesTab() {
  const [puzzles, setPuzzles] = useState<ApiPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<PuzzleForm>(defaultForm);
  const [slugError, setSlugError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "next_point" | "scenarios">("all");
  const [filterPublished, setFilterPublished] = useState<"all" | "true" | "false">("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  async function fetchPuzzles() {
    setLoading(true);
    const res = await fetch("/api/puzzles?all=true", { headers: authHeader() });
    if (res.ok) setPuzzles(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPuzzles(); }, []);

  // Auto-update slug suggestion when type changes on a new puzzle
  useEffect(() => {
    if (editingId === "new") {
      setForm((f) => ({ ...f, slug: suggestSlug(f.type, puzzles.map((p) => p.slug)) }));
    }
  }, [form.type, editingId]); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    const suggested = suggestSlug("next_point", puzzles.map((p) => p.slug));
    setForm({ ...defaultForm, slug: suggested });
    setEditingId("new");
    setSlugError("");
    setShowPreview(false);
  }

  function openEdit(p: ApiPuzzle) {
    setForm(apiToForm(p));
    setEditingId(p.id);
    setSlugError("");
    setShowPreview(false);
  }

  function openDuplicate(p: ApiPuzzle) {
    const duplicated = apiToForm(p);
    duplicated.slug = suggestSlug(p.type, puzzles.map((q) => q.slug));
    duplicated.published = false;
    duplicated.notes = "";
    setForm(duplicated);
    setEditingId("new");
    setSlugError("");
    setShowPreview(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowPreview(false);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function handleSave() {
    // Validate slug uniqueness
    const duplicate = puzzles.find((p) => p.slug === form.slug && p.id !== editingId);
    if (duplicate) {
      setSlugError(`Slug "${form.slug}" is already used by another puzzle.`);
      return;
    }
    setSlugError("");
    setSaving(true);
    const body = formToBody(form);
    if (editingId === "new") {
      await fetch("/api/puzzles", { method: "POST", headers: authHeader(), body: JSON.stringify(body) });
    } else {
      await fetch(`/api/puzzles/${editingId}`, { method: "PUT", headers: authHeader(), body: JSON.stringify(body) });
    }
    setSaving(false);
    setEditingId(null);
    setShowPreview(false);
    fetchPuzzles();
  }

  async function handleTogglePublished(p: ApiPuzzle) {
    await fetch(`/api/puzzles/${p.id}`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ published: !p.published }),
    });
    fetchPuzzles();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this puzzle permanently?")) return;
    await fetch(`/api/puzzles/${id}`, { method: "DELETE", headers: authHeader() });
    if (editingId === id) setEditingId(null);
    fetchPuzzles();
  }

  // Filter + sort
  const displayed = [...puzzles]
    .filter((p) => filterType === "all" || p.type === filterType)
    .filter((p) => filterPublished === "all" || String(p.published) === filterPublished)
    .sort((a, b) => {
      let av: string | boolean = a[sortField];
      let bv: string | boolean = b[sortField];
      if (typeof av === "boolean") { av = String(av); bv = String(bv); }
      const cmp = (av as string).localeCompare(bv as string);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const preview = showPreview ? buildPreview(form) : null;

  function SortBtn({ field, label }: { field: SortField; label: string }) {
    const active = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        style={{
          ...smallBtnStyle,
          color: active ? "#101828" : "#667085",
          fontWeight: active ? 600 : 400,
          fontSize: 12,
        }}
      >
        {label} {active ? (sortDir === "asc" ? "↑" : "↓") : ""}
      </button>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#101828" }}>Puzzles</div>
        {editingId === null && (
          <button onClick={openNew} style={submitBtnStyle}>+ New puzzle</button>
        )}
      </div>

      {/* Filters + sort */}
      {editingId === null && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)} style={selectStyle}>
            <option value="all">All types</option>
            <option value="next_point">Next Point</option>
            <option value="scenarios">Scenarios</option>
          </select>
          <select value={filterPublished} onChange={(e) => setFilterPublished(e.target.value as typeof filterPublished)} style={selectStyle}>
            <option value="all">All statuses</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#667085" }}>
            Sort:
            <SortBtn field="created_at" label="Created" />
            <SortBtn field="updated_at" label="Modified" />
            <SortBtn field="slug" label="Name" />
            <SortBtn field="type" label="Type" />
            <SortBtn field="published" label="Status" />
          </div>
        </div>
      )}

      {/* Form */}
      {editingId !== null && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#101828", marginBottom: 16 }}>
            {editingId === "new" ? "New puzzle" : "Edit puzzle"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Meta */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <input
                  placeholder="slug (e.g. puzzle-003)"
                  value={form.slug}
                  onChange={(e) => { setForm({ ...form, slug: e.target.value }); setSlugError(""); }}
                  style={{ ...inputStyle, borderColor: slugError ? "#dc2626" : "#d0d5dd" }}
                />
                {slugError && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{slugError}</div>}
              </div>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PuzzleForm["type"] })}
                style={selectStyle}
              >
                <option value="next_point">Next Point</option>
                <option value="scenarios">Scenarios</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#475467", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
              </label>
            </div>

            <input
              placeholder="Title shown to users"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />

            {/* Base points */}
            <div>
              <SectionLabel>Base data points</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {form.base_points.map((p, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 10, color: "#98a2b3" }}>{i + 1}</span>
                    <input
                      type="number"
                      value={p.value}
                      onChange={(e) => {
                        const next = [...form.base_points];
                        next[i] = { value: e.target.value };
                        setForm({ ...form, base_points: next });
                      }}
                      style={{ ...inputStyle, width: 60, padding: "6px 8px", textAlign: "center" }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                  <button onClick={() => setForm({ ...form, base_points: [...form.base_points, { value: "" }] })} style={smallBtnStyle}>+</button>
                  {form.base_points.length > 1 && (
                    <button onClick={() => setForm({ ...form, base_points: form.base_points.slice(0, -1) })} style={smallBtnStyle}>−</button>
                  )}
                </div>
              </div>
            </div>

            {/* Next Point: answers */}
            {form.type === "next_point" && (
              <div>
                <SectionLabel>Answers (mark one as correct)</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                  {form.answers.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={a.is_correct}
                        onChange={() => setForm({
                          ...form,
                          answers: form.answers.map((ans, j) => ({ ...ans, is_correct: j === i })),
                        })}
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={a.value}
                        onChange={(e) => {
                          const next = [...form.answers];
                          next[i] = { ...next[i], value: e.target.value };
                          setForm({ ...form, answers: next });
                        }}
                        style={{ ...inputStyle, width: 100 }}
                      />
                      {form.answers.length > 2 && (
                        <button onClick={() => setForm({ ...form, answers: form.answers.filter((_, j) => j !== i) })} style={{ ...smallBtnStyle, color: "#dc2626" }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setForm({ ...form, answers: [...form.answers, { label: "", value: "", is_correct: false }] })} style={{ ...smallBtnStyle, alignSelf: "flex-start" }}>+ Answer</button>
                </div>
              </div>
            )}

            {/* Scenarios */}
            {form.type === "scenarios" && (
              <div>
                <SectionLabel>Scenarios (mark one as correct)</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 6 }}>
                  {form.scenarios.map((s, si) => (
                    <div key={si} style={{ background: "#f9fafb", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <input
                          type="radio"
                          name="correct_scenario"
                          checked={s.is_correct}
                          onChange={() => setForm({
                            ...form,
                            scenarios: form.scenarios.map((sc, j) => ({ ...sc, is_correct: j === si })),
                          })}
                        />
                        <input
                          placeholder="Label"
                          value={s.label}
                          onChange={(e) => {
                            const next = [...form.scenarios];
                            next[si] = { ...next[si], label: e.target.value };
                            setForm({ ...form, scenarios: next });
                          }}
                          style={{ ...inputStyle, width: 80 }}
                        />
                        <span style={{ fontSize: 12, color: "#667085" }}>
                          step {form.base_points.filter((p) => p.value !== "").length + 1}+
                        </span>
                        {form.scenarios.length > 2 && (
                          <button onClick={() => setForm({ ...form, scenarios: form.scenarios.filter((_, j) => j !== si) })} style={{ ...smallBtnStyle, color: "#dc2626", marginLeft: "auto" }}>Remove</button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {s.points.map((p, pi) => (
                          <div key={pi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: 10, color: "#98a2b3" }}>
                              {form.base_points.filter((bp) => bp.value !== "").length + pi + 1}
                            </span>
                            <input
                              type="number"
                              value={p.value}
                              onChange={(e) => {
                                const next = [...form.scenarios];
                                next[si] = {
                                  ...next[si],
                                  points: next[si].points.map((pp, j) => j === pi ? { value: e.target.value } : pp),
                                };
                                setForm({ ...form, scenarios: next });
                              }}
                              style={{ ...inputStyle, width: 60, padding: "6px 8px", textAlign: "center" }}
                            />
                          </div>
                        ))}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                          <button onClick={() => {
                            const next = [...form.scenarios];
                            next[si] = { ...next[si], points: [...next[si].points, { value: "" }] };
                            setForm({ ...form, scenarios: next });
                          }} style={smallBtnStyle}>+</button>
                          {s.points.length > 1 && (
                            <button onClick={() => {
                              const next = [...form.scenarios];
                              next[si] = { ...next[si], points: next[si].points.slice(0, -1) };
                              setForm({ ...form, scenarios: next });
                            }} style={smallBtnStyle}>−</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setForm({
                    ...form,
                    scenarios: [...form.scenarios, {
                      label: String.fromCharCode(65 + form.scenarios.length),
                      is_correct: false,
                      points: emptyScenarioPoints(),
                    }],
                  })} style={{ ...smallBtnStyle, alignSelf: "flex-start" }}>+ Scenario</button>
                </div>
              </div>
            )}

            {/* Explanations */}
            <div>
              <SectionLabel>Explanation — correct</SectionLabel>
              <textarea
                value={form.explanation_correct}
                onChange={(e) => setForm({ ...form, explanation_correct: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: "vertical", marginTop: 6 }}
                placeholder="Shown when the user answers correctly."
              />
            </div>
            <div>
              <SectionLabel>
                Explanation — incorrect{" "}
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  (use {"{selected}"} and {"{correct}"})
                </span>
              </SectionLabel>
              <textarea
                value={form.explanation_incorrect}
                onChange={(e) => setForm({ ...form, explanation_incorrect: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: "vertical", marginTop: 6 }}
              />
            </div>

            {/* Notes */}
            <div>
              <SectionLabel>Notes (private)</SectionLabel>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginTop: 6 }}
                placeholder="Your private notes on this puzzle."
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
              <button onClick={handleSave} disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setPreviewKey((k) => k + 1); setShowPreview(true); }} style={secondaryBtnStyle}>
                Preview
              </button>
              <button onClick={cancelEdit} style={cancelBtnStyle}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && (
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Preview</SectionLabel>
          <div style={{ marginTop: 8, background: "#eef2f7", borderRadius: 16, padding: "16px 0", overflow: "hidden" }}>
            {"answers" in preview ? (
              <PuzzleCard key={previewKey} puzzle={preview as PuzzleDefinition} />
            ) : (
              <ScenarioCard key={previewKey} puzzle={preview as ScenarioPuzzleDefinition} />
            )}
          </div>
        </div>
      )}

      {/* Puzzle list */}
      {loading ? (
        <div style={{ color: "#667085", fontSize: 14 }}>Loading...</div>
      ) : displayed.length === 0 ? (
        <div style={{ color: "#667085", fontSize: 14 }}>No puzzles match the selected filters.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map((p) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#101828", marginBottom: 4 }}>{p.title || p.slug}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  <Badge text={p.type === "next_point" ? "Next Point" : "Scenarios"} color="#667085" />
                  <Badge text={p.slug} color="#98a2b3" />
                  <Badge text={p.published ? "Published" : "Unpublished"} color={p.published ? "#16a34a" : "#b45309"} />
                </div>
                <div style={{ fontSize: 11, color: "#98a2b3" }}>
                  Created {formatDate(p.created_at)}
                  {p.updated_at !== p.created_at && <> · Modified {formatDate(p.updated_at)}</>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEdit(p)} style={smallBtnStyle}>Edit</button>
                <button onClick={() => openDuplicate(p)} style={smallBtnStyle}>Duplicate</button>
                <button onClick={() => handleTogglePublished(p)} style={smallBtnStyle}>
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ ...smallBtnStyle, color: "#dc2626" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Small components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color, background: `${color}18`, padding: "2px 7px", borderRadius: 5 }}>
      {text}
    </span>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 13,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 13,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: "#101828",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#101828",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#667085",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const smallBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 13,
  color: "#667085",
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "2px 6px",
};
