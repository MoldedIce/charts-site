import { useMemo, useState } from "react";
import type { WhatHappenedPuzzleDefinition } from "../data/puzzle-types";

export function useWhatHappenedState(puzzle: WhatHappenedPuzzleDefinition) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const hasAnswered = selectedAnswerId !== null;
  const isCorrect = selectedAnswerId === puzzle.correctAnswerId;

  const selectedAnswer = useMemo(
    () => puzzle.answers.find((a) => a.id === selectedAnswerId) ?? null,
    [puzzle.answers, selectedAnswerId]
  );

  function handleAnswerClick(answerId: string) {
    if (hasAnswered) return;
    setSelectedAnswerId(answerId);
  }

  function handleReset() {
    setSelectedAnswerId(null);
  }

  return {
    selectedAnswerId,
    hasAnswered,
    isCorrect,
    selectedAnswer,
    handleAnswerClick,
    handleReset,
  };
}
