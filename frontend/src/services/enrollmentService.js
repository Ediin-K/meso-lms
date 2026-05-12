import axiosInstance from "./axiosInstance";

const ENROLLMENT_API = "/enrollments";

export const getAllEnrollments = async () => {
  const response = await axiosInstance.get(ENROLLMENT_API);
  return response.data;
};

export const getEnrollment = async (id) => {
  const response = await axiosInstance.get(`${ENROLLMENT_API}/${id}`);
  return response.data;
};

export const createEnrollment = async (enrollment) => {
  const response = await axiosInstance.post(ENROLLMENT_API, enrollment);
  return response.data;
};

export const updateEnrollmentProgress = async (id, progresi) => {
  const response = await axiosInstance.patch(
    `${ENROLLMENT_API}/${id}/progresi`,
    null,
    {
      params: { progresi },
    },
  );
  return response.data;
};

export const updateEnrollmentStatus = async (id, statusi) => {
  const response = await axiosInstance.patch(
    `${ENROLLMENT_API}/${id}/statusi`,
    null,
    {
      params: { statusi },
    },
  );
  return response.data;
};

export const deleteEnrollment = async (id) => {
  await axiosInstance.delete(`${ENROLLMENT_API}/${id}`);
};
