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

const STEPS = ['Vendosja', 'Pyetjet', 'Përmbledhje'];

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
    if (!editingQuiz) setLoadedQuizId(null);
  
  }, [editingQuiz?.id]);

  const resetWizard = () => {
    setForm(emptyQuizForm());
    setActiveStep(0);
    setLoadedQuizId(null);
  };

  const updateQuestion = (idx, patch) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }));

  const changeQuestionType = (idx, lloji) => {
    const base = lloji === QUESTION_TYPES.VERTET_GABIM ? emptyTrueFalseQuestion() : emptyAbcdQuestion();
    updateQuestion(idx, { lloji: base.lloji, options: base.options });
  };

  const updateOption = (qIdx, oIdx, patch) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)) };
      }),
    }));

  const setCorrectOption = (qIdx, oIdx) =>
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, options: q.options.map((o, j) => ({ ...o, eshteSakte: j === oIdx })) };
      }),
    }));

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
    <Card elevation={0} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:!border-slate-700 dark:!bg-slate-900">
      {}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
        <div>
          <Typography variant="subtitle1" className="!font-black dark:!text-white">
            {loadedQuizId ? 'Ndrysho quiz-in' : 'Krijo quiz të ri'}
          </Typography>
          <Typography variant="caption" className="text-slate-400 dark:!text-slate-500">
            Hapi {activeStep + 1} nga {STEPS.length} — {STEPS[activeStep]}
          </Typography>
        </div>
        {loadedQuizId && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            Modifikim
          </span>
        )}
      </div>

      <CardContent className="!p-6">
        {}
        <div className="mb-8 flex items-start justify-center gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  i < activeStep
                    ? 'bg-amber-500 text-white'
                    : i === activeStep
                    ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}>
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-bold ${
                  i === activeStep
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 mt-4 h-px w-12 shrink-0 transition-all ${
                  i < activeStep ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-amber-500" />
                <Typography variant="caption" className="!font-black !uppercase !tracking-widest text-slate-400 dark:!text-slate-500">
                  Leksioni QUIZ
                </Typography>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <FormControl fullWidth size="small">
                  <InputLabel>Kursi</InputLabel>
                  <Select label="Kursi" value={selectedCourse} onChange={(e) => onCourseChange(e.target.value)}>
                    {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.titulli}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!selectedCourse}>
                  <InputLabel>Moduli</InputLabel>
                  <Select label="Moduli" value={selectedModule} onChange={(e) => onModuleChange(e.target.value)}>
                    {modules.map((m) => <MenuItem key={m.id} value={m.id}>{m.titulli}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!selectedModule}>
                  <InputLabel>Leksioni (QUIZ)</InputLabel>
                  <Select label="Leksioni (QUIZ)" value={selectedLesson} onChange={(e) => onLessonChange(e.target.value)}>
                    {lessons.filter((l) => l.lloji === 'QUIZ').map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.titulli}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              {!lessons.some((l) => l.lloji === 'QUIZ') && selectedModule && (
                <Alert severity="info" className="!mt-3">Nuk ka leksione QUIZ në këtë modul. Krijo një leksion me lloj QUIZ fillimisht.</Alert>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-amber-500" />
                <Typography variant="caption" className="!font-black !uppercase !tracking-widest text-slate-400 dark:!text-slate-500">
                  Detajet e quiz-it
                </Typography>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Titulli i quiz-it"
                  size="small"
                  value={form.titulli}
                  onChange={(e) => setForm({ ...form, titulli: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Koha totale (minuta)"
                  type="number"
                  size="small"
                  inputProps={{ min: 1, max: 180 }}
                  value={form.kohezgjatjaMinuta}
                  onChange={(e) => setForm({ ...form, kohezgjatjaMinuta: e.target.value })}
                  fullWidth
                  required
                />
              </div>
              <TextField
                label="Përshkrimi (opsional)"
                size="small"
                multiline
                minRows={2}
                value={form.pershkrimi}
                onChange={(e) => setForm({ ...form, pershkrimi: e.target.value })}
                fullWidth
                className="!mt-3"
              />
            </div>
          </div>
        )}

        {}
        {activeStep === 1 && (
          <div className="space-y-4">
            {form.questions.map((question, qIdx) => (
              <div key={qIdx} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                {}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                      {qIdx + 1}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      question.lloji === QUESTION_TYPES.VERTET_GABIM
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                    }`}>
                      {question.lloji === QUESTION_TYPES.VERTET_GABIM ? 'E vërtetë / E gabuar' : 'Shumë alternativa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Lloji</InputLabel>
                      <Select label="Lloji" value={question.lloji} onChange={(e) => changeQuestionType(qIdx, e.target.value)}>
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
                      sx={{ width: 80 }}
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

                {}
                <div className="space-y-3 p-4">
                  <TextField
                    label="Teksti i pyetjes"
                    fullWidth
                    size="small"
                    value={question.pyetja}
                    onChange={(e) => updateQuestion(qIdx, { pyetja: e.target.value })}
                  />

                  {question.lloji === QUESTION_TYPES.VERTET_GABIM ? (
                    <div className="grid grid-cols-2 gap-3">
                      {question.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setCorrectOption(qIdx, oIdx)}
                          className={`rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                            opt.eshteSakte
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700'
                          }`}
                        >
                          {opt.pergjigja}
                          {opt.eshteSakte && (
                            <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs font-normal">
                              e saktë
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {question.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                            opt.eshteSakte
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <TextField
                            fullWidth
                            size="small"
                            value={opt.pergjigja}
                            placeholder={`Alternativa ${String.fromCharCode(65 + oIdx)}`}
                            onChange={(e) => updateOption(qIdx, oIdx, { pergjigja: e.target.value })}
                          />
                          <Checkbox
                            checked={Boolean(opt.eshteSakte)}
                            onChange={() => setCorrectOption(qIdx, oIdx)}
                            color="success"
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              startIcon={<AddRounded />}
              variant="outlined"
              onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyAbcdQuestion()] }))}
              className="!normal-case"
            >
              Shto pyetje
            </Button>
          </div>
        )}

        {}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20">
              <Typography variant="h6" className="!font-black dark:!text-white">{form.titulli || '—'}</Typography>
              {form.pershkrimi && (
                <Typography variant="body2" className="!mt-1 text-slate-500 dark:!text-slate-400">{form.pershkrimi}</Typography>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Koha', value: `${form.kohezgjatjaMinuta} min`, cls: 'from-blue-50 to-cyan-50 border-blue-100 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-900/20' },
                { label: 'Pyetje', value: form.questions.length, cls: 'from-purple-50 to-violet-50 border-purple-100 dark:from-purple-950/20 dark:to-violet-950/20 dark:border-purple-900/20' },
                { label: 'Pikë totale', value: totalPoints(form.questions), cls: 'from-amber-50 to-yellow-50 border-amber-100 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-900/20' },
                {
                  label: 'ABCD / V-G',
                  value: `${form.questions.filter((q) => q.lloji === QUESTION_TYPES.SHUMEFISHTE).length} / ${form.questions.filter((q) => q.lloji === QUESTION_TYPES.VERTET_GABIM).length}`,
                  cls: 'from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-900/20',
                },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border bg-gradient-to-br ${item.cls} p-3 text-center`}>
                  <Typography variant="h6" className="!font-black dark:!text-white">{item.value}</Typography>
                  <Typography variant="caption" className="text-slate-500 dark:!text-slate-400">{item.label}</Typography>
                </div>
              ))}
            </div>
            <Alert severity="info">
              Ruaj si draft për ta modifikuar më vonë, ose aktivizo që studentët ta fillojnë.
            </Alert>
          </div>
        )}

        {}
        <Box className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            className="!normal-case"
          >
            Prapa
          </Button>
          <Box className="flex gap-2">
            {activeStep === STEPS.length - 1 ? (
              <>
                <Button variant="outlined" disabled={saving} onClick={saveDraft} className="!normal-case">
                  Ruaj si Draft
                </Button>
                <Button variant="contained" color="success" disabled={saving} onClick={saveAndActivate} className="!rounded-xl !normal-case">
                  {saving ? 'Duke ruajtur...' : 'Aktivizo quiz-in'}
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={handleNext} className="!rounded-xl !normal-case">
                Vazhdo
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
