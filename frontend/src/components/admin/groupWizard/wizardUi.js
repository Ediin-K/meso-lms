/** Shared admin groups / wizard theme tokens and MUI sx helpers. */
import { scheduleCardSx, schedulePrimaryButtonSx, scheduleTheme } from "../../schedule/scheduleTheme";

export const WIZARD_STEPS = [
  { id: 0, label: "Info", group: "Basic Group Info" },
  { id: 1, label: "Orari", group: "Weekly Schedule Builder" },
  { id: 2, label: "Review", group: "Review & Confirm" },
];

export const ROOM_PRESETS = ["101", "132", "205", "301", "A1", "B2"];
export const DRAFT_STORAGE_KEY = "meson-group-wizard-draft";

/** Theme tokens for admin groups module (light/dark). */
export function getGroupsTheme(isDark) {
  void isDark;
  return {
    background: scheduleTheme.background,
    surface: scheduleTheme.surface,
    card: scheduleTheme.card,
    text: scheduleTheme.text,
    textMuted: scheduleTheme.muted,
    border: scheduleTheme.border,
    hover: scheduleTheme.hover,
    inputBg: scheduleTheme.input,
    accent: scheduleTheme.accent,
    accentStrong: scheduleTheme.accentStrong,
    danger: scheduleTheme.danger,
    warning: scheduleTheme.warning,
    focus: scheduleTheme.focus,
  };
}

export function truncateText(text, max = 28) {
  if (!text) return "";
  const s = String(text);
  return s.length <= max ? s : `${s.slice(0, max).trim()}…`;
}

export function wizardSurfaceClass(isDark) {
  void isDark;
  return "lms-schedule-surface rounded-2xl";
}

export function cardSx(isDark) {
  void isDark;
  return scheduleCardSx();
}

export function tableContainerSx(isDark) {
  const t = getGroupsTheme(isDark);
  return {
    ...cardSx(isDark),
    "& .MuiTable-root": { bgcolor: "transparent" },
    "& .MuiTableCell-root": {
      borderColor: t.border,
      color: t.text,
      py: 1,
      px: 1.5,
      fontSize: "0.875rem",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      bgcolor: `${t.surface} !important`,
      color: t.textMuted,
      fontWeight: 700,
      fontSize: "0.7rem",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      py: 1.25,
    },
    "& .MuiTableBody-root .MuiTableRow-root": {
      bgcolor: `${t.card} !important`,
      "&:hover": { bgcolor: `${t.hover} !important` },
    },
    "& .MuiTableBody-root .MuiTableRow-root:last-child td": {
      borderBottom: 0,
    },
  };
}

export function pageShellSx(isDark) {
  const t = getGroupsTheme(isDark);
  return { bgcolor: t.background, minHeight: "100%", flex: 1 };
}

export function wizardFieldClass() {
  return "rounded-xl!";
}

export function getWizardFieldSx(isDark) {
  void isDark;
  const t = getGroupsTheme(isDark);
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.75rem",
      backgroundColor: t.inputBg,
      color: t.text,
      transition: "border-color 0.2s ease",
      "& fieldset": { borderColor: t.border },
      "&:hover fieldset": { borderColor: t.accent },
      "&.Mui-focused fieldset": { borderColor: t.focus, borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { color: t.textMuted },
    "& .MuiInputLabel-root.Mui-focused": { color: t.accent },
    "& .MuiSelect-select": { color: t.text },
    "& .MuiInputBase-input": { color: t.text },
    "& .MuiInputBase-input::placeholder": { color: t.textMuted, opacity: 1 },
    "& .MuiFormHelperText-root": { color: t.textMuted },
    "& .MuiFormHelperText-root.Mui-error": { color: t.danger },
  };
}

export function getMenuPaperSx(isDark) {
  const t = getGroupsTheme(isDark);
  return {
    PaperProps: {
      sx: {
        borderRadius: "0.75rem",
        mt: 0.5,
        bgcolor: t.card,
        border: `1px solid ${t.border}`,
        "& .MuiMenuItem-root": { color: t.text },
        "& .MuiMenuItem-root:hover": { bgcolor: t.hover, color: t.text },
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: t.hover, color: t.text },
      },
    },
  };
}

export function primaryButtonSx() {
  return schedulePrimaryButtonSx();
}

/** Build staff lookup by courseId from wizard staff rows. */
export function buildStaffByCourse(staffRows, courses, teachers) {
  const map = {};
  for (const row of staffRows) {
    if (!row.courseId || !row.professorId) continue;
    const course = courses.find((c) => String(c.id) === String(row.courseId));
    const prof = teachers.find((t) => String(t.id) === String(row.professorId));
    const asst = row.assistantId
      ? teachers.find((t) => String(t.id) === String(row.assistantId))
      : null;
    map[String(row.courseId)] = {
      professorId: row.professorId,
      assistantId: row.assistantId || "",
      courseLabel: course?.titulli || "—",
      professorLabel: prof ? `${prof.emri || ""} ${prof.mbiemri || ""}`.trim() : "—",
      assistantLabel: asst ? `${asst.emri || ""} ${asst.mbiemri || ""}`.trim() : "—",
    };
  }
  return map;
}

export function applyStaffToScheduleRow(row, staffByCourse) {
  if (!row.courseId) return row;
  const staff = staffByCourse[String(row.courseId)];
  if (!staff) return row;
  return {
    ...row,
    professorId: staff.professorId,
    assistantId: staff.assistantId,
  };
}

export function seedScheduleRowsFromStaff(staffRows, emptyScheduleRow) {
  const valid = staffRows.filter((r) => r.courseId && r.professorId);
  if (valid.length === 0) return [emptyScheduleRow()];
  return valid.map((r) => ({
    courseId: r.courseId,
    professorId: r.professorId,
    assistantId: r.assistantId || "",
    sessionType: "LECTURE",
    dayOfWeek: "MONDAY",
    startTime: "10:00",
    endTime: "",
    room: "",
    color: "sky",
  }));
}
