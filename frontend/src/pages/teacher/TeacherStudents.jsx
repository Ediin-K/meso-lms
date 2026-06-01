import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import BarChartRounded from '@mui/icons-material/BarChartRounded';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import teacherContentService from '../../services/teacherContentService';
import progressService from '../../services/progressService';
import Footer from '../../components/ui/Footer';

function ProgressBar({ value, color = 'bg-sky-500', height = 'h-2' }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${height}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function TeacherStudents() {
  const navigate = useNavigate();

  const [courses, setCourses]           = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents]         = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError]               = useState('');

  const [detailOpen, setDetailOpen]     = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailProgress, setDetailProgress] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    teacherContentService.getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError('Kurset nuk u ngarkuan.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setStudents([]);
    setLoadingStudents(true);
    progressService.getCourseStudents(selectedCourse)
      .then((res) => setStudents(res.data))
      .catch(() => setError('Studentët nuk u ngarkuan.'))
      .finally(() => setLoadingStudents(false));
  }, [selectedCourse]);

  const openDetail = async (student) => {
    setDetailStudent(student);
    setDetailOpen(true);
    setDetailProgress(null);
    setDetailLoading(true);
    try {
      const res = await progressService.getStudentProgress(selectedCourse, student.userId);
      setDetailProgress(res.data);
    } catch {
      setDetailProgress(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 flex-grow">

        {}
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate('/teacher')}
            className="!rounded-2xl !px-6 !py-2 !normal-case !font-bold !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200/50 dark:hover:!bg-slate-800/50"
          >
            Kthehu te Paneli
          </Button>
        </Box>

        {}
        <Box className="mb-8 flex items-center gap-4">
          <Box className="h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <PeopleRounded />
          </Box>
          <div>
            <Typography variant="h4" className="!font-black dark:!text-white">Studentët</Typography>
            <Typography variant="body1" className="text-slate-500 dark:!text-slate-400">
              Shikoni progresin e studentëve të regjistruar.
            </Typography>
          </div>
        </Box>

        {error && <Alert severity="error" className="!mb-6" onClose={() => setError('')}>{error}</Alert>}

        {}
        <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900 mb-6">
          <CardContent className="!p-5">
            <Typography variant="subtitle2" className="!mb-3 !font-bold dark:!text-white">Zgjidh kursin</Typography>
            {loadingCourses ? (
              <CircularProgress size={24} />
            ) : (
              <FormControl size="small" fullWidth sx={{ maxWidth: 420 }}>
                <InputLabel>Kursi</InputLabel>
                <Select
                  label="Kursi"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.titulli}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </CardContent>
        </Card>

        {}
        {!selectedCourse && (
          <div className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center">
            <SchoolRounded className="!text-5xl text-slate-200 dark:text-slate-700 !mb-3" />
            <Typography className="text-slate-400 dark:!text-slate-500">Zgjidh një kurs për të parë studentët.</Typography>
          </div>
        )}

        {loadingStudents && (
          <Box className="flex justify-center py-12"><CircularProgress /></Box>
        )}

        {!loadingStudents && selectedCourse && students.length === 0 && (
          <Alert severity="info">Asnjë student i regjistruar në këtë kurs.</Alert>
        )}

        {!loadingStudents && students.length > 0 && (
          <Card elevation={0} className="rounded-2xl border border-slate-200 bg-white dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <div className="mb-4 flex items-center justify-between">
                <Typography variant="subtitle1" className="!font-black dark:!text-white">
                  {students.length} student{students.length !== 1 ? 'ë' : ''}
                </Typography>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">#</th>
                      <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">Studenti</th>
                      <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400 min-w-[180px]">Progresi</th>
                      <th className="py-3 pr-4 font-bold text-slate-500 dark:text-slate-400">%</th>
                      <th className="py-3 font-bold text-slate-500 dark:text-slate-400">Detaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((s, i) => {
                      const pct = Math.round(s.progresi ?? 0);
                      return (
                        <tr key={s.id} className="dark:text-slate-200">
                          <td className="py-3 pr-4 text-slate-400">{i + 1}</td>
                          <td className="py-3 pr-4 font-medium">{s.userEmri}</td>
                          <td className="py-3 pr-4">
                            <ProgressBar
                              value={pct}
                              color={pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`font-black ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3">
                            <Button
                              size="small"
                              startIcon={<BarChartRounded />}
                              onClick={() => openDetail(s)}
                              className="!normal-case !rounded-xl"
                            >
                              Shiko
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Container>

      {}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: 'rounded-[2rem]! p-2! dark:bg-slate-900!' }}
      >
        <DialogTitle className="flex items-center justify-between !pt-6 !px-6 !font-black dark:!text-white">
          <Box className="flex items-center gap-2">
            <BarChartRounded className="text-sky-500" />
            <span>{detailStudent?.userEmri}</span>
          </Box>
          <IconButton onClick={() => setDetailOpen(false)} size="small">
            <CloseRounded fontSize="small" className="dark:text-slate-400" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!px-6 !pb-8">
          {detailLoading && (
            <Box className="flex justify-center py-10"><CircularProgress /></Box>
          )}
          {!detailLoading && !detailProgress && (
            <Alert severity="info">Nuk ka të dhëna progresi.</Alert>
          )}
          {!detailLoading && detailProgress && (
            <div className="space-y-5 mt-2">
              {}
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Typography variant="body2" className="font-bold! dark:!text-white">Totali</Typography>
                  <span className="font-black text-sky-600 dark:text-sky-400">
                    {detailProgress.viewedLessons}/{detailProgress.totalLessons} &nbsp;·&nbsp; {Math.round(detailProgress.progressPercent)}%
                  </span>
                </div>
                <ProgressBar
                  value={detailProgress.progressPercent}
                  color={detailProgress.progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500'}
                  height="h-3"
                />
              </div>

              {}
              <div className="space-y-3">
                {detailProgress.modules.map((mod, i) => (
                  <div key={mod.moduleId}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 dark:text-slate-400">
                          {i + 1}
                        </span>
                        <Typography variant="body2" className="font-medium! dark:!text-slate-200 truncate">
                          {mod.titulli}
                        </Typography>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {mod.viewedLessons}/{mod.totalLessons}
                      </span>
                    </div>
                    <ProgressBar
                      value={mod.progressPercent}
                      color={mod.progressPercent === 100 ? 'bg-emerald-500' : mod.progressPercent > 0 ? 'bg-sky-400' : 'bg-slate-200 dark:bg-slate-700'}
                      height="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
