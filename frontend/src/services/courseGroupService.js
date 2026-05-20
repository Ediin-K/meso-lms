import axiosInstance from "./axiosInstance";

export const getCourseGroups = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}/groups`);
  return response.data;
};

export const createCourseGroup = async (courseId, payload) => {
  const response = await axiosInstance.post(`/courses/${courseId}/groups`, payload);
  return response.data;
};

export const updateCourseGroup = async (groupId, payload) => {
  const response = await axiosInstance.put(`/course-groups/${groupId}`, payload);
  return response.data;
};

export const deleteCourseGroup = async (groupId) => {
  await axiosInstance.delete(`/course-groups/${groupId}`);
};

export const createCourseSubgroup = async (groupId, payload) => {
  const response = await axiosInstance.post(`/course-groups/${groupId}/subgroups`, payload);
  return response.data;
};

export const updateCourseSubgroup = async (subgroupId, payload) => {
  const response = await axiosInstance.put(`/course-subgroups/${subgroupId}`, payload);
  return response.data;
};

export const deleteCourseSubgroup = async (subgroupId) => {
  await axiosInstance.delete(`/course-subgroups/${subgroupId}`);
};
