import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { min, max } from "d3-array";
import type { Point, ScenarioPuzzleDefinition } from "../../data/puzzle-types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { getLastBasePoint } from "./puzzle-chart-utils";
import { puzzleTheme } from "./puzzle-theme";

const MARGIN = { top: 20, right: 80, bottom: 32, left: 45 };

type TooltipData = {
  screenX: number;
  screenY: number;
  step: number;
  value: number | null;
};

type ScenarioChartProps = {
  puzzle: ScenarioPuzzleDefinition;
  selectedId: string | null;
  hoveredId: string | null;
  hasAnswered: boolean;
};

export function ScenarioChart({
  puzzle,
  selectedId,
  hoveredId,
  hasAnswered,
}: ScenarioChartProps) {
  const { baseData, scenarios } = puzzle;
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : puzzleTheme.sizes.chartHeight;

  const lastBasePoint = getLastBasePoint(baseData);
  const lastStep = scenarios[0].data[scenarios[0].data.length - 1].step;

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
      ...scenarios.flatMap((s) => s.data.map((d) => d.value)),
    ];
    const yMin = min(allValues) ?? 0;
    const yMax = max(allValues) ?? 100;
    const pad = Math.max((yMax - yMin) * 0.15, 1);

    const xScale = scaleLinear()
      .domain([1, lastStep])
      .range([MARGIN.left, width - MARGIN.right]);

    const yScale = scaleLinear()
      .domain([Math.max(0, yMin - pad), yMax + pad])
      .range([chartHeight - MARGIN.bottom, MARGIN.top])
      .nice();

    return { xScale, yScale };
  }, [width, chartHeight, baseData, scenarios, lastStep]);

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
    const clampedStep = Math.max(1, Math.min(lastStep, step));
    const point = baseData.find((d) => d.step === clampedStep);
    setTooltip({
      screenX: xScale(clampedStep),
      screenY: mouseY,
      step: clampedStep,
      value: point?.value ?? null,
    });
  }

  if (width === 0 || !xScale || !yScale || !lineGen) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: chartHeight, marginBottom: 28 }}
      />
    );
  }

  const yTicks = yScale.ticks(6);
  const xTicks = Array.from({ length: lastStep }, (_, i) => i + 1).filter(
    (_t, i) => !isMobile || lastStep <= 7 || i % 2 === 0
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: chartHeight,
        marginBottom: 28,
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

        {/* Scenario lines + labels */}
        {scenarios.map((scenario) => {
          const isSelected = selectedId === scenario.id;
          const isCorrectScenario = scenario.id === puzzle.correctScenarioId;
          const isHovered = hoveredId === scenario.id;
          const isDimmed = hoveredId !== null && !isHovered;
          const endPt = scenario.data[scenario.data.length - 1];

          let stroke: string = isHovered
            ? puzzleTheme.colors.lineCandidateHover
            : puzzleTheme.colors.lineCandidate;
          let strokeWidth = isHovered ? 2.5 : 2;
          let strokeDasharray = "6 6";
          let opacity = isDimmed ? 0.45 : 1;
          let labelFill: string = isHovered
            ? puzzleTheme.colors.labelHover
            : puzzleTheme.colors.labelNeutral;
          let labelOpacity = isDimmed ? 0.45 : 1;
          let labelWeight = isHovered ? 700 : 500;

          if (hasAnswered) {
            if (isCorrectScenario) {
              stroke = puzzleTheme.colors.correct;
              strokeWidth = 3;
              strokeDasharray = "0";
              opacity = 1;
              labelFill = puzzleTheme.colors.correct;
              labelWeight = 700;
              labelOpacity = 1;
            } else if (isSelected) {
              stroke = puzzleTheme.colors.incorrect;
              strokeWidth = 2;
              opacity = 1;
              labelFill = puzzleTheme.colors.incorrect;
              labelWeight = 600;
              labelOpacity = 1;
            } else {
              opacity = 0.15;
              labelOpacity = 0.3;
            }
          }

          return (
            <g key={scenario.id}>
              <path
                d={lineGen([lastBasePoint, ...scenario.data]) ?? ""}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                opacity={opacity}
              />
              <text
                x={xScale(endPt.step) + puzzleTheme.labels.endpointOffset}
                y={yScale(endPt.value)}
                dominantBaseline="middle"
                fontSize={puzzleTheme.labels.endpointFontSize}
                fontWeight={labelWeight}
                fill={labelFill}
                opacity={labelOpacity}
              >
                {scenario.label}
              </text>
            </g>
          );
        })}

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
