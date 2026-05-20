import { useEffect, useState } from "react";
import { Box, Card, Container, Typography, Alert } from "@mui/material";
import { getStudentSchedules } from "../services/scheduleService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
};

export default function StudentSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getStudentSchedules(userId)
      .then(setSchedules)
      .catch((err) => setError(err?.response?.data?.message || err.message || "Gabim gjate marrjes se orarit"));
  }, [userId]);

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-sky-600! dark:text-sky-400!">
          JAVA AKADEMIKE
        </Typography>
        <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
          Orari im
        </Typography>
        <Typography className="text-slate-500! dark:text-slate-400! mb-8!">
          Shfaqen vetem lendet e kategorise dhe semestrit tend.
        </Typography>

        {error && <Alert severity="error" className="mb-4 rounded-2xl!">{error}</Alert>}

        <Box className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {DAYS.map((day) => (
            <Card key={day} className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60! p-4 min-h-[420px]">
              <Typography className="font-black! text-slate-900! dark:text-white! mb-4!">
                {DAY_LABELS[day]}
              </Typography>
              <Box className="flex flex-col gap-3">
                {schedules.filter((s) => s.dayOfWeek === day).map((schedule) => (
                  <Box key={schedule.id} className="rounded-2xl bg-sky-50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 p-3">
                    <Typography className="font-black! text-slate-900! dark:text-white!">
                      {schedule.startTime} - {schedule.endTime}
                    </Typography>
                    <Typography className="font-bold! text-sky-700! dark:text-sky-300!">
                      {schedule.courseTitle}
                    </Typography>
                    <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                      {schedule.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"}
                    </Typography>
                    <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                      {schedule.courseGroupName || "-"}{schedule.courseSubgroupName ? ` / ${schedule.courseSubgroupName}` : ""}
                    </Typography>
                    <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                      {schedule.teacherName}
                    </Typography>
                  </Box>
                ))}
                {schedules.filter((s) => s.dayOfWeek === day).length === 0 && (
                  <Typography className="text-slate-400! text-sm!">Pushim</Typography>
                )}
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
