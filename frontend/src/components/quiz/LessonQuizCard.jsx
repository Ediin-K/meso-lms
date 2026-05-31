import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import QuizRounded from '@mui/icons-material/QuizRounded';
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import quizService from '../../services/quizService';

const ATTEMPT_LABELS = {
  IN_PROGRESS: { label: 'Në progres', color: 'warning' },
  SUBMITTED: { label: 'Përfunduar', color: 'success' },
  TIMED_OUT: { label: 'Koha mbaroi', color: 'error' },
  ABANDONED: { label: 'Braktisur', color: 'default' },
};

export default function LessonQuizCard({ lessonId, courseId, compact = false }) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await quizService.getPublishedByLesson(lessonId);
        if (!mounted) return;
        setQuizzes(res.data || []);
        const attemptMap = {};
        await Promise.all(
          (res.data || []).map(async (quiz) => {
            try {
              const attRes = await quizService.getMyAttempt(quiz.id);
              if (attRes.status === 200 && attRes.data) attemptMap[quiz.id] = attRes.data;
            } catch {
              // no attempt
            }
          }),
        );
        if (mounted) setAttempts(attemptMap);
      } catch {
        if (mounted) setQuizzes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [lessonId]);

  if (loading) return null;

  if (quizzes.length === 0) {
    if (compact) return null;
    return (
      <Typography variant="body2" className="!text-slate-500">
        Nuk ka quiz aktiv për këtë leksion.
      </Typography>
    );
  }

  const startPath = (quizId) => (courseId ? `/course/${courseId}/quiz/${quizId}` : `/quiz/${quizId}`);

  const getAction = (quiz) => {
    const att = attempts[quiz.id];
    if (!att) return { label: 'Fillo quiz-in', icon: PlayCircleFilledRounded, disabled: false };
    if (att.submitted) return { label: 'Përfunduar', icon: CheckCircleRounded, disabled: true };
    if (att.attemptStatus === 'IN_PROGRESS') return { label: 'Vazhdo quiz-in', icon: PlayCircleFilledRounded, disabled: false };
    return { label: 'Fillo quiz-in', icon: PlayCircleFilledRounded, disabled: false };
  };

  if (compact) {
    return (
      <Box className="mt-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
        {quizzes.map((quiz) => {
          const action = getAction(quiz);
          const att = attempts[quiz.id];
          const statusCfg = att ? ATTEMPT_LABELS[att.attemptStatus] : null;
          return (
            <div key={quiz.id} className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <QuizRounded className="text-amber-600" fontSize="small" />
                <div>
                  <Typography variant="body2" className="!font-semibold dark:!text-white">{quiz.titulli}</Typography>
                  <Typography variant="caption" className="text-slate-500">
                    ⏱ {quiz.kohezgjatjaMinuta} min · {quiz.totalPikete ?? 0} pikë
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusCfg && <Chip label={statusCfg.label} size="small" color={statusCfg.color} />}
                <Button
                  size="small"
                  variant="contained"
                  disabled={action.disabled}
                  startIcon={<action.icon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!action.disabled) navigate(startPath(quiz.id));
                  }}
                  className="!normal-case"
                >
                  {action.label}
                </Button>
              </div>
            </div>
          );
        })}
      </Box>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {quizzes.map((quiz) => {
        const action = getAction(quiz);
        const att = attempts[quiz.id];
        const statusCfg = att ? ATTEMPT_LABELS[att.attemptStatus] : null;
        return (
          <Box
            key={quiz.id}
            className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 dark:border-slate-700 dark:bg-slate-800/40"
          >
            <Typography variant="body2" className="!font-semibold dark:!text-white">{quiz.titulli}</Typography>
            <Typography variant="caption" className="!mt-1 !block text-slate-500">
              ⏱ {quiz.kohezgjatjaMinuta} min · {quiz.totalPikete ?? 0} pikë · {quiz.questionCount ?? 0} pyetje
            </Typography>
            {att?.submitted && att.pikete != null && (
              <Typography variant="caption" className="!mt-1 !block font-bold text-emerald-600">
                Rezultati: {Math.round(att.pikete)}%
              </Typography>
            )}
            <div className="mt-3 flex items-center gap-2">
              {statusCfg && <Chip label={statusCfg.label} size="small" color={statusCfg.color} />}
              <Button
                size="small"
                variant="contained"
                disabled={action.disabled}
                startIcon={<action.icon />}
                onClick={() => !action.disabled && navigate(startPath(quiz.id))}
                className="!normal-case"
              >
                {action.label}
              </Button>
            </div>
          </Box>
        );
      })}
    </div>
  );
}
