import axiosInstance from "./axiosInstance";

const quizService = {
  listActive: () => axiosInstance.get("/quizzes"),
  getPublishedByLesson: (lessonId) => axiosInstance.get(`/quizzes/lesson/${lessonId}`),
  getMyAttempt: (quizId) => axiosInstance.get(`/quizzes/${quizId}/my-attempt`),
  start: (quizId) => axiosInstance.post(`/quizzes/${quizId}/start`),
  submit: (quizId, payload) => axiosInstance.post(`/quizzes/${quizId}/submit`, payload),

  create: (payload) => axiosInstance.post("/teacher/quizzes", payload),
  update: (quizId, payload) => axiosInstance.put(`/teacher/quizzes/${quizId}`, payload),
  getTeacherLessonQuizzes: (lessonId) => axiosInstance.get(`/teacher/lessons/${lessonId}/quizzes`),
  getQuestions: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/questions`),
  activate: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/activate`),
  close: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/close`),
  getResults: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/results`),
  getAllAttempts: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/all-attempts`),
  deleteQuiz: (quizId) => axiosInstance.delete(`/teacher/quizzes/${quizId}`),
};

export default quizService;
