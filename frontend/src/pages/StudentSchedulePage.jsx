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
  Skeleton,
  Snackbar,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import WeekendRounded from "@mui/icons-material/WeekendRounded";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import { scheduleCardSx, schedulePrimaryButtonSx, scheduleTheme } from "../components/schedule/scheduleTheme";
import { useAppPreferences } from "../context/appPreferencesContext";
import { getStudentScheduleOverview, selectGroup } from "../services/studentGroupService";
import { extractApiError, normalizeOverview } from "../utils/studentScheduleUtils";

function pageTokens(isDark) {
  void isDark;
  return {
    bg: scheduleTheme.background,
    card: scheduleTheme.card,
    surface: scheduleTheme.surface,
    border: scheduleTheme.border,
    text: scheduleTheme.text,
    muted: scheduleTheme.muted,
    accent: scheduleTheme.accent,
    accentStrong: scheduleTheme.accentStrong,
  };
}

function GroupCard({ entry, isDark, selectedPendingId, selectingId, onSelect }) {
  const t = pageTokens(isDark);
  const { group, schedules, canApply, applyBlockedReason } = entry;
  const isPending = selectedPendingId === group.id;
  const disabled = selectingId === group.id || group.isFull || group.status === "CLOSED";

  return (
    <Card
      variant="outlined"
      className="rounded-2xl! p-4 flex flex-col gap-4"
      sx={scheduleCardSx()}
    >
      <Box className="flex flex-wrap items-start justify-between gap-3">
        <Box className="min-w-0">
          <Box className="flex items-center gap-2">
            <Box
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              sx={{ bgcolor: "var(--lms-schedule-sky-bg)" }}
            >
              <GroupsRounded sx={{ color: t.accent }} />
            </Box>
            <Box className="min-w-0">
              <Typography sx={{ color: t.text, fontWeight: 900, fontSize: "1.15rem" }} noWrap>
                {group.name}
              </Typography>
              <Typography variant="body2" sx={{ color: t.muted }} noWrap>
                {group.categoryName}
              </Typography>
            </Box>
          </Box>
          {group.description && (
            <Typography variant="body2" sx={{ color: t.muted, mt: 1.5 }}>
              {group.description}
            </Typography>
          )}
        </Box>
        <Box className="flex gap-1 flex-wrap justify-end">
          <Chip size="small" label={`${group.currentStudents}/${group.maxCapacity}`} />
          <Chip
            size="small"
            label={group.remainingSeats > 0 ? `${group.remainingSeats} vende` : "Plote"}
            color={group.remainingSeats > 0 ? "success" : "error"}
          />
          {isPending && <Chip size="small" label="Ne pritje" color="warning" />}
        </Box>
      </Box>

      <Box className="rounded-2xl border p-3" sx={{ bgcolor: t.surface, borderColor: t.border }}>
        <Box className="mb-2 flex items-center gap-1.5">
          <ScheduleRounded fontSize="small" sx={{ color: t.accent }} />
          <Typography sx={{ color: t.text, fontWeight: 800 }}>Pamje javore</Typography>
        </Box>
        {schedules.length === 0 ? (
          <Typography variant="body2" sx={{ color: t.muted }}>
            Ky grup ende nuk ka orar te publikuar.
          </Typography>
        ) : (
          <WeeklyScheduleGrid schedules={schedules} isDark={isDark} compact />
        )}
      </Box>

      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => onSelect(group.id)}
        startIcon={selectingId === group.id ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRounded />}
        className="rounded-xl! normal-case! font-bold! py-2.5!"
        sx={schedulePrimaryButtonSx()}
      >
        {selectingId === group.id ? "Duke u zgjedhur..." : "Zgjidh kete grup"}
      </Button>
      {!canApply && applyBlockedReason && !isPending && (
        <Typography variant="caption" sx={{ color: t.muted, textAlign: "center" }}>
          {applyBlockedReason}
        </Typography>
      )}
    </Card>
  );
}

export default function StudentSchedulePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const { colorMode } = useAppPreferences();
  const isDark = colorMode === "dark";
  const t = pageTokens(isDark);

  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [approvedSchedules, setApprovedSchedules] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const view = useMemo(() => {
    if (!status) return "loading";
    return status.hasApprovedGroup ? "schedule" : "groups";
  }, [status]);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Sesioni nuk eshte aktiv. Kycu perseri.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const raw = await getStudentScheduleOverview(userId);
      const normalized = normalizeOverview(raw);
      setStatus(normalized.status);
      setAvailableGroups(normalized.availableGroups);
      setApprovedSchedules(normalized.approvedSchedules);
    } catch (err) {
      setError(extractApiError(err));
      setStatus({ hasApprovedGroup: false, categoryAssigned: false });
      setAvailableGroups([]);
      setApprovedSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = async (directionGroupId) => {
    if (!userId || directionGroupId == null) return;
    setSelectingId(directionGroupId);
    try {
      await selectGroup(userId, directionGroupId);
      setToast({ open: true, message: "Grupi u zgjodh dhe orari u personalizua.", severity: "success" });
      await load();
    } catch (err) {
      setToast({ open: true, message: extractApiError(err, "Gabim gjate zgjedhjes"), severity: "error" });
    } finally {
      setSelectingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: t.bg, minHeight: "100vh", color: t.text }}>
        <Container maxWidth="xl" className="py-8 mt-8">
          <Skeleton variant="rounded" height={72} className="mb-5!" />
          <Skeleton variant="rounded" height={160} className="mb-5!" />
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="rounded" height={360} />
            <Skeleton variant="rounded" height={360} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: t.bg, minHeight: "100vh", color: t.text }}>
      <Container maxWidth="xl" className="py-6 sm:py-8 mt-2 sm:mt-4">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/student")}
          className="rounded-xl! normal-case! font-bold!"
          sx={{ color: t.muted }}
        >
          Kthehu te Paneli
        </Button>

        {error && (
          <Alert severity="error" className="mt-5 rounded-xl!">
            {error}
          </Alert>
        )}

        <Box
          className="my-5 rounded-2xl border p-5 sm:p-6"
          sx={scheduleCardSx()}
        >
          <Box className="flex flex-wrap items-start justify-between gap-4">
            <Box>
              <Typography variant="overline" sx={{ color: t.accent, fontWeight: 900 }}>
                Schedule & Groups
              </Typography>
              <Typography variant="h4" sx={{ color: t.text, fontWeight: 950, mt: 0.5 }}>
                {view === "schedule" ? "Orari im javor" : "Zgjidh grupin tend"}
              </Typography>
              <Typography sx={{ color: t.muted, mt: 1, maxWidth: 820 }}>
                {view === "schedule"
                  ? "Ky eshte orari i personalizuar per grupin tend aktiv."
                  : "Shfaqen vetem grupet qe perputhen me drejtimin dhe semestrin tend."}
              </Typography>
            </Box>
            <Box className="flex gap-2 flex-wrap">
              {status?.categoryName && (
                <Chip
                  label={status.categoryName}
                  sx={{
                    color: t.text,
                    bgcolor: t.surface,
                    borderColor: t.border,
                    "& .MuiChip-label": { color: t.text },
                  }}
                />
              )}
              {status?.currentSemester != null && (
                <Chip
                  label={`Semestri ${status.currentSemester}`}
                  variant="outlined"
                  sx={{
                    color: t.text,
                    borderColor: t.border,
                    bgcolor: t.surface,
                    "& .MuiChip-label": { color: t.text },
                  }}
                />
              )}
              {status?.approvedGroup?.name && <Chip color="primary" label={`Grupi ${status.approvedGroup.name}`} />}
            </Box>
          </Box>
        </Box>

        {view === "schedule" && (
          <>
            <WeeklyScheduleGrid schedules={approvedSchedules} isDark={isDark} />
            {approvedSchedules.length === 0 && (
              <Alert severity="info" className="mt-5 rounded-xl!">
                Grupi yt nuk ka ende orar aktiv. Administratori mund ta plotesoje nga wizard-i i grupeve.
              </Alert>
            )}
          </>
        )}

        {view === "groups" && (
          <>
            {!status?.categoryAssigned && !error && (
              <Alert severity="warning" className="mb-5 rounded-xl!">
                Drejtimi nuk eshte caktuar per llogarine tende. Kontakto administratorin.
              </Alert>
            )}

            {status?.pendingRequest && (
              <Alert severity="info" className="mb-5 rounded-xl!">
                Ke nje aplikim ne pritje per grupin <strong>{status.pendingRequest.directionGroupName || "-"}</strong>.
                Zgjedhja direkte e nje grupi do ta zevendesoje kete pritje.
              </Alert>
            )}

            <Box className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {availableGroups.map((entry) => (
                <GroupCard
                  key={entry.group.id}
                  entry={entry}
                  isDark={isDark}
                  selectingId={selectingId}
                  selectedPendingId={status?.pendingRequest?.directionGroupId}
                  onSelect={handleSelect}
                />
              ))}
            </Box>

            {status?.categoryAssigned && availableGroups.length === 0 && !error && (
              <Box
                className="rounded-2xl border p-8 text-center"
                sx={scheduleCardSx()}
              >
                <WeekendRounded sx={{ fontSize: 42, color: t.muted, mb: 1 }} />
                <Typography sx={{ fontWeight: 900 }}>Nuk ka grupe aktive per ty.</Typography>
                <Typography sx={{ color: t.muted, mt: 0.5 }}>
                  Grupet shfaqen pasi administratori krijon orar per drejtimin dhe semestrin tend.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} className="rounded-xl! w-full">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
