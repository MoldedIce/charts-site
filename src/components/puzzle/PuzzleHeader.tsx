import { puzzleTheme } from "./puzzle-theme";

type PuzzleHeaderProps = {
  title: string;
  subtitle?: string;
  onReset: () => void;
};

export function PuzzleHeader({
  title,
  subtitle,
  onReset,
}: PuzzleHeaderProps) {
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
        {subtitle && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: puzzleTheme.colors.textSecondary,
              marginBottom: 12,
            }}
          >
            {subtitle}
          </div>
        )}

        <h1
          style={{
            margin: 0,
            fontSize: 34,
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