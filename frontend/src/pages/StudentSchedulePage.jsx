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
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import {
  applyToGroup,
  getStudentScheduleOverview,
} from "../services/studentGroupService";
import {
  DAY_LABELS,
  extractApiError,
  formatTime,
  normalizeOverview,
} from "../utils/studentScheduleUtils";

const WEEK_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

function ScheduleGrid({ schedules }) {
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  return (
    <Box className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {WEEK_DAYS.map((day) => {
        const dayItems = safeSchedules.filter((s) => s?.dayOfWeek === day);
        return (
          <Card
            key={day}
            className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60! p-4 min-h-[320px]"
          >
            <Typography className="font-black! text-slate-900! dark:text-white! mb-4!">
              {DAY_LABELS[day] || day}
            </Typography>
            <Box className="flex flex-col gap-3">
              {dayItems.map((schedule) => (
                <Box
                  key={schedule.id}
                  className="rounded-2xl bg-sky-50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 p-3"
                >
                  <Typography className="font-black! text-slate-900! dark:text-white!">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Typography>
                  <Typography className="font-bold! text-sky-700! dark:text-sky-300!">
                    {schedule.courseTitle}
                  </Typography>
                  <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                    {schedule.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"}
                  </Typography>
                  <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                    {schedule.courseGroupName || "-"}
                    {schedule.courseSubgroupName ? ` / ${schedule.courseSubgroupName}` : ""}
                  </Typography>
                  <Typography variant="caption" className="block! text-slate-500! dark:text-slate-300!">
                    {schedule.teacherName}
                  </Typography>
                </Box>
              ))}
              {dayItems.length === 0 && (
                <Typography className="text-slate-400! text-sm!">Pushim</Typography>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

export default function StudentSchedulePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [approvedSchedules, setApprovedSchedules] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const view = useMemo(() => {
    if (!status) return "loading";
    if (status.hasApprovedGroup) return "schedule";
    return "groups";
  }, [status]);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Sesioni nuk eshte aktiv. Kyçu përsëri.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const raw = await getStudentScheduleOverview(userId);
      const { status: nextStatus, availableGroups: groups, approvedSchedules: schedules } =
        normalizeOverview(raw);
      setStatus(nextStatus);
      setAvailableGroups(groups);
      setApprovedSchedules(schedules);
    } catch (err) {
      setError(extractApiError(err));
      setStatus({
        hasApprovedGroup: false,
        categoryAssigned: false,
        categoryId: null,
        categoryName: null,
        approvedGroup: null,
        pendingRequest: null,
      });
      setAvailableGroups([]);
      setApprovedSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = async (directionGroupId) => {
    if (!userId || directionGroupId == null) return;
    try {
      setApplyingId(directionGroupId);
      await applyToGroup(userId, directionGroupId);
      setToast({ open: true, message: "Aplikimi u dergua me sukses!", severity: "success" });
      await load();
    } catch (err) {
      setToast({ open: true, message: extractApiError(err, "Gabim gjate aplikimit"), severity: "error" });
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <Container maxWidth="xl" className="py-8 mt-8 grow">
          <Skeleton variant="rounded" height={48} className="mb-6!" />
          <Skeleton variant="rounded" height={120} className="mb-6!" />
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={280} />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/student")}
          className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400!"
        >
          Kthehu te Paneli
        </Button>

        {error && (
          <Alert severity="error" className="mt-6 mb-4 rounded-2xl!">
            {error}
          </Alert>
        )}

        {view === "schedule" && (
          <>
            <Box className="my-8">
              <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-sky-600! dark:text-sky-400!">
                ORARI AKADEMIK
              </Typography>
              <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
                Orari im
              </Typography>
              {status?.approvedGroup?.name && (
                <Chip
                  icon={<GroupsRounded />}
                  label={`Grupi: ${status.approvedGroup.name}`}
                  className="mt-3! font-bold!"
                  color="primary"
                />
              )}
              <Typography className="text-slate-500! dark:text-slate-400! mt-2!">
                Shfaqen vetem lendet e grupit tend te aprovuar.
              </Typography>
            </Box>

            <ScheduleGrid schedules={approvedSchedules} />

            {approvedSchedules.length === 0 && !error && (
              <Alert severity="info" className="mt-6 rounded-2xl!">
                Nuk ka orare te lidhura me grupin tend. Kontakto administratorin.
              </Alert>
            )}
          </>
        )}

        {view === "groups" && (
          <>
            <Box className="my-8">
              <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-sky-600! dark:text-sky-400!">
                ZGJEDHJA E GRUPIT
              </Typography>
              <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
                Grupet e disponueshme
              </Typography>
              <Box className="flex flex-wrap gap-2 mt-3">
                {status?.categoryName && <Chip label={status.categoryName} className="font-bold!" />}
                {status?.currentSemester != null && (
                  <Chip label={`Semestri ${status.currentSemester}`} variant="outlined" className="font-bold!" />
                )}
              </Box>
              <Typography className="text-slate-500! dark:text-slate-400! mt-2!">
                Shfaqen vetem grupet per drejtimin dhe semestrin tend. Pas aprovimit, shikon vetem orarin e grupit tend.
              </Typography>
            </Box>

            {!status?.categoryAssigned && !error && (
              <Alert severity="warning" className="mb-6 rounded-2xl!">
                Drejtimi nuk eshte caktuar per llogarine tende. Kontakto administratorin.
              </Alert>
            )}

            {status?.pendingRequest && (
              <Alert severity="info" className="mb-6 rounded-2xl!">
                Ke nje aplikim ne pritje per grupin{" "}
                <strong>{status.pendingRequest.directionGroupName || "—"}</strong>.
              </Alert>
            )}

            <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {availableGroups.map((entry) => {
                const { group, schedules, canApply, applyBlockedReason } = entry;
                const isFull = group?.isFull;
                const isPending =
                  status?.pendingRequest?.directionGroupId === group?.id;

                return (
                  <Card
                    key={group.id}
                    className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70! p-6 flex flex-col"
                  >
                    <Box className="flex items-start justify-between gap-3 mb-4">
                      <Box className="flex items-center gap-3">
                        <Box className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                          <GroupsRounded className="text-sky-600 dark:text-sky-400" />
                        </Box>
                        <div>
                          <Typography className="font-black! text-slate-900! dark:text-white! text-xl!">
                            {group.name}
                          </Typography>
                          <Typography variant="body2" className="text-slate-500! dark:text-slate-400!">
                            {group.categoryName}
                          </Typography>
                        </div>
                      </Box>
                      {isFull && <Chip label="I plote" color="error" size="small" className="font-bold!" />}
                      {group?.status === "CLOSED" && (
                        <Chip label="I mbyllur" color="default" size="small" className="font-bold!" />
                      )}
                      {isPending && <Chip label="Ne pritje" color="warning" size="small" className="font-bold!" />}
                    </Box>

                    <Box className="flex gap-2 mb-4 flex-wrap">
                      <Chip
                        label={`${group.currentStudents} / ${group.maxCapacity} studente`}
                        size="small"
                        className="font-bold!"
                      />
                      <Chip
                        label={`${group.remainingSeats} vende te lira`}
                        size="small"
                        color={group.remainingSeats > 0 ? "success" : "default"}
                        className="font-bold!"
                      />
                    </Box>

                    <Typography
                      variant="subtitle2"
                      className="font-black! text-slate-700! dark:text-slate-200! mb-2! flex items-center gap-1"
                    >
                      <ScheduleRounded fontSize="small" />
                      Orari i grupit
                    </Typography>
                    <Box className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 mb-4 max-h-48 overflow-y-auto">
                      {schedules.length === 0 ? (
                        <Typography variant="body2" className="text-slate-400!">
                          Nuk ka orare te lidhura me kete grup.
                        </Typography>
                      ) : (
                        schedules.map((s) => (
                          <Box
                            key={s.id}
                            className="mb-2 last:mb-0 pb-2 last:pb-0 border-b border-slate-200/80 dark:border-slate-700/80 last:border-0"
                          >
                            <Typography variant="body2" className="font-bold! text-slate-800! dark:text-slate-100!">
                              {DAY_LABELS[s.dayOfWeek] || s.dayOfWeek} · {formatTime(s.startTime)} - {formatTime(s.endTime)}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500! dark:text-slate-400!">
                              {s.courseTitle} · {s.sessionType === "LECTURE" ? "Ligjerate" : "Ushtrime"} · {s.teacherName}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!canApply || applyingId === group.id}
                      onClick={() => handleApply(group.id)}
                      className="rounded-xl! bg-sky-600! normal-case! font-bold! py-2.5!"
                    >
                      {applyingId === group.id ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : isFull ? (
                        "Group Full"
                      ) : isPending ? (
                        "Aplikim ne pritje"
                      ) : (
                        "Apliko per kete grup"
                      )}
                    </Button>
                    {!canApply && applyBlockedReason && (
                      <Typography variant="caption" className="text-slate-500! mt-2! text-center! block!">
                        {applyBlockedReason}
                      </Typography>
                    )}
                  </Card>
                );
              })}
            </Box>

            {status?.categoryAssigned && availableGroups.length === 0 && !error && (
              <Alert severity="warning" className="mt-6 rounded-2xl!">
                Nuk ka grupe te krijuara per drejtimin tend. Kontakto administratorin.
              </Alert>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} className="rounded-xl! w-full">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
