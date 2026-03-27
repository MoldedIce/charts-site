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
      border: "none",
      background: "rgba(0,0,0,0.04)",
      color: puzzleTheme.colors.textPrimary,
      cursor: hasAnswered ? "default" : "pointer",
      fontSize: 16,
      textAlign: "left",
      transition: "background 0.15s ease",
    };

    if (!hasAnswered) {
      if (isHovered) {
        return {
          ...baseStyle,
          background: "rgba(0,0,0,0.07)",
        };
      }

      return baseStyle;
    }

    if (answerId === correctAnswerId) {
      return {
        ...baseStyle,
        background: "rgba(22,163,74,0.08)",
        color: "#166534",
        fontWeight: 600,
      };
    }

    if (answerId === selectedAnswerId && answerId !== correctAnswerId) {
      return {
        ...baseStyle,
        background: "rgba(220,38,38,0.08)",
        color: "#991b1b",
        fontWeight: 600,
      };
    }

    return {
      ...baseStyle,
      opacity: 0.5,
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