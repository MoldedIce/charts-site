import type { WhatHappenedPuzzleDefinition } from "../../data/puzzle-types";
import { useWhatHappenedState } from "../../hooks/useWhatHappenedState";
import { AnswerButtons } from "./AnswerButtons";
import { PuzzleHeader } from "./PuzzleHeader";
import { ResultBanner } from "./ResultBanner";
import { WhatHappenedChart } from "./WhatHappenedChart";
import { puzzleTheme } from "./puzzle-theme";

type WhatHappenedCardProps = {
  puzzle: WhatHappenedPuzzleDefinition;
};

export function WhatHappenedCard({ puzzle }: WhatHappenedCardProps) {
  const {
    selectedAnswerId,
    hasAnswered,
    isCorrect,
    selectedAnswer,
    handleAnswerClick,
    handleReset,
  } = useWhatHappenedState(puzzle);

  const explanationText = !hasAnswered ? null : selectedAnswer?.explanation ?? null;

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
        <PuzzleHeader title={puzzle.title} onReset={handleReset} />
        <WhatHappenedChart puzzle={puzzle} hasAnswered={hasAnswered} />

        <AnswerButtons
          answers={puzzle.answers.map((a, i) => ({
            id: a.id,
            label: `${String.fromCharCode(65 + i)}. ${a.label}`,
          }))}
          selectedAnswerId={selectedAnswerId}
          hoveredAnswerId={null}
          correctAnswerId={puzzle.correctAnswerId}
          hasAnswered={hasAnswered}
          onAnswerClick={handleAnswerClick}
          onAnswerHover={() => {}}
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
