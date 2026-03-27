import type { PuzzleDefinition } from "../puzzle-types";

export const puzzle001: PuzzleDefinition = {
  id: "puzzle-001",
  title: "What should the next point be?",
  subtitle: "Puzzle 1",
  baseData: [
    { step: 1, value: 12 },
    { step: 2, value: 18 },
    { step: 3, value: 27 },
    { step: 4, value: 39 },
    { step: 5, value: 54 },
    { step: 6, value: 72 },
    { step: 7, value: 93 },

  ],
  answers: [
    { id: "a", label: "228", value: 228 },
    { id: "b", label: "243", value: 243 },
    { id: "c", label: "261", value: 261 },
  ],
  correctAnswerId: "b",
  explanation: {
    correct: "Correct. The increases grow by 3 each time, so the next point is 243.",
    incorrect: (chosenLabel, correctLabel) =>
      `Not quite. You chose ${chosenLabel}, but the correct next point is ${correctLabel}.`,
  },
};