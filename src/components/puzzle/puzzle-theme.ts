export const puzzleTheme = {
  colors: {
    background: "#f5f7fb",
    cardBackground: "#ffffff",

    textPrimary: "#101828",
    textSecondary: "#667085",

    lineBase: "#111827",
    lineCandidate: "#cbd5e1",
    lineCandidateHover: "#667085",

    labelNeutral: "#98a2b3",
    labelHover: "#475467",

    correct: "#16a34a",
    incorrect: "#dc2626",

    border: "#d0d5dd",
    borderLight: "#eaecf0",
    grid: "#eaeef3",
    hoverGuide: "#d0d5dd",
  },

  brand: {
    background: "#222222",
    accent: "#A8FFE6",
  },

  radii: {
    card: 24,
    panel: 20,
    button: 12,
    banner: 16,
  },

  sizes: {
    headerHeight: 80,
    chartHeight: 520,
    contentMaxWidth: 1200,
  },

  labels: {
    endpointFontSize: 13,
    endpointOffset: 10,
  },
} as const;