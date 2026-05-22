import axiosInstance from "./axiosInstance";

export const getDirectionGroups = async (categoryId, semester) => {
  const params = semester != null ? { semester } : {};
  const response = await axiosInstance.get(`/categories/${categoryId}/direction-groups`, { params });
  return response.data;
};

export const getWizardContext = async (categoryId, semester) => {
  const response = await axiosInstance.get("/admin/direction-groups/wizard/context", {
    params: { categoryId, semester },
  });
  return response.data;
};

export const createGroupWizard = async (payload) => {
  const response = await axiosInstance.post("/admin/direction-groups/wizard", payload);
  return response.data;
};

export const getDirectionGroupDetail = async (directionGroupId) => {
  const response = await axiosInstance.get(`/admin/direction-groups/${directionGroupId}/detail`);
  return response.data;
};

export const updateDirectionGroup = async (groupId, payload) => {
  const response = await axiosInstance.put(`/direction-groups/${groupId}`, payload);
  return response.data;
};

export const deleteDirectionGroup = async (groupId) => {
  await axiosInstance.delete(`/direction-groups/${groupId}`);
};

export const getDirectionGroupMembers = async (groupId) => {
  const response = await axiosInstance.get(`/direction-groups/${groupId}/students`);
  return response.data;
};

export const GROUP_STATUS = {
  ACTIVE: "ACTIVE",
  FULL: "FULL",
  CLOSED: "CLOSED",
};

export const statusChipColor = (status) => {
  if (status === GROUP_STATUS.FULL) return "warning";
  if (status === GROUP_STATUS.CLOSED) return "default";
  return "success";
};
