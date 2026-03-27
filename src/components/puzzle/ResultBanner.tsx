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
        borderLeft: `3px solid ${isCorrect ? puzzleTheme.colors.correct : puzzleTheme.colors.incorrect}`,
        paddingLeft: 14,
        paddingTop: 4,
        paddingBottom: 4,
        color: isCorrect ? "#166534" : "#991b1b",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}