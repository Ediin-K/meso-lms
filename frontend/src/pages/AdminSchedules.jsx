import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Zoom,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import axiosInstance from "../services/axiosInstance";
import { createSchedule, deleteSchedule, getAllSchedules } from "../services/scheduleService";
import { getCourseGroups } from "../services/courseGroupService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
};

const EMPTY_FORM = {
  courseId: "",
  courseGroupId: "",
  courseSubgroupId: "",
  teacherId: "",
  sessionType: "LECTURE",
  dayOfWeek: "MONDAY",
  startTime: "10:00",
  room: "",
  capacity: 30,
};

export default function AdminSchedules() {
  const navigate = useNavigate();
  const { mode } = useAppPreferences();
  const isDark = mode === "dark";
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadData = async () => {
    const [scheduleData, courseRes, userRes] = await Promise.all([
      getAllSchedules(),
      axiosInstance.get("/courses"),
      axiosInstance.get("/users"),
    ]);
    setSchedules(scheduleData);
    setCourses(courseRes.data);
    setUsers(userRes.data);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Gabim gjate ngarkimit"));
  }, []);

  const selectedGroup = groups.find((group) => group.id === Number(form.courseGroupId));
  const subgroups = selectedGroup?.subgroups || [];
  const teachers = useMemo(
    () => users.filter((user) => user.role === "teacher"),
    [users],
  );

  const updateForm = (key) => async (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "courseId" ? { courseGroupId: "", courseSubgroupId: "" } : {}),
      ...(key === "courseGroupId" ? { courseSubgroupId: "" } : {}),
    }));

    if (key === "courseId" && value) {
      setGroups(await getCourseGroups(value));
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");
      await createSchedule({
        ...form,
        courseId: Number(form.courseId),
        courseGroupId: form.courseGroupId ? Number(form.courseGroupId) : null,
        courseSubgroupId: form.courseSubgroupId ? Number(form.courseSubgroupId) : null,
        teacherId: Number(form.teacherId),
        capacity: Number(form.capacity || 30),
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data || err.message || "Gabim gjate ruajtjes");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setError("");
      await deleteSchedule(deleteTargetId);
      setOpenDeleteConfirm(false);
      setDeleteTargetId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Gabim gjate fshirjes");
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400!"
        >
          Kthehu te Paneli
        </Button>

        <Box className="my-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
              PLANIFIKIMI AKADEMIK
            </Typography>
            <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
              Oraret
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setOpen(true)}
            className="rounded-2xl! bg-indigo-600! normal-case! font-bold!"
          >
            Shto Orar
          </Button>
        </Box>

        {error && <Alert severity="error" className="mb-4 rounded-2xl!">{error}</Alert>}

        <Box className="grid gap-4">
          {DAYS.map((day) => (
            <Card key={day} className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60! p-5">
              <Typography variant="h6" className="font-black! dark:text-white! mb-3">
                {DAY_LABELS[day]}
              </Typography>
              <Box className="grid gap-3">
                {schedules.filter((s) => s.dayOfWeek === day).map((schedule) => (
                  <Box key={schedule.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4">
                    <div>
                      <Typography className="font-black! text-slate-900! dark:text-white!">
                        {schedule.startTime} - {schedule.endTime} · {schedule.courseTitle}
                      </Typography>
                      <Typography variant="body2" className="text-slate-500! dark:text-slate-300!">
                        {schedule.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"} · {schedule.courseGroupName || "-"}{schedule.courseSubgroupName ? ` / ${schedule.courseSubgroupName}` : ""} · {schedule.teacherName}
                      </Typography>
                    </div>
                    <Button
                      color="error"
                      startIcon={<DeleteRounded />}
                      onClick={() => {
                        setDeleteTargetId(schedule.id);
                        setOpenDeleteConfirm(true);
                      }}
                      className="rounded-xl! normal-case! font-bold!"
                    >
                      Fshi
                    </Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" className="font-black!">Shto Orar</Typography>
        </DialogTitle>
        <DialogContent>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <FormControl fullWidth>
              <InputLabel>Lenda</InputLabel>
              <Select value={form.courseId} label="Lenda" onChange={updateForm("courseId")}>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>{course.titulli} · Sem. {course.semester}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tipi</InputLabel>
              <Select value={form.sessionType} label="Tipi" onChange={updateForm("sessionType")}>
                <MenuItem value="LECTURE">Ligjerate</MenuItem>
                <MenuItem value="EXERCISE">Ushtrime</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Grupi</InputLabel>
              <Select value={form.courseGroupId} label="Grupi" onChange={updateForm("courseGroupId")}>
                <MenuItem value="">Pa grup</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Nengrupi</InputLabel>
              <Select value={form.courseSubgroupId} label="Nengrupi" onChange={updateForm("courseSubgroupId")}>
                <MenuItem value="">Pa nengrup</MenuItem>
                {subgroups.map((subgroup) => (
                  <MenuItem key={subgroup.id} value={subgroup.id}>{subgroup.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Profesor/Asistent</InputLabel>
              <Select value={form.teacherId} label="Profesor/Asistent" onChange={updateForm("teacherId")}>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>{teacher.emri} {teacher.mbiemri}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Dita</InputLabel>
              <Select value={form.dayOfWeek} label="Dita" onChange={updateForm("dayOfWeek")}>
                {DAYS.map((day) => <MenuItem key={day} value={day}>{DAY_LABELS[day]}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Ora e fillimit" type="time" value={form.startTime} onChange={updateForm("startTime")} />
            <TextField label="Salla" value={form.room} onChange={updateForm("room")} />
            <TextField label="Kapaciteti" type="number" value={form.capacity} onChange={updateForm("capacity")} />
          </Box>
        </DialogContent>
        <DialogActions className="p-6!">
          <Button onClick={() => setOpen(false)} className="rounded-xl! normal-case!">Anulo</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.courseId || !form.teacherId}
            className="rounded-xl! bg-indigo-600! normal-case! font-bold!"
          >
            Ruaj
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "2rem",
            p: 2,
            backgroundColor: isDark ? "#0f172a" : "white",
            border: isDark
              ? "1px solid #1e293b"
              : "1px solid rgba(148,163,184,0.15)",
          },
        }}
      >
        <DialogTitle className="px-6! pt-6! pb-2!">
          <Typography
            variant="h5"
            className={
              isDark
                ? "font-black! text-white!"
                : "font-black! text-slate-900!"
            }
          >
            Fshi Orarin
          </Typography>
        </DialogTitle>
        <DialogContent
          className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
        >
          <Typography className="text-slate-600! dark:text-slate-300!">
            A je i sigurt që dëshiron ta fshish këtë orar?
          </Typography>
        </DialogContent>
        <DialogActions className="p-4! gap-2">
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            className="rounded-xl! normal-case! text-slate-600!"
          >
            Anulo
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            className="rounded-xl! normal-case! font-bold!"
          >
            Fshi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
