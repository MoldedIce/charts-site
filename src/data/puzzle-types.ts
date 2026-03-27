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