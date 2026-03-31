import { useMemo } from "react";
import type { WhatHappenedPuzzleDefinition } from "../../data/puzzle-types";
import { puzzleTheme } from "./puzzle-theme";
import { useChartLayout } from "./use-chart-layout";
import {
  ChartAxes,
  ChartBaseDots,
  ChartBaseLine,
  ChartGrid,
  ChartHoverGuide,
  ChartTooltip,
} from "./chart-shared";

type WhatHappenedChartProps = {
  puzzle: WhatHappenedPuzzleDefinition;
  hasAnswered: boolean;
};

export function WhatHappenedChart({ puzzle, hasAnswered }: WhatHappenedChartProps) {
  const { baseData, forecastData, actualData } = puzzle;

  const lastStep = useMemo(() => {
    const allSteps = [...baseData, ...forecastData, ...actualData];
    return allSteps.reduce((m, d) => Math.max(m, d.step), 1);
  }, [baseData, forecastData, actualData]);

  const allValues = useMemo(
    () => [
      ...baseData.map((d) => d.value),
      ...forecastData.map((d) => d.value),
      ...actualData.map((d) => d.value),
    ],
    [baseData, forecastData, actualData]
  );

  const {
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
  } = useChartLayout(allValues, lastStep, baseData);

  const lastBasePoint = baseData[baseData.length - 1];

  if (width === 0 || !xScale || !yScale || !lineGen) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: chartHeight, marginBottom: 28 }}
      />
    );
  }

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
        <ChartGrid yTicks={yTicks} width={width} yScale={yScale} />
        <ChartAxes
          xTicks={xTicks}
          yTicks={yTicks}
          chartHeight={chartHeight}
          xScale={xScale}
          yScale={yScale}
        />

        <ChartBaseLine data={baseData} lineGen={lineGen} />

        {/* Forecast line — orange dashed, always visible */}
        {forecastData.length > 0 && lastBasePoint && (
          <path
            d={lineGen([lastBasePoint, ...forecastData]) ?? ""}
            fill="none"
            stroke={puzzleTheme.colors.forecast}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}

        {/* Actuals line — revealed after answering */}
        {hasAnswered && actualData.length > 0 && lastBasePoint && (
          <path
            d={lineGen([lastBasePoint, ...actualData]) ?? ""}
            fill="none"
            stroke={puzzleTheme.colors.correct}
            strokeWidth={2.5}
          />
        )}

        {/* Base dots — always on top */}
        <ChartBaseDots data={baseData} xScale={xScale} yScale={yScale} isMobile={isMobile} />

        {tooltip && <ChartHoverGuide tooltip={tooltip} chartHeight={chartHeight} />}
      </svg>

      {tooltip && <ChartTooltip tooltip={tooltip} />}
    </div>
  );
}
