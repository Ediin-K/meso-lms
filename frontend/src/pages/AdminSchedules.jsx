import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import { getAllSchedules } from "../services/scheduleService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
  SATURDAY: "E Shtune",
  SUNDAY: "E Diele",
};

export default function AdminSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllSchedules()
      .then(setSchedules)
      .catch((err) => setError(err.message || "Gabim gjate ngarkimit"));
  }, []);

  return (
    <Box className="flex flex-col min-h-screen grow">
      <Container maxWidth="xl" className="py-4 mt-2 sm:mt-4 grow">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400!"
        >
          Kthehu te Paneli
        </Button>

        <Box className="my-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
              PAMJE E PERGJITHSHME
            </Typography>
            <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
              Oraret (vetem lexim)
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<GroupsRounded />}
            onClick={() => navigate("/admin/groups")}
            className="rounded-2xl! bg-sky-600! normal-case! font-bold!"
          >
            Menaxho grupet & oraret
          </Button>
        </Box>

        <Alert severity="info" className="mb-6 rounded-2xl!">
          Oraret krijohen vetem brenda wizard-it te grupit. Hapni{" "}
          <strong>Menaxhimi i Grupeve → Krijo grup (wizard)</strong> per te shtuar staf dhe orar
          javor me validim konfliktesh.
        </Alert>

        {error && <Alert severity="error" className="mb-4 rounded-2xl!">{error}</Alert>}

        <Box className="grid gap-4">
          {DAYS.map((day) => (
            <Card
              key={day}
              className="rounded-2xl! border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90! p-4 shadow-sm"
            >
              <Typography variant="h6" className="font-black! dark:text-white! mb-3">
                {DAY_LABELS[day]}
              </Typography>
              <Box className="grid gap-3">
                {schedules
                  .filter((s) => s.dayOfWeek === day)
                  .map((schedule) => (
                    <Box
                      key={schedule.id}
                      className="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 p-3"
                    >
                      <Typography className="font-black! text-slate-900! dark:text-white!">
                        {String(schedule.startTime).slice(0, 5)} -{" "}
                        {String(schedule.endTime).slice(0, 5)} · {schedule.courseTitle}
                      </Typography>
                      <Typography variant="body2" className="text-slate-500! dark:text-slate-300!">
                        {schedule.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"} ·{" "}
                        {schedule.courseGroupName || "—"} · {schedule.teacherName}
                        {schedule.room ? ` · ${schedule.room}` : ""}
                      </Typography>
                    </Box>
                  ))}
                {schedules.filter((s) => s.dayOfWeek === day).length === 0 && (
                  <Typography className="text-slate-400!">Nuk ka orare.</Typography>
                )}
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
