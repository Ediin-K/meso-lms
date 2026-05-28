import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import PublishRounded from "@mui/icons-material/PublishRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import ResultsRounded from "@mui/icons-material/AssessmentRounded";
import teacherContentService from "../../services/teacherContentService";
import quizService from "../../services/quizService";

const emptyQuestion = () => ({
  pyetja: "",
  options: [
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
    { pergjigja: "", eshteSakte: false },
  ],
});

export default function TeacherQuizzes() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titulli: "",
    pershkrimi: "",
    kohezgjatjaMinuta: 20,
    publikuar: false,
    questions: [emptyQuestion()],
  });

  useEffect(() => {
    teacherContentService
      .getCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => setError(err.response?.data?.message || "Kurset nuk u ngarkuan."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setSelectedModule("");
    setSelectedLesson("");
    setQuizzes([]);
    teacherContentService.getModules(selectedCourse).then((res) => setModules(res.data));
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedModule) return;
    setSelectedLesson("");
    setQuizzes([]);
    teacherContentService.getLessons(selectedModule).then((res) => setLessons(res.data));
  }, [selectedModule]);

  const loadQuizzes = async (lessonId = selectedLesson) => {
    if (!lessonId) return;
    const res = await quizService.getTeacherLessonQuizzes(lessonId);
    setQuizzes(res.data);
    if (res.data.length && !selectedQuiz) setSelectedQuiz(res.data[0].id);
  };

  useEffect(() => {
    if (!selectedLesson) return;
    setSelectedQuiz("");
    setResults([]);
    loadQuizzes(selectedLesson);
  }, [selectedLesson]);

  useEffect(() => {
    if (!selectedQuiz) return;
    quizService.getResults(selectedQuiz).then((res) => setResults(res.data));
  }, [selectedQuiz]);

  const selectedQuizData = useMemo(
    () => quizzes.find((quiz) => quiz.id === Number(selectedQuiz)),
    [quizzes, selectedQuiz],
  );

  const updateQuestion = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    }));
  };

  const updateOption = (questionIndex, optionIndex, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, j) => (j === optionIndex ? { ...option, ...patch } : option)),
        };
      }),
    }));
  };

  const createQuiz = async () => {
    setError("");
    setMessage("");
    if (!selectedLesson) {
      setError("Zgjidh nje leksion para se te krijosh kuizin.");
      return;
    }
    setSaving(true);
    try {
      await quizService.create({
        ...form,
        lessonId: Number(selectedLesson),
        kohezgjatjaMinuta: Number(form.kohezgjatjaMinuta),
      });
      setForm({ titulli: "", pershkrimi: "", kohezgjatjaMinuta: 20, publikuar: false, questions: [emptyQuestion()] });
      setMessage("Kuizi u krijua me sukses.");
      await loadQuizzes(selectedLesson);
    } catch (err) {
      setError(err.response?.data?.message || "Kuizi nuk u krijua.");
    } finally {
      setSaving(false);
    }
  };

  const publishQuiz = async (quizId) => {
    await quizService.publish(quizId);
    setMessage("Kuizi u publikua.");
    await loadQuizzes(selectedLesson);
  };

  if (loading) {
    return (
      <Box className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Box className="mb-7 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <QuizRounded />
        </span>
        <div>
          <Typography variant="h4" className="!font-black text-slate-950 dark:!text-white">
            Kuizet
          </Typography>
          <Typography className="text-slate-600 dark:!text-slate-300">
            Krijo kuize, publiko per studentet dhe shiko rezultatet.
          </Typography>
        </div>
      </Box>

      {message && <Alert severity="success" className="!mb-4">{message}</Alert>}
      {error && <Alert severity="error" className="!mb-4">{error}</Alert>}

      <Card elevation={0} className="mb-5 rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
        <CardContent className="!p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <FormControl fullWidth>
              <InputLabel>Kursi</InputLabel>
              <Select label="Kursi" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>{course.titulli}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedCourse}>
              <InputLabel>Moduli</InputLabel>
              <Select label="Moduli" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>{module.titulli}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedModule}>
              <InputLabel>Leksioni</InputLabel>
              <Select label="Leksioni" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
                {lessons.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id}>{lesson.titulli}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
          <CardContent className="!p-5">
            <Typography variant="h6" className="!mb-4 !font-black dark:!text-white">Krijo quiz</Typography>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Titulli" value={form.titulli} onChange={(e) => setForm({ ...form, titulli: e.target.value })} />
              <TextField label="Kohezgjatja (min)" type="number" value={form.kohezgjatjaMinuta} onChange={(e) => setForm({ ...form, kohezgjatjaMinuta: e.target.value })} />
            </div>
            <TextField
              label="Pershkrimi"
              multiline
              minRows={2}
              value={form.pershkrimi}
              onChange={(e) => setForm({ ...form, pershkrimi: e.target.value })}
              className="!mt-4"
              fullWidth
            />

            <Box className="mt-5 flex items-center gap-2">
              <Checkbox checked={form.publikuar} onChange={(e) => setForm({ ...form, publikuar: e.target.checked })} />
              <Typography className="dark:!text-slate-200">Publiko menjehere</Typography>
            </Box>

            <div className="mt-5 flex flex-col gap-4">
              {form.questions.map((question, questionIndex) => (
                <Box key={questionIndex} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <TextField
                    label={`Pyetja ${questionIndex + 1}`}
                    fullWidth
                    value={question.pyetja}
                    onChange={(e) => updateQuestion(questionIndex, { pyetja: e.target.value })}
                  />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <Box key={optionIndex} className="flex items-center gap-2">
                        <Checkbox
                          checked={option.eshteSakte}
                          onChange={(e) => updateOption(questionIndex, optionIndex, { eshteSakte: e.target.checked })}
                        />
                        <TextField
                          label={`Alternativa ${String.fromCharCode(65 + optionIndex)}`}
                          value={option.pergjigja}
                          onChange={(e) => updateOption(questionIndex, optionIndex, { pergjigja: e.target.value })}
                          fullWidth
                        />
                      </Box>
                    ))}
                  </div>
                </Box>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button startIcon={<AddRounded />} variant="outlined" onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }))} className="!rounded-xl !normal-case">
                Shto pyetje
              </Button>
              <Button variant="contained" disabled={saving} onClick={createQuiz} className="!rounded-xl !normal-case">
                {saving ? "Duke ruajtur..." : "Ruaj quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <Typography variant="h6" className="!mb-4 !font-black dark:!text-white">Kuizet e leksionit</Typography>
              <div className="flex flex-col gap-3">
                {quizzes.map((quiz) => (
                  <Box key={quiz.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Typography className="!font-bold dark:!text-white">{quiz.titulli}</Typography>
                        <Typography variant="caption" className="text-slate-500">{quiz.kohezgjatjaMinuta} minuta</Typography>
                      </div>
                      <Button size="small" onClick={() => setSelectedQuiz(quiz.id)} className="!normal-case">Rezultatet</Button>
                    </div>
                    {!quiz.publikuar && (
                      <Button size="small" startIcon={<PublishRounded />} onClick={() => publishQuiz(quiz.id)} className="!mt-2 !normal-case">
                        Publiko
                      </Button>
                    )}
                  </Box>
                ))}
                {selectedLesson && quizzes.length === 0 && <Alert severity="info">Ky leksion nuk ka ende kuize.</Alert>}
              </div>
            </CardContent>
          </Card>

          <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <Box className="mb-4 flex items-center gap-2">
                <ResultsRounded className="text-sky-600" />
                <Typography variant="h6" className="!font-black dark:!text-white">
                  Rezultatet {selectedQuizData ? `- ${selectedQuizData.titulli}` : ""}
                </Typography>
              </Box>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2">Studenti</th>
                      <th className="py-2">Piket</th>
                      <th className="py-2">Dorezuar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((row) => (
                      <tr key={row.id} className="dark:text-slate-200">
                        <td className="py-3">{row.userEmri}</td>
                        <td className="py-3 font-bold">{row.pikete?.toFixed?.(0) ?? row.pikete}%</td>
                        <td className="py-3">{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedQuiz && results.length === 0 && <Alert severity="info">Nuk ka dorezime per kete kuiz.</Alert>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
