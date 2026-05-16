import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography,
  Container,
  Box,
  Card,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Zoom,
  Grid,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import BadgeRounded from "@mui/icons-material/BadgeRounded";
import EmailRounded from "@mui/icons-material/EmailRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import Footer from "../components/ui/Footer";
import * as teacherService from "../services/teacherService";

const AVATAR_GRADIENT = {
  default: "from-sky-500 to-blue-600",
};

const EMPTY_FORM = {
  emri: "",
  mbiemri: "",
  email: "",
  password: "",
  phoneNumber: "",
  statusi: "active",
};

export default function AdminTeachers() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [moreMenuId, setMoreMenuId] = useState(null);

  const filtered = teachers.filter((t) => {
    const matchesSearch =
      `${t.emri} ${t.mbiemri} ${t.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      t.courseCount?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || t.statusi === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setSnackbarMessage("Gabim gjatë marrjes së mësuesve");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedTeacher(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (teacher) => {
    setIsEdit(true);
    setSelectedTeacher(teacher);
    setFormData({
      emri: teacher.emri,
      mbiemri: teacher.mbiemri,
      email: teacher.email,
      password: "",
      phoneNumber: teacher.phoneNumber || "",
      statusi: teacher.statusi,
    });
    setOpenDialog(true);
  };

  const field = (k) => (e) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        const updateData = {
          emri: formData.emri,
          mbiemri: formData.mbiemri,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          statusi: formData.statusi,
        };
        if (formData.password) updateData.password = formData.password;

        await teacherService.updateTeacher(selectedTeacher.id, updateData);
        await fetchTeachers();
        setSnackbarMessage("Mësuesi u përditësua me sukses");
      } else {
        await teacherService.createTeacher(formData);
        await fetchTeachers();
        setSnackbarMessage("Mësuesi u krijua me sukses");
      }
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (err) {
      setSnackbarMessage(err.message || "Gabim gjatë ruajtjes");
      setOpenSnackbar(true);
    }
  };

  const handleOpenDelete = (teacher) => {
    setDeleteTarget(teacher);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await teacherService.deleteTeacher(deleteTarget.id);
      setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setSnackbarMessage(
        `${deleteTarget.emri} ${deleteTarget.mbiemri} u fshi me sukses`,
      );
      setOpenSnackbar(true);
    } catch (err) {
      setSnackbarMessage(err.message || "Gabim gjatë fshirjes");
      setOpenSnackbar(true);
    } finally {
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const getInitials = (teacher) => {
    return `${teacher.emri?.[0]}${teacher.mbiemri?.[0]}`.toUpperCase();
  };

  const statusColor = (status) => {
    return status === "active"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
  };

  const statusLabel = (status) => {
    return status === "active" ? "Aktiv" : "Joaktiv";
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        {/* BACK BUTTON */}
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/admin")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
          >
            Kthehu te Paneli
          </Button>
        </Box>

        {/* HEADER */}
        <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <Typography
              variant="overline"
              className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!"
            >
              MENAXHIMI I MËSUESVE
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              className="mt-2! font-black! text-slate-900! dark:text-white!"
            >
              Mësuesit
            </Typography>
            <Typography
              variant="body1"
              className="mt-4! max-w-2xl! text-slate-500! dark:text-slate-400! text-lg font-medium!"
            >
              Menaxhoni mësuesit, caktoni kurset dhe monitoroni aktivitetin në
              sistem.
            </Typography>
          </div>

          <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <TextField
              placeholder="Kërko mësuesit..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleOpenAdd}
              className="rounded-3xl! py-4! px-8! normal-case! font-black! bg-indigo-600! hover:bg-indigo-700! shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Shto Mësues
            </Button>
          </Box>
        </Box>

        {/* STATS */}
        <Grid container spacing={3} className="mb-10">
          {[
            {
              label: "Gjithsej Mësues",
              value: teachers.length,
              icon: PeopleRounded,
              color: "text-indigo-600",
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
            },
            {
              label: "Kurse Të Lidhura",
              value: teachers.reduce((sum, t) => sum + (t.courseCount || 0), 0),
              icon: SchoolRounded,
              color: "text-sky-600",
              bg: "bg-sky-50 dark:bg-sky-900/20",
            },
            {
              label: "Mësues Aktiv",
              value: teachers.filter((t) => t.statusi === "active").length,
              icon: BadgeRounded,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
          ].map((s, i) => (
            <Grid item xs={6} sm={4} md={4} key={i}>
              <Box className="p-6 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}
                >
                  <s.icon fontSize="small" />
                </div>
                <div>
                  <Typography
                    variant="h5"
                    className="font-black! dark:text-white! leading-none mb-1"
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-slate-500! font-bold! tracking-widest! uppercase! block!"
                  >
                    {s.label}
                  </Typography>
                </div>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* TABLE */}
        <Card
          elevation={0}
          className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none"
        >
          <Box className="p-8 border-b border-slate-100 dark:border-slate-800">
            <Box className="flex justify-between items-center">
              <Typography
                variant="h6"
                className="font-black! text-slate-800! dark:text-white!"
              >
                Lista e Mësuesve
              </Typography>
              <FormControl size="small" className="w-40">
                <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                  Statusi
                </InputLabel>
                <Select variant="outlined"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Statusi"
                  sx={{
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                    "& .MuiSvgIcon-root": {
                      color: isDark ? "#cbd5e1" : "#64748b",
                    },
                  }}
                >
                  <MenuItem value="all">Të Gjithë</MenuItem>
                  <MenuItem value="active">Aktiv</MenuItem>
                  <MenuItem value="inactive">Joaktiv</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading ? (
            <Box className="flex justify-center py-32">
              <CircularProgress className="text-indigo-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                  <TableRow>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pl-8!">
                      Emri
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Email
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Telefon
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Kurse
                    </TableCell>
                    <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                      Statusi
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pr-8!"
                    >
                      Veprime
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className="flex flex-col items-center justify-center py-24 gap-6">
                          <div className="h-24 w-24 rounded-4xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                            <SchoolRounded className="text-5xl! text-slate-200 dark:text-slate-700" />
                          </div>
                          <div className="text-center">
                            <Typography
                              variant="h6"
                              className="font-black! text-slate-800! dark:text-white! mb-1"
                            >
                              Nuk u gjet asnjë mësues
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-slate-400!"
                            >
                              Provo të ndryshosh kërkimin ose shto një mësues të
                              ri.
                            </Typography>
                          </div>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((teacher) => (
                      <TableRow
                        key={teacher.id}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <TableCell className="pl-8! py-6!">
                          <Box className="flex items-center gap-3">
                            <Avatar
                              className={`!bg-gradient-to-br ${AVATAR_GRADIENT.default} font-black! text-white!`}
                            >
                              {getInitials(teacher)}
                            </Avatar>
                            <div>
                              <Typography
                                variant="body1"
                                className="font-black! text-slate-900! dark:text-white!"
                              >
                                {teacher.emri} {teacher.mbiemri}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            <EmailRounded
                              fontSize="small"
                              className="text-slate-400"
                            />
                            <Typography
                              variant="body2"
                              className="text-slate-600! dark:text-slate-400!"
                            >
                              {teacher.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            {teacher.phoneNumber ? (
                              <>
                                <PhoneRounded
                                  fontSize="small"
                                  className="text-slate-400"
                                />
                                <Typography
                                  variant="body2"
                                  className="text-slate-600! dark:text-slate-400!"
                                >
                                  {teacher.phoneNumber}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                                className="text-slate-400!"
                              >
                                —
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            className="font-bold! text-indigo-600! dark:text-indigo-400!"
                          >
                            {teacher.courseCount || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColor(teacher.statusi)}`}
                          >
                            {statusLabel(teacher.statusi)}
                          </Box>
                        </TableCell>
                        <TableCell align="right" className="pr-2!">
                          <Tooltip title="Redakto">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(teacher)}
                              className="text-slate-500! hover:text-sky-600! dark:hover:text-sky-400!"
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Fshij">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(teacher)}
                              className="text-slate-500! hover:text-rose-600! dark:hover:text-rose-400!"
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>

      {/* CREATE/EDIT DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "2.5rem",
            p: 2,
            backgroundColor: isDark ? "#0f172a" : "white",
            border: isDark
              ? "1px solid #1e293b"
              : "1px solid rgba(148,163,184,0.15)",
            boxShadow: isDark
              ? "0 30px 60px rgba(15,23,42,0.65)"
              : "0 30px 60px rgba(148,163,184,0.15)",
          },
        }}
      >
        <DialogTitle className="px-6! pt-6! pb-2!">
          <Typography
            variant="h5"
            component="p"
            className={
              isDark ? "font-black! text-white!" : "font-black! text-slate-900!"
            }
          >
            {isEdit ? "Përditëso Mësuesin" : "Shto Mësues të Ri"}
          </Typography>
          <Typography
            variant="body2"
            className={
              isDark ? "text-slate-300! mt-1!" : "text-slate-600! mt-1!"
            }
          >
            {isEdit
              ? "Ndryshoni të dhënat e llogarisë ekzistuese."
              : "Plotësoni të dhënat për të krijuar një llogari të re."}
          </Typography>
        </DialogTitle>
        <DialogContent
          className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
        >
          <Box className="flex flex-col gap-5 mt-4">
            <Box className="flex gap-4">
              <TextField
                label="Emri"
                fullWidth
                value={formData.emri}
                onChange={field("emri")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDark ? "#94a3b8" : "#94a3b8",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
              <TextField
                label="Mbiemri"
                fullWidth
                value={formData.mbiemri}
                onChange={field("mbiemri")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDark ? "#94a3b8" : "#94a3b8",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            </Box>
            <TextField
              label="Email Adresa"
              type="email"
              fullWidth
              value={formData.email}
              onChange={field("email")}
              InputProps={{ className: "rounded-2xl!" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  "& fieldset": {
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: isDark ? "#94a3b8" : "#94a3b8",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: isDark ? "#cbd5e1" : "#64748b",
                },
              }}
            />
            <TextField
              label="Numri i Telefonit"
              fullWidth
              value={formData.phoneNumber}
              onChange={field("phoneNumber")}
              InputProps={{ className: "rounded-2xl!" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  "& fieldset": {
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: isDark ? "#94a3b8" : "#94a3b8",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: isDark ? "#cbd5e1" : "#64748b",
                },
              }}
            />
            {!isEdit && (
              <TextField
                label="Fjalëkalimi"
                type="password"
                fullWidth
                value={formData.password}
                onChange={field("password")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDark ? "#94a3b8" : "#94a3b8",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            )}
            {isEdit && (
              <TextField
                label="Fjalëkalim (lëre bosh nëse nuk dëshiron ta ndryshosh)"
                type="password"
                fullWidth
                value={formData.password}
                onChange={field("password")}
                InputProps={{ className: "rounded-2xl!" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDark ? "#94a3b8" : "#94a3b8",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            )}
            <FormControl fullWidth>
              <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                Statusi
              </InputLabel>
              <Select variant="outlined"
                value={formData.statusi}
                label="Statusi"
                onChange={field("statusi")}
                sx={{
                  borderRadius: "1rem",
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              >
                <MenuItem value="active">Aktiv</MenuItem>
                <MenuItem value="inactive">Joaktiv</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions className="px-8! pb-8! pt-4! gap-2">
          <Button
            onClick={() => setOpenDialog(false)}
            className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
          >
            {t("adminUsers.form.cancel", "Anulo")}
          </Button>
          <Button
            variant="contained"
            disabled={!formData.emri || !formData.email}
            onClick={handleSubmit}
            className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-indigo-600! hover:bg-indigo-700! shadow-lg shadow-indigo-500/20"
          >
            {isEdit ? "Përditëso" : "Krijo Llogarinë"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => {
          setOpenDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "2.5rem",
            p: 2,
            backgroundColor: isDark ? "#0f172a" : "white",
            border: isDark
              ? "1px solid #1e293b"
              : "1px solid rgba(148,163,184,0.15)",
            boxShadow: isDark
              ? "0 30px 60px rgba(15,23,42,0.65)"
              : "0 30px 60px rgba(148,163,184,0.15)",
          },
        }}
      >
        <DialogTitle className="px-6! pt-6! pb-2!">
          <Typography
            variant="h5"
            component="p"
            className={
              isDark ? "font-black! text-white!" : "font-black! text-slate-900!"
            }
          >
            A jeni i sigurt?
          </Typography>
        </DialogTitle>
        <DialogContent className="px-6! py-4!">
          <Typography
            variant="body2"
            className={isDark ? "text-slate-300!" : "text-slate-600!"}
          >
            Do të fshihet përhershëm mësuesi:
          </Typography>
          <Typography
            variant="body1"
            className={
              isDark
                ? "font-bold! text-white! mt-3!"
                : "font-bold! text-slate-900! mt-3!"
            }
          >
            {deleteTarget ? `${deleteTarget.emri} ${deleteTarget.mbiemri}` : ""}
          </Typography>
          <Typography
            variant="caption"
            className={isDark ? "text-slate-400!" : "text-slate-500!"}
          >
            {deleteTarget ? deleteTarget.email : ""}
          </Typography>
        </DialogContent>
        <DialogActions className="px-8! pb-8! pt-4! gap-2">
          <Button
            onClick={() => {
              setOpenDeleteConfirm(false);
              setDeleteTarget(null);
            }}
            className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
          >
            Anulo
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            className="rounded-2xl! px-10! py-3! normal-case! font-black!"
          >
            Fshi
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarMessage.includes("Gabim") ? "error" : "success"}
          variant="filled"
          sx={{ 
            width: "100%", 
            borderRadius: "1.25rem",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
}
