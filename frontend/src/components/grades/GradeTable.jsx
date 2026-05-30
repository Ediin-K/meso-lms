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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function GradeBadge({ value }) {
  let bg = "bg-rose-100 text-rose-800 ring-rose-200";
  if (value >= 9) bg = "bg-emerald-100 text-emerald-800 ring-emerald-200";
  else if (value >= 7) bg = "bg-sky-100 text-sky-800 ring-sky-200";
  else if (value >= 6) bg = "bg-amber-100 text-amber-800 ring-amber-200";

  return (
    <span className={`inline-flex min-w-[2rem] items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold ring-1 ${bg}`}>
      {value}
    </span>
  );
}

const headerCellSx = {
  fontWeight: 700,
  fontSize: "0.8125rem",
  color: "#1e3a5f",
  backgroundColor: "#dde4ec",
  borderBottom: "1px solid #b8c4d0",
  whiteSpace: "nowrap",
  py: 1.5,
};

const bodyCellSx = {
  fontSize: "0.875rem",
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
  py: 1.75,
};

export default function GradeTable({
  rows = [],
  loading = false,
  mode = "student",
  onEdit,
  onDelete,
  pageSize: defaultPageSize = 10,
}) {
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
        <CircularProgress size={36} className="!text-[#1e3a5f]" />
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
        <Typography variant="body2" className="!mt-1 !text-slate-500">
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
      className="overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <TableContainer>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              {mode === "professor" && (
                <TableCell sx={headerCellSx}>Studenti</TableCell>
              )}
              <TableCell sx={headerCellSx}>Lenda</TableCell>
              <TableCell sx={headerCellSx}>Profesori</TableCell>
              <TableCell sx={headerCellSx} align="center">Nota</TableCell>
              <TableCell sx={headerCellSx}>Komenti</TableCell>
              <TableCell sx={headerCellSx}>Data vendosjes</TableCell>
              {mode === "professor" && (onEdit || onDelete) && (
                <TableCell sx={headerCellSx} align="center">Veprime</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f4f7fa",
                  "&:hover": { backgroundColor: "#e8f0f8 !important" },
                }}
              >
                {mode === "professor" && (
                  <TableCell sx={bodyCellSx} className="!font-medium">
                    {row.studentEmri} {row.studentMbiemri}
                  </TableCell>
                )}
                <TableCell sx={bodyCellSx}>{row.courseTitulli}</TableCell>
                <TableCell sx={bodyCellSx}>{row.professorEmri}</TableCell>
                <TableCell sx={bodyCellSx} align="center">
                  <GradeBadge value={row.grade} />
                </TableCell>
                <TableCell sx={{ ...bodyCellSx, maxWidth: 220 }}>
                  <Typography
                    variant="body2"
                    className="!text-slate-600 dark:!text-slate-400"
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={row.comment || ""}
                  >
                    {row.comment || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...bodyCellSx, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {formatDate(row.assignedAt)}
                </TableCell>
                {mode === "professor" && (onEdit || onDelete) && (
                  <TableCell sx={bodyCellSx} align="center">
                    <Box className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                          onClick={() => onEdit(row)}
                          className="!min-w-0 !rounded !bg-[#2563eb] !px-3 !py-1 !text-xs !normal-case !shadow-none hover:!bg-[#1d4ed8]"
                        >
                          Ndrysho
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                          onClick={() => onDelete(row)}
                          className="!min-w-0 !rounded !px-3 !py-1 !text-xs !normal-case"
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
          borderTop: "1px solid #e2e8f0",
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            fontSize: "0.8125rem",
            color: "#64748b",
          },
        }}
      />
    </Paper>
  );
}
