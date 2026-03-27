import { puzzleTheme } from "../puzzle/puzzle-theme";

type HeaderProps = {
  isScrolled: boolean;
};

export function Header({ isScrolled }: HeaderProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        width: "100%",
        height: puzzleTheme.sizes.headerHeight,
        background: puzzleTheme.brand.background,
        padding: "0 20px",
        boxSizing: "border-box",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        boxShadow: isScrolled ? "0 6px 18px rgba(0,0,0,0.10)" : "none",
        transition: "box-shadow 0.18s ease",
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: puzzleTheme.brand.accent,
          letterSpacing: 0.3,
          lineHeight: 1,
        }}
      >
        Directionally Accurate
      </div>
    </div>
  );
}