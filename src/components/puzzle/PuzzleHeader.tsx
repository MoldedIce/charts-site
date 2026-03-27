import { useIsMobile } from "../../hooks/useIsMobile";
import { puzzleTheme } from "./puzzle-theme";

type PuzzleHeaderProps = {
  title: string;
  onReset: () => void;
};

export function PuzzleHeader({
  title,
  onReset,
}: PuzzleHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? 22 : 34,
            lineHeight: 1.2,
            color: puzzleTheme.colors.textPrimary,
          }}
        >
          {title}
        </h1>
      </div>

      <button
        onClick={onReset}
        style={{
          padding: "10px 14px",
          borderRadius: puzzleTheme.radii.button,
          border: `1px solid ${puzzleTheme.colors.border}`,
          background: puzzleTheme.colors.cardBackground,
          color: puzzleTheme.colors.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Reset puzzle
      </button>
    </div>
  );
}