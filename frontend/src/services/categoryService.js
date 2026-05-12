import axiosInstance from "./axiosInstance";

const CATEGORY_API = "/categories";

export const getAllCategories = async () => {
  const response = await axiosInstance.get(CATEGORY_API);
  return response.data;
};

export const getCategory = async (id) => {
  const response = await axiosInstance.get(`${CATEGORY_API}/${id}`);
  return response.data;
};

export const createCategory = async (category) => {
  const response = await axiosInstance.post(CATEGORY_API, category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await axiosInstance.put(`${CATEGORY_API}/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`${CATEGORY_API}/${id}`);
};
