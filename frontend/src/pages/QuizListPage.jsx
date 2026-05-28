import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import QuizRounded from "@mui/icons-material/QuizRounded";
import TimerRounded from "@mui/icons-material/TimerRounded";
import quizService from "../services/quizService";

export default function QuizListPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    quizService
      .listPublished()
      .then((res) => setQuizzes(res.data))
      .catch((err) => setError(err.response?.data?.message || "Kuizet nuk u ngarkuan."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-7">
        <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
          Kuizet e disponueshme
        </Typography>
        <Typography className="!mt-2 text-slate-600 dark:!text-slate-300">
          Hyr ne kuizet e publikuara nga profesoret. Koha fillon sapo ta hapesh kuizin.
        </Typography>
      </Box>

      {loading && (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && quizzes.length === 0 && (
        <Alert severity="info">Nuk ka kuize te publikuara per momentin.</Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <Box className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <QuizRounded />
                </span>
                <div>
                  <Typography className="!font-black text-slate-950 dark:!text-white">{quiz.titulli}</Typography>
                  <Typography variant="caption" className="text-slate-500">{quiz.lessonTitulli}</Typography>
                </div>
              </Box>
              {quiz.pershkrimi && (
                <Typography variant="body2" className="!mb-4 text-slate-600 dark:!text-slate-300">
                  {quiz.pershkrimi}
                </Typography>
              )}
              <Box className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <TimerRounded fontSize="small" />
                {quiz.kohezgjatjaMinuta} minuta
              </Box>
              <Button fullWidth variant="contained" onClick={() => navigate(`/quiz/${quiz.id}`)} className="!rounded-xl !normal-case">
                Fillo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
