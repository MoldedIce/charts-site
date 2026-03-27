import { useMemo, useState } from "react";
import type { PuzzleDefinition } from "../data/puzzle-types";

export function usePuzzleState(puzzle: PuzzleDefinition) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [hoveredAnswerId, setHoveredAnswerId] = useState<string | null>(null);

  const hasAnswered = selectedAnswerId !== null;
  const isCorrect = selectedAnswerId === puzzle.correctAnswerId;

  const selectedAnswer = useMemo(
    () => puzzle.answers.find((answer) => answer.id === selectedAnswerId) ?? null,
    [puzzle.answers, selectedAnswerId]
  );

  const correctAnswer = useMemo(
    () =>
      puzzle.answers.find((answer) => answer.id === puzzle.correctAnswerId) ?? null,
    [puzzle.answers, puzzle.correctAnswerId]
  );

  function handleAnswerClick(answerId: string) {
    if (hasAnswered) {
      return;
    }

    setSelectedAnswerId(answerId);
  }

  function handleAnswerHover(answerId: string | null) {
    if (hasAnswered) {
      return;
    }

    setHoveredAnswerId(answerId);
  }

  function handleReset() {
    setSelectedAnswerId(null);
    setHoveredAnswerId(null);
  }

  return {
    selectedAnswerId,
    hoveredAnswerId,
    hasAnswered,
    isCorrect,
    selectedAnswer,
    correctAnswer,
    handleAnswerClick,
    handleAnswerHover,
    handleReset,
  };
}