import axiosInstance from "./axiosInstance";

const quizService = {
  listPublished: () => axiosInstance.get("/quizzes"),
  getPublishedByLesson: (lessonId) => axiosInstance.get(`/quizzes/lesson/${lessonId}`),
  start: (quizId) => axiosInstance.post(`/quizzes/${quizId}/start`),
  submit: (quizId, payload) => axiosInstance.post(`/quizzes/${quizId}/submit`, payload),

  create: (payload) => axiosInstance.post("/quizzes", payload),
  getTeacherLessonQuizzes: (lessonId) => axiosInstance.get(`/teacher/lessons/${lessonId}/quizzes`),
  publish: (quizId) => axiosInstance.post(`/teacher/quizzes/${quizId}/publish`),
  getResults: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/results`),
};

export default quizService;
