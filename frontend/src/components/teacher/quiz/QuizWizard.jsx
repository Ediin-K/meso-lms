import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import quizService from '../../../services/quizService';
import {
  emptyAbcdQuestion,
  emptyQuizForm,
  emptyTrueFalseQuestion,
  mapQuestionFromApi,
  QUESTION_TYPES,
  totalPoints,
  validateStep1,
  validateStep2,
} from './quizWizardUtils';

const STEPS = ['Informacioni bazë', 'Pyetjet', 'Përmbledhje'];

export default function QuizWizard({
  courses,
  modules,
  lessons,
  selectedCourse,
  selectedModule,
  selectedLesson,
  onCourseChange,
  onModuleChange,
  onLessonChange,
  editingQuiz,
  onSaved,
  onError,
  onMessage,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(emptyQuizForm());
  const [saving, setSaving] = useState(false);
  const [loadedQuizId, setLoadedQuizId] = useState(null);

  const loadQuizForEdit = async (quiz) => {
    if (!quiz?.id) return;
    try {
      const res = await quizService.getQuestions(quiz.id);
      setForm({
        titulli: quiz.titulli || '',
        pershkrimi: quiz.pershkrimi || '',
        kohezgjatjaMinuta: quiz.kohezgjatjaMinuta || 20,
        questions: res.data?.length ? res.data.map(mapQuestionFromApi) : [emptyAbcdQuestion()],
      });
      setLoadedQuizId(quiz.id);
      setActiveStep(0);
    } catch {
      onError?.('Pyetjet e quiz-it nuk u ngarkuan.');
    }
  };

  useEffect(() => {
    if (editingQuiz?.id && editingQuiz.status === 'DRAFT' && editingQuiz.id !== loadedQuizId) {
      loadQuizForEdit(editingQuiz);
    }
    if (!editingQuiz) {
      setLoadedQuizId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingQuiz?.id]);

  const resetWizard = () => {
    setForm(emptyQuizForm());
    setActiveStep(0);
    setLoadedQuizId(null);
  };

  const updateQuestion = (idx, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }));
  };

  const changeQuestionType = (idx, lloji) => {
    const base = lloji === QUESTION_TYPES.VERTET_GABIM ? emptyTrueFalseQuestion() : emptyAbcdQuestion();
    updateQuestion(idx, { lloji: base.lloji, options: base.options });
  };

  const updateOption = (qIdx, oIdx, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)),
        };
      }),
    }));
  };

  const setCorrectOption = (qIdx, oIdx) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) => ({ ...o, eshteSakte: j === oIdx })),
        };
      }),
    }));
  };

  const buildPayload = () => ({
    titulli: form.titulli.trim(),
    pershkrimi: form.pershkrimi?.trim() || '',
    kohezgjatjaMinuta: Number(form.kohezgjatjaMinuta),
    lessonId: Number(selectedLesson),
    questions: form.questions.map((q) => ({
      pyetja: q.pyetja.trim(),
      lloji: q.lloji,
      pikete: Number(q.pikete),
      options: q.options.map((o) => ({
        pergjigja: o.pergjigja.trim(),
        eshteSakte: Boolean(o.eshteSakte),
      })),
    })),
  });

  const saveDraft = async () => {
    const err1 = validateStep1(form, selectedLesson);
    if (err1) { onError?.(err1); return; }
    const err2 = validateStep2(form.questions);
    if (err2) { onError?.(err2); return; }

    setSaving(true);
    onError?.('');
    try {
      const payload = buildPayload();
      if (loadedQuizId) {
        await quizService.update(loadedQuizId, payload);
        onMessage?.('Quiz-i u përditësua si draft.');
      } else {
        const res = await quizService.create(payload);
        setLoadedQuizId(res.data.id);
        onMessage?.('Quiz-i u ruajt si draft.');
      }
      onSaved?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Ruajtja dështoi.');
    } finally {
      setSaving(false);
    }
  };

  const saveAndActivate = async () => {
    const err1 = validateStep1(form, selectedLesson);
    if (err1) { onError?.(err1); return; }
    const err2 = validateStep2(form.questions);
    if (err2) { onError?.(err2); return; }

    setSaving(true);
    onError?.('');
    try {
      const payload = buildPayload();
      let quizId = loadedQuizId;
      if (quizId) {
        await quizService.update(quizId, payload);
      } else {
        const res = await quizService.create(payload);
        quizId = res.data.id;
        setLoadedQuizId(quizId);
      }
      await quizService.activate(quizId);
      onMessage?.('Quiz-i u aktivizua me sukses.');
      resetWizard();
      onSaved?.(quizId);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Aktivizimi dështoi.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const err = validateStep1(form, selectedLesson);
      if (err) { onError?.(err); return; }
    }
    if (activeStep === 1) {
      const err = validateStep2(form.questions);
      if (err) { onError?.(err); return; }
    }
    onError?.('');
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    onError?.('');
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
      <CardContent className="!p-5">
        <Stepper activeStep={activeStep} alternativeLabel className="!mb-6">
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormControl fullWidth>
                <InputLabel>Kursi</InputLabel>
                <Select label="Kursi" value={selectedCourse} onChange={(e) => onCourseChange(e.target.value)}>
                  {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.titulli}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!selectedCourse}>
                <InputLabel>Moduli</InputLabel>
                <Select label="Moduli" value={selectedModule} onChange={(e) => onModuleChange(e.target.value)}>
                  {modules.map((m) => <MenuItem key={m.id} value={m.id}>{m.titulli}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!selectedModule}>
                <InputLabel>Leksioni (QUIZ)</InputLabel>
                <Select label="Leksioni (QUIZ)" value={selectedLesson} onChange={(e) => onLessonChange(e.target.value)}>
                  {lessons.filter((l) => l.lloji === 'QUIZ').map((l) => (
                    <MenuItem key={l.id} value={l.id}>{l.titulli}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            {!lessons.some((l) => l.lloji === 'QUIZ') && selectedModule && (
              <Alert severity="info">Nuk ka leksione QUIZ në këtë modul. Krijo një leksion me lloj QUIZ fillimisht.</Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Titulli i quiz-it"
                value={form.titulli}
                onChange={(e) => setForm({ ...form, titulli: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Koha totale (minuta)"
                type="number"
                inputProps={{ min: 1, max: 180 }}
                value={form.kohezgjatjaMinuta}
                onChange={(e) => setForm({ ...form, kohezgjatjaMinuta: e.target.value })}
                fullWidth
                required
              />
            </div>
            <TextField
              label="Përshkrimi (opsional)"
              multiline
              minRows={2}
              value={form.pershkrimi}
              onChange={(e) => setForm({ ...form, pershkrimi: e.target.value })}
              fullWidth
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box className="flex flex-col gap-4">
            {form.questions.map((question, qIdx) => (
              <Box key={qIdx} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <Typography variant="subtitle2" className="!font-bold dark:!text-white">
                    Pyetja {qIdx + 1}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Lloji</InputLabel>
                      <Select
                        label="Lloji"
                        value={question.lloji}
                        onChange={(e) => changeQuestionType(qIdx, e.target.value)}
                      >
                        <MenuItem value={QUESTION_TYPES.SHUMEFISHTE}>ABCD</MenuItem>
                        <MenuItem value={QUESTION_TYPES.VERTET_GABIM}>E vërtetë / E gabuar</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Pikë"
                      type="number"
                      size="small"
                      inputProps={{ min: 1 }}
                      value={question.pikete}
                      onChange={(e) => updateQuestion(qIdx, { pikete: e.target.value })}
                      sx={{ width: 90 }}
                    />
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
                </div>
                <TextField
                  label="Teksti i pyetjes"
                  fullWidth
                  value={question.pyetja}
                  onChange={(e) => updateQuestion(qIdx, { pyetja: e.target.value })}
                  className="!mb-3"
                />
                <div className="flex flex-col gap-2">
                  {question.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      {question.lloji === QUESTION_TYPES.SHUMEFISHTE && (
                        <span className="w-6 text-center text-sm font-bold text-slate-500">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                      )}
                      <TextField
                        label={question.lloji === QUESTION_TYPES.VERTET_GABIM ? `Opsioni ${oIdx + 1}` : `Alternativa ${String.fromCharCode(65 + oIdx)}`}
                        fullWidth
                        size="small"
                        value={opt.pergjigja}
                        disabled={question.lloji === QUESTION_TYPES.VERTET_GABIM}
                        onChange={(e) => updateOption(qIdx, oIdx, { pergjigja: e.target.value })}
                      />
                      <Checkbox
                        checked={Boolean(opt.eshteSakte)}
                        onChange={() => setCorrectOption(qIdx, oIdx)}
                        color="success"
                      />
                      <Typography variant="caption" className="whitespace-nowrap text-slate-500">E saktë</Typography>
                    </div>
                  ))}
                </div>
              </Box>
            ))}
            <Button
              startIcon={<AddRounded />}
              variant="outlined"
              onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyAbcdQuestion()] }))}
              className="!self-start !normal-case"
            >
              Shto pyetje
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Box className="flex flex-col gap-3">
            <Typography variant="h6" className="!font-black dark:!text-white">{form.titulli || '—'}</Typography>
            {form.pershkrimi && (
              <Typography variant="body2" className="text-slate-500">{form.pershkrimi}</Typography>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Koha', value: `${form.kohezgjatjaMinuta} min` },
                { label: 'Pyetje', value: form.questions.length },
                { label: 'Pikë totale', value: totalPoints(form.questions) },
                { label: 'Lloje', value: `${form.questions.filter((q) => q.lloji === QUESTION_TYPES.SHUMEFISHTE).length} ABCD · ${form.questions.filter((q) => q.lloji === QUESTION_TYPES.VERTET_GABIM).length} V/G` },
              ].map((item) => (
                <Box key={item.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                  <Typography variant="h6" className="!font-black dark:!text-white">{item.value}</Typography>
                  <Typography variant="caption" className="text-slate-500">{item.label}</Typography>
                </Box>
              ))}
            </div>
            <Alert severity="info">
              Ruaj si draft për ta modifikuar më vonë, ose aktivizo që studentët ta fillojnë.
            </Alert>
          </Box>
        )}

        <Box className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <Button disabled={activeStep === 0} onClick={handleBack} className="!normal-case">
            Prapa
          </Button>
          <Box className="flex flex-wrap gap-2">
            {activeStep === STEPS.length - 1 ? (
              <>
                <Button variant="outlined" disabled={saving} onClick={saveDraft} className="!normal-case">
                  Ruaj si Draft
                </Button>
                <Button variant="contained" color="success" disabled={saving} onClick={saveAndActivate} className="!normal-case">
                  {saving ? 'Duke ruajtur...' : 'Aktivizo quiz-in'}
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={handleNext} className="!normal-case">
                Vazhdo
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
