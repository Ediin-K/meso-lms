import axiosInstance from "./axiosInstance";

export const getStudentScheduleOverview = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/schedule-overview`);
  return response.data;
};

export const getStudentGroupStatus = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/groups/status`);
  return response.data;
};

export const getAvailableGroups = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/groups/available`);
  return response.data;
};

export const applyToGroup = async (userId, directionGroupId) => {
  const response = await axiosInstance.post(`/student/${userId}/groups/apply`, { directionGroupId });
  return response.data;
};

export const selectGroup = async (userId, directionGroupId) => {
  const response = await axiosInstance.post(`/student/${userId}/groups/select`, { directionGroupId });
  return response.data;
};

export const getAdminGroupRequests = async (params = {}) => {
  const response = await axiosInstance.get("/admin/group-requests", { params });
  return response.data;
};

export const approveGroupRequest = async (requestId) => {
  const response = await axiosInstance.post(`/admin/group-requests/${requestId}/approve`);
  return response.data;
};

export const rejectGroupRequest = async (requestId) => {
  const response = await axiosInstance.post(`/admin/group-requests/${requestId}/reject`);
  return response.data;
};

export const assignStudentToGroup = async (userId, directionGroupId) => {
  const response = await axiosInstance.post(`/admin/students/${userId}/assign-group`, {
    directionGroupId,
  });
  return response.data;
};

export const removeStudentFromGroup = async (userId) => {
  await axiosInstance.delete(`/admin/students/${userId}/assign-group`);
};
