import { useState, useEffect } from "react";
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
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Zoom,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import {
  getAllCertificates,
  createCertificate,
  deleteCertificate,
} from "../services/certificateService";

export default function AdminCertificates() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ enrollmentId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const showToast = (message, severity = "success") => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await getAllCertificates();
      setCertificates(response);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së certifikatave"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await axiosInstance.get("/enrollments");
      setEnrollments(response.data);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së regjistrimeve"),
        "error",
      );
    }
  };

  useEffect(() => {
    loadCertificates();
    loadEnrollments();
  }, []);

  const availableEnrollments = enrollments.filter(
    (enr) =>
      enr.statusi === "PERFUNDUAR" &&
      !certificates.some((cert) => cert.enrollmentId === enr.id),
  );

  const filtered = certificates.filter((cert) => {
    const term = searchTerm.toLowerCase();
    const matchStudent = (cert.userEmri?.toLowerCase() || "").includes(term);
    const matchCourse = (cert.courseTitulli?.toLowerCase() || "").includes(
      term,
    );
    const matchCode = (cert.kodiUnik?.toLowerCase() || "").includes(term);
    return matchStudent || matchCourse || matchCode;
  });

  const openAddDialog = () => {
    setFormData({ enrollmentId: "" });
    setOpenDialog(true);
  };

  const handleFieldChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.enrollmentId) {
      showToast("Zgjidh një regjistrim për të krijuar certifikatën", "error");
      return;
    }

    setSubmitting(true);

    try {
      await createCertificate({ enrollmentId: Number(formData.enrollmentId) });
      showToast("Certifikata u krijua me sukses", "success");
      setOpenDialog(false);
      setFormData({ enrollmentId: "" });
      await loadCertificates();
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë krijimit të certifikatës"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await deleteCertificate(deleteTarget.id);
      showToast("Certifikata u fshi me sukses", "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadCertificates();
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë fshirjes së certifikatës"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400"
        >
          {t("home.admin.services.backToPanel", "Kthehu te Paneli")}
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <WorkspacePremiumRounded className="text-emerald-600 !text-xl" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="!font-extrabold !text-slate-900 dark:!text-white"
              >
                {t("home.admin.services.certificates.title", "Certifikatat")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="!text-slate-600 dark:!text-slate-400"
            >
              {t(
                "home.admin.services.certificates.desc",
                "Menaxho lëshimin e certifikatave dhe arritjet e studentëve.",
              )}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder="Kërko student, kurs ose kod..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "!rounded-[1.5rem] !bg-white dark:!bg-slate-900 !border-none shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-emerald-600 hover:!bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              Shto Certifikatë
            </Button>
          </div>
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="!text-emerald-500" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                  <TableRow>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Studenti
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Kursi
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Data lëshimit
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Kodi
                    </TableCell>
                    <TableCell
                      align="right"
                      className="!font-bold !text-slate-700 dark:!text-slate-200"
                    >
                      Veprime
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <WorkspacePremiumOutlinedIcon className="!text-4xl text-emerald-400" />
                          </div>
                          <Typography className="!font-semibold !text-slate-500">
                            Nuk ka certifikata të disponueshme.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((cert) => (
                      <TableRow key={cert.id} hover>
                        <TableCell>
                          <Box className="flex items-center gap-3">
                            <Avatar className="!w-9 !h-9 !text-sm !bg-gradient-to-br from-emerald-500 to-teal-600 !font-bold">
                              {cert.userEmri?.charAt(0)}
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                {cert.userEmri}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {cert.userId}
                              </p>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell className="!text-slate-700 dark:!text-slate-300 !font-medium max-w-[220px]">
                          <p className="truncate">{cert.courseTitulli}</p>
                        </TableCell>
                        <TableCell className="!text-slate-500 !text-sm">
                          {cert.dataLeshimit
                            ? new Date(cert.dataLeshimit).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg font-semibold">
                            {cert.kodiUnik}
                          </code>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            className="!text-slate-400 hover:!text-rose-600"
                            onClick={() => {
                              setDeleteTarget(cert);
                              setOpenDeleteConfirm(true);
                            }}
                          >
                            <DeleteRounded fontSize="small" />
                          </IconButton>
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

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "2rem",
            p: 2,
            backgroundColor: "var(--mui-palette-background-paper)",
          },
        }}
      >
        <DialogTitle className="!px-6 !pt-6 !pb-2">
          <Typography
            variant="h5"
            className="!font-black !text-slate-900 dark:!text-white"
          >
            Shto Certifikatë
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Box className="flex flex-col gap-4 mt-2">
            <FormControl fullWidth>
              <InputLabel id="select-enrollment-label">Regjistrimi</InputLabel>
              <Select
                labelId="select-enrollment-label"
                value={formData.enrollmentId}
                label="Regjistrimi"
                onChange={handleFieldChange("enrollmentId")}
              >
                <MenuItem value="">Zgjidh</MenuItem>
                {availableEnrollments.map((enr) => (
                  <MenuItem key={enr.id} value={enr.id}>
                    {enr.userEmri} — {enr.courseTitulli}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {availableEnrollments.length === 0 && (
              <Typography className="!text-slate-500 dark:!text-slate-400 text-sm">
                Nuk ka regjistrime të përfunduara pa certifikatë.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <Button
            onClick={() => setOpenDialog(false)}
            className="!rounded-xl !normal-case !text-slate-600"
          >
            Anulo
          </Button>
          <Button
            variant="contained"
            disabled={submitting || !formData.enrollmentId}
            onClick={handleSubmit}
            className="!rounded-xl !normal-case !font-bold !bg-emerald-600 hover:!bg-emerald-700"
          >
            {submitting ? "Duke ruajtur..." : "Krijo Certifikatë"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle className="!px-6 !pt-6 !pb-2">
          <Typography
            variant="h5"
            className="!font-black !text-slate-900 dark:!text-white"
          >
            Fshi Certifikatë
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Typography className="!text-slate-600 dark:!text-slate-300">
            Je i sigurt që dëshiron të fshish certifikatën e "
            {deleteTarget?.userEmri}"?
          </Typography>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            className="!rounded-xl !normal-case !text-slate-600"
          >
            Anulo
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
            className="!rounded-xl !normal-case !font-bold"
          >
            {submitting ? "Po fshihet..." : "Fshi Certifikatë"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </section>
  );
}
