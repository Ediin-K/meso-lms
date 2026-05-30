import axiosInstance from './axiosInstance'

export const getStudentProfile = async (userId) => {
  const { data } = await axiosInstance.get(`/student/${userId}/profile`)
  return data
}

export const updateStudentProfile = async (userId, payload) => {
  const { data } = await axiosInstance.patch(`/student/${userId}/profile`, payload)
  return data
}

export const changePassword = async (userId, payload) => {
  const { data } = await axiosInstance.post(`/student/${userId}/change-password`, payload)
  return data
}

export const getStudentEnrollments = async (userId) => {
  const { data } = await axiosInstance.get(`/enrollments/user/${userId}`)
  return data
}

export const getStudentCertificates = async (userId) => {
  const { data } = await axiosInstance.get(`/certificates/user/${userId}`)
  return data
}

export const getStudentAssignmentSubmissions = async (userId) => {
  const { data } = await axiosInstance.get(`/assignments/submissions/student/${userId}`)
  return data
}

export const getMyQuizAttempts = async () => {
  const { data } = await axiosInstance.get('/quizzes/attempts/my')
  return data
}
