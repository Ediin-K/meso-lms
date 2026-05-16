import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography,
  Container,
  Box,
  Card,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Zoom,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import BookRounded from "@mui/icons-material/BookRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import Footer from "../components/ui/Footer";

const BASE_URL = "http://localhost:8080/api";

const SEMESTER_COLORS = {
  1: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  2: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  3: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  4: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  5: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  6: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const EMPTY_FORM = {
  titulli: "",
  pershkrimi: "",
  teacherId: "",
  categoryId: "",
  semester: 1,
  enrollmentKey: "",
  cmimi: 0.0,
  niveli: "FILLESTAR",
  statusi: "DRAFT",
};

export default function AdminCourses() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Gabim gjatë marrjes së kurseve");
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Gabim gjatë krijimit");
    }

    // Nëse body është bosh, mos provo ta parse-sh
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  };

  const updateCourse = async (id, courseData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Gabim gjatë përditësimit");
    }
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {};
  };

  const deleteCourse = async (id) => {
    const token = localStorage.getItem("token");
    console.log(
      "Fshij kurs me ID:",
      id,
      "Token:",
      token ? "Ekziston" : "Nuk ekziston",
    );
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response status:", response.status, response.statusText);
    if (!response.ok) {
      const text = await response.text();
      console.log("Error response text:", text);
      throw new Error(
        text || `Gabim ${response.status}: ${response.statusText}`,
      );
    }
  };

  // ─── HANDLERS ─────────────────────────────────────────────────

  // Hap dialogun për shtim
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedCourse(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setOpenDialog(true);
  };

  // Hap dialogun për editim
  const handleOpenEdit = (course) => {
    setIsEdit(true);
    setSelectedCourse(course);
    // Mbush form-in me të dhënat e kursit ekzistues
    setFormData({
      titulli: course.titulli,
      pershkrimi: course.pershkrimi,
      teacherId: course.teacherId,
      categoryId: course.categoryId,
      semester: course.semester,
      enrollmentKey: course.enrollmentKey || "",
      cmimi: course.cmimi,
      niveli: course.niveli,
      statusi: course.statusi,
    });
    setFormError(null);
    setOpenDialog(true);
  };

  // Submit - Krijo ose Përditëso
  const handleSubmit = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (isEdit) {
        const updated = await updateCourse(selectedCourse.id, formData);
        // Zëvendëso kursin e vjetër me të riun në state
        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        setSnackbarMessage("Kursi u përditësua me sukses.");
      } else {
        const created = await createCourse(formData);
        // Shto kursin e ri në listë
        setCourses((prev) => [...prev, created]);
        setSnackbarMessage("Kursi u krijua me sukses.");
      }
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Fshi kurs
  const handleOpenDelete = (course) => {
    setDeleteTarget(course);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCourse(deleteTarget.id);
      // Largo kursin nga state pa re-fetch
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSnackbarMessage(`${deleteTarget.titulli} u fshi me sukses.`);
      setOpenSnackbar(true);
      setDeleteTarget(null);
      setOpenDeleteConfirm(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Gabim gjatë fshirjes");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const field = (k) => (e) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));

  // Merr kurset kur komponenti ngarkohet
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtro kurset sipas kërkimit
  const filtered = courses.filter(
    (c) =>
      (c.titulli?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (c.categoryName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  // ─── UI ───────────────────────────────────────────────────────

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        {/* BACK BUTTON */}
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/admin")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
          >
            {t("home.admin.services.backToPanel", "Kthehu te Paneli")}
          </Button>
        </Box>

        {/* HEADER */}
        <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <Typography
              variant="overline"
              className="font-bold! tracking-[0.3em]! text-sky-600! dark:text-sky-400!"
            >
              {t("adminCourses.overline", "KURIKULA AKADEMIKE")}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              className="mt-2! font-black! text-slate-900! dark:text-white!"
            >
              {t("adminCourses.title", "Lëndët")}
            </Typography>
            <Typography
              variant="body1"
              className="mt-4! max-w-2xl! text-slate-500! dark:text-slate-400! text-lg font-medium!"
            >
              {t(
                "adminCourses.subtitle",
                "Menaxhoni planin mësimor, kreditet ECTS dhe instruktorët për çdo lëndë.",
              )}
            </Typography>
          </div>

          <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <TextField
              placeholder={t(
                "adminCourses.searchPlaceholder",
                "Kërko lëndët...",
              )}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleOpenAdd}
              className="rounded-3xl! py-4! px-8! normal-case! font-black! bg-sky-600! hover:bg-sky-700! shadow-xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
            >
              {t("adminCourses.addTitle", "Shto Lëndë")}
            </Button>
          </Box>
        </Box>

        {/* ERROR GLOBAL */}
        {error && (
          <Alert
            severity="error"
            className="mb-6 rounded-2xl!"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* STATS */}
        <Grid container spacing={3} className="mb-10">
          {[
            {
              label: t("adminCourses.stats.total", "Gjithsej"),
              value: courses.length,
              icon: BookRounded,
              color: "text-sky-600",
              bg: "bg-sky-50 dark:bg-sky-900/20",
            },
            {
              label: t("adminCourses.stats.categories", "Kategori"),
              value: new Set(courses.map((c) => c.categoryName)).size,
              icon: AutoStoriesRounded,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: t("adminCourses.stats.teachers", "Mësues"),
              value: new Set(courses.map((c) => c.teacherId)).size,
              icon: SchoolRounded,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
            {
              label: t("adminCourses.stats.semesters", "Semestra"),
              value: new Set(courses.map((c) => c.semester)).size,
              icon: LayersRounded,
              color: "text-indigo-600",
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
            },
          ].map((s, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Box className="p-6 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}
                >
                  <s.icon fontSize="small" />
                </div>
                <div>
                  <Typography
                    variant="h5"
                    className="font-black! dark:text-white! leading-none mb-1"
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-slate-500! font-bold! tracking-widest! uppercase! block!"
                  >
                    {s.label}
                  </Typography>
                </div>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* TABLE */}
        <Card
          elevation={0}
          className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none"
        >
          <Box className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Typography
              variant="h6"
              className="font-black! text-slate-800! dark:text-white!"
            >
              {t("adminCourses.catalogTitle", "Katalogu i Lëndëve")}
            </Typography>
          </Box>

          {loading ? (
            <Box className="flex justify-center py-32">
              <CircularProgress className="text-sky-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                  <TableRow>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pl-8!">
                      {t("adminCourses.table.title", "Lënda")}
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      {t("adminCourses.table.category", "Kategoria")}
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      {t("adminCourses.table.semester", "Semestri")}
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      {t("adminCourses.table.instructor", "Instruktori")}
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      {t("adminCourses.table.status", "Statusi")}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pr-8!"
                    >
                      {t("adminCourses.table.actions", "Veprime")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className="flex flex-col items-center justify-center py-24 gap-6">
                          <div className="h-24 w-24 rounded-4xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                            <MenuBookRounded className="text-5xl! text-slate-200 dark:text-slate-700" />
                          </div>
                          <div className="text-center">
                            <Typography
                              variant="h6"
                              className="font-black! text-slate-800! dark:text-white! mb-1"
                            >
                              Nuk u gjet asnjë lëndë
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-slate-400!"
                            >
                              Provo të ndryshosh kërkimin ose shto një lëndë të
                              re.
                            </Typography>
                          </div>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((course) => (
                      <TableRow
                        key={course.id}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <TableCell className="pl-8! py-6!">
                          <Box className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
                              <AutoStoriesRounded fontSize="small" />
                            </div>
                            <div>
                              <Typography
                                variant="body1"
                                className="font-black! text-slate-900! dark:text-white!"
                              >
                                {course.titulli}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-slate-500! font-medium! line-clamp-1 max-w-[250px]"
                              >
                                {course.pershkrimi}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={course.categoryName}
                            size="small"
                            className="font-bold! bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-slate-400! rounded-lg!"
                          />
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${SEMESTER_COLORS[course.semester] || SEMESTER_COLORS[1]}`}
                          >
                            Sem. {course.semester}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-400! font-bold! text-sm!">
                          {course.teacherName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={course.statusi}
                            size="small"
                            className={`!font-bold rounded-lg! ${
                              course.statusi === "AKTIV"
                                ? "bg-emerald-100! text-emerald-700! dark:bg-emerald-900/30! dark:text-emerald-400!"
                                : "bg-slate-100! text-slate-500! dark:bg-slate-800! dark:text-slate-400!"
                            }`}
                          />
                        </TableCell>
                        <TableCell align="right" className="pr-8!">
                          <Box className="flex justify-end gap-1">
                            <Tooltip title="Ndrysho">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(course)}
                                className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-sky-600! rounded-xl! transition-all"
                              >
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Fshi">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(course)}
                                className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-rose-600! rounded-xl! transition-all"
                              >
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* DIALOG - SHTO / NDRYSHO */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: "2.5rem",
              p: 2,
              backgroundColor: isDark ? "#0f172a" : "white",
              border: isDark
                ? "1px solid #1e293b"
                : "1px solid rgba(148,163,184,0.15)",
              boxShadow: isDark
                ? "0 30px 60px rgba(15,23,42,0.65)"
                : "0 30px 60px rgba(148,163,184,0.15)",
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
              {isEdit ? "Ndrysho Lëndën" : "Shto Lëndë të Re"}
            </Typography>
            <Typography
              variant="body2"
              className={
                isDark ? "text-slate-300! mt-1!" : "text-slate-600! mt-1!"
              }
            >
              Plotëso të dhënat e lëndës dhe ruaji ndryshimet.
            </Typography>
          </DialogTitle>

          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            {/* ERROR NË FORM */}
            {formError && (
              <Alert
                severity="error"
                className="mb-4 rounded-2xl!"
                onClose={() => setFormError(null)}
              >
                {formError}
              </Alert>
            )}

            <Box className="flex flex-col gap-5 mt-4">
              {/* TITULLI */}
              <TextField
                label="Titulli i Lëndës *"
                fullWidth
                value={formData.titulli}
                onChange={field("titulli")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#94a3b8",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />

              {/* PERSHKRIMI */}
              <TextField
                label="Përshkrimi"
                fullWidth
                multiline
                rows={3}
                value={formData.pershkrimi}
                onChange={field("pershkrimi")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#94a3b8",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />

              {/* TEACHER ID & CATEGORY ID */}
              <Box className="flex gap-4">
                <TextField
                  label="Teacher ID *"
                  fullWidth
                  type="number"
                  value={formData.teacherId}
                  onChange={field("teacherId")}
                  InputProps={{ className: "rounded-2xl!" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& fieldset": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDark ? "#cbd5e1" : "#64748b",
                    },
                  }}
                />
                <TextField
                  label="Category ID *"
                  fullWidth
                  type="number"
                  value={formData.categoryId}
                  onChange={field("categoryId")}
                  InputProps={{ className: "rounded-2xl!" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& fieldset": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDark ? "#cbd5e1" : "#64748b",
                    },
                  }}
                />
              </Box>

              {/* SEMESTER & CMIMI */}
              <Box className="flex gap-4">
                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                    Semestri *
                  </InputLabel>
                  <Select variant="outlined"
                    value={formData.semester}
                    label="Semestri *"
                    onChange={field("semester")}
                    sx={{
                      borderRadius: "1rem",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <MenuItem key={s} value={s}>
                        Semestri {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Çmimi (€)"
                  fullWidth
                  type="number"
                  value={formData.cmimi}
                  onChange={field("cmimi")}
                  InputProps={{ className: "rounded-2xl!" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& fieldset": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDark ? "#cbd5e1" : "#64748b",
                    },
                  }}
                />
              </Box>

              {/* NIVELI & STATUSI */}
              <Box className="flex gap-4">
                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                    Niveli
                  </InputLabel>
                  <Select variant="outlined"
                    value={formData.niveli}
                    label="Niveli"
                    onChange={field("niveli")}
                    sx={{
                      borderRadius: "1rem",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                  >
                    <MenuItem value="FILLESTAR">Fillestar</MenuItem>
                    <MenuItem value="MESEM">Mesëm</MenuItem>
                    <MenuItem value="AVANCUAR">Avancuar</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                    Statusi
                  </InputLabel>
                  <Select variant="outlined"
                    value={formData.statusi}
                    label="Statusi"
                    onChange={field("statusi")}
                    sx={{
                      borderRadius: "1rem",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                      },
                      "& .MuiSvgIcon-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="AKTIV">Aktiv</MenuItem>
                    <MenuItem value="ARKIVUAR">Arkivuar</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* ENROLLMENT KEY */}
              <TextField
                label="Enrollment Key (opsionale)"
                fullWidth
                value={formData.enrollmentKey}
                onChange={field("enrollmentKey")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions className="px-8! pb-8! pt-4! gap-2">
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={saving}
              className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
            >
              Anulo
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !formData.titulli ||
                !formData.teacherId ||
                !formData.categoryId ||
                saving
              }
              className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-sky-600! hover:bg-sky-700! shadow-lg shadow-sky-500/20"
            >
              {saving ? (
                <CircularProgress size={20} className="text-white!" />
              ) : isEdit ? (
                "Përditëso"
              ) : (
                "Shto Lëndën"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog
          open={openDeleteConfirm}
          onClose={() => {
            setOpenDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          maxWidth="xs"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: "2.5rem",
              p: 2,
              backgroundColor: isDark ? "#0f172a" : "white",
              border: isDark
                ? "1px solid #1e293b"
                : "1px solid rgba(148,163,184,0.15)",
              boxShadow: isDark
                ? "0 30px 60px rgba(15,23,42,0.65)"
                : "0 30px 60px rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography
              variant="h5"
              component="p"
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              A jeni i sigurt?
            </Typography>
          </DialogTitle>
          <DialogContent className="px-6! py-4!">
            <Typography
              variant="body2"
              className={isDark ? "text-slate-300!" : "text-slate-600!"}
            >
              Do të fshihet përhershëm kursi:
            </Typography>
            <Typography
              variant="body1"
              className={
                isDark
                  ? "font-bold! text-white! mt-3!"
                  : "font-bold! text-slate-900! mt-3!"
              }
            >
              {deleteTarget ? deleteTarget.titulli : ""}
            </Typography>
            <Typography
              variant="caption"
              className={isDark ? "text-slate-400!" : "text-slate-500!"}
            >
              {deleteTarget ? deleteTarget.pershkrimi : ""}
            </Typography>
          </DialogContent>
          <DialogActions className="px-8! pb-8! pt-4! gap-2">
            <Button
              onClick={() => {
                setOpenDeleteConfirm(false);
                setDeleteTarget(null);
              }}
              className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
            >
              Anulo
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              className="rounded-2xl! px-10! py-3! normal-case! font-black!"
            >
              Fshi
            </Button>
          </DialogActions>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          TransitionComponent={Zoom}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            variant="filled"
            sx={{ 
              width: "100%", 
              borderRadius: "1.25rem",
              fontWeight: "bold",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
}
