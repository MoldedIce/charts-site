import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { min, max } from "d3-array";
import type { Point } from "../../data/puzzle-types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { puzzleTheme } from "./puzzle-theme";

export const CHART_MARGIN = { top: 20, right: 35, bottom: 32, left: 45 };

export type TooltipData = {
  screenX: number;
  screenY: number;
  step: number;
  value: number | null;
};

/**
 * Shared chart layout hook. Handles resize observation, scale computation,
 * line generator, and tooltip state. Both PuzzleChart and ScenarioChart use this.
 *
 * @param allValues - All y-values in the chart (base + candidate/scenario), used for y-scale domain.
 *                    Caller should memoize this array to avoid unnecessary scale recomputation.
 * @param xMax      - The highest step number displayed on the x-axis.
 * @param baseData  - Base data points, used for tooltip value lookup.
 */
export function useChartLayout(allValues: number[], xMax: number, baseData: Point[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : puzzleTheme.sizes.chartHeight;

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
    const yMin = min(allValues) ?? 0;
    const yMax = max(allValues) ?? 100;
    const pad = Math.max((yMax - yMin) * 0.15, 1);
    const xScale = scaleLinear()
      .domain([1, xMax])
      .range([CHART_MARGIN.left, width - CHART_MARGIN.right]);
    const yScale = scaleLinear()
      .domain([Math.max(0, yMin - pad), yMax + pad])
      .range([chartHeight - CHART_MARGIN.bottom, CHART_MARGIN.top])
      .nice();
    return { xScale, yScale };
  }, [width, chartHeight, allValues, xMax]);

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
    const clampedStep = Math.max(1, Math.min(xMax, step));
    const point = baseData.find((d) => d.step === clampedStep);
    setTooltip({
      screenX: xScale(clampedStep),
      screenY: mouseY,
      step: clampedStep,
      value: point?.value ?? null,
    });
  }

  const yTicks = yScale?.ticks(6) ?? [];
  const xTicks = Array.from({ length: xMax }, (_, i) => i + 1).filter(
    (_t, i) => !isMobile || xMax <= 7 || i % 2 === 0
  );

  return {
    containerRef,
    width,
    isMobile,
    chartHeight,
    xScale,
    yScale,
    lineGen,
    tooltip,
    setTooltip,
    updateTooltip,
    yTicks,
    xTicks,
  };
}
