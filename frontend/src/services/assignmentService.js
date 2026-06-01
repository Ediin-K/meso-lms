import axiosInstance from './axiosInstance'

const assignmentService = {
    
    getByLesson:     (lessonId) => axiosInstance.get(`/assignments/lesson/${lessonId}`),
    getById:         (id)       => axiosInstance.get(`/assignments/${id}`),
    getMySubmission: (id)       => axiosInstance.get(`/assignments/${id}/my-submission`),
    getMySubmissions:()         => axiosInstance.get('/assignments/my-submissions'),

    submit: (id, file) => {
        const form = new FormData()
        form.append('file', file)
        return axiosInstance.post(`/assignments/${id}/submit`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    downloadAttachment: (id) =>
        axiosInstance.get(`/assignments/${id}/attachment`, { responseType: 'blob' }),

    upsertForLesson: (lessonId, deadline) =>
        axiosInstance.post(`/teacher/lessons/${lessonId}/assignment`, { deadline }),

    deleteForLesson: (lessonId) =>
        axiosInstance.delete(`/teacher/lessons/${lessonId}/assignment`),

    uploadAttachment: (lessonId, file) => {
        const form = new FormData()
        form.append('file', file)
        return axiosInstance.post(`/teacher/lessons/${lessonId}/assignment/attachment`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    removeAttachment: (lessonId) =>
        axiosInstance.delete(`/teacher/lessons/${lessonId}/assignment/attachment`),

    getSubmissions: (lessonId) =>
        axiosInstance.get(`/teacher/lessons/${lessonId}/assignment/submissions`),

    downloadSubmissionFile: (subId) =>
        axiosInstance.get(`/teacher/submissions/${subId}/file`, { responseType: 'blob' }),

    getAll: () => axiosInstance.get('/teacher/assignments'),
}

export default assignmentService
