import { Box, Chip, IconButton, TextField, Typography } from "@mui/material";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import TruncatedSelect from "./TruncatedSelect";
import RoomInput from "./RoomInput";
import { computeScheduleEndTime } from "../../../utils/scheduleConflict";
import { getGroupsTheme, getWizardFieldSx, wizardFieldClass } from "./wizardUi";

const SESSION_OPTIONS = [
  { value: "LECTURE", label: "Ligjerate" },
  { value: "EXERCISE", label: "Ushtrime" },
];

export default function ScheduleEntryCard({
  row,
  index,
  isDark,
  courseOptions,
  staffForCourse,
  dayOptions,
  onChange,
  onRemove,
  canRemove,
  rowError,
}) {
  const t = getGroupsTheme(isDark);

  const gridFields = (
    <>
      <Box className="min-w-0 lg:col-span-2">
        <TruncatedSelect
          label="Lenda"
          value={row.courseId}
          onChange={(e) => onChange(index, "courseId", e.target.value)}
          options={courseOptions}
          emptyOption="Zgjidh lenden"
          isDark={isDark}
          maxLabelLen={36}
        />
      </Box>
      <Box className="min-w-0 lg:col-span-2 flex flex-col justify-center gap-1">
        <Typography variant="caption" sx={{ color: t.textMuted, fontWeight: 600 }}>
          Stafi (nga hapi i stafit)
        </Typography>
        <Box className="flex flex-wrap gap-1">
          <Chip
            size="small"
            label={staffForCourse?.professorLabel ? `Prof: ${staffForCourse.professorLabel}` : "Zgjidh lenden"}
            variant="outlined"
            sx={{ borderColor: t.border, color: t.text, maxWidth: "100%" }}
          />
          {staffForCourse?.assistantLabel && staffForCourse.assistantLabel !== "—" && (
            <Chip
              size="small"
              label={`Asist: ${staffForCourse.assistantLabel}`}
              variant="outlined"
              sx={{ borderColor: t.border, color: t.text }}
            />
          )}
        </Box>
      </Box>
      <Box className="min-w-0">
        <TruncatedSelect
          label="Lloji"
          value={row.sessionType}
          onChange={(e) => onChange(index, "sessionType", e.target.value)}
          options={SESSION_OPTIONS}
          isDark={isDark}
          maxLabelLen={14}
        />
      </Box>
      <Box className="min-w-0">
        <TruncatedSelect
          label="Dita"
          value={row.dayOfWeek}
          onChange={(e) => onChange(index, "dayOfWeek", e.target.value)}
          options={dayOptions}
          isDark={isDark}
          maxLabelLen={12}
        />
      </Box>
      <Box className="min-w-0">
        <TextField
          size="small"
          label="Fillimi"
          type="time"
          value={row.startTime}
          onChange={(e) => {
            const v = e.target.value;
            onChange(index, "startTime", v);
            if (!row.endTime) onChange(index, "endTime", computeScheduleEndTime(v));
          }}
          fullWidth
          className={wizardFieldClass()}
          sx={getWizardFieldSx(isDark)}
        />
      </Box>
      <Box className="min-w-0">
        <TextField
          size="small"
          label="Mbarimi"
          type="time"
          value={row.endTime || computeScheduleEndTime(row.startTime)}
          onChange={(e) => onChange(index, "endTime", e.target.value)}
          fullWidth
          className={wizardFieldClass()}
          sx={getWizardFieldSx(isDark)}
        />
      </Box>
      <Box className="min-w-0 lg:col-span-2">
        <RoomInput value={row.room} onChange={(v) => onChange(index, "room", v)} isDark={isDark} />
      </Box>
    </>
  );

  return (
    <Box
      className="group rounded-xl border p-3 transition-all duration-200"
      sx={{
        borderColor: rowError ? "#f43f5e" : t.border,
        bgcolor: t.surface,
        "&:hover": { borderColor: isDark ? "#475569" : "#7dd3fc" },
      }}
    >
      <Box className="mb-2 flex items-center justify-between gap-2">
        <Typography variant="caption" className="font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Sesioni #{index + 1}
        </Typography>
        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          aria-label="Fshi sesionin"
        >
          <DeleteRounded fontSize="small" />
        </IconButton>
      </Box>

      <Box className="hidden lg:block overflow-x-auto pb-1 -mx-1 px-1">
        <Box
          className="grid gap-2 min-w-[720px]"
          style={{
            gridTemplateColumns:
              "minmax(160px,1.4fr) minmax(200px,1.2fr) minmax(100px,0.75fr) minmax(110px,0.85fr) minmax(95px,0.65fr) minmax(95px,0.65fr) minmax(130px,1fr)",
          }}
        >
          {gridFields}
        </Box>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:hidden">{gridFields}</Box>

      {rowError && (
        <Typography variant="caption" className="mt-2 block font-medium text-rose-600 dark:text-rose-400">
          {rowError}
        </Typography>
      )}
      {row.courseId && !staffForCourse?.professorId && (
        <Typography variant="caption" className="mt-2 block text-amber-700 dark:text-amber-400">
          Kjo lende nuk ka staf ne hapin e stafit — shtojeni atje fillimisht.
        </Typography>
      )}
    </Box>
  );
}
