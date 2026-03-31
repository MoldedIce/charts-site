import { useEffect, useState } from "react";
import type { PuzzleDefinition, ScenarioPuzzleDefinition } from "../data/puzzle-types";

function templateToFn(template: string) {
  return (chosen: string, correct: string) =>
    template.replace("{selected}", chosen).replace("{correct}", correct);
}

export function usePuzzles() {
  const [nextPointPuzzles, setNextPointPuzzles] = useState<PuzzleDefinition[]>([]);
  const [scenarioPuzzles, setScenarioPuzzles] = useState<ScenarioPuzzleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/puzzles")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load puzzles (${r.status})`);
        return r.json();
      })
      .then((data: any[]) => {
        const nextPoint: PuzzleDefinition[] = [];
        const scenarios: ScenarioPuzzleDefinition[] = [];

        for (const p of data) {
          if (p.type === "next_point") {
            nextPoint.push({
              id: p.slug,
              title: p.title,
              baseData: [...p.puzzle_base_points].sort((a: any, b: any) => a.step - b.step),
              answers: p.puzzle_answers.map((a: any) => ({
                id: String(a.id),
                label: a.label,
                value: Number(a.value),
              })),
              correctAnswerId: p.correctAnswerId ?? "",
              explanation: {
                correct: p.explanation_correct,
                incorrect: templateToFn(p.explanation_incorrect),
              },
            });
          } else if (p.type === "scenarios") {
            scenarios.push({
              id: p.slug,
              title: p.title,
              baseData: [...p.puzzle_base_points].sort((a: any, b: any) => a.step - b.step),
              scenarios: p.puzzle_scenarios.map((s: any) => ({
                id: String(s.id),
                label: s.label,
                data: [...s.puzzle_scenario_points].sort((a: any, b: any) => a.step - b.step),
              })),
              correctScenarioId: p.correctScenarioId ?? "",
              explanation: {
                correct: p.explanation_correct,
                incorrect: templateToFn(p.explanation_incorrect),
              },
            });
          }
        }

        setNextPointPuzzles(nextPoint);
        setScenarioPuzzles(scenarios);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { nextPointPuzzles, scenarioPuzzles, loading, error };
}
