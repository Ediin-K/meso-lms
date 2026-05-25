import { Box, Chip, Typography } from "@mui/material";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import MeetingRoomRounded from "@mui/icons-material/MeetingRoomRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import { DAY_LABELS, formatTime } from "../../utils/studentScheduleUtils";
import { scheduleColorTokens, scheduleTheme } from "./scheduleTheme";

const WEEK_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function toMinutes(time) {
  const [hours = 0, minutes = 0] = formatTime(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function sortSchedules(items) {
  return [...items].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

export default function WeeklyScheduleGrid({ schedules = [], isDark = false, compact = false }) {
  void isDark;
  const grouped = WEEK_DAYS.reduce((acc, day) => {
    acc[day] = sortSchedules(schedules.filter((s) => s.dayOfWeek === day));
    return acc;
  }, {});

  const shellSx = {
    borderColor: scheduleTheme.border,
    bgcolor: scheduleTheme.surface,
    color: scheduleTheme.text,
  };

  return (
    <Box
      className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"}
    >
      {WEEK_DAYS.map((day) => (
        <Box key={day} className="rounded-2xl border p-3 min-h-[180px]" sx={shellSx}>
          <Box className="mb-3 flex items-center justify-between gap-2">
            <Typography sx={{ color: scheduleTheme.text, fontWeight: 900 }}>
              {DAY_LABELS[day] || day}
            </Typography>
            <Chip
              size="small"
              label={grouped[day].length}
              variant="outlined"
              sx={{ color: scheduleTheme.muted, borderColor: scheduleTheme.border }}
            />
          </Box>

          <Box className="flex flex-col gap-2">
            {grouped[day].map((item) => {
              const token = scheduleColorTokens[item.color || "sky"] ? item.color || "sky" : "sky";
              const colors = scheduleColorTokens[token];
              return (
                <Box
                  key={item.id}
                  className="rounded-xl border p-3 transition-transform duration-200 hover:-translate-y-0.5"
                  sx={{ bgcolor: colors.bg, borderColor: colors.border }}
                >
                  <Box className="flex items-start justify-between gap-2">
                    <Typography sx={{ color: colors.text, fontWeight: 900, lineHeight: 1.2 }}>
                      {item.courseTitle}
                    </Typography>
                    <Chip
                      size="small"
                      label={item.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"}
                      sx={{ color: colors.text, borderColor: colors.border, fontWeight: 700 }}
                      variant="outlined"
                    />
                  </Box>
                  <Box className="mt-2 flex flex-col gap-0.5">
                    <Typography variant="caption" sx={{ color: scheduleTheme.muted }}>
                      <AccessTimeRounded sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.5 }} />
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: scheduleTheme.muted }}>
                      <PersonRounded sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.5 }} />
                      {item.teacherName || "-"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: scheduleTheme.muted }}>
                      <MeetingRoomRounded sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.5 }} />
                      {item.room || "Salle e pacaktuar"}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            {grouped[day].length === 0 && (
              <Typography variant="body2" sx={{ color: scheduleTheme.muted }}>
                Pa ore te planifikuara.
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
