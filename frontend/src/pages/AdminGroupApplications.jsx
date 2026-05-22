import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import {
  approveGroupRequest,
  getAdminGroupRequests,
  rejectGroupRequest,
} from "../services/studentGroupService";
import { getAllCategories } from "../services/categoryService";
import { getDirectionGroups } from "../services/directionGroupService";

const STATUS_OPTIONS = [
  { value: "", label: "Te gjitha" },
  { value: "PENDING", label: "Ne pritje" },
  { value: "APPROVED", label: "Aprovuar" },
  { value: "REJECTED", label: "Refuzuar" },
];

const STATUS_CHIP = {
  PENDING: { label: "Ne pritje", color: "warning" },
  APPROVED: { label: "Aprovuar", color: "success" },
  REJECTED: { label: "Refuzuar", color: "error" },
};

export default function AdminGroupApplications() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [directionGroups, setDirectionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "PENDING", categoryId: "", directionGroupId: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = Number(filters.categoryId);
      if (filters.directionGroupId) params.directionGroupId = Number(filters.directionGroupId);
      const data = await getAdminGroupRequests(params);
      setRequests(data);
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err.message || "Gabim gjate ngarkimit",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters.categoryId) {
      getDirectionGroups(filters.categoryId).then(setDirectionGroups).catch(() => setDirectionGroups([]));
    } else {
      setDirectionGroups([]);
    }
  }, [filters.categoryId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      `${r.studentFirstName} ${r.studentLastName} ${r.studentEmail} ${r.directionGroupName} ${r.categoryName}`
        .toLowerCase()
        .includes(q),
    );
  }, [requests, search]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveGroupRequest(id);
      setToast({ open: true, message: "Aplikimi u aprovua", severity: "success" });
      await loadRequests();
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err?.response?.data || err.message || "Gabim",
        severity: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      await rejectGroupRequest(id);
      setToast({ open: true, message: "Aplikimi u refuzua", severity: "success" });
      await loadRequests();
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err?.response?.data || err.message || "Gabim",
        severity: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400!"
        >
          Kthehu te Paneli
        </Button>

        <Box className="my-8">
          <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
            STUDENTET & GRUPET
          </Typography>
          <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
            Aplikimet per grupe
          </Typography>
        </Box>

        <Card className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60! p-5 mb-6">
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              placeholder="Kerko student, email, grup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchRounded className="text-slate-400 mr-2" /> }}
              className="md:col-span-2"
            />
            <FormControl fullWidth>
              <InputLabel>Statusi</InputLabel>
              <Select
                value={filters.status}
                label="Statusi"
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Drejtimi</InputLabel>
              <Select
                value={filters.categoryId}
                label="Drejtimi"
                onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value, directionGroupId: "" }))}
              >
                <MenuItem value="">Te gjitha</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.emertimi}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth className="md:col-span-2">
              <InputLabel>Grupi</InputLabel>
              <Select
                value={filters.directionGroupId}
                label="Grupi"
                disabled={!filters.categoryId}
                onChange={(e) => setFilters((f) => ({ ...f, directionGroupId: e.target.value }))}
              >
                <MenuItem value="">Te gjitha</MenuItem>
                {directionGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name} ({g.currentStudents}/{g.maxCapacity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {loading ? (
          <Box className="flex justify-center py-16"><CircularProgress /></Box>
        ) : (
          <TableContainer component={Card} className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60!">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="font-black!">Emri</TableCell>
                  <TableCell className="font-black!">Mbiemri</TableCell>
                  <TableCell className="font-black!">Email</TableCell>
                  <TableCell className="font-black!">Drejtimi</TableCell>
                  <TableCell className="font-black!">Grupi</TableCell>
                  <TableCell className="font-black!">Statusi</TableCell>
                  <TableCell className="font-black!">Data</TableCell>
                  <TableCell className="font-black!" align="right">Veprime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => {
                  const chip = STATUS_CHIP[row.status] || { label: row.status, color: "default" };
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.studentFirstName}</TableCell>
                      <TableCell>{row.studentLastName}</TableCell>
                      <TableCell>{row.studentEmail}</TableCell>
                      <TableCell>{row.categoryName}</TableCell>
                      <TableCell>
                        <Chip label={row.directionGroupName} size="small" className="font-bold!" />
                      </TableCell>
                      <TableCell>
                        <Chip label={chip.label} color={chip.color} size="small" className="font-bold!" />
                      </TableCell>
                      <TableCell>
                        {row.appliedAt ? new Date(row.appliedAt).toLocaleString("sq-AL") : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {row.status === "PENDING" && (
                          <Box className="flex gap-2 justify-end">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleRounded />}
                              disabled={actionId === row.id}
                              onClick={() => handleApprove(row.id)}
                              className="rounded-xl! normal-case! font-bold!"
                            >
                              Aprovo
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelRounded />}
                              disabled={actionId === row.id}
                              onClick={() => handleReject(row.id)}
                              className="rounded-xl! normal-case! font-bold!"
                            >
                              Refuzo
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12 text-slate-400!">
                      Nuk ka aplikime.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} className="rounded-xl!">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
