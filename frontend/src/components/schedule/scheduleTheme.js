export const scheduleTheme = {
  background: "var(--lms-schedule-bg)",
  surface: "var(--lms-schedule-surface)",
  card: "var(--lms-schedule-card)",
  input: "var(--lms-schedule-input)",
  text: "var(--lms-schedule-text)",
  muted: "var(--lms-schedule-muted)",
  border: "var(--lms-schedule-border)",
  hover: "var(--lms-schedule-hover)",
  accent: "var(--lms-schedule-accent)",
  accentStrong: "var(--lms-schedule-accent-strong)",
  success: "var(--lms-schedule-success)",
  danger: "var(--lms-schedule-danger)",
  warning: "var(--lms-schedule-warning)",
  focus: "var(--lms-schedule-focus-ring)",
  shadow: "var(--lms-schedule-shadow)",
};

export const scheduleColorTokens = {
  sky: {
    bg: "var(--lms-schedule-sky-bg)",
    border: "var(--lms-schedule-sky-border)",
    text: "var(--lms-schedule-sky-text)",
  },
  emerald: {
    bg: "var(--lms-schedule-emerald-bg)",
    border: "var(--lms-schedule-emerald-border)",
    text: "var(--lms-schedule-emerald-text)",
  },
  violet: {
    bg: "var(--lms-schedule-violet-bg)",
    border: "var(--lms-schedule-violet-border)",
    text: "var(--lms-schedule-violet-text)",
  },
  amber: {
    bg: "var(--lms-schedule-amber-bg)",
    border: "var(--lms-schedule-amber-border)",
    text: "var(--lms-schedule-amber-text)",
  },
  rose: {
    bg: "var(--lms-schedule-rose-bg)",
    border: "var(--lms-schedule-rose-border)",
    text: "var(--lms-schedule-rose-text)",
  },
  slate: {
    bg: "var(--lms-schedule-slate-bg)",
    border: "var(--lms-schedule-slate-border)",
    text: "var(--lms-schedule-slate-text)",
  },
};

export function scheduleCardSx() {
  return {
    bgcolor: scheduleTheme.card,
    color: scheduleTheme.text,
    borderColor: scheduleTheme.border,
    backgroundImage: "none",
    boxShadow: scheduleTheme.shadow,
  };
}

export function schedulePrimaryButtonSx() {
  return {
    bgcolor: "var(--lms-schedule-accent-strong)",
    color: "var(--lms-schedule-card)",
    "&:hover": {
      bgcolor: "var(--lms-schedule-accent)",
      color: "var(--lms-schedule-bg)",
    },
    "&.Mui-disabled": {
      bgcolor: "var(--lms-schedule-surface)",
      color: "var(--lms-schedule-muted)",
      border: "1px solid var(--lms-schedule-border)",
    },
  };
}
