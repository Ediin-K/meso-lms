export const DAY_LABELS = {
  MONDAY: "E Hene",
  TUESDAY: "E Marte",
  WEDNESDAY: "E Merkure",
  THURSDAY: "E Enjte",
  FRIDAY: "E Premte",
  SATURDAY: "E Shtune",
  SUNDAY: "E Diele",
};

export const extractApiError = (err, fallback = "Gabim gjate ngarkimit") => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
};

export const normalizeStatus = (raw) => {
  if (!raw || typeof raw !== "object") {
    return {
      hasApprovedGroup: false,
      categoryAssigned: false,
      categoryId: null,
      categoryName: null,
      approvedGroup: null,
      pendingRequest: null,
    };
  }
  return {
    hasApprovedGroup: Boolean(raw.hasApprovedGroup),
    categoryAssigned: Boolean(raw.categoryAssigned),
    categoryId: raw.categoryId ?? null,
    categoryName: raw.categoryName ?? null,
    approvedGroup: raw.approvedGroup ?? null,
    pendingRequest: raw.pendingRequest ?? null,
    currentSemester: raw.currentSemester ?? null,
  };
};

export const normalizeSchedule = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id;
  if (id == null) return null;
  return {
    id,
    dayOfWeek: raw.dayOfWeek ?? "",
    startTime: raw.startTime ?? "",
    endTime: raw.endTime ?? "",
    courseTitle: raw.courseTitle ?? "Lende",
    sessionType: raw.sessionType ?? "LECTURE",
    courseGroupName: raw.courseGroupName ?? null,
    courseSubgroupName: raw.courseSubgroupName ?? null,
    teacherName: raw.teacherName ?? "",
    room: raw.room ?? "",
    color: raw.color ?? "sky",
  };
};

export const normalizeAvailableGroup = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const groupSource = raw.group ?? raw;
  const groupId = groupSource?.id ?? raw.id;
  if (groupId == null) return null;

  const schedules = Array.isArray(raw.schedules)
    ? raw.schedules.map(normalizeSchedule).filter(Boolean)
    : [];

  return {
    group: {
      id: groupId,
      name: groupSource?.name ?? "Grup",
      description: groupSource?.description ?? "",
      categoryName: groupSource?.categoryName ?? "",
      status: groupSource?.status ?? "ACTIVE",
      maxCapacity: Number(groupSource?.maxCapacity ?? 0),
      currentStudents: Number(groupSource?.currentStudents ?? 0),
      remainingSeats: Number(groupSource?.remainingSeats ?? 0),
      isFull: Boolean(groupSource?.isFull),
    },
    schedules,
    canApply: Boolean(raw.canApply),
    applyBlockedReason: raw.applyBlockedReason ?? null,
  };
};

export const normalizeOverview = (raw) => {
  const status = normalizeStatus(raw?.status);
  const availableGroups = Array.isArray(raw?.availableGroups)
    ? raw.availableGroups.map(normalizeAvailableGroup).filter(Boolean)
    : [];
  const approvedSchedules = Array.isArray(raw?.approvedSchedules)
    ? raw.approvedSchedules.map(normalizeSchedule).filter(Boolean)
    : [];

  return { status, availableGroups, approvedSchedules };
};

export const formatTime = (time) => {
  if (time == null) return "";
  return String(time).slice(0, 5);
};
