export type AnswerOption = {
  id: string;
  label: string;
  value: number;
};

export type Point = {
  step: number;
  value: number;
};

export type PuzzleDefinition = {
  id: string;
  title: string;
  subtitle?: string;
  baseData: Point[];
  answers: AnswerOption[];
  correctAnswerId: string;
  explanation: {
    correct: string;
    incorrect: (chosenLabel: string, correctLabel: string) => string;
  };
};

export type WhatHappenedAnswer = {
  id: string;
  label: string;
  explanation: string;
};

export type WhatHappenedPuzzleDefinition = {
  id: string;
  title: string;
  baseData: Point[];
  forecastData: Point[];
  actualData: Point[];
  answers: WhatHappenedAnswer[];
  correctAnswerId: string;
};

export type ScenarioOption = {
  id: string;
  label: string;
  data: Point[];
};

export type ScenarioPuzzleDefinition = {
  id: string;
  title: string;
  baseData: Point[];
  scenarios: ScenarioOption[];
  correctScenarioId: string;
  explanation: {
    correct: string;
    incorrect: (chosenLabel: string, correctLabel: string) => string;
  };
};