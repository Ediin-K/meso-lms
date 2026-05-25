import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
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
  Zoom,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Footer from "../components/ui/Footer";
import { useAppPreferences } from "../context/appPreferencesContext";
import GroupCreateWizard from "../components/admin/groupWizard/GroupCreateWizard";
import {
  DRAFT_STORAGE_KEY,
  applyStaffToScheduleRow,
  buildStaffByCourse,
  cardSx,
  getGroupsTheme,
  getMenuPaperSx,
  getWizardFieldSx,
  pageShellSx,
  primaryButtonSx,
  seedScheduleRowsFromStaff,
  tableContainerSx,
} from "../components/admin/groupWizard/wizardUi";
import { getAllCategories } from "../services/categoryService";
import {
  createGroupWizard,
  deleteDirectionGroup,
  getDirectionGroupDetail,
  getDirectionGroupMembers,
  getDirectionGroups,
  getWizardContext,
  GROUP_STATUS,
  statusChipColor,
} from "../services/directionGroupService";
import {
  getScheduleConflict,
  getScheduleConflictMessage,
} from "../utils/scheduleConflict";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
  SATURDAY: "E Shtune",
  SUNDAY: "E Diele",
};
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Te gjitha" },
  { value: GROUP_STATUS.ACTIVE, label: "Aktiv" },
  { value: GROUP_STATUS.FULL, label: "Plote" },
  { value: GROUP_STATUS.CLOSED, label: "Mbyllur" },
];

const emptyStaffRow = () => ({ courseId: "", professorId: "", assistantId: "" });
const emptyScheduleRow = () => ({
  courseId: "",
  professorId: "",
  assistantId: "",
  sessionType: "LECTURE",
  dayOfWeek: "MONDAY",
  startTime: "10:00",
  endTime: "",
  room: "",
  color: "sky",
});

const dayOptions = DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] }));

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

export default function AdminGroups() {
  const navigate = useNavigate();
  const { colorMode } = useAppPreferences();
  const isDark = colorMode === "dark";
  const theme = getGroupsTheme(isDark);

  const [view, setView] = useState("list");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [semester, setSemester] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [wizardStep, setWizardStep] = useState(0);
  const [context, setContext] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [staffRows, setStaffRows] = useState([emptyStaffRow()]);
  const [scheduleRows, setScheduleRows] = useState([emptyScheduleRow()]);
  const [wizardError, setWizardError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [detailDialog, setDetailDialog] = useState(null);
  const [membersDialog, setMembersDialog] = useState({ open: false, group: null, members: [], loading: false });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId],
  );

  const staffCourseIds = useMemo(
    () => new Set(staffRows.map((r) => Number(r.courseId)).filter(Boolean)),
    [staffRows],
  );

  const courses = context?.courses || [];
  const teachers = context?.teachers || [];

  const staffByCourse = useMemo(
    () => buildStaffByCourse(staffRows, courses, teachers),
    [staffRows, courses, teachers],
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter && g.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [g.name, g.categoryName, String(g.semester), g.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [groups, searchQuery, statusFilter]);

  const loadCategories = useCallback(async () => {
    const data = await getAllCategories();
    setCategories(data);
    if (data.length > 0 && !categoryId) setCategoryId(String(data[0].id));
  }, [categoryId]);

  const loadGroups = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      setGroups(await getDirectionGroups(categoryId, semester));
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjate ngarkimit"), "error");
    } finally {
      setLoading(false);
    }
  }, [categoryId, semester]);

  useEffect(() => {
    loadCategories().catch(() => {});
  }, [loadCategories]);

  useEffect(() => {
    if (view === "list") loadGroups();
  }, [view, loadGroups]);

  useEffect(() => {
    if (view !== "wizard" || !categoryId) return;
    loadWizardContext(categoryId, semester).catch(() => {});
  }, [categoryId, semester, view]);

  const loadWizardContext = async (catId, sem) => {
    setContextLoading(true);
    try {
      const ctx = await getWizardContext(catId, sem);
      setContext(ctx);
      return ctx;
    } finally {
      setContextLoading(false);
    }
  };

  const handleScheduleChange = useCallback(
    (index, key, val) => {
      if (key === "_add") {
        setScheduleRows((rows) => [...rows, val || emptyScheduleRow()]);
        return;
      }
      if (key === "_remove") {
        setScheduleRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
        return;
      }
      setScheduleRows((rows) =>
        rows.map((r, i) => {
          if (i !== index) return r;
          const next = { ...r, [key]: val };
          if (key === "courseId") return applyStaffToScheduleRow(next, staffByCourse);
          return next;
        }),
      );
    },
    [staffByCourse],
  );

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.categoryId) setCategoryId(String(d.categoryId));
      if (d.semester) setSemester(Number(d.semester));
      if (d.groupName) setGroupName(d.groupName);
      if (d.groupDescription) setGroupDescription(d.groupDescription);
      if (d.maxCapacity) setMaxCapacity(d.maxCapacity);
      if (d.staffRows?.length) setStaffRows(d.staffRows);
      if (d.scheduleRows?.length) setScheduleRows(d.scheduleRows);
      if (typeof d.wizardStep === "number") setWizardStep(d.wizardStep);
      return true;
    } catch {
      return false;
    }
  };

  const startWizard = async () => {
    if (!categoryId) return;
    setWizardStep(0);
    setGroupName("");
    setGroupDescription("");
    setMaxCapacity(30);
    setStaffRows([emptyStaffRow()]);
    setScheduleRows([emptyScheduleRow()]);
    setWizardError("");
    setFieldErrors({});
    setView("wizard");
    const hadDraft = restoreDraft();
    try {
      await loadWizardContext(categoryId, semester);
      if (hadDraft) showToast("Draft-i u ngarkua", "info");
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          categoryId,
          semester,
          groupName,
          groupDescription,
          maxCapacity,
          staffRows,
          scheduleRows,
          wizardStep,
        }),
      );
      showToast("Draft-i u ruajt lokalisht");
    } catch {
      showToast("Draft-i nuk u ruajt", "error");
    }
  };

  const validateStep = async () => {
    const errors = {};
    if (wizardStep === 0) {
      if (!categoryId) errors.categoryId = "Zgjidh drejtimin";
      if (!groupName.trim()) errors.groupName = "Emri i grupit eshte i detyrueshem";
      if (Number(maxCapacity) < 1) errors.maxCapacity = "Kapaciteti duhet te jete te pakten 1";
      else {
        try {
          await loadWizardContext(categoryId, semester);
        } catch (error) {
          errors.global = getErrorMessage(error, "Gabim gjate ngarkimit");
        }
      }
    }
    if (wizardStep === 1) {
      const validStaff = staffRows.filter((r) => r.courseId && r.professorId);
      if (validStaff.length === 0) errors.staff = "Shto te pakten nje rresht stafi (lende + profesor)";
      const validSchedules = scheduleRows.filter((r) => r.courseId && r.professorId && r.startTime);
      if (validSchedules.length === 0) {
        errors.schedules = "Shto te pakten nje sesion orari";
      } else {
        for (let i = 0; i < validSchedules.length; i += 1) {
          const conflict = getScheduleConflict(validSchedules, validSchedules[i], i);
          const msg = getScheduleConflictMessage(conflict);
          if (msg) {
            errors.schedules = msg;
            break;
          }
        }
        const missingStaff = validSchedules.some((r) => !staffByCourse[String(r.courseId)]?.professorId);
        if (missingStaff) {
          errors.schedules = "Disa lende nuk kane staf te caktuar ne hapin e stafit";
        }
      }
    }
    setFieldErrors(errors);
    setWizardError(errors.global || "");
    return Object.keys(errors).length === 0;
  };

  const goNext = async () => {
    setWizardError("");
    const ok = await validateStep();
    if (!ok) return;

    if (wizardStep === 1) {
      const hasValidSchedule = scheduleRows.some((r) => r.courseId && r.startTime);
      if (!hasValidSchedule) {
        setScheduleRows(seedScheduleRowsFromStaff(staffRows, emptyScheduleRow));
      } else {
        setScheduleRows((rows) => rows.map((r) => applyStaffToScheduleRow(r, staffByCourse)));
      }
    }

    setWizardStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => {
    setFieldErrors({});
    setWizardError("");
    setWizardStep((s) => Math.max(s - 1, 0));
  };

  const buildPayload = () => ({
    categoryId: Number(categoryId),
    semester: Number(semester),
    name: groupName.trim(),
    description: groupDescription.trim() || null,
    maxCapacity: Number(maxCapacity),
    staff: staffRows
      .filter((r) => r.courseId && r.professorId)
      .map((r) => ({
        courseId: Number(r.courseId),
        professorId: Number(r.professorId),
        assistantId: r.assistantId ? Number(r.assistantId) : null,
      })),
    schedules: scheduleRows
      .filter((r) => r.courseId && r.professorId && r.startTime)
      .map((r) => ({
        courseId: Number(r.courseId),
        professorId: Number(r.professorId),
        assistantId: r.assistantId ? Number(r.assistantId) : null,
        sessionType: r.sessionType,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime.length === 5 ? `${r.startTime}:00` : r.startTime,
        endTime: r.endTime
          ? r.endTime.length === 5
            ? `${r.endTime}:00`
            : r.endTime
          : null,
        room: r.room || null,
        color: r.color || "sky",
      })),
  });

  const handleSaveWizard = async () => {
    setSubmitting(true);
    setWizardError("");
    setFieldErrors({});
    try {
      await createGroupWizard(buildPayload());
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      showToast("Grupi u krijua me staf dhe orar te plote");
      setView("list");
      loadGroups();
    } catch (error) {
      setWizardError(getErrorMessage(error, "Gabim gjate ruajtjes"));
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (group) => {
    try {
      setDetailDialog({ loading: true, group, data: null });
      const data = await getDirectionGroupDetail(group.id);
      setDetailDialog({ loading: false, group, data });
    } catch (error) {
      setDetailDialog(null);
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const openMembers = async (group) => {
    setMembersDialog({ open: true, group, members: [], loading: true });
    try {
      const members = await getDirectionGroupMembers(group.id);
      setMembersDialog({ open: true, group, members, loading: false });
    } catch (error) {
      setMembersDialog({ open: false, group: null, members: [], loading: false });
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const renderGroupActions = (group) => (
    <Box className="flex justify-end gap-0.5">
      <IconButton size="small" onClick={() => openDetail(group)} sx={{ color: theme.textMuted }}>
        <VisibilityRounded fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => openMembers(group)} sx={{ color: theme.textMuted }}>
        <PeopleRounded fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={async () => {
          if (!window.confirm(`Fshini ${group.name}?`)) return;
          try {
            await deleteDirectionGroup(group.id);
            showToast("U fshi");
            loadGroups();
          } catch (error) {
            showToast(getErrorMessage(error, "Gabim"), "error");
          }
        }}
      >
        <DeleteRounded fontSize="small" />
      </IconButton>
    </Box>
  );

  if (view === "wizard") {
    return (
      <Box sx={pageShellSx(isDark)}>
        <Container maxWidth="lg" className="py-4 mt-2 sm:mt-4">
          <GroupCreateWizard
            isDark={isDark}
            wizardStep={wizardStep}
            wizardError={wizardError}
            fieldErrors={fieldErrors}
            submitting={submitting}
            contextLoading={contextLoading}
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            semester={semester}
            setSemester={setSemester}
            semesters={SEMESTERS}
            courses={courses}
            teachers={teachers}
            groupName={groupName}
            setGroupName={setGroupName}
            groupDescription={groupDescription}
            setGroupDescription={setGroupDescription}
            maxCapacity={maxCapacity}
            setMaxCapacity={setMaxCapacity}
            staffRows={staffRows}
            setStaffRows={setStaffRows}
            scheduleRows={scheduleRows}
            onScheduleChange={handleScheduleChange}
            staffCourseIds={staffCourseIds}
            selectedCategory={selectedCategory}
            onBack={() => setView("list")}
            onNext={goNext}
            onPrev={goBack}
            onSave={handleSaveWizard}
            onSaveDraft={saveDraft}
            emptyStaffRow={emptyStaffRow}
            emptyScheduleRow={emptyScheduleRow}
            dayOptions={dayOptions}
          />
          <Footer />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx(isDark)} className="flex flex-col min-h-full">
      <Container maxWidth="xl" className="py-4 mt-2 sm:mt-4 grow">
        {/* Compact toolbar — single row on desktop */}
        <Box
          className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3"
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: theme.card,
          }}
        >
          <IconButton size="small" onClick={() => navigate("/admin")} sx={{ color: theme.textMuted }}>
            <ArrowBackRounded />
          </IconButton>
          <Typography variant="h6" sx={{ color: theme.text, fontWeight: 900, mr: 1 }}>
            Groups
          </Typography>

          <TextField
            size="small"
            placeholder="Kerko grupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[140px]"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" sx={{ color: theme.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={getWizardFieldSx(isDark)}
          />

          <FormControl size="small" sx={{ minWidth: 130, ...getWizardFieldSx(isDark) }}>
            <InputLabel>Drejtimi</InputLabel>
            <Select
              label="Drejtimi"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.emertimi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100, ...getWizardFieldSx(isDark) }}>
            <InputLabel>Sem.</InputLabel>
            <Select
              label="Sem."
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {SEMESTERS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110, ...getWizardFieldSx(isDark) }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <MenuItem key={o.value || "all"} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={startWizard}
            disabled={!categoryId}
            className="!rounded-xl !normal-case !font-bold shrink-0"
            sx={primaryButtonSx()}
          >
            Create Group
          </Button>
        </Box>

        {loading ? (
          <Box className="flex justify-center py-12">
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {/* Desktop table */}
            <TableContainer
              className="hidden md:block rounded-2xl overflow-hidden"
              sx={tableContainerSx(isDark)}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Grupi</TableCell>
                    <TableCell>Drejtimi</TableCell>
                    <TableCell>Sem.</TableCell>
                    <TableCell>Kapaciteti</TableCell>
                    <TableCell>Statusi</TableCell>
                    <TableCell align="right">Veprime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: theme.textMuted }}>
                        Nuk ka grupe. Përdorni Create Group për wizard-in e plotë.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id} hover>
                        <TableCell>
                          <Box className="flex items-center gap-1.5 min-w-0">
                            <GroupsRounded sx={{ color: theme.accent, fontSize: 18 }} />
                            <Typography fontWeight={700} noWrap title={group.name}>
                              {group.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={group.categoryName || selectedCategory?.emertimi}>
                            {group.categoryName || selectedCategory?.emertimi || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>{group.semester}</TableCell>
                        <TableCell>
                          {group.currentStudents}/{group.maxCapacity}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={group.status} color={statusChipColor(group.status)} />
                        </TableCell>
                        <TableCell align="right">{renderGroupActions(group)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile cards */}
            <Box className="md:hidden flex flex-col gap-2">
              {filteredGroups.length === 0 ? (
                <Box
                  className="rounded-xl border p-6 text-center"
                  sx={{ borderColor: theme.border, bgcolor: theme.card, color: theme.textMuted }}
                >
                  Nuk ka grupe.
                </Box>
              ) : (
                filteredGroups.map((group) => (
                  <Card
                    key={group.id}
                    variant="outlined"
                    sx={{ ...tableContainerSx(isDark), p: 2 }}
                  >
                    <Box className="flex items-start justify-between gap-2">
                      <Box className="min-w-0">
                        <Typography fontWeight={800} sx={{ color: theme.text }} noWrap>
                          {group.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textMuted }} noWrap>
                          {group.categoryName || selectedCategory?.emertimi} · Sem. {group.semester}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textMuted, mt: 0.5 }}>
                          {group.currentStudents}/{group.maxCapacity} studente
                        </Typography>
                        <Chip
                          size="small"
                          label={group.status}
                          color={statusChipColor(group.status)}
                          className="!mt-2"
                        />
                      </Box>
                      {renderGroupActions(group)}
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </>
        )}

        <Dialog
          open={Boolean(detailDialog)}
          onClose={() => setDetailDialog(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: cardSx(isDark) }}
        >
          <DialogTitle sx={{ color: theme.text, fontWeight: 800 }}>
            Detajet — {detailDialog?.group?.name || ""}
          </DialogTitle>
          <DialogContent sx={{ color: theme.text }}>
            {detailDialog?.loading ? (
              <CircularProgress size={28} />
            ) : (
              <Table size="small" sx={tableContainerSx(isDark)}>
                <TableHead>
                  <TableRow>
                    <TableCell>Dita</TableCell>
                    <TableCell>Ora</TableCell>
                    <TableCell>Lenda</TableCell>
                    <TableCell>Profesori</TableCell>
                    <TableCell>Salla</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detailDialog?.data?.schedules || []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{DAY_LABELS[s.dayOfWeek] || s.dayOfWeek}</TableCell>
                      <TableCell>
                        {String(s.startTime).slice(0, 5)} – {String(s.endTime).slice(0, 5)}
                      </TableCell>
                      <TableCell>{s.courseTitle}</TableCell>
                      <TableCell>{s.teacherName}</TableCell>
                      <TableCell>{s.room || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(null)}>Mbyll</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={membersDialog.open}
          onClose={() => setMembersDialog({ open: false, group: null, members: [], loading: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: cardSx(isDark) }}
        >
          <DialogTitle sx={{ color: theme.text, fontWeight: 800 }}>
            Studentet — {membersDialog.group?.name}
          </DialogTitle>
          <DialogContent sx={{ color: theme.text }}>
            {membersDialog.loading ? (
              <CircularProgress size={28} />
            ) : membersDialog.members.length === 0 ? (
              <Typography sx={{ color: theme.textMuted }}>Asnje student.</Typography>
            ) : (
              membersDialog.members.map((m) => (
                <Typography key={m.userId} variant="body2" sx={{ py: 0.5 }}>
                  {m.firstName} {m.lastName} ({m.email})
                </Typography>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setMembersDialog({ open: false, group: null, members: [], loading: false })}
            >
              Mbyll
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          TransitionComponent={Zoom}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
}
