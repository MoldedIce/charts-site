import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import {
  PuzzleModeMenu,
  type PuzzleMode,
} from "./components/layout/PuzzleModeMenu";
import { PuzzlePicker } from "./components/layout/PuzzlePicker";
import { PuzzleCard } from "./components/puzzle/PuzzleCard";
import { puzzleTheme } from "./components/puzzle/puzzle-theme";
import { nextPointPuzzles } from "./data/puzzles";

export default function App() {
  const [activeMode, setActiveMode] = useState<PuzzleMode>("next-point");
  const [nextPointIndex, setNextPointIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 4);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextPointPuzzle = nextPointPuzzles[nextPointIndex];

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        background: puzzleTheme.colors.background,
      }}
    >
      <Header isScrolled={isScrolled} />

      <main
        style={{
          padding: "18px 16px 40px",
          boxSizing: "border-box",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <PuzzleModeMenu activeMode={activeMode} onChange={setActiveMode} />

        {activeMode === "next-point" && (
          <PuzzlePicker
            count={nextPointPuzzles.length}
            activeIndex={nextPointIndex}
            onChange={setNextPointIndex}
          />
        )}

        {activeMode === "next-point" ? (
          <PuzzleCard key={nextPointPuzzle.id} puzzle={nextPointPuzzle} />
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: puzzleTheme.sizes.contentMaxWidth,
              margin: "0 auto",
              background: puzzleTheme.colors.cardBackground,
              borderRadius: puzzleTheme.radii.card,
              padding: 32,
              boxSizing: "border-box",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
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
              Coming Soon
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.2,
                color: puzzleTheme.colors.textPrimary,
                marginBottom: 16,
              }}
            >
              Scenario selection puzzles
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.7,
                color: puzzleTheme.colors.textSecondary,
                maxWidth: 760,
              }}
            >
              This mode will let users compare multiple full future curves and
              choose the most plausible continuation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}