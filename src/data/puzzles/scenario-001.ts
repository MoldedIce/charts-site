import type { ScenarioPuzzleDefinition } from "../puzzle-types";

// Base data: differences between steps increase by 1 each time (3, 4, 5, ... 13)
// Scenario A: constant diff (too slow, linear)
// Scenario B: diff increases by 1 (correct, continues the pattern)
// Scenario C: diff increases by 3 (too fast, accelerating)

export const scenario001: ScenarioPuzzleDefinition = {
  id: "scenario-001",
  title: "Which curve is the most plausible continuation?",
  baseData: [
    { step: 1, value: 10 },
    { step: 2, value: 13 },
    { step: 3, value: 17 },
    { step: 4, value: 22 },
    { step: 5, value: 28 },
    { step: 6, value: 35 },
    { step: 7, value: 43 },
    { step: 8, value: 52 },
    { step: 9, value: 62 },
    { step: 10, value: 73 },
    { step: 11, value: 85 },
    { step: 12, value: 98 },
  ],
  scenarios: [
    {
      id: "a",
      label: "A",
      data: [
        { step: 13, value: 111 },
        { step: 14, value: 124 },
        { step: 15, value: 137 },
        { step: 16, value: 150 },
        { step: 17, value: 163 },
        { step: 18, value: 176 },
      ],
    },
    {
      id: "b",
      label: "B",
      data: [
        { step: 13, value: 112 },
        { step: 14, value: 127 },
        { step: 15, value: 143 },
        { step: 16, value: 160 },
        { step: 17, value: 178 },
        { step: 18, value: 197 },
      ],
    },
    {
      id: "c",
      label: "C",
      data: [
        { step: 13, value: 114 },
        { step: 14, value: 133 },
        { step: 15, value: 155 },
        { step: 16, value: 180 },
        { step: 17, value: 208 },
        { step: 18, value: 239 },
      ],
    },
  ],
  correctScenarioId: "b",
  explanation: {
    correct:
      "Correct. The gap between each value increases by 1 each step. Scenario B continues this pattern.",
    incorrect: (chosenLabel, correctLabel) =>
      `Not quite. You chose ${chosenLabel}, but the correct continuation is ${correctLabel}. The gap between each value increases by 1 each step.`,
  },
};
