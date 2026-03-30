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

  useEffect(() => {
    fetch("/api/puzzles")
      .then((r) => r.json())
      .then((data: any[]) => {
        const nextPoint: PuzzleDefinition[] = [];
        const scenarios: ScenarioPuzzleDefinition[] = [];

        for (const p of data) {
          if (p.type === "next_point") {
            const correctAnswer = p.puzzle_answers.find((a: any) => a.is_correct);
            nextPoint.push({
              id: p.slug,
              title: p.title,
              baseData: [...p.puzzle_base_points].sort((a: any, b: any) => a.step - b.step),
              answers: p.puzzle_answers.map((a: any) => ({
                id: String(a.id),
                label: a.label,
                value: Number(a.value),
              })),
              correctAnswerId: String(correctAnswer?.id),
              explanation: {
                correct: p.explanation_correct,
                incorrect: templateToFn(p.explanation_incorrect),
              },
            });
          } else if (p.type === "scenarios") {
            const correctScenario = p.puzzle_scenarios.find((s: any) => s.is_correct);
            scenarios.push({
              id: p.slug,
              title: p.title,
              baseData: [...p.puzzle_base_points].sort((a: any, b: any) => a.step - b.step),
              scenarios: p.puzzle_scenarios.map((s: any) => ({
                id: String(s.id),
                label: s.label,
                data: [...s.puzzle_scenario_points].sort((a: any, b: any) => a.step - b.step),
              })),
              correctScenarioId: String(correctScenario?.id),
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
      .finally(() => setLoading(false));
  }, []);

  return { nextPointPuzzles, scenarioPuzzles, loading };
}
