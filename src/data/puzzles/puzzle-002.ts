import type { PuzzleDefinition } from "../puzzle-types";

export const puzzle002: PuzzleDefinition = {
  id: "puzzle-002",
  title: "What should the next point be?",
  subtitle: "Puzzle 2",
  baseData: [
    { step: 1, value: 5 },
    { step: 2, value: 9 },
    { step: 3, value: 15 },
    { step: 4, value: 23 },
    { step: 5, value: 33 },
    { step: 6, value: 45 },
    { step: 7, value: 59 },
    { step: 8, value: 75 },
    { step: 9, value: 93 },
    { step: 10, value: 113 },
    { step: 11, value: 135 },
    { step: 12, value: 150 },
  ],
  answers: [
    { id: "a", label: "180", value: 180 },
    { id: "b", label: "200", value: 200 },
    { id: "c", label: "220", value: 220 },
  ],
  correctAnswerId: "b",
  explanation: {
    correct: "Correct. The increases grow by 2 each time, so the next point is 159.",
    incorrect: (chosenLabel, correctLabel) =>
      `Not quite. You chose ${chosenLabel}, but the correct next point is ${correctLabel}.`,
  },
};