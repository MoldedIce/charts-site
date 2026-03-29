import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { min, max } from "d3-array";
import type { Point, PuzzleDefinition } from "../../data/puzzle-types";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  getCandidateLines,
  getCorrectAnswer,
  getLastBasePoint,
  getSelectedAnswer,
  getTargetStep,
} from "./puzzle-chart-utils";
import { puzzleTheme } from "./puzzle-theme";

const MARGIN = { top: 20, right: 80, bottom: 32, left: 45 };

type TooltipData = {
  screenX: number;
  screenY: number;
  step: number;
  value: number | null;
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : puzzleTheme.sizes.chartHeight;

  const lastBasePoint = getLastBasePoint(baseData);
  const targetStep = getTargetStep(baseData);
  const correctAnswer = getCorrectAnswer(puzzle);
  const selectedAnswer = getSelectedAnswer(puzzle, selectedAnswerId);
  const candidateLines = getCandidateLines(puzzle);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { xScale, yScale } = useMemo(() => {
    if (width === 0) return { xScale: null, yScale: null };

    const allValues = [
      ...baseData.map((d) => d.value),
      ...puzzle.answers.map((a) => a.value),
    ];
    const yMin = min(allValues) ?? 0;
    const yMax = max(allValues) ?? 100;
    const pad = Math.max((yMax - yMin) * 0.15, 1);

    const xScale = scaleLinear()
      .domain([1, targetStep])
      .range([MARGIN.left, width - MARGIN.right]);

    const yScale = scaleLinear()
      .domain([Math.max(0, yMin - pad), yMax + pad])
      .range([chartHeight - MARGIN.bottom, MARGIN.top])
      .nice();

    return { xScale, yScale };
  }, [width, chartHeight, baseData, puzzle.answers, targetStep]);

  const lineGen = useMemo(() => {
    if (!xScale || !yScale) return null;
    return d3Line<Point>()
      .x((d) => xScale(d.step))
      .y((d) => yScale(d.value));
  }, [xScale, yScale]);

  function updateTooltip(clientX: number, clientY: number) {
    if (!containerRef.current || !xScale) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const step = Math.round(xScale.invert(mouseX));
    const clampedStep = Math.max(1, Math.min(targetStep, step));
    const point = baseData.find((d) => d.step === clampedStep);
    setTooltip({
      screenX: xScale(clampedStep),
      screenY: mouseY,
      step: clampedStep,
      value: point?.value ?? null,
    });
  }

  if (!correctAnswer) return null;

  const correctNextPoint: Point = { step: targetStep, value: correctAnswer.value };
  const selectedAnswerPoint: Point | null = selectedAnswer
    ? { step: targetStep, value: selectedAnswer.value }
    : null;

  if (width === 0 || !xScale || !yScale || !lineGen) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: chartHeight, marginBottom: 28 }}
      />
    );
  }

  const yTicks = yScale.ticks(6);
  const xTicks = Array.from({ length: targetStep }, (_, i) => i + 1).filter(
    (_t, i) => !isMobile || targetStep <= 7 || i % 2 === 0
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isMobile ? undefined : puzzleTheme.sizes.chartMaxWidth,
        height: chartHeight,
        marginBottom: 10,
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        width={width}
        height={chartHeight}
        onMouseMove={(e) => updateTooltip(e.clientX, e.clientY)}
        onTouchMove={(e) =>
          updateTooltip(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={() => setTooltip(null)}
        style={{ touchAction: "pan-y", display: "block" }}
      >
        {/* Grid */}
        {yTicks.map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke={puzzleTheme.colors.grid}
            strokeWidth={1}
          />
        ))}

        {/* X axis */}
        {xTicks.map((tick) => (
          <text
            key={`xtick-${tick}`}
            x={xScale(tick)}
            y={chartHeight - MARGIN.bottom + 16}
            textAnchor="middle"
            fontSize={12}
            fill={puzzleTheme.colors.textSecondary}
          >
            {tick}
          </text>
        ))}

        {/* Y axis */}
        {yTicks.map((tick) => (
          <text
            key={`ytick-${tick}`}
            x={MARGIN.left - 8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={12}
            fill={puzzleTheme.colors.textSecondary}
          >
            {tick}
          </text>
        ))}

        {/* Candidate lines (pre-answer) */}
        {!hasAnswered &&
          candidateLines.map((cLine) => {
            const isHovered = hoveredAnswerId === cLine.id;
            const isDimmed = hoveredAnswerId !== null && !isHovered;
            const endPt = cLine.data[cLine.data.length - 1];
            return (
              <g key={`candidate-${cLine.id}`}>
                <path
                  d={lineGen(cLine.data) ?? ""}
                  fill="none"
                  stroke={
                    isHovered
                      ? puzzleTheme.colors.lineCandidateHover
                      : puzzleTheme.colors.lineCandidate
                  }
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="6 6"
                  opacity={isDimmed ? 0.55 : 1}
                />
                <text
                  x={xScale(endPt.step) + puzzleTheme.labels.endpointOffset}
                  y={yScale(endPt.value)}
                  dominantBaseline="middle"
                  fontSize={puzzleTheme.labels.endpointFontSize}
                  fontWeight={isHovered ? 700 : 500}
                  fill={
                    isHovered
                      ? puzzleTheme.colors.labelHover
                      : puzzleTheme.colors.labelNeutral
                  }
                  opacity={isDimmed ? 0.9 : 1}
                >
                  {cLine.label}
                </text>
              </g>
            );
          })}

        {/* Base line */}
        <path
          d={lineGen(baseData) ?? ""}
          fill="none"
          stroke={puzzleTheme.colors.lineBase}
          strokeWidth={3}
        />

        {/* Base dots */}
        {baseData.map((pt) => (
          <circle
            key={`dot-${pt.step}`}
            cx={xScale(pt.step)}
            cy={yScale(pt.value)}
            r={isMobile ? 3 : 5}
            fill={puzzleTheme.colors.lineBase}
          />
        ))}

        {/* Result: correct line */}
        {hasAnswered && (
          <g>
            <path
              d={lineGen([lastBasePoint, correctNextPoint]) ?? ""}
              fill="none"
              stroke={puzzleTheme.colors.correct}
              strokeWidth={3}
            />
            <circle
              cx={xScale(correctNextPoint.step)}
              cy={yScale(correctNextPoint.value)}
              r={isMobile ? 3 : 5}
              fill={puzzleTheme.colors.correct}
            />
            <text
              x={
                xScale(correctNextPoint.step) + puzzleTheme.labels.endpointOffset
              }
              y={yScale(correctNextPoint.value)}
              dominantBaseline="middle"
              fontSize={puzzleTheme.labels.endpointFontSize}
              fontWeight={700}
              fill={puzzleTheme.colors.correct}
            >
              {correctNextPoint.value}
            </text>
          </g>
        )}

        {/* Result: incorrect selection */}
        {hasAnswered && !isCorrect && selectedAnswerPoint && (
          <g>
            <path
              d={lineGen([lastBasePoint, selectedAnswerPoint]) ?? ""}
              fill="none"
              stroke={puzzleTheme.colors.incorrect}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <circle
              cx={xScale(selectedAnswerPoint.step)}
              cy={yScale(selectedAnswerPoint.value)}
              r={isMobile ? 3 : 5}
              fill={puzzleTheme.colors.incorrect}
            />
            <text
              x={
                xScale(selectedAnswerPoint.step) +
                puzzleTheme.labels.endpointOffset
              }
              y={yScale(selectedAnswerPoint.value)}
              dominantBaseline="middle"
              fontSize={puzzleTheme.labels.endpointFontSize}
              fontWeight={700}
              fill={puzzleTheme.colors.incorrect}
            >
              {selectedAnswerPoint.value}
            </text>
          </g>
        )}

        {/* Hover guide */}
        {tooltip && (
          <line
            x1={tooltip.screenX}
            x2={tooltip.screenX}
            y1={MARGIN.top}
            y2={chartHeight - MARGIN.bottom}
            stroke={puzzleTheme.colors.hoverGuide}
            strokeWidth={1.5}
            strokeDasharray="4 6"
            pointerEvents="none"
          />
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && tooltip.value !== null && (
        <div
          style={{
            position: "absolute",
            left: tooltip.screenX + 12,
            top: Math.max(0, tooltip.screenY - 20),
            background: puzzleTheme.colors.cardBackground,
            border: `1px solid ${puzzleTheme.colors.borderLight}`,
            borderRadius: 12,
            padding: "8px 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            fontSize: 14,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 4,
              color: puzzleTheme.colors.textPrimary,
            }}
          >
            Step {tooltip.step}
          </div>
          <div style={{ color: "#344054" }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}
