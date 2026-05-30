import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import GradeRounded from "@mui/icons-material/GradeRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import GradesPageShell from "../../components/grades/GradesPageShell";
import GradeTable from "../../components/grades/GradeTable";
import { getGradesByStudent } from "../../services/gradeService";
import { useAppPreferences } from "../../context/appPreferencesContext";

function StatItem({ label, value, highlight }) {
  return (
    <Box className="flex flex-1 flex-col rounded-lg border border-slate-300 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
      <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-500">
        {label}
      </Typography>
      <Typography
        variant="h4"
        className={`!mt-1 !font-bold !tabular-nums ${highlight ? "!text-[#1e3a5f] dark:!text-sky-400" : "!text-slate-800 dark:!text-white"}`}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function StudentGradesPage() {
  const { t } = useAppPreferences();
  const userId = localStorage.getItem("userId");

  const [summary, setSummary] = useState({ grades: [], averageGrade: 0, totalGrades: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const loadGrades = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getGradesByStudent(userId);
      setSummary(data);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Gabim gjatë marrjes së notave";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const filteredGrades = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (summary.grades || []).filter((g) => {
      const course = (g.courseTitulli || "").toLowerCase();
      const professor = (g.professorEmri || "").toLowerCase();
      const comment = (g.comment || "").toLowerCase();
      return course.includes(term) || professor.includes(term) || comment.includes(term);
    });
  }, [summary.grades, searchTerm]);

  const gpaLabel = summary.averageGrade > 0 ? summary.averageGrade.toFixed(2) : "—";
  const statusLabel = summary.totalGrades > 0 ? "Rregullt" : "Pa nota";

  return (
    <GradesPageShell
      backTo="/student"
      backLabel="Kthehu te Paneli"
      breadcrumbs={[
        { label: t("header.navDashboard", "Paneli"), to: "/student" },
        { label: t("header.grades", "Notat") },
      ]}
      title={t("header.grades", "Notat e mia")}
      subtitle="Shikoni notat, komentet dhe mesataren tuaj akademike."
      icon={GradeRounded}
    >
      <Box className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatItem label="Mesatarja (GPA)" value={gpaLabel} highlight />
        <StatItem label="Total lëndë me notë" value={summary.totalGrades || 0} />
        <StatItem label="Statusi" value={statusLabel} />
      </Box>

      <Box className="mb-4 rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-5">
        <TextField
          size="small"
          fullWidth
          placeholder="Kërko lëndë, profesor ose koment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" className="text-slate-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
            },
          }}
        />
      </Box>

      <GradeTable rows={filteredGrades} mode="student" loading={loading} />

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
