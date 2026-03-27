import { puzzleTheme } from "../puzzle/puzzle-theme";

type PuzzlePickerProps = {
  count: number;
  activeIndex: number;
  onChange: (index: number) => void;
};

export function PuzzlePicker({
  count,
  activeIndex,
  onChange,
}: PuzzlePickerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: puzzleTheme.sizes.contentMaxWidth,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={index}
              onClick={() => onChange(index)}
              style={{
                padding: "4px 0",
                border: "none",
                borderBottom: isActive
                  ? `2px solid ${puzzleTheme.colors.textPrimary}`
                  : "2px solid transparent",
                background: "transparent",
                color: isActive
                  ? puzzleTheme.colors.textPrimary
                  : puzzleTheme.colors.textSecondary,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Puzzle {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}