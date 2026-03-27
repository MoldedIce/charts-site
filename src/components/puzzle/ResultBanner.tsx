import { puzzleTheme } from "./puzzle-theme";

type ResultBannerProps = {
  hasAnswered: boolean;
  isCorrect: boolean;
  text: string | null;
};

export function ResultBanner({
  hasAnswered,
  isCorrect,
  text,
}: ResultBannerProps) {
  if (!hasAnswered || !text) {
    return null;
  }

  return (
    <div
      style={{
        borderRadius: puzzleTheme.radii.banner,
        padding: 16,
        background: isCorrect ? "#f0fdf4" : "#fef2f2",
        color: isCorrect ? "#166534" : "#991b1b",
        border: isCorrect ? "1px solid #bbf7d0" : "1px solid #fecaca",
        fontSize: 16,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}