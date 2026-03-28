import { useState } from "react";
import type { ScenarioPuzzleDefinition, ScenarioOption } from "../data/puzzle-types";

export function useScenarioState(puzzle: ScenarioPuzzleDefinition) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hasAnswered = selectedId !== null;
  const isCorrect = selectedId === puzzle.correctScenarioId;

  const selectedScenario: ScenarioOption | null =
    puzzle.scenarios.find((s) => s.id === selectedId) ?? null;

  const correctScenario: ScenarioOption | null =
    puzzle.scenarios.find((s) => s.id === puzzle.correctScenarioId) ?? null;

  function handleSelect(id: string) {
    if (hasAnswered) return;
    setSelectedId(id);
  }

  function handleHover(id: string | null) {
    if (hasAnswered) return;
    setHoveredId(id);
  }

  function handleReset() {
    setSelectedId(null);
    setHoveredId(null);
  }

  return {
    selectedId,
    hoveredId,
    hasAnswered,
    isCorrect,
    selectedScenario,
    correctScenario,
    handleSelect,
    handleHover,
    handleReset,
  };
}
