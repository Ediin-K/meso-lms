import axiosInstance from "./axiosInstance";

export const getAllSchedules = async () => {
  const response = await axiosInstance.get("/schedules");
  return response.data;
};

export const getStudentSchedules = async (userId) => {
  const response = await axiosInstance.get(`/schedules/student/${userId}`);
  return response.data;
};

export const getTeacherSchedules = async (teacherId) => {
  const response = await axiosInstance.get(`/schedules/teacher/${teacherId}`);
  return response.data;
};

export const createSchedule = async (payload) => {
  const response = await axiosInstance.post("/schedules", payload);
  return response.data;
};

export const updateSchedule = async (id, payload) => {
  const response = await axiosInstance.put(`/schedules/${id}`, payload);
  return response.data;
};

export const deleteSchedule = async (id) => {
  await axiosInstance.delete(`/schedules/${id}`);
};
