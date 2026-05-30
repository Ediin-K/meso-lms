import axiosInstance from "./axiosInstance";

const quizService = {
  listActive: () => axiosInstance.get("/quizzes"),
  getPublishedByLesson: (lessonId) => axiosInstance.get(`/quizzes/lesson/${lessonId}`),
  start: (quizId) => axiosInstance.post(`/quizzes/${quizId}/start`),
  submit: (quizId, payload) => axiosInstance.post(`/quizzes/${quizId}/submit`, payload),
  abandon: (quizId, attemptId) => axiosInstance.post(`/quizzes/${quizId}/abandon/${attemptId}`),

  create: (payload) => axiosInstance.post("/teacher/quizzes", payload),
  getTeacherLessonQuizzes: (lessonId) => axiosInstance.get(`/teacher/lessons/${lessonId}/quizzes`),
  activate: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/activate`),
  close: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/close`),
  publish: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/publish`),
  getResults: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/results`),
  getAllAttempts: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/all-attempts`),
  deleteQuiz: (quizId) => axiosInstance.delete(`/teacher/quizzes/${quizId}`),
};

export default quizService;
