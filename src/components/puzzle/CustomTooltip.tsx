import type { Point } from "../../data/puzzle-types";
import { puzzleTheme } from "./puzzle-theme";

type TooltipItem = {
  value?: string | number | ReadonlyArray<string | number>;
  payload?: Point;
  dataKey?: string | number | ((obj: any) => any);
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<TooltipItem>;
  label?: string | number;
  hasAnswered: boolean;
  isCorrect: boolean;
  selectedAnswerValue?: number | null;
  correctAnswerValue: number;
  lastKnownStep: number;
  targetStep: number;
};

export function CustomTooltip({
  active,
  payload,
  label,
  hasAnswered,
  isCorrect,
  selectedAnswerValue,
  correctAnswerValue,
  lastKnownStep,
  targetStep,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || typeof label !== "number") {
    return null;
  }

  const stepItems = payload.filter(
    (item) =>
      typeof item.value === "number" &&
      item.payload &&
      item.payload.step === label
  );

  const boxStyle: React.CSSProperties = {
    background: puzzleTheme.colors.cardBackground,
    border: `1px solid ${puzzleTheme.colors.borderLight}`,
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    fontSize: 14,
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: 8,
    color: puzzleTheme.colors.textPrimary,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#344054",
  };

  const dotStyle = (background: string): React.CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    background,
    display: "inline-block",
  });

  if (label === lastKnownStep) {
    const item = stepItems[0];
    if (!item || typeof item.value !== "number") {
      return null;
    }

    return (
      <div style={boxStyle}>
        <div style={titleStyle}>Step {lastKnownStep}</div>
        <div style={rowStyle}>
          <span style={dotStyle(puzzleTheme.colors.lineBase)} />
          <span>{item.value}</span>
        </div>
      </div>
    );
  }

  if (label === targetStep) {
    if (!hasAnswered) {
      return null;
    }

    const itemsToShow: Array<{ label: string; value: number; color: string }> = [];

    if (!isCorrect && typeof selectedAnswerValue === "number") {
      itemsToShow.push({
        label: "Your choice",
        value: selectedAnswerValue,
        color: puzzleTheme.colors.incorrect,
      });
    }

    itemsToShow.push({
      label: "Correct",
      value: correctAnswerValue,
      color: puzzleTheme.colors.correct,
    });

    return (
      <div style={boxStyle}>
        <div style={titleStyle}>Step {targetStep}</div>

        {itemsToShow.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            style={{
              ...rowStyle,
              marginTop: index === 0 ? 0 : 6,
            }}
          >
            <span style={dotStyle(item.color)} />
            <span>
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const item = stepItems[0];
  if (!item || typeof item.value !== "number") {
    return null;
  }

  return (
    <div style={boxStyle}>
      <div style={titleStyle}>Step {label}</div>
      <div style={rowStyle}>
        <span style={dotStyle(puzzleTheme.colors.lineBase)} />
        <span>{item.value}</span>
      </div>
    </div>
  );
}