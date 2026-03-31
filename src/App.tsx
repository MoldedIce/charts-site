import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { Header } from "./components/layout/Header";
import {
  PuzzleModeMenu,
  type PuzzleMode,
} from "./components/layout/PuzzleModeMenu";
import { PuzzlePicker } from "./components/layout/PuzzlePicker";
import { PuzzleCard } from "./components/puzzle/PuzzleCard";
import { ScenarioCard } from "./components/puzzle/ScenarioCard";
import { puzzleTheme } from "./components/puzzle/puzzle-theme";
import { useIsMobile } from "./hooks/useIsMobile";
import { usePuzzles } from "./hooks/usePuzzles";

export default function App() {
  const [activeMode, setActiveMode] = useState<PuzzleMode>("next-point");
  const [nextPointIndex, setNextPointIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const headerHeight = isMobile ? 56 : puzzleTheme.sizes.headerHeight;
  const { nextPointPuzzles, scenarioPuzzles, loading, error } = usePuzzles();

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
  const scenarioPuzzle = scenarioPuzzles[scenarioIndex];

  const puzzlesReady = !loading && nextPointPuzzle && scenarioPuzzle;

  const puzzleApp = (
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
          padding: "0 16px 40px",
          boxSizing: "border-box",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: headerHeight,
            zIndex: 20,
            background: puzzleTheme.colors.background,
            padding: "6px 0 8px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: puzzleTheme.sizes.chartMaxWidth,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
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
            {activeMode === "scenario" && (
              <PuzzlePicker
                count={scenarioPuzzles.length}
                activeIndex={scenarioIndex}
                onChange={setScenarioIndex}
              />
            )}
          </div>
        </div>

        {error ? (
          <div style={{ color: "#dc2626", fontSize: 14, textAlign: "center", paddingTop: 40 }}>
            {error}
          </div>
        ) : !puzzlesReady ? (
          <div style={{ color: puzzleTheme.colors.textSecondary, fontSize: 14, textAlign: "center", paddingTop: 40 }}>
            Loading...
          </div>
        ) : activeMode === "next-point" ? (
          <PuzzleCard key={nextPointPuzzle.id} puzzle={nextPointPuzzle} />
        ) : (
          <ScenarioCard key={scenarioPuzzle.id} puzzle={scenarioPuzzle} />
        )}
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={puzzleApp} />
      <Route path="/backstage" element={<AdminPage />} />
    </Routes>
  );
}