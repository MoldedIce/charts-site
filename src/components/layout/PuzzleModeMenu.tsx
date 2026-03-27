import { puzzleTheme } from "../puzzle/puzzle-theme";

export type PuzzleMode = "next-point" | "scenario";

type PuzzleModeMenuProps = {
  activeMode: PuzzleMode;
  onChange: (mode: PuzzleMode) => void;
};

export function PuzzleModeMenu({
  activeMode,
  onChange,
}: PuzzleModeMenuProps) {
  const modes: Array<{ id: PuzzleMode; label: string }> = [
    { id: "next-point", label: "Next Point" },
    { id: "scenario", label: "Scenarios" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
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
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
