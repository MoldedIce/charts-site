import type { AnswerOption } from "../../data/puzzle-types";
import { puzzleTheme } from "./puzzle-theme";

type AnswerButtonsProps = {
  answers: AnswerOption[];
  selectedAnswerId: string | null;
  hoveredAnswerId: string | null;
  correctAnswerId: string;
  hasAnswered: boolean;
  onAnswerClick: (answerId: string) => void;
  onAnswerHover: (answerId: string | null) => void;
};

export function AnswerButtons({
  answers,
  selectedAnswerId,
  hoveredAnswerId,
  correctAnswerId,
  hasAnswered,
  onAnswerClick,
  onAnswerHover,
}: AnswerButtonsProps) {
  function getAnswerStyles(answerId: string): React.CSSProperties {
    const isHovered = hoveredAnswerId === answerId;

    const baseStyle: React.CSSProperties = {
      width: "100%",
      padding: "14px 16px",
      borderRadius: puzzleTheme.radii.button,
      border: `1px solid ${puzzleTheme.colors.border}`,
      background: puzzleTheme.colors.cardBackground,
      color: puzzleTheme.colors.textPrimary,
      cursor: hasAnswered ? "default" : "pointer",
      fontSize: 16,
      textAlign: "left",
      transition: "all 0.15s ease",
      boxShadow:
        isHovered && !hasAnswered ? "0 0 0 2px rgba(17,24,39,0.04)" : "none",
    };

    if (!hasAnswered) {
      if (isHovered) {
        return {
          ...baseStyle,
          border: `1px solid ${puzzleTheme.colors.labelNeutral}`,
          background: "#fcfcfd",
        };
      }

      return baseStyle;
    }

    if (answerId === correctAnswerId) {
      return {
        ...baseStyle,
        border: `1px solid ${puzzleTheme.colors.correct}`,
        background: "#f0fdf4",
        color: "#166534",
        fontWeight: 600,
      };
    }

    if (answerId === selectedAnswerId && answerId !== correctAnswerId) {
      return {
        ...baseStyle,
        border: `1px solid ${puzzleTheme.colors.incorrect}`,
        background: "#fef2f2",
        color: "#991b1b",
        fontWeight: 600,
      };
    }

    return {
      ...baseStyle,
      opacity: 0.7,
    };
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {answers.map((answer) => (
        <button
          key={answer.id}
          onClick={() => onAnswerClick(answer.id)}
          onMouseEnter={() => onAnswerHover(answer.id)}
          onMouseLeave={() => onAnswerHover(null)}
          style={getAnswerStyles(answer.id)}
        >
          {answer.label}
        </button>
      ))}
    </div>
  );
}