import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  LinearProgress,
  Typography,
} from '@mui/material';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import TimerRounded from '@mui/icons-material/TimerRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import quizService from '../services/quizService';

const QUESTION_TYPE = {
  SHUMEFISHTE: 'SHUMEFISHTE',
  VERTET_GABIM: 'VERTET_GABIM',
};

export default function QuizPage() {
  const { quizId, courseId: courseIdParam } = useParams();
  const navigate = useNavigate();
  const submittedRef = useRef(false);

  const [attempt, setAttempt] = useState(null);
  const [selected, setSelected] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const courseId = courseIdParam || attempt?.courseId;

  useEffect(() => {
    let mounted = true;
    quizService
      .start(quizId)
      .then((res) => {
        if (!mounted) return;
        setAttempt(res.data);
        setRemainingSeconds(res.data.remainingSeconds || 0);
      })
      .catch(async (err) => {
        const msg = err.response?.data?.message || 'Quiz-i nuk mund të hapet.';
        if (mounted) setError(msg);
        if (msg.toLowerCase().includes('dorezuar') || msg.toLowerCase().includes('dorëzuar')) {
          try {
            const prev = await quizService.getMyAttempt(quizId);
            if (mounted && prev.data?.submitted) {
              setFinalScore(prev.data.pikete);
              setAlreadySubmitted(true);
              setFinished(true);
            }
          } catch { void 0 }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [quizId]);

  useEffect(() => {
    if (finished || !attempt) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Quiz-i është aktiv. Nuk mund të largohesh pa e përfunduar ose pa mbaruar koha.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [finished, attempt]);

  const buildPayload = useCallback(() => ({
    attemptId: attempt?.attemptId,
    answers: Object.entries(selected).map(([questionId, answerIds]) => ({
      questionId: Number(questionId),
      answerIds,
    })),
  }), [attempt?.attemptId, selected]);

  const submitQuiz = useCallback(async () => {
    if (!attempt?.attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await quizService.submit(quizId, buildPayload());
      setFinalScore(res.data?.pikete ?? null);
      setFinished(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Dorëzimi dështoi.');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [attempt?.attemptId, buildPayload, quizId]);

  useEffect(() => {
    if (!attempt || finished) return undefined;
    if (remainingSeconds <= 0) {
      submitQuiz();
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [attempt, finished, remainingSeconds, submitQuiz]);

  const selectAnswer = (questionId, answerId) => {
    setSelected((prev) => ({
      ...prev,
      [questionId]: [answerId],
    }));
  };

  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  const isTimeWarning = remainingSeconds > 0 && remainingSeconds <= 60;

  const answeredCount = useMemo(
    () => Object.values(selected).filter((ids) => ids.length > 0).length,
    [selected],
  );

  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const goToCourse = () => {
    if (courseId) {
      navigate(`/course/${courseId}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <CircularProgress className="!text-sky-600" />
      </Box>
    );
  }

  if (finished) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <Card elevation={0} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-8 text-center">
            <CheckCircleRounded className="!mb-4 !text-6xl text-emerald-500" />
            <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
              {alreadySubmitted ? 'Quiz-i është dorëzuar tashmë' : 'Quiz-i u dorëzua'}
            </Typography>
            {finalScore != null && (
              <Typography variant="h5" className="!mt-3 !font-bold !text-sky-600 dark:!text-sky-400">
                Rezultati: {Math.round(finalScore)}%
              </Typography>
            )}
            <Typography className="!mt-3 text-slate-600 dark:!text-slate-300">
              {alreadySubmitted
                ? 'E keni dorëzuar tashmë këtë quiz. Nuk mund ta filloni përsëri.'
                : 'Përgjigjet u ruajtën me sukses.'}
            </Typography>
            <Button variant="contained" onClick={goToCourse} className="!mt-7 !rounded-xl !normal-case">
              Kthehu te lënda
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error && !attempt) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <Card elevation={0} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-8 text-center">
            <WarningAmberRounded className="!mb-4 !text-5xl text-amber-500" />
            <Typography variant="h5" className="!mb-3 !font-black dark:!text-white">
              Quiz-i nuk është i disponueshëm
            </Typography>
            <Alert severity="error" className="!mb-5 text-left">{error}</Alert>
            <Button variant="outlined" onClick={goToCourse} className="!rounded-xl !normal-case">
              Kthehu
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="md" className="py-8">
        <Box className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
              {attempt?.titulli}
            </Typography>
            {attempt?.pershkrimi && (
              <Typography className="!mt-1 text-slate-600 dark:!text-slate-300">
                {attempt.pershkrimi}
              </Typography>
            )}
            {attempt?.totalPikete != null && (
              <Typography variant="caption" className="!mt-1 !block text-slate-500">
                {attempt.totalPikete} pikë totale · {questions.length} pyetje
              </Typography>
            )}
          </div>
          <Box
            className={`flex min-w-[128px] items-center justify-center gap-2 rounded-xl border px-4 py-3 font-black transition ${
              isTimeWarning
                ? 'animate-pulse border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
                : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            }`}
          >
            <TimerRounded fontSize="small" />
            {minutes}:{seconds}
          </Box>
        </Box>

        <Box className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>Pyetja {currentIndex + 1} nga {questions.length}</span>
            <span>{answeredCount}/{questions.length} të përgjigjura</span>
          </div>
          <LinearProgress variant="determinate" value={progress} className="!h-2 !rounded-full" color={isTimeWarning ? 'error' : 'primary'} />
        </Box>

        {error && <Alert severity="error" className="!mb-4">{error}</Alert>}

        {currentQuestion && (
          <Card elevation={0} className="mb-6 rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Typography variant="h6" className="!font-bold text-slate-950 dark:!text-white">
                  {currentQuestion.pyetja}
                </Typography>
                {currentQuestion.pikete != null && (
                  <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {currentQuestion.pikete} pikë
                  </span>
                )}
              </div>

              {currentQuestion.lloji === QUESTION_TYPE.VERTET_GABIM ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.answers.map((answer) => {
                    const checked = (selected[currentQuestion.id] || []).includes(answer.id);
                    return (
                      <Button
                        key={answer.id}
                        variant={checked ? 'contained' : 'outlined'}
                        onClick={() => selectAnswer(currentQuestion.id, answer.id)}
                        className="!rounded-xl !py-4 !text-base !normal-case"
                        color="primary"
                        sx={!checked ? { '.dark &': { color: '#fff', borderColor: 'rgba(255,255,255,0.3)' } } : {}}
                      >
                        {answer.pergjigja}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {currentQuestion.answers.map((answer, index) => {
                    const checked = (selected[currentQuestion.id] || []).includes(answer.id);
                    return (
                      <Box
                        key={answer.id}
                        onClick={() => selectAnswer(currentQuestion.id, answer.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all select-none ${
                          checked
                            ? 'border-sky-500 bg-sky-50 dark:border-sky-600 dark:bg-sky-950/40'
                            : 'border-slate-200 hover:border-sky-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          checked ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Typography className={checked ? 'text-sky-800 dark:!text-sky-200 !font-medium' : 'text-slate-800 dark:!text-slate-200'}>
                          {answer.pergjigja}
                        </Typography>
                      </Box>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Box className="flex gap-2">
            <Button variant="outlined" disabled={currentIndex === 0} onClick={() => setCurrentIndex((p) => p - 1)} className="!rounded-xl !normal-case">
              Prapa
            </Button>
            {currentIndex < questions.length - 1 && (
              <Button variant="contained" onClick={() => setCurrentIndex((p) => p + 1)} className="!rounded-xl !normal-case">
                Vazhdo
              </Button>
            )}
          </Box>

          {currentIndex === questions.length - 1 && (
            <Button
              variant="contained"
              color="success"
              disabled={submitting || !allAnswered}
              onClick={submitQuiz}
              className="!rounded-xl !normal-case"
            >
              {submitting ? 'Duke dorëzuar...' : 'Dorëzo quiz-in'}
            </Button>
          )}
        </div>

        {!allAnswered && currentIndex === questions.length - 1 && (
          <Alert severity="warning" className="!mt-4">
            Duhet t&apos;i përgjigjesh të gjitha pyetjeve para dorëzimit.
          </Alert>
        )}

        <Box className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((q, i) => {
            const isAnswered = (selected[q.id] || []).length > 0;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                  i === currentIndex
                    ? 'bg-sky-600 text-white'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
