import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Breadcrumbs,
  Snackbar,
  Alert,
  Zoom,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import teacherContentService from "../../services/teacherContentService";
import quizService from "../../services/quizService";

function formatSeconds(sec) {
  if (!sec && sec !== 0) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
import { useAppPreferences } from "../../context/appPreferencesContext";
import Footer from "../../components/ui/Footer";

const EMPTY_MODULE = {
  titulli: "",
  pershkrimi: "",
  rradhitja: 1,
};

export default function TeacherModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState(EMPTY_MODULE);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsModuleName, setResultsModuleName] = useState('');
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsQuizzes, setResultsQuizzes] = useState([]);
  const [resultsSelectedQuiz, setResultsSelectedQuiz] = useState(null);
  const [resultsAttempts, setResultsAttempts] = useState([]);
  const [resultsAttemptsLoading, setResultsAttemptsLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    } else {
      fetchCourseAndModules();
    }
  }, [courseId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await teacherContentService.getCourses();
      setCourses(res.data);
    } catch {
      setError("Gabim gjatë marrjes së kurseve.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAndModules = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([
        teacherContentService.getCourseById(courseId),
        teacherContentService.getModules(courseId),
      ]);
      setSelectedCourse(courseRes.data);
      setModules(modulesRes.data);
    } catch {
      setError("Gabim gjatë marrjes së të dhënave.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditingModule(null);
    setFormData({ ...EMPTY_MODULE, rradhitja: modules.length + 1 });
    setOpenDialog(true);
  };

  const handleOpenEdit = (mod) => {
    setIsEdit(true);
    setEditingModule(mod);
    setFormData({
      titulli: mod.titulli,
      pershkrimi: mod.pershkrimi,
      rradhitja: mod.rradhitja,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await teacherContentService.updateModule(editingModule.id, {
          ...formData,
          courseId: Number(courseId),
        });
      } else {
        await teacherContentService.createModule({
          ...formData,
          courseId: Number(courseId),
        });
      }
      const res = await teacherContentService.getModules(courseId);
      setModules(res.data);
      setSnackbarMessage(isEdit ? "Moduli u përditësua me sukses." : "Moduli u krijua me sukses.");
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (mod) => {
    setDeleteTarget(mod);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await teacherContentService.deleteModule(deleteTarget.id);
      setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setSnackbarMessage("Moduli u fshi me sukses.");
      setOpenSnackbar(true);
      setDeleteTarget(null);
      setOpenDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenResults = async (mod) => {
    setResultsOpen(true);
    setResultsModuleName(mod.titulli);
    setResultsLoading(true);
    setResultsQuizzes([]);
    setResultsSelectedQuiz(null);
    setResultsAttempts([]);
    try {
      const lessonsRes = await teacherContentService.getLessons(mod.id);
      const quizLessons = (lessonsRes.data || []).filter((l) => l.lloji === 'QUIZ');
      const quizArrays = await Promise.all(
        quizLessons.map((l) =>
          quizService.getTeacherLessonQuizzes(l.id).then((r) =>
            (r.data || []).map((q) => ({ ...q, lessonTitulli: l.titulli }))
          )
        )
      );
      setResultsQuizzes(quizArrays.flat());
    } catch { void 0 } finally {
      setResultsLoading(false);
    }
  };

  const handleSelectQuiz = async (quiz) => {
    setResultsSelectedQuiz(quiz);
    setResultsAttemptsLoading(true);
    setResultsAttempts([]);
    try {
      const res = await quizService.getResults(quiz.id);
      setResultsAttempts(res.data || []);
    } catch { void 0 } finally {
      setResultsAttemptsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-32 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <CircularProgress className="text-indigo-500!" />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        
        {}
        <Box className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs 
            separator={<Box className="w-1 h-1 rounded-full bg-slate-300 mx-2" />}
            className="text-slate-500! dark:text-slate-400!"
          >
            <Link to="/teacher" className="hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider text-xs">
              Paneli
            </Link>
            <Link to="/teacher/modules" className="hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider text-xs">
              Modulet
            </Link>
            {selectedCourse && (
              <Typography className="font-bold! text-indigo-600! uppercase! tracking-wider! text-xs!">
                {selectedCourse.titulli}
              </Typography>
            )}
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate(courseId ? "/teacher/modules" : "/teacher")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
          >
            {courseId ? "Ndërro Kursin" : "Kthehu te Paneli"}
          </Button>
        </Box>

        {}
        {!courseId ? (
          
          <Box>
            <Box className="mb-12">
              <Typography variant="h3" className="font-black! text-slate-900! dark:text-white! mb-2">
                Zgjidhni Kursin
              </Typography>
              <Typography variant="body1" className="text-slate-500 dark:text-slate-400 text-lg">
                Zgjidhni një nga kurset tuaja për të menaxhuar modulet.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <Card 
                    elevation={0}
                    onClick={() => navigate(`/teacher/modules/${course.id}`)}
                    className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 bg-white dark:bg-slate-900"
                    sx={{
                      height: "240px important!",
                      minHeight: "240px important!",
                      maxHeight: "240px important!",
                      borderRadius: "2.5rem important!",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden important!",
                      "&:hover": {
                        borderColor: "primary.main",
                      }
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        p: "40px important!", 
                        height: "100%", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        overflow: "hidden"
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
                        <Box className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner flex-shrink-0 transition-transform group-hover:scale-110">
                          <SchoolRounded fontSize="large" />
                        </Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 900,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.2,
                            fontSize: "1.25rem"
                          }}
                          className="dark:text-white"
                        >
                          {course.titulli}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 3, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                           <Box className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                           <Typography sx={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary" }}>
                              {course.moduleCount || 0} MODULE
                           </Typography>
                         </Box>
                         <ArrowForwardRounded
                           className="text-2xl! transition-all duration-300 group-hover:translate-x-3"
                           sx={{ color: "var(--teacher-action-icon)" }}
                         />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {courses.length === 0 && (
                <Grid item xs={12}>
                   <Box className="p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <SchoolRounded className="text-6xl! text-slate-200 mb-4" />
                      <Typography variant="h6" className="text-slate-400">Nuk keni asnjë kurs të regjistruar akoma.</Typography>
                   </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          
          <Box>
            <Box className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Typography variant="h3" className="font-black! text-slate-900! dark:text-white! mb-2">
                  Menaxhimi i Moduleve
                </Typography>
                <Typography variant="body1" className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2">
                  <SchoolRounded className="text-indigo-600" /> {selectedCourse?.titulli}
                </Typography>
              </div>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={handleOpenAdd}
                className="rounded-2xl! bg-indigo-600! px-8! py-3! normal-case! font-bold! shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                Shto Modul të Ri
              </Button>
            </Box>

            <Grid container spacing={3}>
              {modules.map((mod) => (
                <Grid item xs={12} key={mod.id}>
                  <Card 
                    elevation={0}
                    className="rounded-4xl! border border-slate-200/80 bg-white/80 dark:bg-slate-900/50! dark:border-slate-800! hover:border-indigo-300 dark:hover:border-indigo-900 transition-all shadow-sm"
                  >
                    <CardContent className="p-6! flex flex-col md:flex-row md:items-center gap-6">
                      <Box className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black text-xl flex-shrink-0">
                        {mod.rradhitja}
                      </Box>
                      <Box className="grow">
                        <Typography variant="h6" className="font-black! dark:text-white!">
                          {mod.titulli}
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 line-clamp-1">
                          {mod.pershkrimi || "Nuk ka përshkrim."}
                        </Typography>
                      </Box>
                      
                      <Box className="flex items-center gap-6 md:px-6 md:border-x border-slate-100 dark:border-slate-800">
                         <div className="flex flex-col items-center">
                            <Typography variant="caption" className="font-bold! text-slate-400! uppercase">Leksione</Typography>
                            <Typography variant="subtitle1" className="font-black! dark:text-white! flex items-center gap-1">
                               <AutoStoriesRounded fontSize="small" className="text-indigo-500" /> {mod.lessonCount || 0}
                            </Typography>
                         </div>
                      </Box>

                      <Box className="flex gap-2">
                        <Tooltip title="Rezultate Quiz">
                          <IconButton
                            onClick={() => handleOpenResults(mod)}
                            className="bg-sky-50! dark:bg-sky-900/30! text-sky-600! dark:text-sky-300! hover:bg-sky-100! dark:hover:bg-sky-900/50! transition-colors"
                          >
                            <AssessmentRounded />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ndrysho">
                          <IconButton
                            onClick={() => handleOpenEdit(mod)}
                            className="bg-indigo-50! dark:bg-indigo-900/30! text-indigo-600! dark:text-indigo-200! hover:bg-indigo-100! dark:hover:bg-indigo-900/50! transition-colors"
                          >
                            <EditRounded />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Fshij">
                          <IconButton
                            onClick={() => handleOpenDelete(mod)}
                            className="bg-rose-50! dark:bg-rose-900/30! text-rose-600! dark:text-rose-200! hover:bg-rose-100! dark:hover:bg-rose-900/50! transition-colors"
                          >
                            <DeleteRounded />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {modules.length === 0 && (
                <Grid item xs={12}>
                   <Box className="p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                      <LayersRounded className="text-6xl! text-slate-200 mb-4" />
                      <Typography variant="h6" className="text-slate-400">Nuk ka asnjë modul për këtë kurs akoma.</Typography>
                      <Button 
                        variant="outlined" 
                        className="mt-4! rounded-full! normal-case!" 
                        onClick={handleOpenAdd}
                      >
                        Krijo Modulin e Parë
                      </Button>
                   </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Container>

      {}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-[2.5rem]! p-2! shadow-2xl dark:bg-slate-900!" }}
      >
        <DialogTitle className="font-black! text-2xl! pt-8! px-8!">
          {isEdit ? "Ndrysho Modulin" : "Shto Modul të Ri"}
        </DialogTitle>
        <DialogContent className="px-8! pt-4!">
          <Box className="flex flex-col gap-6 py-4">
            <TextField
              label="Titulli i Modulit"
              fullWidth
              variant="outlined"
              value={formData.titulli}
              onChange={(e) => setFormData({ ...formData, titulli: e.target.value })}
              InputProps={{ className: "rounded-2xl!" }}
            />
            <TextField
              label="Përshkrimi"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.pershkrimi}
              onChange={(e) => setFormData({ ...formData, pershkrimi: e.target.value })}
              InputProps={{ className: "rounded-2xl!" }}
            />
            <TextField
              label="Rradhitja"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.rradhitja}
              onChange={(e) => setFormData({ ...formData, rradhitja: Number(e.target.value) })}
              InputProps={{ className: "rounded-2xl!" }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="px-8! pb-8! pt-2!">
          <Button onClick={() => setOpenDialog(false)} className="normal-case! font-bold! text-slate-500!">
            Anulo
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.titulli}
            className="rounded-2xl! bg-indigo-600! px-10! py-3! normal-case! font-bold! shadow-lg"
          >
            {saving ? "Duke ruajtur..." : isEdit ? "Përditëso" : "Krijo"}
          </Button>
        </DialogActions>
      </Dialog>

      {}
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
            className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}
          >
            A jeni i sigurt?
          </Typography>
        </DialogTitle>
        <DialogContent className="px-6! py-4!">
          <Typography
            variant="body2"
            className={isDark ? "text-slate-300!" : "text-slate-600!"}
          >
            Do të fshihet përhershëm moduli:
          </Typography>
          <Typography
            variant="body1"
            className={isDark ? "font-bold! text-white! mt-3!" : "font-bold! text-slate-900! mt-3!"}
          >
            {deleteTarget ? deleteTarget.titulli : ""}
          </Typography>
          <Typography
            variant="caption"
            className={isDark ? "text-slate-400! block! mt-1!" : "text-slate-500! block! mt-1!"}
          >
            Kujdes: Ky veprim fshin edhe të gjitha leksionet brenda tij.
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
            className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-rose-600! hover:bg-rose-700! shadow-lg shadow-rose-500/20"
          >
            Fshi
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-[2rem]! p-2! dark:bg-slate-900!" }}
      >
        <DialogTitle className="flex items-center justify-between font-black! text-xl! pt-6! px-6!">
          <Box className="flex items-center gap-2">
            <AssessmentRounded className="text-sky-500" />
            <span className="dark:text-white">Rezultatet — {resultsModuleName}</span>
          </Box>
          <IconButton onClick={() => setResultsOpen(false)} size="small">
            <CloseRounded fontSize="small" className="dark:text-slate-400" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="px-6! pb-8!">
          {resultsLoading ? (
            <Box className="flex justify-center py-12">
              <CircularProgress />
            </Box>
          ) : resultsQuizzes.length === 0 ? (
            <Alert severity="info" className="mt-2">Ky modul nuk ka leksione quiz.</Alert>
          ) : !resultsSelectedQuiz ? (
            <Box className="mt-3 flex flex-col gap-3">
              <Typography variant="body2" className="text-slate-500 dark:!text-slate-400">
                Zgjidhni quiz-in për të parë rezultatet e studentëve:
              </Typography>
              {resultsQuizzes.map((q) => (
                <Box
                  key={q.id}
                  onClick={() => handleSelectQuiz(q)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-sky-400 dark:border-slate-700 dark:hover:border-sky-600"
                >
                  <div>
                    <Typography className="font-bold! dark:!text-white">{q.titulli}</Typography>
                    <Typography variant="caption" className="text-slate-500">
                      {q.lessonTitulli} · {q.status}
                    </Typography>
                  </div>
                  <ArrowForwardRounded className="text-slate-400" />
                </Box>
              ))}
            </Box>
          ) : (
            <Box className="mt-3">
              <Box className="mb-4 flex items-center gap-3">
                <Button
                  startIcon={<ArrowBackRounded />}
                  size="small"
                  onClick={() => { setResultsSelectedQuiz(null); setResultsAttempts([]); }}
                  className="normal-case! text-slate-500!"
                >
                  Kthehu
                </Button>
                <Typography className="font-bold! dark:!text-white">{resultsSelectedQuiz.titulli}</Typography>
              </Box>
              {resultsAttemptsLoading ? (
                <Box className="flex justify-center py-8"><CircularProgress size={28} /></Box>
              ) : resultsAttempts.length === 0 ? (
                <Alert severity="info">Asnjë student nuk e ka dorëzuar ende këtë quiz.</Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">#</th>
                        <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">Emri dhe Mbiemri</th>
                        <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">ID</th>
                        <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">Koha</th>
                        <th className="py-3 font-bold text-slate-500 dark:text-slate-400">Pikët</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resultsAttempts.map((r, i) => (
                        <tr key={r.id} className="dark:text-slate-200">
                          <td className="py-3 pr-4 text-slate-400">{i + 1}</td>
                          <td className="py-3 pr-4 font-medium">{r.userEmri}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-slate-500">{r.userId}</td>
                          <td className="py-3 pr-4 text-slate-500">{formatSeconds(r.kohaSekondat)}</td>
                          <td className="py-3">
                            <span className={`font-bold ${r.pikete != null && r.pikete >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                              {r.pikete != null ? `${Math.round(r.pikete)}%` : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
    </Box>
  );
}
