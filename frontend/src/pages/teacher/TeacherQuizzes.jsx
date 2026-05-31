import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
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
import teacherContentService from '../../services/teacherContentService';
import quizService from '../../services/quizService';
import QuizWizard from '../../components/teacher/quiz/QuizWizard';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'default', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  ACTIVE: { label: 'Aktiv', color: 'success', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  CLOSED: { label: 'Mbyllur', color: 'error', bg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

const ATTEMPT_STATUS_CONFIG = {
  IN_PROGRESS: { label: 'Në progres', bg: 'bg-amber-100 text-amber-700' },
  SUBMITTED: { label: 'Dorëzuar', bg: 'bg-emerald-100 text-emerald-700' },
  TIMED_OUT: { label: 'Koha mbaroi', bg: 'bg-red-100 text-red-600' },
  ABANDONED: { label: 'Braktisur', bg: 'bg-slate-100 text-slate-500' },
};

function formatSeconds(sec) {
  if (!sec && sec !== 0) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TeacherQuizzes() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [results, setResults] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
    } catch {
      // poll silently
    }
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

  return (
    <Container maxWidth="xl" className="py-8">
      <Box className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <QuizRounded />
        </span>
        <div>
          <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
            Quiz-et
          </Typography>
          <Typography className="text-slate-600 dark:!text-slate-300">
            Krijo quiz me wizard, aktivizo dhe monitoro rezultatet.
          </Typography>
        </div>
      </Box>

      {message && <Alert severity="success" className="!mb-4" onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert severity="error" className="!mb-4" onClose={() => setError('')}>{error}</Alert>}

      <div className="mb-5 flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'create', label: 'Krijo quiz' },
          { id: 'list', label: 'Quiz-et' },
          { id: 'live', label: 'Dashboard live' },
          { id: 'results', label: 'Rezultatet' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-bold transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="flex flex-col gap-5">
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

          {activeTab === 'list' && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <Typography variant="h6" className="!mb-4 !font-black dark:!text-white">Quiz-et e leksionit</Typography>
                {!selectedLesson && <Alert severity="info">Zgjidh kurs, modul dhe leksion QUIZ te wizard-i.</Alert>}
                {loadingQuizzes && <CircularProgress size={24} />}
                {!loadingQuizzes && selectedLesson && quizzes.length === 0 && (
                  <Typography className="text-slate-500">Nuk ka quiz për këtë leksion.</Typography>
                )}
                <div className="flex flex-col gap-3">
                  {quizzes.map((quiz) => {
                    const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <Box
                        key={quiz.id}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Typography className="!font-bold dark:!text-white">{quiz.titulli}</Typography>
                            <Typography variant="caption" className="text-slate-500">
                              {quiz.kohezgjatjaMinuta} min · {quiz.questionCount ?? 0} pyetje · {quiz.totalPikete ?? 0} pikë
                            </Typography>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cfg.bg}`}>{cfg.label}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {quiz.status === 'DRAFT' && (
                            <>
                              <Button size="small" startIcon={<EditRounded />} onClick={() => { setEditingQuiz(quiz); setActiveTab('create'); }}>
                                Ndrysho
                              </Button>
                              <Button size="small" color="success" variant="contained" startIcon={<PlayArrowRounded />} disabled={activating} onClick={() => handleActivate(quiz.id)}>
                                Aktivizo
                              </Button>
                            </>
                          )}
                          {quiz.status === 'ACTIVE' && (
                            <Button size="small" color="error" variant="outlined" startIcon={<StopRounded />} onClick={() => handleClose(quiz.id)}>
                              Mbyll
                            </Button>
                          )}
                          <Button size="small" onClick={() => { setSelectedQuizId(quiz.id); setActiveTab(quiz.status === 'ACTIVE' ? 'live' : 'results'); }}>
                            Shiko
                          </Button>
                          {quiz.status !== 'ACTIVE' && (
                            <Button size="small" color="error" startIcon={<DeleteRounded />} onClick={() => handleDelete(quiz.id)}>
                              Fshi
                            </Button>
                          )}
                        </div>
                      </Box>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
                        { label: 'Në progres', value: allAttempts.filter((a) => a.attemptStatus === 'IN_PROGRESS').length, color: 'text-amber-600' },
                        { label: 'Dorëzuar', value: allAttempts.filter((a) => a.attemptStatus === 'SUBMITTED').length, color: 'text-emerald-600' },
                        { label: 'Braktisur', value: allAttempts.filter((a) => a.attemptStatus === 'ABANDONED').length, color: 'text-red-500' },
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
                            <th className="py-2">Pikët</th>
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'results' && (
            <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent className="!p-5">
                <Box className="mb-4 flex items-center gap-2">
                  <AssessmentRounded className="text-sky-600" />
                  <Typography variant="h6" className="!font-black dark:!text-white">
                    Rezultatet {selectedQuiz ? `— ${selectedQuiz.titulli}` : ''}
                  </Typography>
                </Box>
                {!selectedQuizId && <Alert severity="info">Zgjidh një quiz nga lista.</Alert>}
                {selectedQuizId && results.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Mesatarja', value: avgScore != null ? `${avgScore}%` : '-' },
                      { label: 'Maksimumi', value: `${Math.max(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` },
                      { label: 'Minimumi', value: `${Math.min(...results.map((r) => r.pikete ?? 0)).toFixed(0)}%` },
                    ].map((s) => (
                      <Box key={s.label} className="rounded-xl bg-sky-50 p-3 text-center dark:bg-sky-950/30">
                        <Typography variant="h6" className="!font-black text-sky-700 dark:text-sky-300">{s.value}</Typography>
                        <Typography variant="caption" className="text-slate-500">{s.label}</Typography>
                      </Box>
                    ))}
                  </div>
                )}
                {selectedQuizId && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="py-2 pr-4">Studenti</th>
                          <th className="py-2 pr-4">Pikët</th>
                          <th className="py-2 pr-4">Koha</th>
                          <th className="py-2">Dorëzuar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {results.map((row) => (
                          <tr key={row.id} className="dark:text-slate-200">
                            <td className="py-3 pr-4 font-medium">{row.userEmri}</td>
                            <td className="py-3 pr-4 font-bold text-sky-700 dark:text-sky-300">{row.pikete?.toFixed(0) ?? '-'}%</td>
                            <td className="py-3 pr-4 text-slate-500">{formatSeconds(row.kohaSekondat)}</td>
                            <td className="py-3 text-slate-500">{row.submittedAt ? new Date(row.submittedAt).toLocaleTimeString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {results.length === 0 && <Alert severity="info" className="!mt-3">Nuk ka dorëzime.</Alert>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

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
                  <Chip label={`${selectedQuiz.totalPikete ?? 0} pikë`} size="small" />
                  <Chip
                    label={(STATUS_CONFIG[selectedQuiz.status] || STATUS_CONFIG.DRAFT).label}
                    color={(STATUS_CONFIG[selectedQuiz.status] || STATUS_CONFIG.DRAFT).color}
                    size="small"
                  />
                </div>
                {selectedQuiz.status === 'DRAFT' && (
                  <Button fullWidth variant="contained" color="success" startIcon={<PlayArrowRounded />} disabled={activating} onClick={() => handleActivate(selectedQuiz.id)} className="!rounded-xl !normal-case">
                    {activating ? 'Duke aktivizuar...' : 'Aktivizo quiz-in'}
                  </Button>
                )}
                {selectedQuiz.status === 'ACTIVE' && (
                  <Button fullWidth variant="outlined" color="error" startIcon={<StopRounded />} onClick={() => handleClose(selectedQuiz.id)} className="!rounded-xl !normal-case">
                    Mbyll quiz-in
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <Typography variant="subtitle2" className="!mb-2 !font-bold dark:!text-white">Udhëzime</Typography>
              <Typography variant="body2" className="text-slate-500">
                1. Krijo leksion me lloj QUIZ te moduli.<br />
                2. Përdor wizard-in për pyetje ABCD ose E vërtetë/E gabuar.<br />
                3. Aktivizo quiz-in që studentët ta shohin te faqja e lëndës.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
