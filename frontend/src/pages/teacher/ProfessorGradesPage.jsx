import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import GradeRounded from "@mui/icons-material/GradeRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import GradesPageShell from "../../components/grades/GradesPageShell";
import GradeTable from "../../components/grades/GradeTable";
import GradeFormDialog from "../../components/grades/GradeFormDialog";
import teacherContentService from "../../services/teacherContentService";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  getGradesByCourse,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../../services/gradeService";

export default function ProfessorGradesPage() {
  const { colorMode } = useAppPreferences();
  const isDark = colorMode === "dark";
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editGrade, setEditGrade] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

  const loadCourses = useCallback(async () => {
    try {
      const res = await teacherContentService.getCourses();
      setCourses(res.data || []);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë marrjes së kurseve"), "error");
    }
  }, []);

  const loadCourseData = useCallback(async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [gradesData, studentsRes] = await Promise.all([
        getGradesByCourse(courseId),
        teacherContentService.getStudentsByCourse(courseId),
      ]);
      setGrades(gradesData || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë marrjes së të dhënave"), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId);
    } else {
      setGrades([]);
      setStudents([]);
    }
  }, [selectedCourseId, loadCourseData]);

  const filteredGrades = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return grades.filter((g) => {
      const studentName = `${g.studentEmri || ""} ${g.studentMbiemri || ""}`.toLowerCase();
      const comment = (g.comment || "").toLowerCase();
      return studentName.includes(term) || comment.includes(term);
    });
  }, [grades, searchTerm]);

  const studentsWithoutGrade = useMemo(() => {
    const gradedIds = new Set(grades.map((g) => g.studentId));
    return students.filter((s) => !gradedIds.has(s.userId));
  }, [students, grades]);

  const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editGrade?.id) {
        await updateGrade(editGrade.id, data);
        showToast("Nota u përditësua me sukses");
      } else {
        await createGrade(data);
        showToast("Nota u shtua me sukses");
      }
      setOpenForm(false);
      await loadCourseData(selectedCourseId);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë ruajtjes së notës"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteGrade(deleteTarget.id);
      showToast("Nota u fshi me sukses");
      setDeleteTarget(null);
      await loadCourseData(selectedCourseId);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë fshirjes së notës"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toolbarActions = (
    <Button
      variant="contained"
      startIcon={<AddRounded />}
      onClick={() => { setEditGrade(null); setOpenForm(true); }}
      disabled={!selectedCourseId}
      className="!rounded-lg !normal-case !bg-[#2563eb] !shadow-none hover:!bg-[#1d4ed8]"
    >
      Shto notë
    </Button>
  );

  return (
    <GradesPageShell
      backTo="/teacher"
      backLabel="Kthehu te Paneli"
      breadcrumbs={[
        { label: "Paneli", to: "/teacher" },
        { label: "Notat" },
      ]}
      title="Menaxhimi i Notave"
      subtitle="Vendosni, ndryshoni dhe fshini notat për studentët e regjistruar."
      icon={GradeRounded}
      actions={toolbarActions}
    >
      <Box className="mb-5 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <Box className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FormControl size="small" className="w-full lg:max-w-xs" required>
            <InputLabel>Kursi</InputLabel>
            <Select
              value={selectedCourseId}
              label="Kursi"
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <MenuItem value="">
                <em>Zgjidhni kursin...</em>
              </MenuItem>
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.titulli} ({c.ects ?? 5} ECTS)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Kërko student ose koment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!selectedCourseId}
            className="w-full lg:flex-1"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                borderRadius: "8px",
                color: isDark ? "#e2e8f0" : "inherit",
              },
            }}
          />
        </Box>

        {selectedCourse && (
          <Box className="mt-4 flex flex-wrap gap-2">
            <Chip
              size="small"
              label={`${filteredGrades.length} nota`}
              className="!bg-sky-100 !font-semibold !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300"
            />
            <Chip
              size="small"
              label={`${studentsWithoutGrade.length} studentë pa notë`}
              className="!bg-amber-100 !font-semibold !text-amber-800 dark:!bg-amber-950/60 dark:!text-amber-300"
            />
            <Chip
              size="small"
              label={`${students.length} studentë total`}
              variant="outlined"
              className="!font-semibold dark:!border-slate-600 dark:!text-slate-300"
            />
          </Box>
        )}
      </Box>

      {!selectedCourseId ? (
        <Box className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-6 text-center dark:border-slate-600 dark:bg-slate-900">
          <Typography className="!text-slate-600 dark:!text-slate-400">
            Zgjidhni një kurs nga lista për të parë dhe menaxhuar notat e studentëve.
          </Typography>
        </Box>
      ) : (
        <GradeTable
          rows={filteredGrades}
          mode="professor"
          loading={loading}
          onEdit={(row) => { setEditGrade(row); setOpenForm(true); }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <GradeFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editGrade}
        students={editGrade ? students : studentsWithoutGrade.length ? studentsWithoutGrade : students}
        courses={courses}
        fixedCourseId={selectedCourseId ? Number(selectedCourseId) : null}
        fixedCourseTitle={selectedCourse?.titulli || ""}
        submitting={submitting}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ className: "rounded-xl" }}>
        <DialogTitle className="!font-bold">Konfirmo fshirjen</DialogTitle>
        <DialogContent>
          <Typography>
            Doni të fshini notën e studentit{" "}
            <strong>{deleteTarget?.studentEmri} {deleteTarget?.studentMbiemri}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setDeleteTarget(null)} className="!rounded-lg !normal-case">Anulo</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={submitting}
            className="!rounded-lg !normal-case"
          >
            Fshi notën
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GradesPageShell>
  );
}
