import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import StopRounded from "@mui/icons-material/StopRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import teacherContentService from "../../services/teacherContentService";
import quizService from "../../services/quizService";

const STATUS_CONFIG = {
  DRAFT:   { label: "Draft",   color: "default",  bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  ACTIVE:  { label: "Aktiv",   color: "success",  bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  CLOSED:  { label: "Mbyllur", color: "error",    bg: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

const ATTEMPT_STATUS_CONFIG = {
  IN_PROGRESS: { label: "Ne progres",  bg: "bg-amber-100 text-amber-700" },
  SUBMITTED:   { label: "Dorezuar",    bg: "bg-emerald-100 text-emerald-700" },
  TIMED_OUT:   { label: "Koha mbaroi", bg: "bg-red-100 text-red-600" },
  ABANDONED:   { label: "Braktisur",   bg: "bg-slate-100 text-slate-500" },
};

const emptyQuestion = () => ({
  pyetja: "",
  options: [
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
  ],
});

function formatSeconds(sec) {
  if (!sec && sec !== 0) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TeacherQuizzes() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [results, setResults] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titulli: "",
    pershkrimi: "",
    kohezgjatjaMinuta: 20,
    questions: [emptyQuestion()],
  });
  const pollRef = useRef(null);

  useEffect(() => {
    teacherContentService
      .getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError("Kurset nuk u ngarkuan."))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setSelectedModule("");
    setSelectedLesson("");
    setQuizzes([]);
    setSelectedQuizId(null);
    teacherContentService.getModules(selectedCourse).then((res) => setModules(res.data));
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedModule) return;
    setSelectedLesson("");
    setQuizzes([]);
    setSelectedQuizId(null);
    teacherContentService.getLessons(selectedModule).then((res) => setLessons(res.data));
  }, [selectedModule]);

  const loadQuizzes = useCallback(async (lessonId) => {
    if (!lessonId) return;
    setLoadingQuizzes(true);
    try {
      const res = await quizService.getTeacherLessonQuizzes(lessonId);
      setQuizzes(res.data);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedLesson) return;
    setSelectedQuizId(null);
    setResults([]);
    setAllAttempts([]);
    loadQuizzes(selectedLesson);
  }, [selectedLesson, loadQuizzes]);

  const selectedQuiz = useMemo(
    () => quizzes.find((q) => q.id === selectedQuizId),
    [quizzes, selectedQuizId],
  );

  const loadAttemptData = useCallback(async (quizId) => {
    if (!quizId) return;
    try {
      const [resultsRes, attemptsRes] = await Promise.all([
        quizService.getResults(quizId),
        quizService.getAllAttempts(quizId),
      ]);
      setResults(resultsRes.data);
      setAllAttempts(attemptsRes.data);
    } catch {
      // silently fail on poll
    }
  }, []);

  useEffect(() => {
    if (!selectedQuizId) {
      clearInterval(pollRef.current);
      return;
    }
    loadAttemptData(selectedQuizId);

    if (selectedQuiz?.status === "ACTIVE") {
      pollRef.current = setInterval(() => loadAttemptData(selectedQuizId), 5000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedQuizId, selectedQuiz?.status, loadAttemptData]);

  const updateQuestion = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  };

  const updateOption = (qIdx, oIdx, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)) };
      }),
    }));
  };

  const createQuiz = async () => {
    setError("");
    setMessage("");
    if (!selectedLesson) { setError("Zgjidh nje leksion fillimisht."); return; }
    const hasEmptyQuestion = form.questions.some((q) => !q.pyetja.trim());
    if (hasEmptyQuestion) { setError("Te gjitha pyetjet duhet te kene tekst."); return; }
    const hasEmptyOption = form.questions.some((q) => q.options.some((o) => !o.pergjigja.trim()));
    if (hasEmptyOption) { setError("Te gjitha alternativat duhet te kene tekst."); return; }
    const hasMissingCorrect = form.questions.some((q) => !q.options.some((o) => o.eshteSakte));
    if (hasMissingCorrect) { setError("Cdo pyetje duhet te kete te pakten nje pergjigje te sakte."); return; }

    setSaving(true);
    try {
      const res = await quizService.create({
        titulli: form.titulli,
        pershkrimi: form.pershkrimi,
        lessonId: Number(selectedLesson),
        kohezgjatjaMinuta: Number(form.kohezgjatjaMinuta),
        questions: form.questions,
      });
      setMessage("Kuizi u krijua me sukses. Aktivizoje kur je gati.");
      setForm({ titulli: "", pershkrimi: "", kohezgjatjaMinuta: 20, questions: [emptyQuestion()] });
      await loadQuizzes(selectedLesson);
      setSelectedQuizId(res.data.id);
      setActiveTab("list");
    } catch (err) {
      setError(err.response?.data?.message || "Kuizi nuk u krijua.");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (quizId) => {
    setError("");
    setActivating(true);
    try {
      await quizService.activate(quizId);
      setMessage("Kuizi u aktivizua! Studentet mund ta shohin tani.");
      await loadQuizzes(selectedLesson);
      setSelectedQuizId(quizId);
      setActiveTab("live");
    } catch (err) {
      setError(err.response?.data?.message || "Aktivizimi deshtoi.");
    } finally {
      setActivating(false);
    }
  };

  const handleClose = async (quizId) => {
    setError("");
    try {
      await quizService.close(quizId);
      setMessage("Kuizi u mbylli. Studente nuk mund te hyjne me.");
      await loadQuizzes(selectedLesson);
      clearInterval(pollRef.current);
    } catch (err) {
      setError(err.response?.data?.message || "Mbyllja deshtoi.");
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("A jeni i sigurt qe doni te fshini kete kuiz?")) return;
    try {
      await quizService.deleteQuiz(quizId);
      setMessage("Kuizi u fshi.");
      if (selectedQuizId === quizId) setSelectedQuizId(null);
      await loadQuizzes(selectedLesson);
    } catch (err) {
      setError(err.response?.data?.message || "Fshirja deshtoi.");
    }
  };

  const selectQuizAndShowResults = (quiz) => {
    setSelectedQuizId(quiz.id);
    setActiveTab(quiz.status === "ACTIVE" ? "live" : "results");
  };

  const avgScore = useMemo(() => {
    const submitted = results.filter((r) => r.submitted);
    if (!submitted.length) return null;
    return (submitted.reduce((s, r) => s + (r.pikete || 0), 0) / submitted.length).toFixed(1);
  }, [results]);

  if (loadingCourses) {
    return (
      <Box className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header */}
      <Box className="mb-7 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <QuizRounded />
        </span>
        <div>
          <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
            Kuizet
          </Typography>
          <Typography className="text-slate-600 dark:!text-slate-300">
            Krijo, aktivizo dhe monitoro kuizet ne kohe reale.
          </Typography>
        </div>
      </Box>

      {message && <Alert severity="success" className="!mb-4" onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" className="!mb-4" onClose={() => setError("")}>{error}</Alert>}

      {/* Course / Module / Lesson selector */}
      <Card elevation={0} className="mb-5 rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
        <CardContent className="!p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <FormControl fullWidth>
              <InputLabel>Kursi</InputLabel>
              <Select label="Kursi" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.titulli}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedCourse}>
              <InputLabel>Moduli</InputLabel>
              <Select label="Moduli" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                {modules.map((m) => <MenuItem key={m.id} value={m.id}>{m.titulli}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedModule}>
              <InputLabel>Leksioni</InputLabel>
              <Select label="Leksioni" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
                {lessons.map((l) => <MenuItem key={l.id} value={l.id}>{l.titulli}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-5">
          {/* Tab nav */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {["create", "list", "live", "results"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab === "create" ? "Krijo kuiz" :
                 tab === "list"   ? "Kuizet" :
                 tab === "live"   ? "Dashboard live" : "Rezultatet"}
              </button>
            ))}
          </div>

          {/* CREATE TAB */}
          {activeTab === "create" && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <Typography variant="h6" className="!mb-4 !font-black dark:!text-white">Krijo quiz te ri</Typography>
                {!selectedLesson && (
                  <Alert severity="info" className="!mb-4">Zgjidh nje leksion me siper per te krijuar kuiz.</Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Titulli i kuizit"
                    value={form.titulli}
                    onChange={(e) => setForm({ ...form, titulli: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Kohezgjatja (minuta)"
                    type="number"
                    inputProps={{ min: 1, max: 180 }}
                    value={form.kohezgjatjaMinuta}
                    onChange={(e) => setForm({ ...form, kohezgjatjaMinuta: e.target.value })}
                    fullWidth
                  />
                </div>
                <TextField
                  label="Pershkrimi (opsional)"
                  multiline
                  minRows={2}
                  value={form.pershkrimi}
                  onChange={(e) => setForm({ ...form, pershkrimi: e.target.value })}
                  className="!mt-4"
                  fullWidth
                />

                <div className="mt-5 flex flex-col gap-4">
                  {form.questions.map((question, qIdx) => (
                    <Box key={qIdx} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="mb-3 flex items-center justify-between">
                        <Typography variant="subtitle2" className="!font-bold dark:!text-white">
                          Pyetja {qIdx + 1}
                        </Typography>
                        {form.questions.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => setForm((prev) => ({
                              ...prev,
                              questions: prev.questions.filter((_, i) => i !== qIdx),
                            }))}
                          >
                            <DeleteRounded fontSize="small" className="text-red-400" />
                          </IconButton>
                        )}
                      </div>
                      <TextField
                        label={`Teksti i pyetjes ${qIdx + 1}`}
                        fullWidth
                        value={question.pyetja}
                        onChange={(e) => updateQuestion(qIdx, { pyetja: e.target.value })}
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {question.options.map((opt, oIdx) => (
                          <Box key={oIdx} className="flex items-center gap-2">
                            <Tooltip title="Pergjigje e sakte">
                              <Checkbox
                                checked={opt.eshteSakte}
                                onChange={(e) => updateOption(qIdx, oIdx, { eshteSakte: e.target.checked })}
                                color="success"
                              />
                            </Tooltip>
                            <TextField
                              label={`${String.fromCharCode(65 + oIdx)}`}
                              value={opt.pergjigja}
                              onChange={(e) => updateOption(qIdx, oIdx, { pergjigja: e.target.value })}
                              fullWidth
                              size="small"
                            />
                          </Box>
                        ))}
                      </div>
                    </Box>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    startIcon={<AddRounded />}
                    variant="outlined"
                    onClick={() => setForm((p) => ({ ...p, questions: [...p.questions, emptyQuestion()] }))}
                    className="!rounded-xl !normal-case"
                  >
                    Shto pyetje
                  </Button>
                  <Button
                    variant="contained"
                    disabled={saving || !selectedLesson || !form.titulli.trim()}
                    onClick={createQuiz}
                    className="!rounded-xl !normal-case"
                  >
                    {saving ? "Duke ruajtur..." : "Ruaj si Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* LIST TAB */}
          {activeTab === "list" && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Typography variant="h6" className="!font-black dark:!text-white">
                    Kuizet e leksionit
                  </Typography>
                  <IconButton onClick={() => loadQuizzes(selectedLesson)} disabled={!selectedLesson}>
                    <RefreshRounded />
                  </IconButton>
                </div>

                {loadingQuizzes && <Box className="flex justify-center py-6"><CircularProgress size={28} /></Box>}

                {!selectedLesson && (
                  <Alert severity="info">Zgjidh nje leksion per te pare kuizet.</Alert>
                )}

                {selectedLesson && !loadingQuizzes && quizzes.length === 0 && (
                  <Alert severity="info">Ky leksion nuk ka ende kuize.</Alert>
                )}

                <div className="flex flex-col gap-3">
                  {quizzes.map((quiz) => {
                    const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.DRAFT;
                    const isSelected = selectedQuizId === quiz.id;
                    return (
                      <Box
                        key={quiz.id}
                        onClick={() => selectQuizAndShowResults(quiz)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                            : "border-slate-200 hover:border-amber-300 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Typography className="!font-bold dark:!text-white truncate">
                                {quiz.titulli}
                              </Typography>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${cfg.bg}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <Typography variant="caption" className="text-slate-500">
                              {quiz.kohezgjatjaMinuta} minuta
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {quiz.status === "DRAFT" && (
                              <>
                                <Tooltip title="Aktivizo - studentet do ta shohin">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<PlayArrowRounded />}
                                    disabled={activating}
                                    onClick={() => handleActivate(quiz.id)}
                                    className="!normal-case !text-xs"
                                  >
                                    Aktivizo
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Fshi kuizin">
                                  <IconButton size="small" onClick={() => handleDelete(quiz.id)}>
                                    <DeleteRounded fontSize="small" className="text-red-400" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {quiz.status === "ACTIVE" && (
                              <Tooltip title="Mbyll kuizin - studentet nuk mund te hyjne me">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<StopRounded />}
                                  onClick={() => handleClose(quiz.id)}
                                  className="!normal-case !text-xs"
                                >
                                  Mbyll
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </Box>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* LIVE DASHBOARD TAB */}
          {activeTab === "live" && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Box className="flex items-center gap-2">
                    <PeopleRounded className="text-emerald-600" />
                    <Typography variant="h6" className="!font-black dark:!text-white">
                      Dashboard live {selectedQuiz ? `— ${selectedQuiz.titulli}` : ""}
                    </Typography>
                    {selectedQuiz?.status === "ACTIVE" && (
                      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    )}
                  </Box>
                  <IconButton onClick={() => loadAttemptData(selectedQuizId)} size="small">
                    <RefreshRounded />
                  </IconButton>
                </div>

                {!selectedQuizId && (
                  <Alert severity="info">Zgjidh nje kuiz nga lista per te pare dashboardin.</Alert>
                )}

                {selectedQuizId && (
                  <>
                    {/* Stats bar */}
                    <div className="mb-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Ne progres", value: allAttempts.filter((a) => a.attemptStatus === "IN_PROGRESS").length, color: "text-amber-600" },
                        { label: "Dorezuar",   value: allAttempts.filter((a) => a.attemptStatus === "SUBMITTED").length,   color: "text-emerald-600" },
                        { label: "Braktisur",  value: allAttempts.filter((a) => a.attemptStatus === "ABANDONED").length,   color: "text-red-500" },
                      ].map((stat) => (
                        <Box key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                          <Typography variant="h5" className={`!font-black ${stat.color}`}>{stat.value}</Typography>
                          <Typography variant="caption" className="text-slate-500">{stat.label}</Typography>
                        </Box>
                      ))}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-slate-500">
                          <tr>
                            <th className="py-2 pr-3">Studenti</th>
                            <th className="py-2 pr-3">Statusi</th>
                            <th className="py-2 pr-3">Koha</th>
                            <th className="py-2">Piket</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {allAttempts.map((a) => {
                            const asCfg = ATTEMPT_STATUS_CONFIG[a.attemptStatus] || ATTEMPT_STATUS_CONFIG.IN_PROGRESS;
                            return (
                              <tr key={a.id} className="dark:text-slate-200">
                                <td className="py-2 pr-3 font-medium">{a.userEmri}</td>
                                <td className="py-2 pr-3">
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${asCfg.bg}`}>
                                    {asCfg.label}
                                  </span>
                                </td>
                                <td className="py-2 pr-3 text-slate-500">{formatSeconds(a.kohaSekondat)}</td>
                                <td className="py-2 font-bold">
                                  {a.submitted ? `${a.pikete?.toFixed(0) ?? "-"}%` : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {allAttempts.length === 0 && (
                        <Typography className="py-4 text-center text-slate-500" variant="body2">
                          Asnje student nuk ka hapur ende kete kuiz.
                        </Typography>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* RESULTS TAB */}
          {activeTab === "results" && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <Box className="mb-4 flex items-center gap-2">
                  <AssessmentRounded className="text-sky-600" />
                  <Typography variant="h6" className="!font-black dark:!text-white">
                    Rezultatet {selectedQuiz ? `— ${selectedQuiz.titulli}` : ""}
                  </Typography>
                </Box>

                {!selectedQuizId && <Alert severity="info">Zgjidh nje kuiz nga lista per rezultate.</Alert>}

                {selectedQuizId && results.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Mesatarja",  value: avgScore != null ? `${avgScore}%` : "-" },
                      { label: "Maksimumi",  value: results.length ? `${Math.max(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` : "-" },
                      { label: "Minimumi",   value: results.length ? `${Math.min(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` : "-" },
                    ].map((s) => (
                      <Box key={s.label} className="rounded-xl bg-sky-50 p-3 text-center dark:bg-sky-950/30">
                        <Typography variant="h6" className="!font-black text-sky-700 dark:text-sky-300">{s.value}</Typography>
                        <Typography variant="caption" className="text-slate-500">{s.label}</Typography>
                      </Box>
                    ))}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-2 pr-4">Studenti</th>
                        <th className="py-2 pr-4">Piket</th>
                        <th className="py-2 pr-4">Koha</th>
                        <th className="py-2">Dorezuar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {results.map((row) => (
                        <tr key={row.id} className="dark:text-slate-200">
                          <td className="py-3 pr-4 font-medium">{row.userEmri}</td>
                          <td className="py-3 pr-4 font-bold text-sky-700 dark:text-sky-300">
                            {row.pikete?.toFixed(0) ?? "-"}%
                          </td>
                          <td className="py-3 pr-4 text-slate-500">{formatSeconds(row.kohaSekondat)}</td>
                          <td className="py-3 text-slate-500">
                            {row.submittedAt ? new Date(row.submittedAt).toLocaleTimeString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedQuizId && results.length === 0 && (
                    <Alert severity="info" className="!mt-3">Nuk ka dorezime per kete kuiz.</Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT PANEL — quiz detail / status card */}
        <div className="flex flex-col gap-5">
          {selectedQuiz && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <Typography variant="h6" className="!mb-1 !font-black dark:!text-white">{selectedQuiz.titulli}</Typography>
                {selectedQuiz.pershkrimi && (
                  <Typography variant="body2" className="!mb-3 text-slate-500">{selectedQuiz.pershkrimi}</Typography>
                )}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Chip label={`${selectedQuiz.kohezgjatjaMinuta} min`} size="small" />
                  <Chip
                    label={(STATUS_CONFIG[selectedQuiz.status] || STATUS_CONFIG.DRAFT).label}
                    color={(STATUS_CONFIG[selectedQuiz.status] || STATUS_CONFIG.DRAFT).color}
                    size="small"
                  />
                </div>

                {selectedQuiz.status === "DRAFT" && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowRounded />}
                    disabled={activating}
                    onClick={() => handleActivate(selectedQuiz.id)}
                    className="!rounded-xl !normal-case"
                  >
                    {activating ? "Duke aktivizuar..." : "Aktivizo kuizin"}
                  </Button>
                )}
                {selectedQuiz.status === "ACTIVE" && (
                  <Box className="flex flex-col gap-2">
                    <Alert severity="success" className="!py-1 !text-sm">
                      Kuizi eshte aktiv. Studentet mund ta hyjne.
                    </Alert>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<StopRounded />}
                      onClick={() => handleClose(selectedQuiz.id)}
                      className="!rounded-xl !normal-case"
                    >
                      Mbyll kuizin
                    </Button>
                  </Box>
                )}
                {selectedQuiz.status === "CLOSED" && (
                  <Alert severity="info" className="!py-1 !text-sm">
                    Kuizi eshte i mbyllur. Shiko rezultatet ne tab.
                  </Alert>
                )}

                {selectedQuiz.activatedAt && (
                  <Typography variant="caption" className="!mt-3 block text-slate-400">
                    Aktivizuar: {new Date(selectedQuiz.activatedAt).toLocaleString()}
                  </Typography>
                )}
                {selectedQuiz.closedAt && (
                  <Typography variant="caption" className="block text-slate-400">
                    Mbyllur: {new Date(selectedQuiz.closedAt).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick stats for active quiz */}
          {selectedQuiz?.status === "ACTIVE" && (
            <Card elevation={0} className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:!border-emerald-900 dark:!bg-emerald-950/20">
              <CardContent className="!p-5">
                <Box className="flex items-center gap-2 mb-3">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <Typography variant="subtitle2" className="!font-black text-emerald-700 dark:text-emerald-300">
                    Sesion live
                  </Typography>
                </Box>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <Box>
                    <Typography variant="h4" className="!font-black text-emerald-700 dark:text-emerald-300">
                      {allAttempts.filter((a) => a.attemptStatus === "IN_PROGRESS").length}
                    </Typography>
                    <Typography variant="caption" className="text-slate-500">Ne progres</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" className="!font-black text-slate-700 dark:text-slate-200">
                      {allAttempts.filter((a) => a.attemptStatus === "SUBMITTED").length}
                    </Typography>
                    <Typography variant="caption" className="text-slate-500">Dorezuan</Typography>
                  </Box>
                </div>
                <Typography variant="caption" className="!mt-2 block text-slate-400 text-center">
                  Perditeson cdo 5 sekonda
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
