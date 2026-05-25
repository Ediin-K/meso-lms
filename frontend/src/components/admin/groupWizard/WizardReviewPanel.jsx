import { Alert, Box, Chip, Typography } from "@mui/material";
import { truncateText, getGroupsTheme } from "./wizardUi";

const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
  SATURDAY: "E Shtune",
  SUNDAY: "E Diele",
};

function ReviewBlock({ label, children, isDark }) {
  const t = getGroupsTheme(isDark);
  return (
    <Box
      className="rounded-xl border p-3"
      sx={{ borderColor: t.border, bgcolor: t.surface }}
    >
      <Typography
        variant="caption"
        sx={{ color: t.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {label}
      </Typography>
      <Box className="mt-2">{children}</Box>
    </Box>
  );
}

export default function WizardReviewPanel({
  isDark,
  selectedCategory,
  semester,
  groupName,
  groupDescription,
  maxCapacity,
  staffRows,
  scheduleRows,
  staffByCourse,
  courses,
}) {
  const t = getGroupsTheme(isDark);
  const validStaff = staffRows.filter((r) => r.courseId && r.professorId);
  const validSchedules = scheduleRows.filter((r) => r.courseId && r.professorId && r.startTime);

  return (
    <Box className="flex flex-col gap-3">
      <Box className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Drejtimi", value: `${selectedCategory?.emertimi || "—"}` },
          { label: "Semestri", value: String(semester) },
          { label: "Grupi", value: groupName || "—" },
          { label: "Kapaciteti", value: String(maxCapacity) },
        ].map((item) => (
          <Box
            key={item.label}
            className="rounded-xl border p-3"
            sx={{ borderColor: t.border, bgcolor: t.surface }}
          >
            <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 700 }}>
              {item.label}
            </Typography>
            <Typography sx={{ color: t.text, fontWeight: 700, mt: 0.5 }} title={item.value}>
              {truncateText(item.value, 24)}
            </Typography>
          </Box>
        ))}
      </Box>

      {groupDescription && (
        <ReviewBlock label="Pershkrimi" isDark={isDark}>
          <Typography variant="body2" sx={{ color: t.text }}>
            {groupDescription}
          </Typography>
        </ReviewBlock>
      )}

      <ReviewBlock label={`Stafi akademik (${validStaff.length})`} isDark={isDark}>
        {validStaff.length === 0 ? (
          <Typography variant="body2" sx={{ color: t.textMuted }}>
            Asnje lende me staf.
          </Typography>
        ) : (
          <Box className="flex flex-col gap-2">
            {validStaff.map((row, idx) => {
              const staff = staffByCourse[String(row.courseId)];
              const course = courses.find((c) => String(c.id) === String(row.courseId));
              return (
                <Box
                  key={idx}
                  className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
                  sx={{ borderColor: t.border, bgcolor: t.card }}
                >
                  <Typography sx={{ color: t.text, fontWeight: 600, minWidth: 0 }} title={course?.titulli}>
                    {truncateText(course?.titulli || staff?.courseLabel, 36)}
                  </Typography>
                  <Chip size="small" label={`Prof: ${staff?.professorLabel || "—"}`} variant="outlined" />
                  {staff?.assistantLabel && staff.assistantLabel !== "—" && (
                    <Chip size="small" label={`Asist: ${staff.assistantLabel}`} variant="outlined" />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </ReviewBlock>

      <ReviewBlock label={`Orari (${validSchedules.length} sesione)`} isDark={isDark}>
        {validSchedules.length === 0 ? (
          <Typography variant="body2" sx={{ color: t.textMuted }}>
            Asnje sesion orari.
          </Typography>
        ) : (
          <Box className="flex flex-col gap-2">
            {validSchedules.map((row, idx) => {
              const staff = staffByCourse[String(row.courseId)];
              const course = courses.find((c) => String(c.id) === String(row.courseId));
              const teacherForSession =
                row.sessionType === "EXERCISE" && staff?.assistantLabel && staff.assistantLabel !== "—"
                  ? staff.assistantLabel
                  : staff?.professorLabel;
              return (
                <Box
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 rounded-lg border px-3 py-2 text-sm"
                  sx={{ borderColor: t.border, bgcolor: t.card, color: t.text }}
                >
                  <span title={course?.titulli}>
                    <strong>Lenda:</strong> {truncateText(course?.titulli, 28)}
                  </span>
                  <span>
                    <strong>Dita:</strong> {DAY_LABELS[row.dayOfWeek] || row.dayOfWeek}
                  </span>
                  <span>
                    <strong>Ora:</strong> {row.startTime}
                    {row.endTime ? ` – ${row.endTime}` : ""}
                  </span>
                  <span>
                    <strong>Mesues:</strong> {teacherForSession || "—"} ·{" "}
                    {row.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"}
                    {row.room ? ` · ${row.room}` : ""}
                  </span>
                </Box>
              );
            })}
          </Box>
        )}
      </ReviewBlock>

      <Alert severity="success" className="!rounded-xl">
        Verifikoni te dhenat me poshte. Stafi u caktua ne hapin e stafit; orari perdor te njejtin staf per cdo
        lende — nuk kerkohet perseritje.
      </Alert>
    </Box>
  );
}
