import type { ScenarioPuzzleDefinition } from "../puzzle-types";

// Base data: differences decrease by 2 each step (decelerating growth)
// diffs: 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4
// Scenario A: growth re-accelerates (wrong — reverses the pattern)
// Scenario B: deceleration continues — peaks and turns negative (correct)
// Scenario C: growth collapses sharply (wrong — too pessimistic)

export const scenario002: ScenarioPuzzleDefinition = {
  id: "scenario-002",
  title: "Which curve is the most plausible continuation?",
  baseData: [
    { step: 1, value: 10 },
    { step: 2, value: 40 },
    { step: 3, value: 68 },
    { step: 4, value: 94 },
    { step: 5, value: 118 },
    { step: 6, value: 140 },
    { step: 7, value: 160 },
    { step: 8, value: 178 },
    { step: 9, value: 194 },
    { step: 10, value: 208 },
    { step: 11, value: 220 },
    { step: 12, value: 230 },
    { step: 13, value: 238 },
    { step: 14, value: 244 },
    { step: 15, value: 248 },
  ],
  scenarios: [
    {
      id: "a",
      label: "A",
      data: [
        { step: 16, value: 254 },
        { step: 17, value: 262 },
        { step: 18, value: 272 },
        { step: 19, value: 284 },
        { step: 20, value: 298 },
        { step: 21, value: 314 },
        { step: 22, value: 332 },
      ],
    },
    {
      id: "b",
      label: "B",
      data: [
        { step: 16, value: 250 },
        { step: 17, value: 250 },
        { step: 18, value: 248 },
        { step: 19, value: 244 },
        { step: 20, value: 238 },
        { step: 21, value: 230 },
        { step: 22, value: 220 },
      ],
    },
    {
      id: "c",
      label: "C",
      data: [
        { step: 16, value: 244 },
        { step: 17, value: 232 },
        { step: 18, value: 212 },
        { step: 19, value: 184 },
        { step: 20, value: 148 },
        { step: 21, value: 104 },
        { step: 22, value: 52 },
      ],
    },
  ],
  correctScenarioId: "b",
  explanation: {
    correct:
      "Correct. The gap between each value decreases by 2 each step. Following this pattern, growth slows to zero then turns negative.",
    incorrect: (chosenLabel, correctLabel) =>
      `Not quite. You chose ${chosenLabel}, but the correct continuation is ${correctLabel}. The gap between each value decreases by 2 each step — growth peaks, then declines.`,
  },
};
