import type { Point } from "../../data/puzzle-types";

type ResultDotProps = {
  cx?: number;
  cy?: number;
  payload?: Point;
  fill: string;
  targetStep: number;
};

export function ResultDot({
  cx,
  cy,
  payload,
  fill,
  targetStep,
}: ResultDotProps) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    !payload ||
    payload.step !== targetStep
  ) {
    return null;
  }

  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke={fill} />;
}