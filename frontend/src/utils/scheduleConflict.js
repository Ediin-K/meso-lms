const SESSION_MINUTES = 90;

const normalizeTime = (time) => {
  if (!time) return "";
  return String(time).slice(0, 5);
};

const timeToMinutes = (time) => {
  const normalized = normalizeTime(time);
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
};

export const computeScheduleEndTime = (startTime) => {
  const normalized = normalizeTime(startTime);
  const [hours, minutes] = normalized.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + SESSION_MINUTES;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

const timesOverlap = (startA, endA, startB, endB) => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
};

const sameGroupKey = (a, b) => {
  if (a.courseId && b.courseId && a.courseId === b.courseId) return true;
  if (a.courseGroupId && b.courseGroupId && a.courseGroupId === b.courseGroupId) return true;
  return false;
};

export const getScheduleConflict = (schedules, candidate, excludeIndex = null) => {
  const candidateEnd = candidate.endTime || computeScheduleEndTime(candidate.startTime);

  for (let index = 0; index < schedules.length; index += 1) {
    const existing = schedules[index];
    if (excludeIndex != null && index === excludeIndex) continue;
    if (existing.dayOfWeek !== candidate.dayOfWeek) continue;

    const existingEnd = existing.endTime || computeScheduleEndTime(existing.startTime);
    if (!timesOverlap(existing.startTime, existingEnd, candidate.startTime, candidateEnd)) continue;

    if (sameGroupKey(existing, candidate)) return "group";
    if (existing.professorId === candidate.professorId) return "professor";
    if (candidate.assistantId && existing.assistantId === candidate.assistantId) return "assistant";
    if (candidate.assistantId && existing.professorId === candidate.assistantId) return "assistant";
    if (existing.assistantId && existing.assistantId === candidate.professorId) return "professor";
  }

  return null;
};

export const getScheduleConflictMessage = (conflict) => {
  if (conflict === "group") {
    return "This group already has a class at this time";
  }
  if (conflict === "professor") {
    return "Professor already has a class at this time";
  }
  if (conflict === "assistant") {
    return "Assistant already has a class at this time";
  }
  return null;
};
