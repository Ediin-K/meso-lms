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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Zoom,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Footer from "../components/ui/Footer";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

const EMPTY_FORM = { emertimi: "", pershkrimi: "" };

export default function AdminCategories() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së kategorive"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.emertimi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.pershkrimi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedCategory(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEditDialog = (category) => {
    setIsEdit(true);
    setSelectedCategory(category);
    setFormData({
      emertimi: category.emertimi || "",
      pershkrimi: category.pershkrimi || "",
    });
    setOpenDialog(true);
  };

  const handleFieldChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.emertimi.trim()) {
      showToast("Emertimi është i detyrueshëm", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && selectedCategory) {
        await updateCategory(selectedCategory.id, formData);
        showToast("Category updated successfully", "success");
      } else {
        await createCategory(formData);
        showToast("Category created successfully", "success");
      }
      setOpenDialog(false);
      await loadCategories();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë ruajtjes së kategorisë"),
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
      await deleteCategory(deleteTarget.id);
      showToast("Category deleted successfully", "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadCategories();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë fshirjes së kategorisë"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("home.admin.services.backToPanel", "Kthehu te Paneli")}
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <CategoryRounded className="text-amber-600 text-xl!" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="font-extrabold! text-slate-900! dark:text-white!"
              >
                {t("home.admin.services.categories.title", "Kategoritë")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="text-slate-600! dark:text-slate-400!"
            >
              {t(
                "home.admin.services.categories.desc",
                "Organizoni kurset në kategori dhe tema.",
              )}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder="Kërko kategori..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                input: {
                  color: isDark ? "#f8fafc" : "#0f172a",
                  "&::placeholder": {
                    color: isDark
                      ? "rgba(226,232,240,0.7)"
                      : "rgba(100,116,139,0.75)",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-amber-600! hover:bg-amber-700! shadow-lg shadow-amber-500/20"
            >
              Shto Kategori
            </Button>
          </div>
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-amber-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">
                      Emri
                    </TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">
                      Përshkrimi
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-bold! text-slate-700! dark:text-slate-200!"
                    >
                      Veprime
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <CategoryOutlinedIcon className="text-4xl! text-amber-400" />
                          </div>
                          <Typography className="font-semibold! text-slate-500!">
                            Nuk ka kategori akoma.
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddRounded />}
                            onClick={openAddDialog}
                            className="rounded-xl! normal-case! border-amber-300! text-amber-600!"
                          >
                            Shto Kategorinë e Parë
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {category.emertimi}
                        </TableCell>
                        <TableCell className="text-slate-500! text-sm!">
                          {category.pershkrimi || "—"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(category)}
                            className="text-slate-400! hover:text-amber-600!"
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteTarget(category);
                              setOpenDeleteConfirm(true);
                            }}
                            className="text-slate-400! hover:text-rose-600!"
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
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              {isEdit ? "Ndrysho Kategorinë" : "Shto Kategori të Re"}
            </Typography>
          </DialogTitle>
          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            <Box className="flex flex-col gap-4 mt-2">
              <TextField
                label="Emertimi"
                fullWidth
                value={formData.emertimi}
                onChange={handleFieldChange("emertimi")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
              <TextField
                label="Përshkrimi"
                fullWidth
                multiline
                rows={4}
                value={formData.pershkrimi}
                onChange={handleFieldChange("pershkrimi")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button
              onClick={() => setOpenDialog(false)}
              className="rounded-xl! normal-case! text-slate-600!"
            >
              Anulo
            </Button>
            <Button
              variant="contained"
              disabled={submitting || !formData.emertimi.trim()}
              onClick={handleSubmit}
              className="rounded-xl! normal-case! font-bold! bg-amber-600! hover:bg-amber-700!"
            >
              {submitting
                ? "Duke ruajtur..."
                : isEdit
                  ? "Ruaj Ndryshimet"
                  : "Shto Kategorinë"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          maxWidth="xs"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: "2rem",
              p: 2,
              backgroundColor: isDark ? "#0f172a" : "white",
              border: isDark
                ? "1px solid #1e293b"
                : "1px solid rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography
              variant="h5"
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              Fshi Kategorinë
            </Typography>
          </DialogTitle>
          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            <Typography className="text-slate-600! dark:text-slate-300!">
              Je i sigurt që dëshiron të fshish kategorinë "
              {deleteTarget?.emertimi}"?
            </Typography>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              className="rounded-xl! normal-case! text-slate-600!"
            >
              Anulo
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-xl! normal-case! font-bold!"
            >
              {submitting ? "Po fshihet..." : "Fshi Kategorinë"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          TransitionComponent={Zoom}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
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
      </Container>
      <Footer />
    </section>
  );
}
