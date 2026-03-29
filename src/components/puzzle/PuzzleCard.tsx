import type { PuzzleDefinition } from "../../data/puzzle-types";
import { usePuzzleState } from "../../hooks/usePuzzleState";
import { AnswerButtons } from "./AnswerButtons";
import { PuzzleChart } from "./PuzzleChart";
import { PuzzleHeader } from "./PuzzleHeader";
import { ResultBanner } from "./ResultBanner";
import { puzzleTheme } from "./puzzle-theme";

type PuzzleCardProps = {
  puzzle: PuzzleDefinition;
};

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const {
    selectedAnswerId,
    hoveredAnswerId,
    hasAnswered,
    isCorrect,
    selectedAnswer,
    correctAnswer,
    handleAnswerClick,
    handleAnswerHover,
    handleReset,
  } = usePuzzleState(puzzle);

  const explanationText = !hasAnswered
    ? null
    : isCorrect
    ? puzzle.explanation.correct
    : puzzle.explanation.incorrect(
        selectedAnswer?.label ?? "",
        correctAnswer?.label ?? ""
      );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: puzzleTheme.sizes.contentMaxWidth,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: puzzleTheme.sizes.chartMaxWidth, margin: "0 auto" }}>
        <PuzzleHeader
          title={puzzle.title}
          onReset={handleReset}
        />
        <PuzzleChart
          puzzle={puzzle}
          selectedAnswerId={selectedAnswerId}
          hoveredAnswerId={hoveredAnswerId}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
        />

        <AnswerButtons
          answers={puzzle.answers}
          selectedAnswerId={selectedAnswerId}
          hoveredAnswerId={hoveredAnswerId}
          correctAnswerId={puzzle.correctAnswerId}
          hasAnswered={hasAnswered}
          onAnswerClick={handleAnswerClick}
          onAnswerHover={handleAnswerHover}
        />

        <ResultBanner
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          text={explanationText}
        />
      </div>
    </div>
  );
}