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
        margin: "0 auto 20px auto",
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
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${
                  isActive
                    ? puzzleTheme.colors.textPrimary
                    : puzzleTheme.colors.border
                }`,
                background: isActive
                  ? puzzleTheme.colors.textPrimary
                  : puzzleTheme.colors.cardBackground,
                color: isActive ? "#ffffff" : puzzleTheme.colors.textPrimary,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
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