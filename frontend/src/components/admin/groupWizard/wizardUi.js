/** Shared admin groups / wizard theme tokens and MUI sx helpers. */

export const WIZARD_STEPS = [
  { id: 0, label: "Konteksti", group: "Struktura akademike" },
  { id: 1, label: "Grupi", group: "Konfigurimi i grupit" },
  { id: 2, label: "Stafi", group: "Stafi akademik" },
  { id: 3, label: "Orari", group: "Ndertuesi i orarit" },
  { id: 4, label: "Permbledhje", group: "Verifikimi final" },
];

export const ROOM_PRESETS = ["101", "132", "205", "301", "A1", "B2"];
export const DRAFT_STORAGE_KEY = "meson-group-wizard-draft";

/** Theme tokens for admin groups module (light/dark). */
export function getGroupsTheme(isDark) {
  return {
    background: isDark ? "#020617" : "#f0f7fb",
    surface: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f1f5f9" : "#0f172a",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#e2e8f0",
    hover: isDark ? "#334155" : "#f0f9ff",
    inputBg: isDark ? "#0f172a" : "#f8fafc",
  };
}

export function truncateText(text, max = 28) {
  if (!text) return "";
  const s = String(text);
  return s.length <= max ? s : `${s.slice(0, max).trim()}…`;
}

export function wizardSurfaceClass(isDark) {
  const t = getGroupsTheme(isDark);
  return isDark
    ? "rounded-2xl border border-slate-700/70 bg-slate-900/95 shadow-md shadow-black/20"
    : "rounded-2xl border border-slate-200/90 bg-slate-50/95 shadow-sm";
}

export function cardSx(isDark) {
  const t = getGroupsTheme(isDark);
  return {
    bgcolor: `${t.card} !important`,
    color: t.text,
    border: `1px solid ${t.border}`,
    boxShadow: isDark ? "none" : "0 1px 3px rgba(15, 23, 42, 0.06)",
    backgroundImage: "none",
  };
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
  const t = getGroupsTheme(isDark);
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.75rem",
      backgroundColor: t.inputBg,
      color: t.text,
      transition: "border-color 0.2s ease",
      "& fieldset": { borderColor: t.border },
      "&:hover fieldset": { borderColor: isDark ? "#475569" : "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#0ea5e9", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { color: t.textMuted },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0284c7" },
    "& .MuiSelect-select": { color: t.text },
    "& .MuiInputBase-input": { color: t.text },
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
        "& .MuiMenuItem-root:hover": { bgcolor: t.hover },
      },
    },
  };
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
  }));
}
