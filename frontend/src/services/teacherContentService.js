import axiosInstance from "./axiosInstance";

const teacherContentService = {
    getStats: () => axiosInstance.get("/teacher/dashboard/stats"),
    getCourses: () => axiosInstance.get("/teacher/courses"),
    getCourseById: (id) => axiosInstance.get(`/teacher/courses/${id}`),
    updateCourse: (id, data) => axiosInstance.put(`/teacher/courses/${id}`, data),
    
    getModules: (courseId) => axiosInstance.get(`/teacher/courses/${courseId}/modules`),
    createModule: (data) => axiosInstance.post("/teacher/modules", data),
    updateModule: (id, data) => axiosInstance.put(`/teacher/modules/${id}`, data),
    deleteModule: (id) => axiosInstance.delete(`/teacher/modules/${id}`),
    
    getLessons: (moduleId) => axiosInstance.get(`/teacher/modules/${moduleId}/lessons`),
    createLesson: (data) => axiosInstance.post("/teacher/lessons", data),
    updateLesson: (id, data) => axiosInstance.put(`/teacher/lessons/${id}`, data),
    deleteLesson: (id) => axiosInstance.delete(`/teacher/lessons/${id}`),
    
    getQuizzes: (lessonId) => axiosInstance.get(`/teacher/lessons/${lessonId}/quizzes`),
    createQuiz: (data) => axiosInstance.post("/teacher/quizzes", data),
    updateQuiz: (id, data) => axiosInstance.put(`/teacher/quizzes/${id}`, data),
    deleteQuiz: (id) => axiosInstance.delete(`/teacher/quizzes/${id}`),
    
    getQuestions: (quizId) => axiosInstance.get(`/teacher/quizzes/${quizId}/questions`),
    createQuestion: (data) => axiosInstance.post("/teacher/questions", data),
    addAnswer: (questionId, data) => axiosInstance.post(`/teacher/questions/${questionId}/answers`, data),
    
    getAssignments: (lessonId) => axiosInstance.get(`/teacher/lessons/${lessonId}/assignments`),
    createAssignment: (data) => axiosInstance.post("/teacher/assignments", data),
    updateAssignment: (id, data) => axiosInstance.put(`/teacher/assignments/${id}`, data),
    deleteAssignment: (id) => axiosInstance.delete(`/teacher/assignments/${id}`),
    
    getSubmissions: (assignmentId) => axiosInstance.get(`/teacher/assignments/${assignmentId}/submissions`),
    gradeSubmission: (id, data) => axiosInstance.put(`/teacher/submissions/${id}/grade`, data),
    
    getStudents: () => axiosInstance.get("/teacher/students"),
    getStudentsByCourse: (courseId) => axiosInstance.get(`/teacher/courses/${courseId}/students`),
    
    uploadLessonFile: (lessonId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post(`/teacher/files/upload/lesson/${lessonId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    deleteLessonFile: (resourceId) => axiosInstance.delete(`/teacher/files/${resourceId}`),
};

export default teacherContentService;
