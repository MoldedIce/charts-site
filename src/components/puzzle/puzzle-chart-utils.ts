import type {
  AnswerOption,
  Point,
  PuzzleDefinition,
} from "../../data/puzzle-types";

export type CandidateLine = {
  id: string;
  label: string;
  data: Point[];
};

export function getLastBasePoint(baseData: Point[]): Point {
  return baseData[baseData.length - 1];
}

export function getLastKnownStep(baseData: Point[]): number {
  return getLastBasePoint(baseData).step;
}

export function getTargetStep(baseData: Point[]): number {
  return getLastKnownStep(baseData) + 1;
}

export function getCorrectAnswer(
  puzzle: PuzzleDefinition
): AnswerOption | null {
  return (
    puzzle.answers.find((answer) => answer.id === puzzle.correctAnswerId) ?? null
  );
}

export function getSelectedAnswer(
  puzzle: PuzzleDefinition,
  selectedAnswerId: string | null
): AnswerOption | null {
  return puzzle.answers.find((answer) => answer.id === selectedAnswerId) ?? null;
}

export function getCandidateLines(puzzle: PuzzleDefinition): CandidateLine[] {
  const lastBasePoint = getLastBasePoint(puzzle.baseData);
  const targetStep = getTargetStep(puzzle.baseData);

  return puzzle.answers.map((answer) => ({
    id: answer.id,
    label: answer.label,
    data: [lastBasePoint, { step: targetStep, value: answer.value }],
  }));
}

export function getStepTicks(baseData: Point[]): number[] {
  const targetStep = getTargetStep(baseData);
  return Array.from({ length: targetStep }, (_, index) => index + 1);
}