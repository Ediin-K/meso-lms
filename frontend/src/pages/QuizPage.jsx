import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import TimerRounded from "@mui/icons-material/TimerRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import quizService from "../services/quizService";

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const submittedRef = useRef(false);

  const [attempt, setAttempt] = useState(null);
  const [selected, setSelected] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const [abandonDialog, setAbandonDialog] = useState(false);

  useEffect(() => {
    let mounted = true;
    quizService
      .start(quizId)
      .then((res) => {
        if (!mounted) return;
        setAttempt(res.data);
        setRemainingSeconds(res.data.remainingSeconds || 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Kuizi nuk mund te hapet.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [quizId]);

  // Block browser back/forward navigation during quiz
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !finished && attempt != null && currentLocation.pathname !== nextLocation.pathname,
  );

  // Block tab close / refresh
  useEffect(() => {
    if (finished || !attempt) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "A jeni i sigurt? Perparimi juaj mund te humbase.";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
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
      await quizService.submit(quizId, buildPayload());
      setFinished(true);
    } catch (err) {
      setError(err.response?.data?.message || "Dorezimi deshtoi.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [attempt?.attemptId, buildPayload, quizId]);

  // Countdown timer — auto-submit on expiry
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

  const handleAbandon = async () => {
    setAbandonDialog(false);
    if (!attempt?.attemptId) return;
    try {
      await quizService.abandon(quizId, attempt.attemptId);
      submittedRef.current = true;
      navigate("/student/quizzes", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Braktisja deshtoi.");
    }
  };

  const toggleAnswer = (questionId, answerId) => {
    setSelected((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
      return { ...prev, [questionId]: next };
    });
  };

  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
  const isTimeWarning = remainingSeconds > 0 && remainingSeconds <= 60;

  const answeredCount = useMemo(
    () => Object.values(selected).filter((ids) => ids.length > 0).length,
    [selected],
  );

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
              Kuizi u dorezua
            </Typography>
            <Typography className="!mt-3 text-slate-600 dark:!text-slate-300">
              Pergjigjet u ruajten me sukses. Rezultatin e shikon vetem profesori.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/student/quizzes", { replace: true })}
              className="!mt-7 !rounded-xl !normal-case"
            >
              Kthehu te kuizet
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
              Kuizi nuk eshte i disponueshem
            </Typography>
            <Alert severity="error" className="!mb-5 text-left">{error}</Alert>
            <Button variant="outlined" onClick={() => navigate(-1)} className="!rounded-xl !normal-case">
              Kthehu
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation blocker dialog */}
      {blocker.state === "blocked" && (
        <Dialog open>
          <DialogTitle className="flex items-center gap-2">
            <WarningAmberRounded className="text-amber-500" />
            Largohesh nga kuizi?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Nese largohesh tani, tentativa juaj do te shënohet si e braktisur dhe nuk mund ta rifilloni.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => blocker.reset()} variant="contained" className="!normal-case">
              Qëndroni
            </Button>
            <Button
              onClick={async () => {
                if (attempt?.attemptId) {
                  try { await quizService.abandon(quizId, attempt.attemptId); } catch {}
                }
                blocker.proceed();
              }}
              color="error"
              className="!normal-case"
            >
              Braktis kuizin
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Abandon confirmation dialog */}
      <Dialog open={abandonDialog} onClose={() => setAbandonDialog(false)}>
        <DialogTitle>Braktis kuizin?</DialogTitle>
        <DialogContent>
          <Typography>
            Nese braktisni kuizin, nuk mund ta rifilloni. Tentativa do te regjistrohet si e braktisur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbandonDialog(false)} className="!normal-case">Anullo</Button>
          <Button onClick={handleAbandon} color="error" variant="contained" className="!normal-case">
            Braktis
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="md" className="py-8">
        {/* Header with timer */}
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
          </div>
          <Box
            className={`flex min-w-[128px] items-center justify-center gap-2 rounded-xl border px-4 py-3 font-black transition ${
              isTimeWarning
                ? "animate-pulse border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            }`}
          >
            <TimerRounded fontSize="small" />
            {minutes}:{seconds}
          </Box>
        </Box>

        {/* Progress */}
        <Box className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>Pyetja {currentIndex + 1} nga {questions.length}</span>
            <span>{answeredCount}/{questions.length} te pergjigjura</span>
          </div>
          <LinearProgress
            variant="determinate"
            value={progress}
            className="!h-2 !rounded-full"
            color={isTimeWarning ? "error" : "primary"}
          />
        </Box>

        {error && <Alert severity="error" className="!mb-4">{error}</Alert>}

        {/* Question card */}
        {currentQuestion && (
          <Card elevation={0} className="mb-6 rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-6">
              <Typography variant="h6" className="!mb-5 !font-bold text-slate-950 dark:!text-white">
                {currentQuestion.pyetja}
              </Typography>
              <div className="flex flex-col gap-3">
                {currentQuestion.answers.map((answer, index) => {
                  const checked = (selected[currentQuestion.id] || []).includes(answer.id);
                  return (
                    <Box
                      key={answer.id}
                      onClick={() => toggleAnswer(currentQuestion.id, answer.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all select-none ${
                        checked
                          ? "border-sky-500 bg-sky-50 dark:border-sky-600 dark:bg-sky-950/40"
                          : "border-slate-200 hover:border-sky-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black transition ${
                        checked
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Typography className={checked ? "text-sky-800 dark:!text-sky-200 !font-medium" : "text-slate-800 dark:!text-slate-200"}>
                        {answer.pergjigja}
                      </Typography>
                    </Box>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((p) => p - 1)}
              className="!rounded-xl !normal-case"
            >
              Prapa
            </Button>
            {currentIndex < questions.length - 1 && (
              <Button
                variant="contained"
                onClick={() => setCurrentIndex((p) => p + 1)}
                className="!rounded-xl !normal-case"
              >
                Vazhdo
              </Button>
            )}
          </Box>

          <Box className="flex gap-2">
            <Button
              variant="outlined"
              color="error"
              onClick={() => setAbandonDialog(true)}
              className="!rounded-xl !normal-case"
              size="small"
            >
              Braktis
            </Button>
            {currentIndex === questions.length - 1 && (
              <Button
                variant="contained"
                color="success"
                disabled={submitting}
                onClick={submitQuiz}
                className="!rounded-xl !normal-case"
              >
                {submitting ? "Duke dorezuar..." : "Dorezo kuizin"}
              </Button>
            )}
          </Box>
        </div>

        {/* Question navigator (dots) */}
        <Box className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((q, i) => {
            const isAnswered = (selected[q.id] || []).length > 0;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                  i === currentIndex
                    ? "bg-sky-600 text-white"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
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
