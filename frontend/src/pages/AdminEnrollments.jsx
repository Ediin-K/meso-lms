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
  Chip,
  Avatar,
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
  IconButton,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import BlockRounded from "@mui/icons-material/BlockRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import { getCourseGroups } from "../services/courseGroupService";
import {
  getAllEnrollments,
  createEnrollment,
  updateEnrollmentProgress,
  updateEnrollmentStatus,
  deleteEnrollment,
} from "../services/enrollmentService";

const STATUS_CONFIG = {
  AKTIV: {
    label: "Aktiv",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: HourglassTopRounded,
  },
  PERFUNDUAR: {
    label: "Përfunduar",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    icon: CheckCircleRounded,
  },
  ANULUAR: {
    label: "Anuluar",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    icon: BlockRounded,
  },
};

export default function AdminEnrollments() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseGroups, setCourseGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    courseId: "",
    courseGroupId: "",
    courseSubgroupId: "",
    enrollmentKey: "",
    progresi: "0",
    statusi: "AKTIV",
  });
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

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getAllEnrollments();
      setEnrollments(data);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së regjistrimeve"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së përdoruesve"),
        "error",
      );
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axiosInstance.get("/courses");
      setCourses(response.data);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë marrjes së kurseve"),
        "error",
      );
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadUsers();
    loadCourses();
  }, []);

  const filtered = enrollments.filter((e) => {
    const matchSearch =
      (e.userEmri?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (e.courseTitulli?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || e.statusi === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: enrollments.length,
    AKTIV: enrollments.filter((e) => e.statusi === "AKTIV").length,
    PERFUNDUAR: enrollments.filter((e) => e.statusi === "PERFUNDUAR").length,
    ANULUAR: enrollments.filter((e) => e.statusi === "ANULUAR").length,
  };

  const FILTERS = [
    { key: "all", label: `Të gjitha (${counts.all})` },
    { key: "AKTIV", label: `Aktive (${counts.AKTIV})` },
    { key: "PERFUNDUAR", label: `Përfunduara (${counts.PERFUNDUAR})` },
    { key: "ANULUAR", label: `Anuluara (${counts.ANULUAR})` },
  ];

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedEnrollment(null);
    setCourseGroups([]);
    setFormData({
      userId: "",
      courseId: "",
      courseGroupId: "",
      courseSubgroupId: "",
      enrollmentKey: "",
      progresi: "0",
      statusi: "AKTIV",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (enrollment) => {
    setIsEdit(true);
    setSelectedEnrollment(enrollment);
    setFormData({
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      courseGroupId: enrollment.courseGroupId || "",
      courseSubgroupId: enrollment.courseSubgroupId || "",
      enrollmentKey: "",
      progresi: enrollment.progresi != null ? String(enrollment.progresi) : "0",
      statusi: enrollment.statusi || "AKTIV",
    });
    setOpenDialog(true);
  };

  const loadGroupsForCourse = async (courseId) => {
    if (!courseId) {
      setCourseGroups([]);
      return;
    }

    try {
      const groups = await getCourseGroups(courseId);
      setCourseGroups(groups);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjate marrjes se grupeve"), "error");
    }
  };

  const handleFieldChange = (key) => async (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "courseId" ? { courseGroupId: "", courseSubgroupId: "" } : {}),
      ...(key === "courseGroupId" ? { courseSubgroupId: "" } : {}),
    }));

    if (key === "courseId") {
      await loadGroupsForCourse(value);
    }
  };

  const handleSubmit = async () => {
    if (!isEdit && (!formData.userId || !formData.courseId)) {
      showToast("Zgjidh studentin dhe kursin", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && selectedEnrollment) {
        const progressValue = Number(formData.progresi ?? 0);
        const requests = [];

        if (progressValue !== Number(selectedEnrollment.progresi ?? 0)) {
          requests.push(
            updateEnrollmentProgress(selectedEnrollment.id, progressValue),
          );
        }

        if (formData.statusi !== selectedEnrollment.statusi) {
          requests.push(
            updateEnrollmentStatus(selectedEnrollment.id, formData.statusi),
          );
        }

        if (requests.length === 0) {
          showToast("Nuk ka ndryshime për të ruajtur", "info");
        } else {
          await Promise.all(requests);
          showToast("Regjistrimi u përditësua me sukses", "success");
        }
      } else {
        await createEnrollment({
          userId: Number(formData.userId),
          courseId: Number(formData.courseId),
          courseGroupId: formData.courseGroupId
            ? Number(formData.courseGroupId)
            : undefined,
          courseSubgroupId: formData.courseSubgroupId
            ? Number(formData.courseSubgroupId)
            : undefined,
          enrollmentKey: formData.enrollmentKey || undefined,
        });
        showToast("Regjistrimi u krijua me sukses", "success");
      }

      setOpenDialog(false);
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë ruajtjes së regjistrimit"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGroup = courseGroups.find(
    (group) => group.id === Number(formData.courseGroupId),
  );
  const availableSubgroups = selectedGroup?.subgroups || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await deleteEnrollment(deleteTarget.id);
      showToast("Regjistrimi u fshi me sukses", "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, "Gabim gjatë fshirjes së regjistrimit"),
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
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <AssignmentRounded className="text-rose-600 !text-xl" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="!font-extrabold !text-slate-900 dark:!text-white"
              >
                {t("home.admin.services.enrollments.title", "Regjistrimet")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="!text-slate-600 dark:!text-slate-400"
            >
              {t(
                "home.admin.services.enrollments.desc",
                "Shikoni dhe menaxhoni regjistrimet e studentëve.",
              )}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder="Kërko student ose kurs..."
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
              className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-rose-600 hover:!bg-rose-700 shadow-lg shadow-rose-500/20"
            >
              Shto Regjistrim
            </Button>
          </div>
        </Box>

        <Box className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filterStatus === key
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400"
              }`}
            >
              {label}
            </button>
          ))}
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="!text-rose-500" />
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
                      Grupi
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Progresi
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Statusi
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      Regjistruar më
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
                      <TableCell colSpan={7}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                            <AssignmentOutlinedIcon className="!text-4xl text-rose-400" />
                          </div>
                          <Typography className="!font-semibold !text-slate-500">
                            Nuk ka regjistrime akoma.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((enr) => {
                      const cfg =
                        STATUS_CONFIG[enr.statusi] || STATUS_CONFIG.AKTIV;
                      const Icon = cfg.icon;
                      return (
                        <TableRow key={enr.id} hover>
                          <TableCell>
                            <Box className="flex items-center gap-3">
                              <Avatar className="!w-9 !h-9 !text-sm !bg-gradient-to-br from-rose-500 to-pink-600 !font-bold">
                                {enr.userEmri?.charAt(0)}
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                  {enr.userEmri}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ID: {enr.userId}
                                </p>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell className="!text-slate-700 dark:!text-slate-300 !font-medium max-w-[200px]">
                            <p className="truncate">{enr.courseTitulli}</p>
                          </TableCell>
                          <TableCell className="!text-slate-600 dark:!text-slate-300 !text-sm">
                            <p className="font-semibold">
                              {enr.courseGroupName || "-"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {enr.courseSubgroupName
                                ? `${enr.courseSubgroupName}${enr.assistantName ? ` - ${enr.assistantName}` : ""}`
                                : enr.professorName || ""}
                            </p>
                          </TableCell>
                          <TableCell className="!text-slate-700 dark:!text-slate-300">
                            {enr.progresi != null ? `${enr.progresi}%` : "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}
                            >
                              <Icon className="!text-sm" />
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="!text-slate-500 !text-sm">
                            {enr.dataRegjistrimit
                              ? new Date(enr.dataRegjistrimit).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              className="!text-slate-400 hover:!text-amber-600"
                              onClick={() => openEditDialog(enr)}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              className="!text-slate-400 hover:!text-rose-600"
                              onClick={() => {
                                setDeleteTarget(enr);
                                setOpenDeleteConfirm(true);
                              }}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
            {isEdit ? "Ndrysho Regjistrimin" : "Shto Regjistrim"}
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Box className="flex flex-col gap-4 mt-2">
            {!isEdit ? (
              <>
                <FormControl fullWidth>
                  <InputLabel id="select-user-label">Studenti</InputLabel>
                  <Select
                    labelId="select-user-label"
                    value={formData.userId}
                    label="Studenti"
                    onChange={handleFieldChange("userId")}
                  >
                    <MenuItem value="">Zgjidh</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.emri} {user.mbiemri} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="select-course-label">Kursi</InputLabel>
                  <Select
                    labelId="select-course-label"
                    value={formData.courseId}
                    label="Kursi"
                    onChange={handleFieldChange("courseId")}
                  >
                    <MenuItem value="">Zgjidh</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.titulli}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {courseGroups.length > 0 && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel id="select-group-label">Grupi</InputLabel>
                      <Select
                        labelId="select-group-label"
                        value={formData.courseGroupId}
                        label="Grupi"
                        onChange={handleFieldChange("courseGroupId")}
                      >
                        <MenuItem value="">Zgjidh</MenuItem>
                        {courseGroups.map((group) => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.name}
                            {group.teachers?.length
                              ? ` - ${group.teachers.map((t) => t.name).join(", ")}`
                              : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!formData.courseGroupId}>
                      <InputLabel id="select-subgroup-label">
                        Nengrupi i ushtrimeve
                      </InputLabel>
                      <Select
                        labelId="select-subgroup-label"
                        value={formData.courseSubgroupId}
                        label="Nengrupi i ushtrimeve"
                        onChange={handleFieldChange("courseSubgroupId")}
                      >
                        <MenuItem value="">Pa nengrup</MenuItem>
                        {availableSubgroups.map((subgroup) => (
                          <MenuItem key={subgroup.id} value={subgroup.id}>
                            {subgroup.name}
                            {subgroup.assistants?.length
                              ? ` - ${subgroup.assistants.map((a) => a.name).join(", ")}`
                              : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                <TextField
                  label="Enrollment Key (opsionale)"
                  fullWidth
                  value={formData.enrollmentKey}
                  onChange={handleFieldChange("enrollmentKey")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Progress (%)"
                  fullWidth
                  type="number"
                  value={formData.progresi}
                  onChange={handleFieldChange("progresi")}
                  inputProps={{ min: 0, max: 100 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="select-status-label">Statusi</InputLabel>
                  <Select
                    labelId="select-status-label"
                    value={formData.statusi}
                    label="Statusi"
                    onChange={handleFieldChange("statusi")}
                  >
                    <MenuItem value="AKTIV">Aktiv</MenuItem>
                    <MenuItem value="PERFUNDUAR">Përfunduar</MenuItem>
                    <MenuItem value="ANULUAR">Anuluar</MenuItem>
                  </Select>
                </FormControl>
              </>
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
            disabled={
              submitting ||
              (!isEdit
                ? !formData.userId ||
                  !formData.courseId ||
                  (courseGroups.length > 0 && !formData.courseGroupId) ||
                  (availableSubgroups.length > 0 && !formData.courseSubgroupId)
                : false)
            }
            onClick={handleSubmit}
            className="!rounded-xl !normal-case !font-bold !bg-rose-600 hover:!bg-rose-700"
          >
            {submitting
              ? "Duke ruajtur..."
              : isEdit
                ? "Ruaj Ndryshimet"
                : "Krijo Regjistrim"}
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
            Fshi Regjistrimin
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Typography className="!text-slate-600 dark:!text-slate-300">
            Je i sigurt që dëshiron të fshish regjistrimin e "
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
            {submitting ? "Po fshihet..." : "Fshi Regjistrimin"}
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

      <Footer />
    </section>
  );
}
