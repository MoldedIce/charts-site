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
        position: "sticky",
        top: puzzleTheme.sizes.headerHeight,
        zIndex: 20,
        background: puzzleTheme.colors.background,
        padding: "14px 0 18px",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: puzzleTheme.sizes.contentMaxWidth,
          margin: "0 auto",
        }}
      >
        
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: 6,
            background: puzzleTheme.colors.cardBackground,
            border: `1px solid ${puzzleTheme.colors.borderLight}`,
            borderRadius: 16,
            boxShadow: "0 2px 10px rgba(16,24,40,0.04)",
          }}
        >
          {modes.map((mode) => {
            const isActive = activeMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onChange(mode.id)}
                style={{
                  padding: "10px 14px",
                  border: "none",
                  borderRadius: 12,
                  background: isActive
                    ? puzzleTheme.colors.textPrimary
                    : "transparent",
                  color: isActive ? "#ffffff" : puzzleTheme.colors.textPrimary,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}