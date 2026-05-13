import axiosInstance from "./axiosInstance";

const TEACHER_API = "/admin/teachers";

export const getAllTeachers = async () => {
  const response = await axiosInstance.get(TEACHER_API);
  return response.data;
};

export const getTeacher = async (id) => {
  const response = await axiosInstance.get(`${TEACHER_API}/${id}`);
  return response.data;
};

export const createTeacher = async (teacher) => {
  const response = await axiosInstance.post(TEACHER_API, teacher);
  return response.data;
};

export const updateTeacher = async (id, teacher) => {
  const response = await axiosInstance.put(`${TEACHER_API}/${id}`, teacher);
  return response.data;
};

export const deleteTeacher = async (id) => {
  await axiosInstance.delete(`${TEACHER_API}/${id}`);
};

export const searchTeachers = async (term) => {
  const response = await axiosInstance.get(`${TEACHER_API}/search`, {
    params: { term },
  });
  return response.data;
};

export const assignTeacherToCourse = async (assignRequest) => {
  await axiosInstance.post(`${TEACHER_API}/assign-course`, assignRequest);
};
