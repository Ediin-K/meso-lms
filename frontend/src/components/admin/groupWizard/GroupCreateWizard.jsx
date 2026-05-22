import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TruncatedSelect from "./TruncatedSelect";
import ScheduleEntryCard from "./ScheduleEntryCard";
import WizardReviewPanel from "./WizardReviewPanel";
import {
  WIZARD_STEPS,
  buildStaffByCourse,
  getGroupsTheme,
  getWizardFieldSx,
  wizardFieldClass,
  wizardSurfaceClass,
  getMenuPaperSx,
} from "./wizardUi";
import { getScheduleConflict, getScheduleConflictMessage } from "../../../utils/scheduleConflict";

export default function GroupCreateWizard({
  isDark,
  wizardStep,
  wizardError,
  fieldErrors = {},
  submitting,
  contextLoading,
  categories,
  categoryId,
  setCategoryId,
  semester,
  setSemester,
  courses,
  teachers,
  groupName,
  setGroupName,
  maxCapacity,
  setMaxCapacity,
  staffRows,
  setStaffRows,
  scheduleRows,
  onScheduleChange,
  staffCourseIds,
  selectedCategory,
  onBack,
  onNext,
  onPrev,
  onSave,
  onSaveDraft,
  emptyStaffRow,
  emptyScheduleRow,
  dayOptions,
  semesters,
}) {
  const theme = getGroupsTheme(isDark);
  const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;
  const stepMeta = WIZARD_STEPS[wizardStep];

  const staffByCourse = useMemo(
    () => buildStaffByCourse(staffRows, courses, teachers),
    [staffRows, courses, teachers],
  );

  const courseOptions = useMemo(
    () => courses.map((c) => ({ value: c.id, label: c.titulli })),
    [courses],
  );

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.id, label: `${t.emri} ${t.mbiemri}`.trim() })),
    [teachers],
  );

  const scheduleCourseOptions = useMemo(
    () =>
      [...staffCourseIds]
        .map((cid) => courses.find((x) => x.id === cid))
        .filter(Boolean)
        .map((c) => ({ value: c.id, label: c.titulli })),
    [staffCourseIds, courses],
  );

  const scheduleRowErrors = useMemo(() => {
    const errors = scheduleRows.map(() => null);
    const valid = [];
    const rowIndexes = [];
    scheduleRows.forEach((row, idx) => {
      if (row.courseId && row.professorId && row.startTime) {
        rowIndexes.push(idx);
        valid.push(row);
      }
    });
    valid.forEach((row, vi) => {
      const conflict = getScheduleConflict(valid, row, vi);
      const msg = getScheduleConflictMessage(conflict);
      if (msg) errors[rowIndexes[vi]] = msg;
    });
    return errors;
  }, [scheduleRows]);

  const StepIcon = [SchoolOutlinedIcon, GroupsOutlinedIcon, GroupsOutlinedIcon, ScheduleOutlinedIcon, SaveOutlinedIcon][
    wizardStep
  ];

  return (
    <Box className="animate-fadeIn">
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={onBack}
        className="!mb-3 !rounded-xl !normal-case !font-bold"
        sx={{ color: theme.textMuted }}
      >
        Kthehu te lista
      </Button>

      <Box className={`${wizardSurfaceClass(isDark)} p-4 sm:p-5 mb-3`}>
        <Box className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <Box>
            <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
              Wizard — Krijo grup + orar
            </Typography>
            <Typography variant="h5" sx={{ color: theme.text, fontWeight: 900, mt: 0.5 }}>
              {stepMeta.group}
            </Typography>
            <Typography sx={{ color: theme.textMuted, mt: 0.5 }}>
              Hapi {wizardStep + 1} nga {WIZARD_STEPS.length}: {stepMeta.label}
            </Typography>
          </Box>
          <Chip icon={StepIcon ? <StepIcon /> : undefined} label={`${Math.round(progress)}%`} variant="outlined" />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          className="!mb-3 !h-1 !rounded-full"
          sx={{
            bgcolor: isDark ? "rgba(51,65,85,0.5)" : "rgba(226,232,240,0.9)",
            "& .MuiLinearProgress-bar": { borderRadius: 8, background: "linear-gradient(90deg, #0284c7, #6366f1)" },
          }}
        />

        <Box className="hidden md:flex flex-wrap gap-1.5 mb-3">
          {WIZARD_STEPS.map((s, i) => (
            <Chip
              key={s.id}
              size="small"
              label={`${i + 1}. ${s.label}`}
              color={i === wizardStep ? "primary" : i < wizardStep ? "success" : "default"}
              variant={i === wizardStep ? "filled" : "outlined"}
            />
          ))}
        </Box>

        {(wizardError || fieldErrors.global) && (
          <Alert severity="error" className="!mb-3 !rounded-xl">
            {wizardError || fieldErrors.global}
          </Alert>
        )}

        <Fade in key={wizardStep} timeout={220}>
          <Box>
            {wizardStep === 0 && (
              <Box>
                <Typography sx={{ color: theme.text, fontWeight: 700, mb: 2 }}>
                  Struktura akademike
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormControl fullWidth sx={getWizardFieldSx(isDark)} error={Boolean(fieldErrors.categoryId)}>
                    <InputLabel>Drejtimi</InputLabel>
                    <Select
                      label="Drejtimi"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className={wizardFieldClass()}
                      MenuProps={getMenuPaperSx(isDark)}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.emertimi}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.categoryId && (
                      <Typography variant="caption" color="error" className="!mt-1 !ml-3">
                        {fieldErrors.categoryId}
                      </Typography>
                    )}
                  </FormControl>
                  <FormControl fullWidth sx={getWizardFieldSx(isDark)}>
                    <InputLabel>Semestri</InputLabel>
                    <Select
                      label="Semestri"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className={wizardFieldClass()}
                      MenuProps={getMenuPaperSx(isDark)}
                    >
                      {semesters.map((s) => (
                        <MenuItem key={s} value={s}>
                          Semestri {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Alert severity="info" className="!mt-3 !rounded-xl">
                  {contextLoading ? (
                    <Box className="flex items-center gap-2">
                      <CircularProgress size={18} />
                      Duke ngarkuar lendet...
                    </Box>
                  ) : (
                    <>
                      <strong>{courses.length}</strong> lende per{" "}
                      <strong>{selectedCategory?.emertimi || "drejtimin"}</strong> — Semestri{" "}
                      <strong>{semester}</strong>
                    </>
                  )}
                </Alert>
              </Box>
            )}

            {wizardStep === 1 && (
              <Box>
                <Typography sx={{ color: theme.text, fontWeight: 700, mb: 2 }}>
                  Konfigurimi i grupit
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Emri i grupit (p.sh. G1)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    fullWidth
                    error={Boolean(fieldErrors.groupName)}
                    helperText={fieldErrors.groupName}
                    className={wizardFieldClass()}
                    sx={getWizardFieldSx(isDark)}
                  />
                  <TextField
                    label="Kapaciteti maksimal"
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    inputProps={{ min: 1 }}
                    fullWidth
                    error={Boolean(fieldErrors.maxCapacity)}
                    helperText={fieldErrors.maxCapacity}
                    className={wizardFieldClass()}
                    sx={getWizardFieldSx(isDark)}
                  />
                </Box>
              </Box>
            )}

            {wizardStep === 2 && (
              <Box>
                <Typography sx={{ color: theme.text, fontWeight: 700, mb: 1 }}>
                  Stafi akademik
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textMuted, mb: 2 }}>
                  Caktoni profesorin dhe asistentin per cdo lende. Orari ne hapin tjeter do te perdor kete staf
                  automatikisht.
                </Typography>
                {fieldErrors.staff && (
                  <Typography variant="caption" color="error" className="!mb-2 block">
                    {fieldErrors.staff}
                  </Typography>
                )}
                <Box className="flex flex-col gap-2">
                  {staffRows.map((row, idx) => (
                    <Box
                      key={idx}
                      className="rounded-xl border p-3"
                      sx={{ borderColor: theme.border, bgcolor: theme.surface }}
                    >
                      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-start">
                        <TruncatedSelect
                          label="Lenda"
                          value={row.courseId}
                          onChange={(e) =>
                            setStaffRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, courseId: e.target.value } : r)),
                            )
                          }
                          options={courseOptions}
                          isDark={isDark}
                          maxLabelLen={40}
                        />
                        <TruncatedSelect
                          label="Profesori"
                          value={row.professorId}
                          onChange={(e) =>
                            setStaffRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, professorId: e.target.value } : r)),
                            )
                          }
                          options={teacherOptions}
                          isDark={isDark}
                        />
                        <TruncatedSelect
                          label="Asistenti (opsional)"
                          value={row.assistantId}
                          onChange={(e) =>
                            setStaffRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, assistantId: e.target.value } : r)),
                            )
                          }
                          options={teacherOptions}
                          emptyOption="—"
                          isDark={isDark}
                        />
                        <Box className="flex justify-end sm:justify-center pt-1">
                          <IconButton
                            color="error"
                            onClick={() => setStaffRows((rows) => rows.filter((_, i) => i !== idx))}
                            disabled={staffRows.length === 1}
                          >
                            <DeleteRounded />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button
                  startIcon={<AddRounded />}
                  onClick={() => setStaffRows((rows) => [...rows, emptyStaffRow()])}
                  className="!mt-3 !rounded-xl !normal-case !font-bold"
                  variant="outlined"
                >
                  Shto staf
                </Button>
              </Box>
            )}

            {wizardStep === 3 && (
              <Box>
                <Typography sx={{ color: theme.text, fontWeight: 700, mb: 1 }}>
                  Ndertuesi i orarit
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textMuted, mb: 2 }}>
                  Zgjidhni lenden, llojin e sesionit, diten, oren dhe sallen. Profesori dhe asistenti vijne nga
                  stafi i caktuar — nuk duhet te perseriten.
                </Typography>
                {fieldErrors.schedules && (
                  <Typography variant="caption" color="error" className="!mb-2 block">
                    {fieldErrors.schedules}
                  </Typography>
                )}
                <Box className="flex flex-col gap-2">
                  {scheduleRows.map((row, idx) => (
                    <ScheduleEntryCard
                      key={idx}
                      row={row}
                      index={idx}
                      isDark={isDark}
                      courseOptions={scheduleCourseOptions}
                      staffForCourse={staffByCourse[String(row.courseId)]}
                      dayOptions={dayOptions}
                      onChange={onScheduleChange}
                      onRemove={(i) => onScheduleChange(i, "_remove", null)}
                      canRemove={scheduleRows.length > 1}
                      rowError={scheduleRowErrors[idx]}
                    />
                  ))}
                </Box>
                <Button
                  startIcon={<AddRounded />}
                  onClick={() => onScheduleChange(-1, "_add", emptyScheduleRow())}
                  className="!mt-3 !rounded-xl !normal-case !font-bold"
                  variant="outlined"
                  disabled={scheduleCourseOptions.length === 0}
                >
                  Shto sesion orari
                </Button>
              </Box>
            )}

            {wizardStep === 4 && (
              <WizardReviewPanel
                isDark={isDark}
                selectedCategory={selectedCategory}
                semester={semester}
                groupName={groupName}
                maxCapacity={maxCapacity}
                staffRows={staffRows}
                scheduleRows={scheduleRows}
                staffByCourse={staffByCourse}
                courses={courses}
              />
            )}
          </Box>
        </Fade>
      </Box>

      <Box className="flex flex-col-reverse sm:flex-row justify-between gap-2">
        <Box className="flex gap-2">
          <Button disabled={wizardStep === 0 || submitting} onClick={onPrev} variant="outlined" className="!rounded-xl">
            Mbrapa
          </Button>
          {onSaveDraft && (
            <Button onClick={onSaveDraft} disabled={submitting} startIcon={<SaveOutlinedIcon />} variant="text">
              Ruaj draft
            </Button>
          )}
        </Box>
        {wizardStep < WIZARD_STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={contextLoading && wizardStep === 0}
            className="!rounded-xl !bg-sky-600"
          >
            Vazhdo
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onSave}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            className="!rounded-xl !bg-emerald-600"
          >
            {submitting ? "Duke ruajtur..." : "Ruaj grupin"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
