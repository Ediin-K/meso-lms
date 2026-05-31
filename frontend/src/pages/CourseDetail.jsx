import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import { useAppPreferences } from '../context/appPreferencesContext'
import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, Button, CircularProgress, Card, CardContent
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import LibraryBooksRounded from '@mui/icons-material/LibraryBooksRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded'
import LockRounded from '@mui/icons-material/LockRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'
import AttachFileRounded from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded'
import ImageRounded from '@mui/icons-material/ImageRounded'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import DescriptionRounded from '@mui/icons-material/DescriptionRounded'
import QuizRounded from '@mui/icons-material/QuizRounded'
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded'
import teacherContentService from '../services/teacherContentService'
import { downloadResource, openResourcePreview } from '../services/resourceService'
import { getCourseGroups } from '../services/courseGroupService'
import FileUpload from '../components/common/FileUpload'
import LessonQuizCard from '../components/quiz/LessonQuizCard'
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    FormControl, InputLabel, Select, Tooltip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
    Radio, Checkbox, FormControlLabel, TableContainer, Chip, Snackbar, Alert, Zoom
} from '@mui/material'

function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function resourceIcon(type) {
    if (type === 'PDF') return PictureAsPdfRounded
    if (type === 'IMAGE') return ImageRounded
    if (type === 'VIDEO') return VideocamRounded
    if (type === 'DOCUMENT' || type === 'PRESENTATION' || type === 'SPREADSHEET') return DescriptionRounded
    return AttachFileRounded
}

function LearningResourceCard({ resource, isOwner, isDark, onPreview, onDownload, onDelete }) {
    const Icon = resourceIcon(resource.resourceType)
    const text = isDark ? '#f8fafc' : '#0f172a'
    const muted = isDark ? '#cbd5e1' : '#64748b'
    const border = isDark ? '#334155' : '#e2e8f0'
    const surface = isDark ? '#0f172a' : '#f8fafc'

    return (
        <Box
            className="rounded-2xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3"
            sx={{ borderColor: border, bgcolor: surface, color: text }}
        >
            <Box
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                sx={{ bgcolor: isDark ? 'rgba(125,211,252,0.14)' : 'rgba(14,165,233,0.10)' }}
            >
                <Icon sx={{ color: isDark ? '#bae6fd' : '#0369a1' }} />
            </Box>
            <Box className="min-w-0 flex-1">
                <Typography sx={{ color: text, fontWeight: 800 }} noWrap title={resource.emriOrigjinal}>
                    {resource.emriOrigjinal}
                </Typography>
                <Box className="flex flex-wrap gap-1 mt-1">
                    <Chip
                        size="small"
                        label={resource.resourceType || 'FILE'}
                        variant="outlined"
                        sx={{ color: muted, borderColor: border, height: 22 }}
                    />
                    {resource.madhesia != null && (
                        <Typography variant="caption" sx={{ color: muted, alignSelf: 'center' }}>
                            {formatFileSize(resource.madhesia)}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box className="flex items-center gap-1 sm:justify-end">
                {resource.previewable && (
                    <Tooltip title="Hap preview">
                        <IconButton size="small" onClick={() => onPreview(resource)} sx={{ color: isDark ? '#bae6fd' : '#0369a1' }}>
                            <VisibilityRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Shkarko">
                    <IconButton size="small" onClick={() => onDownload(resource)} sx={{ color: text }}>
                        <FileDownloadRounded fontSize="small" />
                    </IconButton>
                </Tooltip>
                {isOwner && (
                    <Tooltip title="Fshi materialin">
                        <IconButton size="small" onClick={() => onDelete(resource.id)} color="error">
                            <DeleteRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    )
}

export default function CourseDetail() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [lessons, setLessons] = useState({})
    const [expandedModule, setExpandedModule] = useState(null)
    const { role, mode } = useAppPreferences()
    const isDark = mode === 'dark'
    const [loading, setLoading] = useState(true)
    const [isEnrolled, setIsEnrolled] = useState(false)

    // Deletion & Toast States
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [enrollmentKey, setEnrollmentKey] = useState('')
    const [courseGroups, setCourseGroups] = useState([])
    const [selectedGroupId, setSelectedGroupId] = useState('')
    const [selectedSubgroupId, setSelectedSubgroupId] = useState('')
    const [enrollError, setEnrollError] = useState('')
    const userId = localStorage.getItem('userId')
    const [isOwner, setIsOwner] = useState(false)

    // Management State
    const [moduleModal, setModuleModal] = useState({ open: false, editing: null })
    const [lessonModal, setLessonModal] = useState({ open: false, editing: null, moduleId: null })
    const [moduleForm, setModuleForm] = useState({ titulli: '', pershkrimi: '', rradhitja: 1 })
    const [lessonForm, setLessonForm] = useState({ titulli: '', permbajtja: '', lloji: 'TEKST', videoUrl: '', resourceUrl: '', rradhitja: 1 })
    const [uploading, setUploading] = useState(false)
    const [pendingFiles, setPendingFiles] = useState([])
    const [menuAnchor, setMenuAnchor] = useState({ el: null, type: null, id: null })

    // Assignment Management State
    const [submissionsModal, setSubmissionsModal] = useState({ open: false, assignmentId: null })
    const [submissions, setSubmissions] = useState([])
    const [gradingModal, setGradingModal] = useState({ open: false, submissionId: null, nota: 0, feedback: '' })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [courseRes, modulesRes, enrollmentRes, groupsRes] = await Promise.all([
                    axiosInstance.get(`/courses/${courseId}`),
                    axiosInstance.get(`/courses/${courseId}/modules`),
                    axiosInstance.get(`/enrollments/user/${userId}`),
                    getCourseGroups(courseId)
                ])
                setCourse(courseRes.data)
                setModules(modulesRes.data)
                setCourseGroups(groupsRes)

                const owner = role === 'teacher' && courseRes.data.teacherId === Number(userId)
                setIsOwner(owner)

                const enrolled = enrollmentRes.data.some(e => e.courseId === Number(courseId))
                setIsEnrolled(enrolled || owner)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId, userId])

    const handleEnroll = async () => {
        try {
            setEnrolling(true)
            setEnrollError('')
            await axiosInstance.post('/enrollments', {
                userId: Number(userId),
                courseId: Number(courseId),
                courseGroupId: selectedGroupId ? Number(selectedGroupId) : undefined,
                courseSubgroupId: selectedSubgroupId ? Number(selectedSubgroupId) : undefined,
                enrollmentKey: enrollmentKey
            })
            setIsEnrolled(true)
            setShowModal(false)
        } catch (err) {
            console.error(err)
            setEnrollError('Kodi i regjistrimit është i gabuar')
        } finally {
            setEnrolling(false)
        }
    }

    const selectedGroup = courseGroups.find(group => group.id === Number(selectedGroupId))
    const availableSubgroups = selectedGroup?.subgroups || []

    const toggleModule = async (moduleId) => {
        if (!isEnrolled) return
        if (expandedModule === moduleId) {
            setExpandedModule(null)
            return
        }
        setExpandedModule(moduleId)
        if (!lessons[moduleId]) {
            try {
                const res = await axiosInstance.get(`/modules/${moduleId}/lessons`)
                setLessons(prev => ({ ...prev, [moduleId]: res.data }))
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleModuleSubmit = async () => {
        try {
            if (moduleModal.editing) {
                await teacherContentService.updateModule(moduleModal.editing, moduleForm)
            } else {
                await teacherContentService.createModule({ ...moduleForm, courseId: Number(courseId) })
            }
            const res = await axiosInstance.get(`/courses/${courseId}/modules`)
            setModules(res.data)
            setSnackbarMessage(moduleModal.editing ? "Moduli u përditësua me sukses." : "Moduli u krijua me sukses.")
            setOpenSnackbar(true)
            setModuleModal({ open: false, editing: null })
        } catch (err) { console.error(err) }
    }

    const handleLessonSubmit = async () => {
        try {
            let lessonId = lessonModal.editing
            if (lessonModal.editing) {
                await teacherContentService.updateLesson(lessonModal.editing, lessonForm)
            } else {
                const created = await teacherContentService.createLesson({ ...lessonForm, moduleId: lessonModal.moduleId })
                lessonId = created.data.id
                // Upload pending files for new lesson
                if (pendingFiles.length > 0) {
                    setUploading(true)
                    for (const file of pendingFiles) {
                        try {
                            await teacherContentService.uploadLessonFile(lessonId, file)
                        } catch (err) {
                            console.error("Gabim në ngarkimin e skedarit:", file.name, err)
                        }
                    }
                    setUploading(false)
                    setPendingFiles([])
                }
            }
            const res = await axiosInstance.get(`/modules/${lessonModal.moduleId}/lessons`)
            setLessons(prev => ({ ...prev, [lessonModal.moduleId]: res.data }))
            setSnackbarMessage(lessonModal.editing ? "Leksioni u përditësua me sukses." : "Leksioni u krijua me sukses.")
            setOpenSnackbar(true)
            setLessonModal({ open: false, editing: null, moduleId: null })
        } catch (err) { console.error(err) }
    }

    const handleOpenDeleteModule = (mod) => {
        setDeleteTarget({ type: 'module', data: mod })
        setOpenDeleteConfirm(true)
    }

    const handleOpenDeleteLesson = (lesson, moduleId) => {
        setDeleteTarget({ type: 'lesson', data: lesson, moduleId })
        setOpenDeleteConfirm(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        try {
            if (deleteTarget.type === 'module') {
                await teacherContentService.deleteModule(deleteTarget.data.id)
                setModules(prev => prev.filter(m => m.id !== deleteTarget.data.id))
                setSnackbarMessage("Moduli u fshi me sukses.")
            } else {
                await teacherContentService.deleteLesson(deleteTarget.data.id)
                setLessons(prev => ({
                    ...prev,
                    [deleteTarget.moduleId]: prev[deleteTarget.moduleId].filter(l => l.id !== deleteTarget.data.id)
                }))
                setSnackbarMessage("Leksioni u fshi me sukses.")
            }
            setOpenSnackbar(true)
            setDeleteTarget(null)
            setOpenDeleteConfirm(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleFileUpload = async (files) => {
        setUploading(true)
        let successCount = 0;
        let failCount = 0;
        try {
            for (const file of files) {
                try {
                    await teacherContentService.uploadLessonFile(lessonModal.editing, file)
                    successCount++;
                } catch (err) {
                    console.error("Gabim në ngarkimin e skedarit:", file.name, err);
                    failCount++;
                }
            }
            // Refresh lessons to show new file(s)
            const res = await axiosInstance.get(`/modules/${lessonModal.moduleId}/lessons`)
            setLessons(prev => ({ ...prev, [lessonModal.moduleId]: res.data }))

            if (failCount === 0) {
                setSnackbarMessage(`${successCount} skedar(ë) u ngarkuan me sukses.`)
            } else if (successCount > 0) {
                setSnackbarMessage(`${successCount} u ngarkuan, ${failCount} dështuan (ndoshta format i palejuar).`)
            } else {
                setSnackbarMessage(`Ngarkimi dështoi për të gjithë ${failCount} skedarët.`)
            }
            setOpenSnackbar(true)
        } catch (err) { console.error(err) }
        finally { setUploading(false) }
    }

    const deleteFile = async (resourceId, moduleId) => {
        if (!window.confirm("A jeni të sigurt?")) return
        try {
            await teacherContentService.deleteLessonFile(resourceId)
            const res = await axiosInstance.get(`/modules/${moduleId}/lessons`)
            setLessons(prev => ({ ...prev, [moduleId]: res.data }))
            setSnackbarMessage("Skedari u fshi me sukses.")
            setOpenSnackbar(true)
        } catch (err) { console.error(err) }
    }

    const handlePreviewResource = async (resource) => {
        try {
            await openResourcePreview(resource)
        } catch (err) {
            console.error(err)
            setSnackbarMessage("Preview nuk u hap. Provo ta shkarkosh materialin.")
            setOpenSnackbar(true)
        }
    }

    const handleDownloadResource = async (resource) => {
        try {
            await downloadResource(resource)
        } catch (err) {
            console.error(err)
            setSnackbarMessage("Shkarkimi deshtoi. Kontrollo lidhjen ose provo perseri.")
            setOpenSnackbar(true)
        }
    }

    // --- ASSIGNMENT HANDLERS ---
    const handleOpenSubmissions = async (lessonId) => {
        try {
            const res = await teacherContentService.getAssignments(lessonId);
            if (res.data.length > 0) {
                const assignmentId = res.data[0].id;
                const subsRes = await teacherContentService.getSubmissions(assignmentId);
                setSubmissions(subsRes.data);
                setSubmissionsModal({ open: true, assignmentId });
            } else {
                // Auto-create assignment
                const newAss = await teacherContentService.createAssignment({ lessonId, titulli: "Detyrë", pershkrimi: "", afatiFundit: new Date(Date.now() + 7*24*60*60*1000).toISOString() });
                setSubmissions([]);
                setSubmissionsModal({ open: true, assignmentId: newAss.data.id });
            }
        } catch (err) { console.error(err); }
    }

    const handleGrade = async () => {
        try {
            await teacherContentService.gradeSubmission(gradingModal.submissionId, { nota: gradingModal.nota, statusi: 'GRADED' });
            const res = await teacherContentService.getSubmissions(submissionsModal.assignmentId);
            setSubmissions(res.data);
            setSnackbarMessage("Vlerësimi u ruajt me sukses.")
            setOpenSnackbar(true)
            setGradingModal({ open: false, submissionId: null, nota: 0, feedback: '' });
        } catch (err) { console.error(err); }
    }

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="text-sky-500!" />
            </Box>
        )
    }

    if (!course) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography variant="h5" className="text-slate-800! dark:text-white!">
                    {t('course.notFound')}
                </Typography>
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="mt-4! normal-case! text-sky-600!"
                >
                    {t('course.backToHome')}
                </Button>
            </Container>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* BACK */}
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="mb-8! normal-case! text-slate-600! dark:text-slate-400! hover:bg-sky-50! dark:hover:bg-slate-800/50! rounded-full! px-4! py-2!"
                >
                    {t('course.backToSubjects')}
                </Button>

                {/* HEADER */}
                <Box className="mb-8">
                    <Typography variant="overline" className="font-bold! tracking-widest! text-sky-600! dark:text-sky-400!">
                        {course.categoryName}
                    </Typography>
                    <Typography variant="h3" component="h1" className="mt-1! font-extrabold! text-slate-900! dark:text-white!">
                        {course.titulli}
                    </Typography>
                    <Typography variant="body1" className="mt-3! max-w-2xl! text-slate-600! dark:text-slate-400!">
                        {course.pershkrimi}
                    </Typography>
                    <div className="mt-4 flex flex-wrap gap-4">
                        <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                            👨‍🏫 {course.teacherName}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            📚 Semestri {course.semester}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            📊 {course.niveli}
                        </span>
                    </div>
                </Box>

                {/* ENROLLMENT BANNER */}
                {!isEnrolled && (
                    <Card elevation={0} className="rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-700/40! dark:bg-amber-900/10! mb-6">
                        <CardContent className="p-5! flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <Typography variant="subtitle1" className="font-bold! text-amber-800! dark:text-amber-300!">
                                    Nuk je i regjistruar në këtë kurs
                                </Typography>
                                <Typography variant="body2" className="text-amber-700! dark:text-amber-400!">
                                    Fut kodin e regjistrimit për të pasur qasje
                                </Typography>
                            </div>
                            <Button
                                variant="contained"
                                onClick={() => setShowModal(true)}
                                className="normal-case! rounded-full! bg-amber-500! hover:bg-amber-600! px-6!"
                            >
                                Regjistrohu
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* MODULES HEADER */}
                <Box className="flex items-center justify-between mb-6">
                    <Typography variant="h5" className="font-bold! text-slate-900! dark:text-white!">
                        Përmbajtja e Kursit
                    </Typography>
                    {isOwner && (
                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            onClick={() => {
                                setModuleForm({ titulli: '', pershkrimi: '', rradhitja: modules.length + 1 })
                                setModuleModal({ open: true, editing: null })
                            }}
                            className="rounded-full! bg-sky-600! normal-case!"
                        >
                            Shto Modul
                        </Button>
                    )}
                </Box>

                {/* MODULES */}
                {!isEnrolled ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <LockRounded className="text-6xl! text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="font-bold! text-slate-800! dark:text-slate-200!">
                            Regjistrohu për të parë modulet
                        </Typography>
                        <Typography variant="body2" className="mt-2! text-slate-500! dark:text-slate-400!">
                            Fut kodin e regjistrimit për të pasur qasje në përmbajtje
                        </Typography>
                    </Box>
                ) : modules.length === 0 ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <LibraryBooksRounded className="text-6xl! text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="font-bold! text-slate-800! dark:text-slate-200!">
                            Nuk ka module në këtë kurs
                        </Typography>
                    </Box>
                ) : (
                    <div className="flex flex-col gap-4">
                        {modules.map((module, index) => (
                            <Card
                                key={module.id}
                                elevation={0}
                                className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900/50! dark:border-slate-700/80! overflow-hidden"
                            >
                                <Box
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => toggleModule(module.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <Typography variant="subtitle1" className="font-bold! text-slate-900! dark:text-white!">
                                                {module.titulli}
                                            </Typography>
                                            <Typography variant="caption" className="text-slate-500! dark:text-slate-400!">
                                                {module.pershkrimi}
                                            </Typography>
                                        </div>
                                    </div>
                                    {isOwner ? (
                                        <div className="flex items-center gap-1">
                                            <IconButton size="small" onClick={(e) => {
                                                e.stopPropagation()
                                                setModuleForm({ titulli: module.titulli, pershkrimi: module.pershkrimi, rradhitja: module.rradhitja })
                                                setModuleModal({ open: true, editing: module.id })
                                            }}>
                                                <EditRounded fontSize="small" className="text-slate-400" />
                                            </IconButton>
                                            <IconButton size="small" onClick={(e) => {
                                                 e.stopPropagation()
                                                 handleOpenDeleteModule(module)
                                             }}>
                                                <DeleteRounded fontSize="small" className="text-red-400" />
                                            </IconButton>
                                            {expandedModule === module.id
                                                ? <ExpandLessRounded className="text-sky-600" />
                                                : <ExpandMoreRounded className="text-slate-400" />
                                            }
                                        </div>
                                    ) : (
                                        expandedModule === module.id
                                            ? <ExpandLessRounded className="text-sky-600" />
                                            : <ExpandMoreRounded className="text-slate-400" />
                                    )}
                                </Box>

                                {expandedModule === module.id && (
                                    <Box className="border-t border-slate-100 dark:border-slate-800">
                                        {!lessons[module.id] ? (
                                            <Box className="flex justify-center py-6">
                                                <CircularProgress size={24} className="text-sky-500!" />
                                            </Box>
                                        ) : lessons[module.id].length === 0 ? (
                                            <Box className="py-6 px-5">
                                                <Typography variant="body2" className="text-slate-500!">
                                                    Nuk ka leksione në këtë modul
                                                </Typography>
                                                {isOwner && (
                                                    <Button
                                                        startIcon={<AddRounded />}
                                                        size="small"
                                                        onClick={() => {
                                                            setLessonForm({ titulli: '', permbajtja: '', lloji: 'TEKST', videoUrl: '', resourceUrl: '', rradhitja: 1 })
                                                            setLessonModal({ open: true, editing: null, moduleId: module.id })
                                                        }}
                                                        className="mt-4! normal-case! text-sky-600!"
                                                    >
                                                        Shto Leksionin e Parë
                                                    </Button>
                                                )}
                                            </Box>
                                        ) : (
                                            <div className="flex flex-col">
                                                {lessons[module.id].map((lesson, lIndex) => (
                                                    <Box
                                                        key={lesson.id}
                                                        className="flex flex-col border-b border-slate-100/50 dark:border-slate-800/50 last:border-0"
                                                    >
                                                        <Box
                                                            className={`flex items-center justify-between px-5 py-4 transition-colors ${
                                                              lesson.lloji === 'QUIZ' ? '' : 'hover:bg-sky-50/30 dark:hover:bg-slate-800/30 cursor-pointer'
                                                            }`}
                                                            onClick={() => lesson.lloji !== 'QUIZ' && navigate(`/lesson/${lesson.id}`)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-bold text-slate-400 w-6">
                                                                    {lIndex + 1}
                                                                </span>
                                                                <div>
                                                                    <Typography variant="body2" className="font-semibold! text-slate-800! dark:text-white!">
                                                                        {lesson.titulli}
                                                                    </Typography>
                                                                    <Typography variant="caption" className="text-slate-500! dark:text-slate-400!">
                                                                        {lesson.lloji === 'QUIZ' ? 'QUIZ' : lesson.lloji}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isOwner && (
                                                                    <>
                                                                        {lesson.lloji === 'QUIZ' && (
                                                                            <Tooltip title="Menaxho quiz-in">
                                                                                <IconButton
                                                                                    component={Link}
                                                                                    to="/teacher/quizzes"
                                                                                    size="small"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="text-amber-500!"
                                                                                >
                                                                                    <QuizRounded fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                        {lesson.lloji === 'ASSIGNMENT' && (
                                                                            <Tooltip title="Shiko Dorëzimet">
                                                                                <IconButton size="small" onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleOpenSubmissions(lesson.id);
                                                                                }} className="text-emerald-500!">
                                                                                    <AssignmentTurnedInRounded fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                        <IconButton size="small" onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setLessonForm({
                                                                                titulli: lesson.titulli,
                                                                                permbajtja: lesson.permbajtja,
                                                                                lloji: lesson.lloji,
                                                                                videoUrl: lesson.videoUrl || '',
                                                                                resourceUrl: lesson.resourceUrl || '',
                                                                                rradhitja: lesson.rradhitja
                                                                            })
                                                                            setLessonModal({ open: true, editing: lesson.id, moduleId: module.id })
                                                                        }}>
                                                                            <EditRounded fontSize="small" className="text-slate-400" />
                                                                        </IconButton>
                                                                        <IconButton size="small" onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleOpenDeleteLesson(lesson, module.id)
                                                                        }}>
                                                                            <DeleteRounded fontSize="small" className="text-red-400" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                {!isOwner && lesson.lloji !== 'QUIZ' && (
                                                                    <PlayCircleFilledRounded className="text-sky-500" fontSize="small" />
                                                                )}
                                                            </div>
                                                        </Box>

                                                        {lesson.lloji === 'QUIZ' && isEnrolled && !isOwner && (
                                                            <Box className="px-5 pb-4" onClick={(e) => e.stopPropagation()}>
                                                                <LessonQuizCard lessonId={lesson.id} courseId={courseId} compact />
                                                            </Box>
                                                        )}

                                                        {/* Resources list */}
                                                        {lesson.resources && lesson.resources.length > 0 && (
                                                            <Box className="px-4 sm:px-14 pb-4 flex flex-col gap-2">
                                                                {lesson.resources.map(res => (
                                                                    <LearningResourceCard
                                                                        key={res.id}
                                                                        resource={res}
                                                                        isOwner={isOwner}
                                                                        isDark={isDark}
                                                                        onPreview={handlePreviewResource}
                                                                        onDownload={handleDownloadResource}
                                                                        onDelete={(resourceId) => deleteFile(resourceId, module.id)}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                                {isOwner && (
                                                    <Box className="p-4 border-t border-slate-50 dark:border-slate-800/30">
                                                        <Button
                                                            startIcon={<AddRounded />}
                                                            size="small"
                                                            fullWidth
                                                            onClick={() => {
                                                                setLessonForm({ titulli: '', permbajtja: '', lloji: 'TEKST', videoUrl: '', resourceUrl: '', rradhitja: lessons[module.id].length + 1 })
                                                                setLessonModal({ open: true, editing: null, moduleId: module.id })
                                                            }}
                                                            className="normal-case! text-sky-600! border! border-dashed! border-sky-100! rounded-xl!"
                                                        >
                                                            Shto Leksion
                                                        </Button>
                                                    </Box>
                                                )}
                                            </div>
                                        )}
                                    </Box>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </Container>
            <Footer />

             {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Card elevation={0} className="w-full max-w-md mx-4 rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/95! dark:border-slate-700/80!">
                        <CardContent className="p-8!">
                            <Typography variant="h6" className="font-bold! text-slate-900! dark:text-white! mb-2!">
                                Regjistrohu në kurs
                            </Typography>
                            <Typography variant="body2" className="text-slate-500! dark:text-slate-400! mb-6!">
                                Fut kodin e regjistrimit që të ka dhënë mësuesi
                            </Typography>
                            {/* Group selection removed; auto-select first group in useEffect. */}

                            <input
                                onChange={(e) => setEnrollmentKey(e.target.value)}
                                placeholder="Kodi i regjistrimit..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 transition mb-3"
                            />

                            {enrollError && (
                                <Typography variant="body2" className="text-red-500! mb-3!">
                                    {enrollError}
                                </Typography>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEnrollError('')
                                        setEnrollmentKey('')
                                        setSelectedGroupId('')
                                        setSelectedSubgroupId('')
                                    }}
                                    className="normal-case! rounded-full! border-slate-300! text-slate-600!"
                                >
                                    Anulo
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleEnroll}
                                    disabled={
                                        !enrollmentKey.trim() ||
                                        enrolling ||
                                        (courseGroups.length > 0 && !selectedGroupId) ||
                                        (availableSubgroups.length > 0 && !selectedSubgroupId)
                                    }
                                    className="normal-case! rounded-full! bg-sky-600!"
                                >
                                    {enrolling ? 'Duke u regjistruar...' : 'Regjistrohu'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* MODULE MANAGEMENT DIALOG */}
            <Dialog
                open={moduleModal.open}
                onClose={() => setModuleModal({ open: false, editing: null })}
                maxWidth="xs"
                fullWidth
                PaperProps={{ className: "rounded-3xl! p-2!" }}
            >
                <DialogTitle className="font-bold!">
                    {moduleModal.editing ? "Ndrysho Modulin" : "Shto Modul të Ri"}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2">
                    <TextField
                        label="Titulli i Modulit"
                        fullWidth
                        value={moduleForm.titulli}
                        onChange={e => setModuleForm({ ...moduleForm, titulli: e.target.value })}
                    />
                    <TextField
                        label="Përshkrimi"
                        fullWidth
                        multiline
                        rows={2}
                        value={moduleForm.pershkrimi}
                        onChange={e => setModuleForm({ ...moduleForm, pershkrimi: e.target.value })}
                    />
                </DialogContent>
                <DialogActions className="px-6! pb-6!">
                    <Button onClick={() => setModuleModal({ open: false, editing: null })} className="normal-case!">Anulo</Button>
                    <Button variant="contained" onClick={handleModuleSubmit} className="rounded-full! bg-sky-600! normal-case!">
                        {moduleModal.editing ? "Përditëso" : "Krijo"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* LESSON MANAGEMENT DIALOG */}
            <Dialog
                open={lessonModal.open}
                onClose={() => setLessonModal({ open: false, editing: null, moduleId: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ className: "rounded-3xl! p-2!" }}
            >
                <DialogTitle className="font-bold!">
                    {lessonModal.editing ? "Ndrysho Leksionin" : "Shto Leksion të Ri"}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2">
                    <TextField
                        label="Titulli i Leksionit"
                        fullWidth
                        value={lessonForm.titulli}
                        onChange={e => setLessonForm({ ...lessonForm, titulli: e.target.value })}
                    />

                    <Box className="flex gap-4">
                        <FormControl fullWidth>
                            <InputLabel>Lloji</InputLabel>
                            <Select variant="outlined"
                                value={lessonForm.lloji}
                                label="Lloji"
                                onChange={e => setLessonForm({ ...lessonForm, lloji: e.target.value })}
                            >
                                <MenuItem value="TEKST">Tekst</MenuItem>
                                <MenuItem value="VIDEO">Video</MenuItem>
                                <MenuItem value="QUIZ">Quiz</MenuItem>
                                <MenuItem value="ASSIGNMENT">Detyrë</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Rradhitja"
                            type="number"
                            value={lessonForm.rradhitja}
                            onChange={e => setLessonForm({ ...lessonForm, rradhitja: Number(e.target.value) })}
                        />
                    </Box>

                    <TextField
                        label="Përmbajtja"
                        fullWidth
                        multiline
                        rows={4}
                        value={lessonForm.permbajtja}
                        onChange={e => setLessonForm({ ...lessonForm, permbajtja: e.target.value })}
                    />

                    <TextField
                        label="Video URL (YouTube)"
                        fullWidth
                        value={lessonForm.videoUrl}
                        onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    />

                    <>
                        <Divider className="my-2!" />
                        <Typography variant="subtitle2" className="font-bold! mb-2 flex items-center gap-2">
                            <AttachFileRounded fontSize="small" /> Materiale Mësimore
                        </Typography>
                        {lessonModal.editing ? (
                            <FileUpload
                                onUpload={handleFileUpload}
                                loading={uploading}
                                allowedTypes=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.mp4"
                            />
                        ) : (
                            <FileUpload
                                onUpload={(files) => setPendingFiles(files)}
                                loading={uploading}
                                allowedTypes=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.mp4"
                            />
                        )}
                        {!lessonModal.editing && pendingFiles.length > 0 && (
                            <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                ✓ {pendingFiles.length} skedar(ë) do të ngarkohen pas krijimit
                            </Typography>
                        )}
                    </>
                </DialogContent>
                <DialogActions className="px-6! pb-6!">
                    <Button onClick={() => setLessonModal({ open: false, editing: null, moduleId: null })} className="normal-case!">Anulo</Button>
                    <Button variant="contained" onClick={handleLessonSubmit} className="rounded-full! bg-sky-600! normal-case!">
                        {lessonModal.editing ? "Përditëso" : "Krijo"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SUBMISSIONS DIALOG */}
            <Dialog
                open={submissionsModal.open}
                onClose={() => setSubmissionsModal({ open: false })}
                maxWidth="md"
                fullWidth
                PaperProps={{ className: "rounded-[2.5rem]! p-4!" }}
            >
                <DialogTitle className="font-black! text-2xl!">Dorëzimet e Detyrës</DialogTitle>
                <DialogContent>
                    <TableContainer className="mt-4">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className="font-black!">Studenti</TableCell>
                                    <TableCell className="font-black!">Data</TableCell>
                                    <TableCell className="font-black!">Statusi</TableCell>
                                    <TableCell className="font-black!">Nota</TableCell>
                                    <TableCell align="right" className="font-black!">Veprime</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell>{sub.studentName}</TableCell>
                                        <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={sub.statusi} size="small" color={sub.statusi === 'GRADED' ? 'success' : 'warning'} className="font-bold! rounded-lg!" />
                                        </TableCell>
                                        <TableCell className="font-black!">{sub.nota || '-'}/100</TableCell>
                                        <TableCell align="right">
                                            <Button variant="outlined" size="small" onClick={() => setGradingModal({ open: true, submissionId: sub.id, nota: sub.nota || 0, feedback: sub.feedback || '' })} className="rounded-lg! normal-case!">Vlerëso</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {submissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" className="py-10! text-slate-400">Ende nuk ka dorëzime.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions className="p-8!">
                    <Button onClick={() => setSubmissionsModal({ open: false })} className="font-bold!">Mbyll</Button>
                </DialogActions>
            </Dialog>

            {/* GRADING DIALOG */}
            <Dialog
                open={gradingModal.open}
                onClose={() => setGradingModal({ open: false })}
                PaperProps={{ className: "rounded-3xl! p-2!" }}
            >
                <DialogTitle className="font-black!">Vlerëso Dorëzimin</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2">
                    <TextField label="Nota (0-100)" type="number" fullWidth value={gradingModal.nota} onChange={e => setGradingModal({...gradingModal, nota: Number(e.target.value)})} />
                    <TextField label="Feedback" fullWidth multiline rows={3} value={gradingModal.feedback} onChange={e => setGradingModal({...gradingModal, feedback: e.target.value})} />
                </DialogContent>
                <DialogActions className="p-6!">
                    <Button onClick={() => setGradingModal({ open: false })}>Anulo</Button>
                    <Button variant="contained" onClick={handleGrade} className="rounded-xl! bg-emerald-600!">Ruaj Vlerësimin</Button>
                </DialogActions>
            </Dialog>
            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={openDeleteConfirm}
                onClose={() => {
                    setOpenDeleteConfirm(false)
                    setDeleteTarget(null)
                }}
                maxWidth="xs"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: "2.5rem",
                        p: 2,
                        backgroundColor: isDark ? "#0f172a" : "white",
                        border: isDark
                            ? "1px solid #1e293b"
                            : "1px solid rgba(148,163,184,0.15)",
                        boxShadow: isDark
                            ? "0 30px 60px rgba(15,23,42,0.65)"
                            : "0 30px 60px rgba(148,163,184,0.15)",
                    },
                }}
            >
                <DialogTitle className="px-6! pt-6! pb-2!">
                    <Typography
                        variant="h5"
                        component="p"
                        className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}
                    >
                        A jeni i sigurt?
                    </Typography>
                </DialogTitle>
                <DialogContent className="px-6! py-4!">
                    <Typography
                        variant="body2"
                        className={isDark ? "text-slate-300!" : "text-slate-600!"}
                    >
                        {deleteTarget?.type === 'module'
                            ? "Do të fshihet përhershëm moduli:"
                            : "Do të fshihet përhershëm leksioni:"}
                    </Typography>
                    <Typography
                        variant="body1"
                        className={isDark ? "font-bold! text-white! mt-3!" : "font-bold! text-slate-900! mt-3!"}
                    >
                        {deleteTarget ? deleteTarget.data.titulli : ""}
                    </Typography>
                    {deleteTarget?.type === 'module' && (
                        <Typography
                            variant="caption"
                            className={isDark ? "text-slate-400! block! mt-1!" : "text-slate-500! block! mt-1!"}
                        >
                            Kujdes: Ky veprim fshin edhe të gjitha leksionet brenda tij.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions className="px-8! pb-8! pt-4! gap-2">
                    <Button
                        onClick={() => {
                            setOpenDeleteConfirm(false)
                            setDeleteTarget(null)
                        }}
                        className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
                    >
                        Anulo
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-rose-600! hover:bg-rose-700! shadow-lg shadow-rose-500/20"
                    >
                        Fshi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SUCCESS TOAST */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity="success"
                    variant="filled"
                    sx={{
                        width: "100%",
                        borderRadius: "1.25rem",
                        fontWeight: "bold",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </section>
    )
}
