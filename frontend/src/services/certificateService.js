import axiosInstance from "./axiosInstance";

const CERTIFICATE_API = "/certificates";

export const getAllCertificates = async () => {
  const response = await axiosInstance.get(CERTIFICATE_API);
  return response.data;
};

export const getCertificate = async (id) => {
  const response = await axiosInstance.get(`${CERTIFICATE_API}/${id}`);
  return response.data;
};

export const createCertificate = async (certificate) => {
  const response = await axiosInstance.post(CERTIFICATE_API, certificate);
  return response.data;
};

export const deleteCertificate = async (id) => {
  await axiosInstance.delete(`${CERTIFICATE_API}/${id}`);
};
