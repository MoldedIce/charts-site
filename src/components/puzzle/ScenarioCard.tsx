import type { ScenarioPuzzleDefinition } from "../../data/puzzle-types";
import { useScenarioState } from "../../hooks/useScenarioState";
import { AnswerButtons } from "./AnswerButtons";
import { PuzzleHeader } from "./PuzzleHeader";
import { ResultBanner } from "./ResultBanner";
import { ScenarioChart } from "./ScenarioChart";
import { puzzleTheme } from "./puzzle-theme";

type ScenarioCardProps = {
  puzzle: ScenarioPuzzleDefinition;
};

export function ScenarioCard({ puzzle }: ScenarioCardProps) {
  const {
    selectedId,
    hoveredId,
    hasAnswered,
    isCorrect,
    selectedScenario,
    correctScenario,
    handleSelect,
    handleHover,
    handleReset,
  } = useScenarioState(puzzle);

  const explanationText = !hasAnswered
    ? null
    : isCorrect
    ? puzzle.explanation.correct
    : puzzle.explanation.incorrect(
        selectedScenario?.label ?? "",
        correctScenario?.label ?? ""
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
      <PuzzleHeader title={puzzle.title} onReset={handleReset} />

      <ScenarioChart
        puzzle={puzzle}
        selectedId={selectedId}
        hoveredId={hoveredId}
        hasAnswered={hasAnswered}
      />

      <AnswerButtons
        answers={puzzle.scenarios.map((s) => ({ id: s.id, label: s.label }))}
        selectedAnswerId={selectedId}
        hoveredAnswerId={null}
        correctAnswerId={puzzle.correctScenarioId}
        hasAnswered={hasAnswered}
        onAnswerClick={handleSelect}
        onAnswerHover={handleHover}
      />

      <ResultBanner
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
        text={explanationText}
      />
    </div>
  );
}
