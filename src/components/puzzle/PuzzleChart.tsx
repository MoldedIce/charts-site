import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PuzzleDefinition, Point } from "../../data/puzzle-types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { CustomTooltip } from "./CustomTooltip";
import { EndpointLabel } from "./EndpointLabel";
import {
  getCandidateLines,
  getCorrectAnswer,
  getLastBasePoint,
  getLastKnownStep,
  getSelectedAnswer,
  getStepTicks,
  getTargetStep,
} from "./puzzle-chart-utils";
import { puzzleTheme } from "./puzzle-theme";
import { ResultDot } from "./ResultDot";
import { ChartHoverCursor } from "./ChartHoverCursor"; 

type PuzzleChartProps = {
  puzzle: PuzzleDefinition;
  selectedAnswerId: string | null;
  hoveredAnswerId: string | null;
  hasAnswered: boolean;
  isCorrect: boolean;
};

export function PuzzleChart({
  puzzle,
  selectedAnswerId,
  hoveredAnswerId,
  hasAnswered,
  isCorrect,
}: PuzzleChartProps) {
  const { baseData } = puzzle;

  const lastBasePoint = getLastBasePoint(baseData);
  const lastKnownStep = getLastKnownStep(baseData);
  const targetStep = getTargetStep(baseData);
  const stepTicks = getStepTicks(baseData);

  const correctAnswer = getCorrectAnswer(puzzle);
  const selectedAnswer = getSelectedAnswer(puzzle, selectedAnswerId);
  const candidateLines = getCandidateLines(puzzle);

  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : puzzleTheme.sizes.chartHeight;
  const chartRightMargin = isMobile ? 48 : 80;
  const tickInterval = isMobile && stepTicks.length > 7 ? 1 : 0;

  if (!correctAnswer) {
    return null;
  }

  const correctNextPoint: Point = { step: targetStep, value: correctAnswer.value };
  const selectedAnswerPoint: Point | null = selectedAnswer
    ? { step: targetStep, value: selectedAnswer.value }
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: chartHeight,
        padding: "24px 0",
        boxSizing: "border-box",
        marginBottom: 28,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={baseData}
          margin={{ top: 20, right: chartRightMargin, left: 10, bottom: 10 }}
        >
          <CartesianGrid stroke={puzzleTheme.colors.grid} vertical={false} />

          <XAxis
            dataKey="step"
            tickLine={false}
            axisLine={false}
            type="number"
            domain={[1, targetStep]}
            ticks={stepTicks}
            interval={tickInterval}
            tick={{ fontSize: 12 }}
          />

          <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 12 }} />

          <Tooltip
            cursor={<ChartHoverCursor />}
            content={(props) => (
              <CustomTooltip
                {...props}
                hasAnswered={hasAnswered}
                isCorrect={isCorrect}
                selectedAnswerValue={selectedAnswerPoint?.value ?? null}
                correctAnswerValue={correctNextPoint.value}
                lastKnownStep={lastKnownStep}
                targetStep={targetStep}
              />
            )}
          />

          <Line
            type="monotone"
            dataKey="value"
            data={baseData}
            stroke={puzzleTheme.colors.lineBase}
            strokeWidth={3}
            dot={{
              r: 5,
              fill: puzzleTheme.colors.lineBase,
              stroke: puzzleTheme.colors.lineBase,
            }}
            activeDot={{
              r: 7,
              fill: puzzleTheme.colors.lineBase,
              stroke: puzzleTheme.colors.lineBase,
            }}
            isAnimationActive={false}
          />

          {candidateLines.map((line) => {
            const isHovered = hoveredAnswerId === line.id;
            const isDimmed =
              hoveredAnswerId !== null && hoveredAnswerId !== line.id;

            return (
              <Line
                key={`candidate-${line.id}`}
                type="monotone"
                dataKey="value"
                data={line.data}
                stroke={
                  isHovered
                    ? puzzleTheme.colors.lineCandidateHover
                    : puzzleTheme.colors.lineCandidate
                }
                strokeWidth={isHovered ? 2.5 : 2}
                strokeDasharray="6 6"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                opacity={hasAnswered ? 0 : isDimmed ? 0.55 : 1}
              />
            );
          })}

          {!hasAnswered &&
            candidateLines.map((line) => {
              const isHovered = hoveredAnswerId === line.id;
              const isDimmed =
                hoveredAnswerId !== null && hoveredAnswerId !== line.id;

              let fill: string = puzzleTheme.colors.labelNeutral;
              let opacity = 1;
              let fontWeight = 500;

              if (isHovered) {
                fill = puzzleTheme.colors.labelHover;
                fontWeight = 700;
              } else if (isDimmed) {
                fill = puzzleTheme.colors.lineCandidate;
                opacity = 0.9;
              }

              return (
                <EndpointLabel
                  key={`candidate-label-${line.id}`}
                  x={targetStep}
                  y={Number(line.label)}
                  value={line.label}
                  fill={fill}
                  opacity={opacity}
                  fontWeight={fontWeight}
                />
              );
            })}

          {hasAnswered && isCorrect && (
            <>
              <Line
                type="monotone"
                dataKey="value"
                data={[lastBasePoint, correctNextPoint]}
                stroke={puzzleTheme.colors.correct}
                strokeWidth={3}
                dot={(props) => (
                  <ResultDot
                    {...props}
                    fill={puzzleTheme.colors.correct}
                    targetStep={targetStep}
                  />
                )}
                activeDot={false}
                isAnimationActive={false}
              />
              <EndpointLabel
                x={targetStep}
                y={correctNextPoint.value}
                value={String(correctNextPoint.value)}
                fill={puzzleTheme.colors.correct}
                fontWeight={700}
              />
            </>
          )}

          {hasAnswered && !isCorrect && selectedAnswerPoint && (
            <>
              <Line
                type="monotone"
                dataKey="value"
                data={[lastBasePoint, selectedAnswerPoint]}
                stroke={puzzleTheme.colors.incorrect}
                strokeWidth={3}
                dot={(props) => (
                  <ResultDot
                    {...props}
                    fill={puzzleTheme.colors.incorrect}
                    targetStep={targetStep}
                  />
                )}
                activeDot={false}
                isAnimationActive={false}
              />
              <EndpointLabel
                x={targetStep}
                y={selectedAnswerPoint.value}
                value={String(selectedAnswerPoint.value)}
                fill={puzzleTheme.colors.incorrect}
                fontWeight={700}
              />
            </>
          )}

          {hasAnswered && !isCorrect && (
            <>
              <Line
                type="monotone"
                dataKey="value"
                data={[lastBasePoint, correctNextPoint]}
                stroke={puzzleTheme.colors.correct}
                strokeWidth={3}
                dot={(props) => (
                  <ResultDot
                    {...props}
                    fill={puzzleTheme.colors.correct}
                    targetStep={targetStep}
                  />
                )}
                activeDot={false}
                isAnimationActive={false}
              />
              <EndpointLabel
                x={targetStep}
                y={correctNextPoint.value}
                value={String(correctNextPoint.value)}
                fill={puzzleTheme.colors.correct}
                fontWeight={700}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}