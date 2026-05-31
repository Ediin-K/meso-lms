export const QUESTION_TYPES = {
  SHUMEFISHTE: 'SHUMEFISHTE',
  VERTET_GABIM: 'VERTET_GABIM',
};

export const emptyAbcdQuestion = () => ({
  pyetja: '',
  lloji: QUESTION_TYPES.SHUMEFISHTE,
  pikete: 5,
  options: [
    { pergjigja: '', eshteSakte: false },
    { pergjigja: '', eshteSakte: false },
    { pergjigja: '', eshteSakte: false },
    { pergjigja: '', eshteSakte: false },
  ],
});

export const emptyTrueFalseQuestion = () => ({
  pyetja: '',
  lloji: QUESTION_TYPES.VERTET_GABIM,
  pikete: 5,
  options: [
    { pergjigja: 'E vërtetë', eshteSakte: false },
    { pergjigja: 'E gabuar', eshteSakte: false },
  ],
});

export const emptyQuizForm = () => ({
  titulli: '',
  pershkrimi: '',
  kohezgjatjaMinuta: 20,
  questions: [emptyAbcdQuestion()],
});

export function totalPoints(questions) {
  return (questions || []).reduce((sum, q) => sum + (Number(q.pikete) || 0), 0);
}

export function validateStep1(form, selectedLesson) {
  if (!selectedLesson) return 'Zgjidh një leksion.';
  if (!form.titulli?.trim()) return 'Titulli i quiz-it është i detyrueshëm.';
  if (!form.kohezgjatjaMinuta || Number(form.kohezgjatjaMinuta) < 1) return 'Koha duhet të jetë të paktën 1 minutë.';
  return null;
}

export function validateStep2(questions) {
  if (!questions?.length) return 'Shto të paktën një pyetje.';
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    if (!q.pyetja?.trim()) return `Pyetja ${i + 1} duhet të ketë tekst.`;
    if (!q.pikete || Number(q.pikete) < 1) return `Pyetja ${i + 1} duhet të ketë të paktën 1 pikë.`;
    const expected = q.lloji === QUESTION_TYPES.VERTET_GABIM ? 2 : 4;
    if (!q.options || q.options.length !== expected) {
      return `Pyetja ${i + 1} duhet të ketë ${expected} alternativa.`;
    }
    if (q.options.some((o) => !o.pergjigja?.trim())) {
      return `Të gjitha alternativat e pyetjes ${i + 1} duhet të kenë tekst.`;
    }
    const correct = q.options.filter((o) => o.eshteSakte).length;
    if (correct !== 1) return `Pyetja ${i + 1} duhet të ketë saktësisht një përgjigje të saktë.`;
  }
  return null;
}

export function mapQuestionFromApi(q) {
  return {
    pyetja: q.pyetja || '',
    lloji: q.lloji || QUESTION_TYPES.SHUMEFISHTE,
    pikete: q.pikete || 1,
    options: (q.options || []).map((o) => ({
      pergjigja: o.pergjigja,
      eshteSakte: Boolean(o.eshteSakte),
    })),
  };
}
