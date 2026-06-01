import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import QuizRounded from '@mui/icons-material/QuizRounded';
import AssessmentRounded from '@mui/icons-material/AssessmentRounded';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import teacherContentService from '../../services/teacherContentService';
import quizService from '../../services/quizService';
import QuizWizard from '../../components/teacher/quiz/QuizWizard';

const STATUS_CONFIG = {
  DRAFT:  { label: 'Draft',   bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  ACTIVE: { label: 'Aktiv',   bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  CLOSED: { label: 'Mbyllur', bg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

const ATTEMPT_STATUS_CONFIG = {
  IN_PROGRESS: { label: 'Në progres',  bg: 'bg-amber-100 text-amber-700' },
  SUBMITTED:   { label: 'Dorëzuar',    bg: 'bg-emerald-100 text-emerald-700' },
  TIMED_OUT:   { label: 'Koha mbaroi', bg: 'bg-red-100 text-red-600' },
  ABANDONED:   { label: 'Braktisur',   bg: 'bg-slate-100 text-slate-500' },
};

function formatSeconds(sec) {
  if (!sec && sec !== 0) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TeacherQuizzes() {
  const [courses, setCourses]               = useState([]);
  const [modules, setModules]               = useState([]);
  const [lessons, setLessons]               = useState([]);
  const [quizzes, setQuizzes]               = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [editingQuiz, setEditingQuiz]       = useState(null);
  const [activeTab, setActiveTab]           = useState('list');
  const [results, setResults]               = useState([]);
  const [allAttempts, setAllAttempts]       = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activating, setActivating]         = useState(false);
  const [message, setMessage]               = useState('');
  const [error, setError]                   = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    teacherContentService.getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError('Kurset nuk u ngarkuan.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setSelectedModule('');
    setSelectedLesson('');
    setQuizzes([]);
    setSelectedQuizId(null);
    teacherContentService.getModules(selectedCourse).then((res) => setModules(res.data));
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedModule) return;
    setSelectedLesson('');
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
    } catch { void 0 }
  }, []);

  useEffect(() => {
    if (!selectedQuizId) {
      clearInterval(pollRef.current);
      return undefined;
    }
    loadAttemptData(selectedQuizId);
    if (selectedQuiz?.status === 'ACTIVE') {
      pollRef.current = setInterval(() => loadAttemptData(selectedQuizId), 5000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedQuizId, selectedQuiz?.status, loadAttemptData]);

  const handleActivate = async (quizId) => {
    setError('');
    setActivating(true);
    try {
      await quizService.activate(quizId);
      setMessage('Quiz-i u aktivizua.');
      await loadQuizzes(selectedLesson);
      setSelectedQuizId(quizId);
      setActiveTab('live');
    } catch (err) {
      setError(err.response?.data?.message || 'Aktivizimi dështoi.');
    } finally {
      setActivating(false);
    }
  };

  const handleClose = async (quizId) => {
    setError('');
    try {
      await quizService.close(quizId);
      setMessage('Quiz-i u mbyll.');
      await loadQuizzes(selectedLesson);
      clearInterval(pollRef.current);
    } catch (err) {
      setError(err.response?.data?.message || 'Mbyllja dështoi.');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('A jeni i sigurt që doni ta fshini këtë quiz?')) return;
    try {
      await quizService.deleteQuiz(quizId);
      setMessage('Quiz-i u fshi.');
      if (selectedQuizId === quizId) setSelectedQuizId(null);
      if (editingQuiz?.id === quizId) setEditingQuiz(null);
      await loadQuizzes(selectedLesson);
    } catch (err) {
      setError(err.response?.data?.message || 'Fshirja dështoi.');
    }
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

  const TABS = [
    { id: 'list',   label: 'Quiz-et' },
    { id: 'create', label: 'Krijo quiz' },
  ];

  return (
    <Container maxWidth="xl" className="py-8">
      {}
      <Box className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <QuizRounded />
        </span>
        <div>
          <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
            Quiz-et
          </Typography>
          <Typography className="text-slate-500 dark:!text-slate-400">
            Menaxho, aktivizo dhe monitoro quiz-et.
          </Typography>
        </div>
      </Box>

      {message && <Alert severity="success" className="!mb-4" onClose={() => setMessage('')}>{message}</Alert>}
      {error   && <Alert severity="error"   className="!mb-4" onClose={() => setError('')}>{error}</Alert>}

      {}
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {}
          <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <div className="mb-2 flex items-center justify-between">
                <Typography variant="subtitle2" className="!font-black dark:!text-white">Zgjidh leksionin</Typography>
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  variant="contained"
                  onClick={() => setActiveTab('create')}
                  className="!rounded-xl !normal-case"
                >
                  Krijo quiz të ri
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormControl size="small" fullWidth>
                  <InputLabel>Kursi</InputLabel>
                  <Select label="Kursi" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                    {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.titulli}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth disabled={!selectedCourse}>
                  <InputLabel>Moduli</InputLabel>
                  <Select label="Moduli" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                    {modules.map((m) => <MenuItem key={m.id} value={m.id}>{m.titulli}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth disabled={!selectedModule}>
                  <InputLabel>Leksioni (QUIZ)</InputLabel>
                  <Select label="Leksioni (QUIZ)" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
                    {lessons.filter((l) => l.lloji === 'QUIZ').map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.titulli}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </CardContent>
          </Card>

          {}
          {!selectedLesson && (
            <Alert severity="info">Zgjidh kursin, modulin dhe leksionin QUIZ për të parë quiz-et.</Alert>
          )}
          {loadingQuizzes && (
            <Box className="flex justify-center py-10"><CircularProgress /></Box>
          )}
          {!loadingQuizzes && selectedLesson && quizzes.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <QuizRounded className="!mb-3 !text-5xl text-slate-200 dark:text-slate-700" />
              <Typography className="text-slate-400 dark:!text-slate-500">Nuk ka quiz për këtë leksion.</Typography>
              <Button variant="outlined" size="small" onClick={() => setActiveTab('create')} className="!mt-4 !rounded-xl !normal-case">
                Krijo quiz-in e parë
              </Button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => {
              const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.DRAFT;
              return (
                <div key={quiz.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Typography className="!font-black leading-snug dark:!text-white">{quiz.titulli}</Typography>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <Typography variant="caption" className="text-slate-500 dark:!text-slate-400">
                      {quiz.kohezgjatjaMinuta} min &nbsp;·&nbsp; {quiz.questionCount ?? 0} pyetje &nbsp;·&nbsp; {quiz.totalPikete ?? 0} pikë
                    </Typography>
                  </div>

                  {}
                  <div className="grid grid-cols-2 gap-2 px-5 pb-3">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PeopleRounded />}
                      onClick={() => { setSelectedQuizId(quiz.id); setActiveTab('live'); }}
                      className="!rounded-xl !normal-case !bg-emerald-600 hover:!bg-emerald-700"
                    >
                      Live
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssessmentRounded />}
                      onClick={() => { setSelectedQuizId(quiz.id); setActiveTab('results'); }}
                      className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                      Statistikat
                    </Button>
                  </div>

                  {}
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                    {quiz.status === 'DRAFT' && (
                      <>
                        <Button size="small" startIcon={<EditRounded />} onClick={() => { setEditingQuiz(quiz); setActiveTab('create'); }} className="!normal-case">
                          Ndrysho
                        </Button>
                        <Button size="small" color="success" variant="outlined" startIcon={<PlayArrowRounded />} disabled={activating} onClick={() => handleActivate(quiz.id)} className="!normal-case">
                          Aktivizo
                        </Button>
                      </>
                    )}
                    {quiz.status === 'ACTIVE' && (
                      <Button size="small" color="error" variant="outlined" startIcon={<StopRounded />} onClick={() => handleClose(quiz.id)} className="!normal-case">
                        Mbyll
                      </Button>
                    )}
                    {quiz.status !== 'ACTIVE' && (
                      <Button size="small" color="error" startIcon={<DeleteRounded />} onClick={() => handleDelete(quiz.id)} className="!normal-case">
                        Fshi
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {activeTab === 'create' && (
        <QuizWizard
          courses={courses}
          modules={modules}
          lessons={lessons}
          selectedCourse={selectedCourse}
          selectedModule={selectedModule}
          selectedLesson={selectedLesson}
          onCourseChange={setSelectedCourse}
          onModuleChange={setSelectedModule}
          onLessonChange={setSelectedLesson}
          editingQuiz={editingQuiz}
          onSaved={(quizId) => {
            loadQuizzes(selectedLesson);
            if (quizId) setSelectedQuizId(quizId);
            setEditingQuiz(null);
            setActiveTab('list');
          }}
          onError={setError}
          onMessage={setMessage}
        />
      )}

      {}
      {activeTab === 'live' && (
        <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-5">
            <div className="mb-4 flex items-center justify-between">
              <Box className="flex items-center gap-2">
                <PeopleRounded className="text-emerald-600" />
                <Typography variant="h6" className="!font-black dark:!text-white">
                  Dashboard live {selectedQuiz ? `— ${selectedQuiz.titulli}` : ''}
                </Typography>
              </Box>
              <IconButton onClick={() => loadAttemptData(selectedQuizId)} size="small">
                <RefreshRounded />
              </IconButton>
            </div>
            {!selectedQuizId && <Alert severity="info">Zgjidh një quiz nga lista.</Alert>}
            {selectedQuizId && (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Në progres', value: allAttempts.filter((a) => a.attemptStatus === 'IN_PROGRESS').length, color: '!text-amber-500' },
                    { label: 'Dorëzuar',   value: allAttempts.filter((a) => a.attemptStatus === 'SUBMITTED').length,   color: '!text-emerald-500' },
                    { label: 'Braktisur',  value: allAttempts.filter((a) => a.attemptStatus === 'ABANDONED').length,   color: '!text-red-500' },
                  ].map((stat) => (
                    <Box key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                      <Typography variant="h5" className={`!font-black ${stat.color}`}>{stat.value}</Typography>
                      <Typography variant="caption" className="text-slate-500 dark:!text-slate-400">{stat.label}</Typography>
                    </Box>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-3 text-slate-500 dark:text-slate-400">Studenti</th>
                        <th className="py-2 pr-3 text-slate-500 dark:text-slate-400">Statusi</th>
                        <th className="py-2 pr-3 text-slate-500 dark:text-slate-400">Koha</th>
                        <th className="py-2 text-slate-500 dark:text-slate-400">Pikët</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allAttempts.map((a) => {
                        const asCfg = ATTEMPT_STATUS_CONFIG[a.attemptStatus] || ATTEMPT_STATUS_CONFIG.IN_PROGRESS;
                        return (
                          <tr key={a.id} className="dark:text-slate-200">
                            <td className="py-2 pr-3 font-medium">{a.userEmri}</td>
                            <td className="py-2 pr-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${asCfg.bg}`}>{asCfg.label}</span>
                            </td>
                            <td className="py-2 pr-3 text-slate-500">{formatSeconds(a.kohaSekondat)}</td>
                            <td className="py-2 font-bold">{a.submitted ? `${a.pikete?.toFixed(0) ?? '-'}%` : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {allAttempts.length === 0 && (
                    <Typography className="!mt-4 text-center text-slate-400">Asnjë student ende.</Typography>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {}
      {activeTab === 'results' && (
        <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-5">
            <Box className="mb-4 flex items-center gap-2">
              <AssessmentRounded className="text-sky-600" />
              <Typography variant="h6" className="!font-black dark:!text-white">
                Statistikat {selectedQuiz ? `— ${selectedQuiz.titulli}` : ''}
              </Typography>
            </Box>
            {!selectedQuizId && <Alert severity="info">Zgjidh një quiz nga lista.</Alert>}
            {selectedQuizId && results.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Mesatarja', value: avgScore != null ? `${avgScore}%` : '-' },
                  { label: 'Maksimumi', value: `${Math.max(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` },
                  { label: 'Minimumi',  value: `${Math.min(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` },
                ].map((s) => (
                  <Box key={s.label} className="rounded-xl bg-sky-50 p-3 text-center dark:bg-sky-950/30">
                    <Typography variant="h6" className="!font-black !text-sky-700 dark:!text-sky-300">{s.value}</Typography>
                    <Typography variant="caption" className="text-slate-500 dark:!text-slate-400">{s.label}</Typography>
                  </Box>
                ))}
              </div>
            )}
            {selectedQuizId && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-4 text-slate-500 dark:text-slate-400">Studenti</th>
                      <th className="py-2 pr-4 text-slate-500 dark:text-slate-400">Pikët</th>
                      <th className="py-2 pr-4 text-slate-500 dark:text-slate-400">Koha</th>
                      <th className="py-2 text-slate-500 dark:text-slate-400">Dorëzuar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((row) => (
                      <tr key={row.id} className="dark:text-slate-200">
                        <td className="py-3 pr-4 font-medium">{row.userEmri}</td>
                        <td className="py-3 pr-4 font-bold !text-sky-700 dark:!text-sky-300">{row.pikete?.toFixed(0) ?? '-'}%</td>
                        <td className="py-3 pr-4 text-slate-500">{formatSeconds(row.kohaSekondat)}</td>
                        <td className="py-3 text-slate-500">{row.submittedAt ? new Date(row.submittedAt).toLocaleTimeString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length === 0 && (
                  <Alert severity="info" className="!mt-3">Nuk ka dorëzime akoma.</Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
