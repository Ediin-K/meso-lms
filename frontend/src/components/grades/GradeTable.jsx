import { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import { useAppPreferences } from "../../context/appPreferencesContext";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function GradeBadge({ value, isDark }) {
  let bg = isDark
    ? "bg-rose-950/60 text-rose-300 ring-rose-800"
    : "bg-rose-100 text-rose-800 ring-rose-200";
  if (value >= 9) {
    bg = isDark
      ? "bg-emerald-950/60 text-emerald-300 ring-emerald-800"
      : "bg-emerald-100 text-emerald-800 ring-emerald-200";
  } else if (value >= 7) {
    bg = isDark
      ? "bg-sky-950/60 text-sky-300 ring-sky-800"
      : "bg-sky-100 text-sky-800 ring-sky-200";
  } else if (value >= 6) {
    bg = isDark
      ? "bg-amber-950/60 text-amber-300 ring-amber-800"
      : "bg-amber-100 text-amber-800 ring-amber-200";
  }

  return (
    <span className={`inline-flex min-w-[2rem] items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold ring-1 ${bg}`}>
      {value}
    </span>
  );
}

function useTableStyles(isDark) {
  return useMemo(
    () => ({
      headerCell: {
        fontWeight: 700,
        fontSize: "0.8125rem",
        color: isDark ? "#e2e8f0" : "#1e3a5f",
        backgroundColor: isDark ? "#1e293b" : "#dde4ec",
        borderBottom: isDark ? "1px solid #334155" : "1px solid #b8c4d0",
        whiteSpace: "nowrap",
        py: 1.5,
      },
      bodyCell: {
        fontSize: "0.875rem",
        color: isDark ? "#cbd5e1" : "#334155",
        borderBottom: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
        py: 1.75,
      },
      rowEven: isDark ? "#0f172a" : "#ffffff",
      rowOdd: isDark ? "#1e293b" : "#f4f7fa",
      rowHover: isDark ? "#334155" : "#e8f0f8",
      paginationBorder: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
      paginationColor: isDark ? "#94a3b8" : "#64748b",
      paperBg: isDark ? "#0f172a" : "#ffffff",
      paperBorder: isDark ? "#334155" : "#cbd5e1",
    }),
    [isDark],
  );
}

export default function GradeTable({
  rows = [],
  loading = false,
  mode = "student",
  onEdit,
  onDelete,
  pageSize: defaultPageSize = 10,
}) {
  const { colorMode } = useAppPreferences();
  const isDark = colorMode === "dark";
  const styles = useTableStyles(isDark);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box className="flex min-h-[280px] items-center justify-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <CircularProgress size={36} className="!text-sky-600 dark:!text-sky-400" />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
        <MenuBookOutlined className="mb-3 !text-4xl !text-slate-300 dark:!text-slate-600" />
        <Typography className="!font-semibold !text-slate-700 dark:!text-slate-300">
          Nuk ka nota për të shfaqur
        </Typography>
        <Typography variant="body2" className="!mt-1 !text-slate-500 dark:!text-slate-400">
          {mode === "professor"
            ? "Zgjidhni një kurs dhe shtoni notën e parë për studentët."
            : "Notat do të shfaqen këtu pasi profesori t'i vendosë."}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: "8px",
        border: `1px solid ${styles.paperBorder}`,
        backgroundColor: styles.paperBg,
      }}
    >
      <TableContainer>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              {mode === "professor" && (
                <TableCell sx={styles.headerCell}>Studenti</TableCell>
              )}
              <TableCell sx={styles.headerCell}>Lenda</TableCell>
              <TableCell sx={styles.headerCell} align="center">ECTS</TableCell>
              <TableCell sx={styles.headerCell}>Profesori</TableCell>
              <TableCell sx={styles.headerCell} align="center">Nota</TableCell>
              <TableCell sx={styles.headerCell}>Komenti</TableCell>
              <TableCell sx={styles.headerCell}>Data vendosjes</TableCell>
              {mode === "professor" && (onEdit || onDelete) && (
                <TableCell sx={styles.headerCell} align="center">Veprime</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  "&:hover": { backgroundColor: `${styles.rowHover} !important` },
                }}
              >
                {mode === "professor" && (
                  <TableCell sx={styles.bodyCell} className="!font-medium">
                    {row.studentEmri} {row.studentMbiemri}
                  </TableCell>
                )}
                <TableCell sx={styles.bodyCell}>{row.courseTitulli}</TableCell>
                <TableCell sx={styles.bodyCell} align="center">
                  {row.courseEcts ?? "—"}
                </TableCell>
                <TableCell sx={styles.bodyCell}>{row.professorEmri}</TableCell>
                <TableCell sx={styles.bodyCell} align="center">
                  <GradeBadge value={row.grade} isDark={isDark} />
                </TableCell>
                <TableCell sx={{ ...styles.bodyCell, maxWidth: 220 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: isDark ? "#94a3b8" : "#475569",
                    }}
                    title={row.comment || ""}
                  >
                    {row.comment || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...styles.bodyCell, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {formatDate(row.assignedAt)}
                </TableCell>
                {mode === "professor" && (onEdit || onDelete) && (
                  <TableCell sx={styles.bodyCell} align="center">
                    <Box className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                          onClick={() => onEdit(row)}
                          className="!min-w-0 !rounded !bg-sky-600 !px-3 !py-1 !text-xs !normal-case !shadow-none hover:!bg-sky-500"
                        >
                          Ndrysho
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                          onClick={() => onDelete(row)}
                          className="!min-w-0 !rounded !border-rose-500 !px-3 !py-1 !text-xs !normal-case !text-rose-400 hover:!border-rose-400 hover:!bg-rose-950/40"
                        >
                          Fshi
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rreshta:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} nga ${count}`}
        sx={{
          borderTop: styles.paginationBorder,
          backgroundColor: isDark ? "#1e293b" : "#f8fafc",
          color: styles.paginationColor,
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select": {
            fontSize: "0.8125rem",
            color: styles.paginationColor,
          },
          ".MuiTablePagination-actions .MuiIconButton-root": {
            color: isDark ? "#94a3b8" : "#64748b",
          },
          ".Mui-disabled": {
            color: isDark ? "#475569" : "#cbd5e1",
          },
        }}
      />
    </Paper>
  );
}
