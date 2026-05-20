import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
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
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Zoom,
  Grid,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import teacherContentService from "../../services/teacherContentService";
import Footer from "../../components/ui/Footer";

const SEMESTER_STYLE = {
  1: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  2: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  3: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  4: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  5: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  6: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export default function TeacherCourses() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await teacherContentService.getCourses();
      setCourses(res.data);
    } catch (err) {
      setError("Gabim gjatë marrjes së kurseve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      titulli: course.titulli,
      pershkrimi: course.pershkrimi,
      semester: course.semester,
      enrollmentKey: course.enrollmentKey || "",
      niveli: course.niveli,
      statusi: course.statusi,
      categoryId: course.categoryId
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await teacherContentService.updateCourse(selectedCourse.id, formData);
      setCourses(prev => prev.map(c => c.id === res.data.id ? res.data : c));
      setSnackbarMessage("Kursi u përditësua me sukses.");
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (err) {
      setError("Gabim gjatë përditësimit.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.titulli.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.pershkrimi && c.pershkrimi.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || c.statusi === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        {/* BACK BUTTON & TOP STRIP */}
        <Box className="flex items-center justify-between mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/teacher")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
          >
            Kthehu te Paneli
          </Button>
          <Box className="flex gap-2">
            <Tooltip title="Filtra të avancuar">
              <IconButton className="bg-white! dark:bg-slate-900! border border-slate-200 dark:border-slate-800 rounded-xl! text-slate-500! dark:text-slate-200!">
                <FilterListRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* HEADER SECTION */}
        <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <Typography
              variant="overline"
              className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!"
            >
              MENAXHIMI I KURSEVE
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              className="mt-2! font-black! text-slate-900! dark:text-white!"
            >
              Kurset e Mia
            </Typography>
            <Typography
              variant="body1"
              className="mt-4! max-w-2xl! text-slate-500! dark:text-slate-400! text-lg font-medium!"
            >
              Mbikëqyrni kurset tuaja, përditësoni informacionin dhe menaxhoni përmbajtjen për studentët.
            </Typography>
          </div>

          <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <TextField
              placeholder="Kërko kurset..."
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
          </Box>
        </Box>

        {error && <Alert severity="error" className="mb-6 rounded-2xl!">{error}</Alert>}

        {/* QUICK STATS STRIP */}
        <Grid container spacing={3} className="mb-10">
          {[
            {
              label: "Gjithsej Kurse",
              value: courses.length,
              color: "text-indigo-600",
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
            },
            {
              label: "Kurse Aktive",
              value: courses.filter((c) => c.statusi === "AKTIV").length,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Kurse Draft",
              value: courses.filter((c) => c.statusi === "DRAFT").length,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
          ].map((s, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Box className="p-6 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}
                >
                  {s.value}
                </div>
                <div>
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

        {/* TABLE CONTAINER */}
        <Card
          elevation={0}
          className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none"
        >
          <Box className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Typography
              variant="h6"
              className="font-black! text-slate-800! dark:text-white!"
            >
              Lista e Kurseve
            </Typography>
            <Box className="flex gap-2">
              {["all", "AKTIV", "DRAFT"].map((status) => (
                <Button
                  key={status}
                  size="small"
                  onClick={() => setStatusFilter(status)}
                  className={`!rounded-full px-4! py-1! normal-case! text-xs! font-bold! ${statusFilter === status ? "bg-slate-900! text-white! dark:bg-white! dark:text-slate-900!" : "text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"}`}
                >
                  {status === "all"
                    ? "Të gjithë"
                    : status === "AKTIV" ? "Aktiv" : "Draft"}
                </Button>
              ))}
            </Box>
          </Box>

          {loading ? (
            <Box className="flex justify-center py-32">
              <CircularProgress className="text-indigo-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                  <TableRow>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pl-8! w-1/3">
                      Kursi & Përshkrimi
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Kategoria / Semestri
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Statusi
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Krijuar Më
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pr-8!"
                    >
                      Veprime
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className="flex flex-col items-center justify-center py-24 gap-6">
                          <div className="h-24 w-24 rounded-4xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                            <SchoolRounded className="text-5xl! text-slate-200 dark:text-slate-700" />
                          </div>
                          <div className="text-center">
                            <Typography
                              variant="h6"
                              className="font-black! text-slate-800! dark:text-white! mb-1"
                            >
                              Nuk u gjet asnjë kurs
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-slate-400!"
                            >
                              Provo të ndryshosh filtrat ose kërkimin tend.
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
                          <Box>
                            <Typography
                              variant="body1"
                              className="font-black! text-slate-900! dark:text-white! mb-1"
                            >
                              {course.titulli}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-slate-500! font-medium! line-clamp-2!"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                              {course.pershkrimi || "Pa përshkrim"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex flex-col gap-1.5 items-start">
                            {course.categoryName && (
                              <Typography variant="caption" className="font-bold! text-slate-700! dark:text-slate-300!">
                                {course.categoryName}
                              </Typography>
                            )}
                            <span
                              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${SEMESTER_STYLE[course.semester] || "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300"}`}
                            >
                              Semestri {course.semester}
                            </span>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${course.statusi === "AKTIV" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}
                            />
                            <Typography
                              variant="caption"
                              className={`!font-black uppercase! tracking-widest! ${course.statusi === "AKTIV" ? "text-emerald-600" : "text-amber-600"}`}
                            >
                              {course.statusi}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className="text-slate-500! font-bold! text-xs!">
                          {course.createdAt
                            ? new Date(course.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell align="right" className="pr-8!">
                          <Box className="flex justify-end gap-1">
                            <Tooltip title="Shiko Kursin">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/course/${course.id}`)}
                                className="bg-slate-100! dark:bg-slate-800! text-slate-500! dark:text-sky-200! hover:text-sky-600! dark:hover:text-sky-300! rounded-xl! transition-all"
                              >
                                <VisibilityRounded fontSize="small" />
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

        {/* EDIT DIALOG */}
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
              component="p"
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              Ndrysho Kursin
            </Typography>
            <Typography
              variant="body2"
              className={
                isDark ? "text-slate-300! mt-1!" : "text-slate-600! mt-1!"
              }
            >
              Përditësoni të dhënat bazë të kursit.
            </Typography>
          </DialogTitle>
          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            <Box className="flex flex-col gap-5 mt-4">
              <TextField
                label="Titulli"
                fullWidth
                disabled
                value={formData.titulli || ''}
                onChange={e => setFormData({...formData, titulli: e.target.value})}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                    "&:hover fieldset": { borderColor: isDark ? "#475569" : "#cbd5e1" },
                  },
                  "& .MuiInputLabel-root": { color: isDark ? "#cbd5e1" : "#64748b" },
                }}
              />
              <TextField
                label="Përshkrimi"
                fullWidth
                multiline
                rows={3}
                value={formData.pershkrimi || ''}
                onChange={e => setFormData({...formData, pershkrimi: e.target.value})}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                    "&:hover fieldset": { borderColor: isDark ? "#475569" : "#cbd5e1" },
                  },
                  "& .MuiInputLabel-root": { color: isDark ? "#cbd5e1" : "#64748b" },
                }}
              />
              <Box className="flex gap-4">
                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>Semestri</InputLabel>
                  <Select variant="outlined"
                    value={formData.semester || 1}
                    label="Semestri"
                    disabled
                    onChange={e => setFormData({...formData, semester: e.target.value})}
                    sx={{
                      borderRadius: "1rem",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#475569" : "#cbd5e1" },
                      "& .MuiSvgIcon-root": { color: isDark ? "#cbd5e1" : "#64748b" },
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(s => <MenuItem key={s} value={s}>Semestri {s}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>Statusi</InputLabel>
                  <Select variant="outlined"
                    value={formData.statusi || 'DRAFT'}
                    label="Statusi"
                    onChange={e => setFormData({...formData, statusi: e.target.value})}
                    sx={{
                      borderRadius: "1rem",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#475569" : "#cbd5e1" },
                      "& .MuiSvgIcon-root": { color: isDark ? "#cbd5e1" : "#64748b" },
                    }}
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="AKTIV">Aktiv</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions className="px-8! pb-8! pt-4! gap-2">
            <Button
              onClick={() => setOpenDialog(false)}
              className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
            >
              Anulo
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-indigo-600! hover:bg-indigo-700! shadow-lg shadow-indigo-500/20"
            >
              {saving ? "Po Ruhet..." : "Ruaj"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%', borderRadius: '1rem' }} className="shadow-xl">
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Container>
    </Box>
  );
}
