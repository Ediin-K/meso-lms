import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  LinearProgress,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import TimerRounded from "@mui/icons-material/TimerRounded";
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
    return () => {
      mounted = false;
    };
  }, [quizId]);

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

  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  const answeredCount = useMemo(
    () => Object.values(selected).filter((ids) => ids.length > 0).length,
    [selected],
  );

  const toggleAnswer = (questionId, answerId) => {
    setSelected((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
      return { ...prev, [questionId]: next };
    });
  };

  if (loading) {
    return (
      <Box className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress className="!text-sky-600" />
      </Box>
    );
  }

  if (finished) {
    return (
      <Container maxWidth="sm" className="py-12">
        <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-8 text-center">
            <CheckCircleRounded className="!mb-4 !text-6xl text-emerald-500" />
            <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
              Kuizi u dorezua
            </Typography>
            <Typography className="!mt-3 text-slate-600 dark:!text-slate-300">
              Pergjigjet u ruajten. Rezultatet i shikon vetem profesori.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/student/quizzes")} className="!mt-7 !rounded-xl !normal-case">
              Kthehu te kuizet
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" className="py-12">
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className="!mt-4 !normal-case">
          Kthehu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className="!mb-5 !normal-case">
        Kthehu
      </Button>

      <Box className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
            {attempt?.titulli}
          </Typography>
          {attempt?.pershkrimi && (
            <Typography className="!mt-2 text-slate-600 dark:!text-slate-300">
              {attempt.pershkrimi}
            </Typography>
          )}
        </div>
        <Box className="flex min-w-[128px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <TimerRounded fontSize="small" />
          {minutes}:{seconds}
        </Box>
      </Box>

      <Box className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-slate-500">
          <span>Pyetja {currentIndex + 1} nga {questions.length}</span>
          <span>{answeredCount}/{questions.length} te pergjigjura</span>
        </div>
        <LinearProgress variant="determinate" value={progress} className="!h-2 !rounded-full" />
      </Box>

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
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      checked
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40"
                        : "border-slate-200 hover:border-sky-300 dark:border-slate-700"
                    }`}
                  >
                    <Checkbox checked={checked} tabIndex={-1} />
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Typography className="text-slate-800 dark:!text-slate-200">{answer.pergjigja}</Typography>
                  </Box>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outlined"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="!rounded-xl !normal-case"
        >
          Prapa
        </Button>
        {currentIndex === questions.length - 1 ? (
          <Button
            variant="contained"
            disabled={submitting}
            onClick={submitQuiz}
            className="!rounded-xl !normal-case"
          >
            {submitting ? "Duke dorezuar..." : "Dorezo kuizin"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="!rounded-xl !normal-case"
          >
            Vazhdo
          </Button>
        )}
      </div>
    </Container>
  );
}
